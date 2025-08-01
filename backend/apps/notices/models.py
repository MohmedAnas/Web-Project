from django.db import models
from django.utils import timezone
from apps.accounts.models import User, StudentProfile
from apps.courses.models import Course


class Notice(models.Model):
    """Model for notices/announcements."""
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    CATEGORY_CHOICES = (
        ('general', 'General'),
        ('academic', 'Academic'),
        ('fee', 'Fee Related'),
        ('event', 'Event'),
        ('holiday', 'Holiday'),
        ('exam', 'Examination'),
        ('maintenance', 'Maintenance'),
    )
    
    TARGET_AUDIENCE_CHOICES = (
        ('all', 'All Students'),
        ('course_specific', 'Course Specific'),
        ('batch_specific', 'Batch Specific'),
    )
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    target_audience = models.CharField(max_length=20, choices=TARGET_AUDIENCE_CHOICES, default='all')
    target_courses = models.ManyToManyField(Course, blank=True, related_name='notices')
    target_batches = models.CharField(max_length=100, blank=True, help_text="Comma-separated batch names")
    is_active = models.BooleanField(default=True)
    publish_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(null=True, blank=True)
    attachment = models.FileField(upload_to='notice_attachments/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_notices')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-publish_date']
    
    def __str__(self):
        return f"{self.title} - {self.get_priority_display()}"
    
    @property
    def is_expired(self):
        """Check if notice is expired."""
        if self.expiry_date:
            return timezone.now() > self.expiry_date
        return False
    
    @property
    def is_published(self):
        """Check if notice is published."""
        return self.publish_date <= timezone.now()
    
    @property
    def total_readers(self):
        """Get total number of students who read this notice."""
        return self.read_status.filter(is_read=True).count()
    
    def get_target_students(self):
        """Get queryset of students who should see this notice."""
        if self.target_audience == 'all':
            return StudentProfile.objects.all()
        elif self.target_audience == 'course_specific':
            return StudentProfile.objects.filter(
                enrollments__course__in=self.target_courses.all()
            ).distinct()
        elif self.target_audience == 'batch_specific':
            batches = [batch.strip() for batch in self.target_batches.split(',') if batch.strip()]
            return StudentProfile.objects.filter(
                enrollments__batch__in=batches
            ).distinct()
        return StudentProfile.objects.none()


class NoticeReadStatus(models.Model):
    """Model to track which students have read which notices."""
    
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='read_status')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='notice_read_status')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['notice', 'student']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.notice.title} - {'Read' if self.is_read else 'Unread'}"
    
    def mark_as_read(self):
        """Mark notice as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class NoticeComment(models.Model):
    """Model for comments on notices (optional feature)."""
    
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.notice.title}"
