from django.db import models
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from apps.accounts.models import User, StudentProfile
from apps.courses.models import Course


class StudentEnrollment(models.Model):
    """Model for student enrollment in courses."""
    
    BATCH_CHOICES = (
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
    )
    
    DURATION_CHOICES = (
        (1, '1 Month'),
        (3, '3 Months'),
        (6, '6 Months'),
        (12, '1 Year'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('on_hold', 'On Hold'),
    )
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.CharField(max_length=10, choices=BATCH_CHOICES)
    duration_months = models.IntegerField(choices=DURATION_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate end date based on duration if not provided
        if not self.end_date:
            self.end_date = self.start_date + relativedelta(months=self.duration_months)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.student_id} - {self.course.name} ({self.batch})"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def progress_percentage(self):
        if self.status == 'completed':
            return 100
        
        today = timezone.now().date()
        
        # If not started yet
        if today < self.start_date:
            return 0
        
        # If already ended
        if today > self.end_date:
            return 100
        
        # Calculate progress
        total_days = (self.end_date - self.start_date).days
        days_passed = (today - self.start_date).days
        
        if total_days <= 0:
            return 0
        
        progress = (days_passed / total_days) * 100
        return min(round(progress, 1), 100)  # Cap at 100%
