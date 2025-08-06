from django.contrib import admin
from .models import FeeStructure, StudentFee, FeePayment, FeeReminder


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['course', 'duration_months', 'base_fee', 'registration_fee', 'discount_percentage', 'total_fee', 'is_active']
    list_filter = ['is_active', 'duration_months', 'course']
    search_fields = ['course__name', 'course__code']
    ordering = ['course', 'duration_months']


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ['student', 'enrollment', 'total_amount', 'paid_amount', 'remaining_amount', 'due_date', 'status']
    list_filter = ['status', 'due_date', 'enrollment__course']
    search_fields = ['student__student_id', 'student__user__name', 'enrollment__course__name']
    readonly_fields = ['remaining_amount']
    ordering = ['-due_date']


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ['student_fee', 'amount', 'payment_method', 'payment_date', 'transaction_id', 'created_by']
    list_filter = ['payment_method', 'payment_date', 'created_by']
    search_fields = ['student_fee__student__student_id', 'transaction_id']
    ordering = ['-payment_date']


@admin.register(FeeReminder)
class FeeReminderAdmin(admin.ModelAdmin):
    list_display = ['student_fee', 'reminder_type', 'sent_date', 'is_successful', 'created_by']
    list_filter = ['reminder_type', 'is_successful', 'sent_date']
    search_fields = ['student_fee__student__student_id']
    ordering = ['-sent_date']
