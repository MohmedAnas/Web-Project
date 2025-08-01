from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid

from core.models import TimeStampedModel, User
from students.models import Student, Course, Enrollment


class FeeStructure(TimeStampedModel):
    """Fee structure model defining fees for courses."""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='fee_structures')
    name = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Optional installment configuration
    allow_installments = models.BooleanField(default=False)
    max_installments = models.PositiveIntegerField(default=1)
    installment_period_days = models.PositiveIntegerField(default=30, help_text="Days between installments")
    
    class Meta:
        ordering = ['course', 'name']
    
    def __str__(self):
        return f"{self.course.name} - {self.name} (₹{self.total_amount})"


class FeeRecord(TimeStampedModel):
    """Fee record model representing a student's fee record."""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('WAIVED', 'Waived'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='fee_records')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='fee_records', null=True, blank=True)
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.SET_NULL, related_name='fee_records', null=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    waived_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    # For installment-based fees
    installment_number = models.PositiveIntegerField(default=1)
    total_installments = models.PositiveIntegerField(default=1)
    
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.student.name} - {self.course.name} - ₹{self.total_amount}"
    
    @property
    def remaining_amount(self):
        """Calculate remaining amount to be paid."""
        return max(0, self.total_amount - self.amount_paid - self.discount_amount - self.waived_amount)
    
    @property
    def is_paid(self):
        """Check if fee is fully paid."""
        return self.remaining_amount == 0
    
    @property
    def is_overdue(self):
        """Check if fee is overdue."""
        return self.due_date < timezone.now().date() and self.remaining_amount > 0
    
    def update_status(self):
        """Update the status based on payment and due date."""
        if self.waived_amount >= self.total_amount:
            self.status = 'WAIVED'
        elif self.is_paid:
            self.status = 'PAID'
        elif self.amount_paid > 0:
            self.status = 'PARTIAL'
        elif self.is_overdue:
            self.status = 'OVERDUE'
        else:
            self.status = 'PENDING'
        return self.status
    
    def save(self, *args, **kwargs):
        # Update status before saving
        self.status = self.update_status()
        super().save(*args, **kwargs)


class Payment(TimeStampedModel):
    """Payment model representing a payment made by a student."""
    
    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('CHEQUE', 'Cheque'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('OTHER', 'Other'),
    )
    
    fee_record = models.ForeignKey(FeeRecord, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    payment_date = models.DateField(default=timezone.now)
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    receipt_number = models.CharField(max_length=50, unique=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    
    # For cheque payments
    cheque_number = models.CharField(max_length=50, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments_received')
    remarks = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"Payment #{self.receipt_number} - ₹{self.amount} - {self.fee_record.student.name}"
    
    def save(self, *args, **kwargs):
        # Generate receipt number if not provided
        if not self.receipt_number:
            year = timezone.now().year
            month = timezone.now().month
            # Format: RBR-YYYY-MM-XXXX (e.g., RBR-2023-07-0001)
            count = Payment.objects.filter(
                payment_date__year=year,
                payment_date__month=month
            ).count()
            self.receipt_number = f"RBR-{year}-{month:02d}-{count+1:04d}"
        
        # Update the fee record's amount_paid
        fee_record = self.fee_record
        
        # For new payments
        if not self.pk:
            fee_record.amount_paid += self.amount
            fee_record.save()
        else:
            # For updates, get the original payment amount
            try:
                original = Payment.objects.get(pk=self.pk)
                difference = self.amount - original.amount
                if difference != 0:
                    fee_record.amount_paid += difference
                    fee_record.save()
            except Payment.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Update the fee record's amount_paid when a payment is deleted
        fee_record = self.fee_record
        fee_record.amount_paid -= self.amount
        fee_record.save()
        
        super().delete(*args, **kwargs)
