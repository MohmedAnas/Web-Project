from django.contrib import admin
from django.utils.html import format_html

from .models import Student, Course, Enrollment, Certificate

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'email', 'phone', 'batch', 'status', 'enrollment_date')
    list_filter = ('status', 'batch', 'gender', 'enrollment_date')
    search_fields = ('name', 'student_id', 'email', 'phone')
    readonly_fields = ('student_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student_id', 'name', 'date_of_birth', 'gender', 'photo')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Enrollment Information', {
            'fields': ('enrollment_date', 'status', 'batch')
        }),
        ('Parent/Guardian Information', {
            'fields': ('parent_name', 'parent_phone', 'parent_email')
        }),
        ('User Account', {
            'fields': ('user',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_photo(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.photo.url)
        return "-"
    get_photo.short_description = 'Photo'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'duration_weeks', 'fee', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'code')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Course Information', {
            'fields': ('name', 'code', 'description', 'duration_weeks', 'fee', 'status')
        }),
        ('Additional Information', {
            'fields': ('syllabus',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrollment_date', 'start_date', 'end_date', 'status', 'batch')
    list_filter = ('status', 'batch', 'enrollment_date')
    search_fields = ('student__name', 'student__student_id', 'course__name', 'course__code')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('student', 'course', 'enrollment_date', 'start_date', 'end_date', 'status', 'batch')
        }),
        ('Additional Information', {
            'fields': ('remarks',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_progress(self, obj):
        return f"{obj.progress_percentage}%"
    get_progress.short_description = 'Progress'


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'student', 'course', 'issue_date', 'is_verified')
    list_filter = ('is_verified', 'issue_date')
    search_fields = ('certificate_number', 'student__name', 'student__student_id', 'course__name')
    readonly_fields = ('certificate_number', 'verification_url', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Certificate Information', {
            'fields': ('certificate_number', 'student', 'course', 'issue_date', 'expiry_date', 'is_verified')
        }),
        ('Certificate File', {
            'fields': ('pdf_file',)
        }),
        ('Verification', {
            'fields': ('verification_url',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
