from django.contrib import admin
from .models import Notice, NoticeReadStatus, NoticeComment


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'target_audience', 'is_active', 'publish_date', 'created_by', 'total_readers']
    list_filter = ['category', 'priority', 'target_audience', 'is_active', 'publish_date']
    search_fields = ['title', 'content']
    filter_horizontal = ['target_courses']
    ordering = ['-publish_date']
    readonly_fields = ['total_readers', 'created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new notice
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(NoticeReadStatus)
class NoticeReadStatusAdmin(admin.ModelAdmin):
    list_display = ['notice', 'student', 'is_read', 'read_at']
    list_filter = ['is_read', 'read_at', 'notice__category']
    search_fields = ['notice__title', 'student__student_id', 'student__user__name']
    ordering = ['-notice__publish_date', 'student__student_id']


@admin.register(NoticeComment)
class NoticeCommentAdmin(admin.ModelAdmin):
    list_display = ['notice', 'user', 'created_at']
    list_filter = ['created_at', 'notice__category']
    search_fields = ['notice__title', 'user__email', 'comment']
    ordering = ['-created_at']
