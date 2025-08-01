from django.db import models
from django.utils import timezone
from apps.accounts.models import StudentProfile
from apps.courses.models import Course
from apps.students.models import StudentEnrollment


class AttendanceSession(models.Model):
    """Model for attendance sessions."""
    
    BATCH_CHOICES = (
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
    )
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    batch = models.CharField(max_length=10, choices=BATCH_CHOICES)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    topic_covered = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'batch', 'date']
        ordering = ['-date', 'start_time']
    
    def __str__(self):
        return f"{self.course.name} - {self.get_batch_display()} - {self.date}"
    
    @property
    def total_students(self):
        """Get total number of students in this session."""
        return self.attendance_records.count()
    
    @property
    def present_students(self):
        """Get number of present students."""
        return self.attendance_records.filter(status='present').count()
    
    @property
    def absent_students(self):
        """Get number of absent students."""
        return self.attendance_records.filter(status='absent').count()
    
    @property
    def attendance_percentage(self):
        """Calculate attendance percentage for this session."""
        total = self.total_students
        if total == 0:
            return 0
        return round((self.present_students / total) * 100, 2)


class AttendanceRecord(models.Model):
    """Model for individual student attendance records."""
    
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    )
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    enrollment = models.ForeignKey(StudentEnrollment, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='absent')
    check_in_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    marked_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['session', 'student']
        ordering = ['-session__date', 'student__student_id']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.session.date} - {self.status}"
    
    @property
    def is_present(self):
        """Check if student is present (including late)."""
        return self.status in ['present', 'late']


class AttendanceSummary(models.Model):
    """Model for monthly attendance summaries."""
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_summaries')
    enrollment = models.ForeignKey(StudentEnrollment, on_delete=models.CASCADE, related_name='attendance_summaries')
    month = models.DateField()  # First day of the month
    total_sessions = models.IntegerField(default=0)
    present_sessions = models.IntegerField(default=0)
    absent_sessions = models.IntegerField(default=0)
    late_sessions = models.IntegerField(default=0)
    excused_sessions = models.IntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'enrollment', 'month']
        ordering = ['-month', 'student__student_id']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.month.strftime('%B %Y')} - {self.attendance_percentage}%"
    
    def calculate_percentage(self):
        """Calculate and update attendance percentage."""
        if self.total_sessions > 0:
            self.attendance_percentage = round((self.present_sessions / self.total_sessions) * 100, 2)
        else:
            self.attendance_percentage = 0
        return self.attendance_percentage
