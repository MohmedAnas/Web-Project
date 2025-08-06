from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import RegexValidator
import uuid

from core.models import TimeStampedModel, User


class Student(TimeStampedModel):
    """Student model representing a student in the system."""
    
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('COMPLETED', 'Completed'),
        ('DROPPED', 'Dropped'),
    )
    
    BATCH_CHOICES = (
        ('MORNING', 'Morning'),
        ('AFTERNOON', 'Afternoon'),
        ('EVENING', 'Evening'),
        ('WEEKEND', 'Weekend'),
    )
    
    # Basic information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    student_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    email = models.EmailField()
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(validators=[phone_regex], max_length=17)
    address = models.TextField()
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    
    # Enrollment information
    enrollment_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    batch = models.CharField(max_length=10, choices=BATCH_CHOICES)
    
    # Parent/Guardian information
    parent_name = models.CharField(max_length=100)
    parent_phone = models.CharField(validators=[phone_regex], max_length=17)
    parent_email = models.EmailField(null=True, blank=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['name']),
            models.Index(fields=['status']),
            models.Index(fields=['batch']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.student_id})"
    
    def save(self, *args, **kwargs):
        # Generate student ID if not provided
        if not self.student_id:
            year = timezone.now().year
            # Get count of students created this year
            count = Student.objects.filter(
                created_at__year=year
            ).count()
            # Format: RB-YYYY-XXXX (e.g., RB-2023-0001)
            self.student_id = f"RB-{year}-{count+1:04d}"
        super().save(*args, **kwargs)
    
    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def is_active(self):
        return self.status == 'ACTIVE'


class Course(TimeStampedModel):
    """Course model representing a course offered by the institute."""
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('UPCOMING', 'Upcoming'),
        ('ARCHIVED', 'Archived'),
    )
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    duration_weeks = models.PositiveIntegerField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    syllabus = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def is_active(self):
        return self.status == 'ACTIVE'


class Enrollment(TimeStampedModel):
    """Enrollment model representing a student's enrollment in a course."""
    
    STATUS_CHOICES = (
        ('ENROLLED', 'Enrolled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('DROPPED', 'Dropped'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(default=timezone.now)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='ENROLLED')
    batch = models.CharField(max_length=10, choices=Student.BATCH_CHOICES)
    remarks = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.student.name} - {self.course.name}"
    
    @property
    def is_active(self):
        return self.status in ['ENROLLED', 'IN_PROGRESS']
    
    @property
    def progress_percentage(self):
        if self.status == 'COMPLETED':
            return 100
        
        today = timezone.now().date()
        if today < self.start_date:
            return 0
        
        total_days = (self.end_date - self.start_date).days
        days_passed = (min(today, self.end_date) - self.start_date).days
        
        if total_days <= 0:
            return 0
        
        return min(100, int((days_passed / total_days) * 100))


class Certificate(TimeStampedModel):
    """Certificate model representing a certificate issued to a student."""
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_number = models.CharField(max_length=50, unique=True, editable=False)
    issue_date = models.DateField(default=timezone.now)
    expiry_date = models.DateField(null=True, blank=True)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    is_verified = models.BooleanField(default=True)
    verification_url = models.URLField(null=True, blank=True)
    
    class Meta:
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"Certificate {self.certificate_number} - {self.student.name}"
    
    def save(self, *args, **kwargs):
        # Generate certificate number if not provided
        if not self.certificate_number:
            year = timezone.now().year
            month = timezone.now().month
            # Format: RBC-YYYY-MM-XXXX-UUID (e.g., RBC-2023-07-0001-a1b2c3)
            count = Certificate.objects.filter(
                issue_date__year=year,
                issue_date__month=month
            ).count()
            uuid_part = str(uuid.uuid4())[:6]
            self.certificate_number = f"RBC-{year}-{month:02d}-{count+1:04d}-{uuid_part}"
        
        # Generate verification URL if not provided
        if not self.verification_url:
            self.verification_url = f"https://rbcomputer.com/verify/{self.certificate_number}"
        
        super().save(*args, **kwargs)
