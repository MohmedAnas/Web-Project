from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.accounts.models import User, StudentProfile
from apps.accounts.serializers import UserSerializer, StudentProfileSerializer
from apps.courses.models import Course
from apps.courses.serializers import CourseSerializer
from .models import StudentEnrollment

User = get_user_model()


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for StudentEnrollment model."""
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    student = StudentProfileSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentEnrollment
        fields = [
            'id', 'student', 'course', 'course_id', 'batch', 'duration_months',
            'start_date', 'end_date', 'status', 'enrollment_date',
            'progress_percentage', 'is_active'
        ]
        read_only_fields = ['id', 'enrollment_date', 'end_date']
    
    def validate_course_id(self, value):
        try:
            course = Course.objects.get(id=value, is_active=True)
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or inactive.")


class StudentRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for student registration."""
    user = serializers.DictField()
    course_id = serializers.IntegerField(write_only=True)
    batch = serializers.ChoiceField(choices=StudentEnrollment.BATCH_CHOICES)
    duration_months = serializers.ChoiceField(choices=StudentEnrollment.DURATION_CHOICES)
    start_date = serializers.DateField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'user', 'student_id', 'parent_name', 'parent_email', 'parent_phone',
            'address', 'date_of_birth', 'course_id', 'batch', 'duration_months', 'start_date'
        ]
    
    def validate_user(self, value):
        """Validate user data."""
        required_fields = ['email', 'name', 'password']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"User {field} is required.")
        
        # Check if email already exists
        if User.objects.filter(email=value['email']).exists():
            raise serializers.ValidationError("User with this email already exists.")
        
        return value
    
    def validate_student_id(self, value):
        """Validate student ID uniqueness."""
        if StudentProfile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student with this ID already exists.")
        return value
    
    def validate_course_id(self, value):
        """Validate course exists and is active."""
        try:
            course = Course.objects.get(id=value, is_active=True)
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or inactive.")
    
    def create(self, validated_data):
        """Create student with user and enrollment."""
        user_data = validated_data.pop('user')
        course_id = validated_data.pop('course_id')
        batch = validated_data.pop('batch')
        duration_months = validated_data.pop('duration_months')
        start_date = validated_data.pop('start_date')
        
        # Create user
        user = User.objects.create_user(
            email=user_data['email'],
            password=user_data['password'],
            name=user_data['name'],
            phone=user_data.get('phone', ''),
            user_type='student'
        )
        
        # Create student profile
        student_profile = StudentProfile.objects.create(
            user=user,
            **validated_data
        )
        
        # Create enrollment
        course = Course.objects.get(id=course_id)
        StudentEnrollment.objects.create(
            student=student_profile,
            course=course,
            batch=batch,
            duration_months=duration_months,
            start_date=start_date
        )
        
        return student_profile


class StudentListSerializer(serializers.ModelSerializer):
    """Serializer for student list view."""
    user = UserSerializer(read_only=True)
    current_enrollments = serializers.SerializerMethodField()
    total_enrollments = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'student_id', 'parent_name', 'parent_email',
            'parent_phone', 'current_enrollments', 'total_enrollments'
        ]
    
    def get_current_enrollments(self, obj):
        """Get current active enrollments."""
        active_enrollments = obj.enrollments.filter(status='active')
        return StudentEnrollmentSerializer(active_enrollments, many=True).data
    
    def get_total_enrollments(self, obj):
        """Get total number of enrollments."""
        return obj.enrollments.count()


class StudentDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed student view."""
    user = UserSerializer(read_only=True)
    enrollments = StudentEnrollmentSerializer(many=True, read_only=True)
    active_enrollments = serializers.SerializerMethodField()
    completed_enrollments = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'student_id', 'parent_name', 'parent_email',
            'parent_phone', 'address', 'date_of_birth', 'enrollments',
            'active_enrollments', 'completed_enrollments'
        ]
    
    def get_active_enrollments(self, obj):
        """Get active enrollments."""
        active_enrollments = obj.enrollments.filter(status='active')
        return StudentEnrollmentSerializer(active_enrollments, many=True).data
    
    def get_completed_enrollments(self, obj):
        """Get completed enrollments."""
        completed_enrollments = obj.enrollments.filter(status='completed')
        return StudentEnrollmentSerializer(completed_enrollments, many=True).data


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating student information."""
    user = serializers.DictField(required=False)
    
    class Meta:
        model = StudentProfile
        fields = [
            'user', 'parent_name', 'parent_email', 'parent_phone',
            'address', 'date_of_birth'
        ]
    
    def update(self, instance, validated_data):
        """Update student profile and user data."""
        user_data = validated_data.pop('user', {})
        
        # Update user fields
        if user_data:
            user = instance.user
            for field, value in user_data.items():
                if field in ['name', 'phone']:  # Only allow certain fields to be updated
                    setattr(user, field, value)
            user.save()
        
        # Update student profile fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        
        return instance
