from django.contrib import admin
from .models import CertificateTemplate, StudentCertificate, CertificateVerification, CertificateDownload


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'is_active', 'certificates_issued', 'created_by', 'created_at']
    list_filter = ['is_active', 'course', 'created_by']
    search_fields = ['name', 'course__name']
    ordering = ['course', 'name']
    readonly_fields = ['certificates_issued']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new template
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(StudentCertificate)
class StudentCertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_number', 'student', 'enrollment', 'issue_date', 'completion_date', 'grade', 'status', 'issued_by']
    list_filter = ['status', 'issue_date', 'enrollment__course', 'grade']
    search_fields = ['certificate_number', 'student__student_id', 'student__user__name', 'enrollment__course__name']
    ordering = ['-issue_date']
    readonly_fields = ['certificate_number', 'verification_code', 'verification_url']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new certificate
            obj.issued_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CertificateVerification)
class CertificateVerificationAdmin(admin.ModelAdmin):
    list_display = ['certificate', 'verified_at', 'ip_address']
    list_filter = ['verified_at']
    search_fields = ['certificate__certificate_number', 'certificate__student__student_id']
    ordering = ['-verified_at']
    readonly_fields = ['verified_at']


@admin.register(CertificateDownload)
class CertificateDownloadAdmin(admin.ModelAdmin):
    list_display = ['certificate', 'downloaded_by', 'downloaded_at', 'ip_address']
    list_filter = ['downloaded_at', 'downloaded_by']
    search_fields = ['certificate__certificate_number', 'certificate__student__student_id']
    ordering = ['-downloaded_at']
    readonly_fields = ['downloaded_at']
