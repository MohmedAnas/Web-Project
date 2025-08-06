from rest_framework import serializers
from .models import FeeStructure, StudentFee, FeePayment, FeeReminder
from apps.courses.serializers import CourseSerializer
from apps.students.serializers import StudentEnrollmentSerializer


class FeeStructureSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    total_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'course', 'course_id', 'duration_months', 'base_fee', 
            'registration_fee', 'discount_percentage', 'total_fee', 
            'is_active', 'created_at', 'updated_at'
        ]


class FeePaymentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = FeePayment
        fields = [
            'id', 'amount', 'payment_method', 'transaction_id', 
            'payment_date', 'notes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']


class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    course_code = serializers.CharField(source='enrollment.course.code', read_only=True)
    fee_structure = FeeStructureSerializer(read_only=True)
    payments = FeePaymentSerializer(many=True, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StudentFee
        fields = [
            'id', 'student', 'student_name', 'student_id', 'enrollment', 
            'course_name', 'course_code', 'fee_structure', 'total_amount', 
            'paid_amount', 'remaining_amount', 'due_date', 'status', 
            'is_overdue', 'payments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['paid_amount', 'status']


class StudentFeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFee
        fields = [
            'student', 'enrollment', 'fee_structure', 'total_amount', 'due_date'
        ]
    
    def validate(self, data):
        # Ensure student and enrollment match
        if data['student'] != data['enrollment'].student:
            raise serializers.ValidationError("Student and enrollment must match.")
        
        # Ensure fee structure matches enrollment course
        if data['fee_structure'].course != data['enrollment'].course:
            raise serializers.ValidationError("Fee structure must match enrollment course.")
        
        return data


class FeePaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeePayment
        fields = [
            'student_fee', 'amount', 'payment_method', 'transaction_id', 
            'payment_date', 'notes'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value
    
    def validate(self, data):
        student_fee = data['student_fee']
        amount = data['amount']
        
        # Check if payment amount doesn't exceed remaining amount
        if amount > student_fee.remaining_amount:
            raise serializers.ValidationError(
                f"Payment amount (₹{amount}) cannot exceed remaining amount (₹{student_fee.remaining_amount})."
            )
        
        return data


class FeeReminderSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student_fee.student.user.name', read_only=True)
    student_id = serializers.CharField(source='student_fee.student.student_id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = FeeReminder
        fields = [
            'id', 'student_fee', 'student_name', 'student_id', 'reminder_type', 
            'sent_date', 'message', 'is_successful', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_by']


class FeeStatsSerializer(serializers.Serializer):
    total_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    collected_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    collection_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_students = serializers.IntegerField()
    paid_students = serializers.IntegerField()
    pending_students = serializers.IntegerField()
    overdue_students = serializers.IntegerField()


class FeeReportSerializer(serializers.Serializer):
    course_name = serializers.CharField()
    course_code = serializers.CharField()
    total_students = serializers.IntegerField()
    total_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    collected_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    collection_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
