from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord, AttendanceSummary


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['course', 'batch', 'date', 'start_time', 'end_time', 'total_students', 'present_students', 'attendance_percentage']
    list_filter = ['course', 'batch', 'date']
    search_fields = ['course__name', 'topic_covered']
    ordering = ['-date', 'start_time']
    readonly_fields = ['total_students', 'present_students', 'absent_students', 'attendance_percentage']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'session', 'status', 'check_in_time', 'marked_by']
    list_filter = ['status', 'session__date', 'session__course', 'session__batch']
    search_fields = ['student__student_id', 'student__user__name', 'session__course__name']
    ordering = ['-session__date', 'student__student_id']


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ['student', 'enrollment', 'month', 'total_sessions', 'present_sessions', 'attendance_percentage']
    list_filter = ['month', 'enrollment__course']
    search_fields = ['student__student_id', 'student__user__name']
    ordering = ['-month', 'student__student_id']
    readonly_fields = ['attendance_percentage']
