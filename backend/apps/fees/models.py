from django.db import models
from django.utils import timezone
from apps.accounts.models import StudentProfile
from apps.courses.models import Course
from apps.students.models import StudentEnrollment


class FeeStructure(models.Model):
    """Model for course fee structures."""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='fee_structures')
    duration_months = models.IntegerField()
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['course', 'duration_months']
        ordering = ['course', 'duration_months']
    
    def __str__(self):
        return f"{self.course.name} - {self.duration_months} months"
    
    @property
    def total_fee(self):
        """Calculate total fee after discount."""
        discount_amount = (self.base_fee * self.discount_percentage) / 100
        return self.base_fee + self.registration_fee - discount_amount


class StudentFee(models.Model):
    """Model for student fee records."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Fully Paid'),
        ('overdue', 'Overdue'),
    )
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='fees')
    enrollment = models.ForeignKey(StudentEnrollment, on_delete=models.CASCADE, related_name='fees')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.student_id} - {self.enrollment.course.name} - {self.status}"
    
    @property
    def remaining_amount(self):
        """Calculate remaining amount to be paid."""
        return self.total_amount - self.paid_amount
    
    @property
    def is_overdue(self):
        """Check if fee is overdue."""
        return self.due_date < timezone.now().date() and self.status != 'paid'
    
    def save(self, *args, **kwargs):
        # Update status based on payment
        if self.paid_amount >= self.total_amount:
            self.status = 'paid'
        elif self.paid_amount > 0:
            self.status = 'partial'
        elif self.is_overdue:
            self.status = 'overdue'
        else:
            self.status = 'pending'
        
        super().save(*args, **kwargs)


class FeePayment(models.Model):
    """Model for fee payments."""
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
    )
    
    student_fee = models.ForeignKey(StudentFee, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student_fee.student.student_id} - ₹{self.amount} - {self.payment_date.date()}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update student fee paid amount
        self.student_fee.paid_amount = self.student_fee.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        self.student_fee.save()


class FeeReminder(models.Model):
    """Model for fee reminders."""
    
    REMINDER_TYPE_CHOICES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('call', 'Phone Call'),
    )
    
    student_fee = models.ForeignKey(StudentFee, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPE_CHOICES)
    sent_date = models.DateTimeField(default=timezone.now)
    message = models.TextField()
    is_successful = models.BooleanField(default=False)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.student_fee.student.student_id} - {self.reminder_type} - {self.sent_date.date()}"
