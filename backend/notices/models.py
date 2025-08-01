from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from core.models import TimeStampedModel, User
from students.models import Student, Course


class Notice(TimeStampedModel):
    """Notice model for announcements and notifications."""
    
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    
    TYPE_CHOICES = (
        ('GENERAL', 'General'),
        ('ACADEMIC', 'Academic'),
        ('EVENT', 'Event'),
        ('HOLIDAY', 'Holiday'),
        ('EXAM', 'Exam'),
        ('FEE', 'Fee'),
        ('OTHER', 'Other'),
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Notice metadata
    notice_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='GENERAL')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    
    # Publication details
    published_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=True)
    
    # Targeting
    is_public = models.BooleanField(default=True, help_text="Visible to all students")
    courses = models.ManyToManyField(Course, related_name='notices', blank=True)
    specific_students = models.ManyToManyField(Student, related_name='specific_notices', blank=True)
    
    # Attachments
    attachment = models.FileField(upload_to='notice_attachments/', null=True, blank=True)
    
    # Author
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_notices')
    
    class Meta:
        ordering = ['-published_date']
        indexes = [
            models.Index(fields=['published_date']),
            models.Index(fields=['notice_type']),
            models.Index(fields=['priority']),
            models.Index(fields=['is_published']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_expired(self):
        """Check if notice is expired."""
        if not self.expiry_date:
            return False
        return timezone.now() > self.expiry_date
    
    @property
    def is_active(self):
        """Check if notice is active (published and not expired)."""
        return self.is_published and not self.is_expired
    
    def is_visible_to_student(self, student):
        """Check if notice is visible to a specific student."""
        if not self.is_active:
            return False
        
        if self.is_public:
            return True
        
        # Check if student is in specific_students
        if student in self.specific_students.all():
            return True
        
        # Check if student is enrolled in any of the targeted courses
        student_courses = student.enrollments.values_list('course', flat=True)
        return self.courses.filter(id__in=student_courses).exists()


class NoticeRead(TimeStampedModel):
    """Model to track which students have read which notices."""
    
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='read_records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='read_notices')
    read_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('notice', 'student')
        ordering = ['-read_at']
    
    def __str__(self):
        return f"{self.student.name} read {self.notice.title} at {self.read_at}"
