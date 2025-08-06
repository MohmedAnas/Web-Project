from django.db import models
from django.utils import timezone
import uuid
from apps.accounts.models import User, StudentProfile
from apps.courses.models import Course
from apps.students.models import StudentEnrollment


class CertificateTemplate(models.Model):
    """Model for certificate templates."""
    
    name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificate_templates')
    template_content = models.TextField(help_text="HTML template content with placeholders")
    background_image = models.ImageField(upload_to='certificate_backgrounds/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.course.name}"
    
    @property
    def certificates_issued(self):
        """Get count of certificates issued using this template."""
        return self.student_certificates.count()


class StudentCertificate(models.Model):
    """Model for student certificates."""
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('revoked', 'Revoked'),
    )
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='certificates')
    enrollment = models.ForeignKey(StudentEnrollment, on_delete=models.CASCADE, related_name='certificates')
    template = models.ForeignKey(CertificateTemplate, on_delete=models.CASCADE, related_name='student_certificates')
    certificate_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField(default=timezone.now)
    completion_date = models.DateField()
    grade = models.CharField(max_length=10, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    certificate_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    verification_code = models.UUIDField(default=uuid.uuid4, unique=True)
    notes = models.TextField(blank=True)
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='issued_certificates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'enrollment']
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.certificate_number} - {self.student.student_id} - {self.enrollment.course.name}"
    
    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = self.generate_certificate_number()
        super().save(*args, **kwargs)
    
    def generate_certificate_number(self):
        """Generate unique certificate number."""
        year = timezone.now().year
        course_code = self.enrollment.course.code.upper()
        # Get the next sequence number for this course and year
        last_cert = StudentCertificate.objects.filter(
            enrollment__course=self.enrollment.course,
            issue_date__year=year
        ).order_by('-certificate_number').first()
        
        if last_cert and last_cert.certificate_number:
            try:
                # Extract sequence number from last certificate
                last_seq = int(last_cert.certificate_number.split('-')[-1])
                next_seq = last_seq + 1
            except (ValueError, IndexError):
                next_seq = 1
        else:
            next_seq = 1
        
        return f"RBC-{course_code}-{year}-{next_seq:04d}"
    
    @property
    def is_valid(self):
        """Check if certificate is valid (issued and not revoked)."""
        return self.status == 'issued'
    
    @property
    def verification_url(self):
        """Get certificate verification URL."""
        return f"/verify-certificate/{self.verification_code}/"


class CertificateVerification(models.Model):
    """Model to track certificate verification attempts."""
    
    certificate = models.ForeignKey(StudentCertificate, on_delete=models.CASCADE, related_name='verifications')
    verified_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.certificate.certificate_number} verified at {self.verified_at}"


class CertificateDownload(models.Model):
    """Model to track certificate downloads."""
    
    certificate = models.ForeignKey(StudentCertificate, on_delete=models.CASCADE, related_name='downloads')
    downloaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    
    def __str__(self):
        return f"{self.certificate.certificate_number} downloaded at {self.downloaded_at}"
