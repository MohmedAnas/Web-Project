from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Count, Q, Avg

from core.models import TimeStampedModel, User
from students.models import Student, Course, Enrollment


class AttendanceRecord(TimeStampedModel):
    """Attendance record model for tracking student attendance."""
    
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused'),
        ('HOLIDAY', 'Holiday'),
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_records')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records', null=True, blank=True)
    
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    
    # For late attendance
    minutes_late = models.PositiveIntegerField(default=0)
    
    # For excused absence
    reason = models.TextField(null=True, blank=True)
    
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendance')
    remarks = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'course', 'date')
        ordering = ['-date', 'student__name']
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['course', 'date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.name} - {self.course.name} - {self.date} - {self.get_status_display()}"
    
    @property
    def is_present(self):
        return self.status == 'PRESENT'
    
    @property
    def is_absent(self):
        return self.status == 'ABSENT'


class AttendanceSummary(TimeStampedModel):
    """Attendance summary model for storing aggregated attendance data."""
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_summaries')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_summaries')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_summaries', null=True, blank=True)
    
    month = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.PositiveIntegerField()
    
    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    excused_days = models.PositiveIntegerField(default=0)
    
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ('student', 'course', 'month', 'year')
        ordering = ['-year', '-month', 'student__name']
    
    def __str__(self):
        return f"{self.student.name} - {self.course.name} - {self.month}/{self.year} - {self.attendance_percentage}%"
    
    @classmethod
    def generate_summary(cls, student, course, month, year):
        """Generate or update attendance summary for a student and course."""
        # Get or create summary object
        summary, created = cls.objects.get_or_create(
            student=student,
            course=course,
            month=month,
            year=year,
            defaults={
                'enrollment': Enrollment.objects.filter(student=student, course=course).first()
            }
        )
        
        # Get attendance records for the month
        records = AttendanceRecord.objects.filter(
            student=student,
            course=course,
            date__month=month,
            date__year=year
        )
        
        # Count different attendance statuses
        summary.total_days = records.count()
        summary.present_days = records.filter(status='PRESENT').count()
        summary.absent_days = records.filter(status='ABSENT').count()
        summary.late_days = records.filter(status='LATE').count()
        summary.excused_days = records.filter(status='EXCUSED').count()
        
        # Calculate attendance percentage
        if summary.total_days > 0:
            summary.attendance_percentage = (
                (summary.present_days + summary.late_days) / summary.total_days
            ) * 100
        else:
            summary.attendance_percentage = 0
        
        summary.save()
        return summary
