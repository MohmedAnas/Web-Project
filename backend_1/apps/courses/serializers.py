from rest_framework import serializers
from .models import Course, CourseModule, CourseSchedule


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for CourseModule model."""
    
    class Meta:
        model = CourseModule
        fields = ['id', 'name', 'description', 'order']
        read_only_fields = ['id']


class CourseScheduleSerializer(serializers.ModelSerializer):
    """Serializer for CourseSchedule model."""
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    batch_display = serializers.CharField(source='get_batch_display', read_only=True)
    
    class Meta:
        model = CourseSchedule
        fields = [
            'id', 'batch', 'batch_display', 'day_of_week', 'day_of_week_display',
            'start_time', 'end_time', 'is_active'
        ]
        read_only_fields = ['id']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model."""
    modules = CourseModuleSerializer(many=True, read_only=True)
    schedules = CourseScheduleSerializer(many=True, read_only=True)
    total_enrollments = serializers.SerializerMethodField()
    active_enrollments = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'syllabus', 'duration_months',
            'fee', 'is_active', 'created_at', 'updated_at', 'modules', 'schedules',
            'total_enrollments', 'active_enrollments'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_enrollments(self, obj):
        """Get total number of enrollments for this course."""
        return obj.enrollments.count()
    
    def get_active_enrollments(self, obj):
        """Get number of active enrollments for this course."""
        return obj.enrollments.filter(status='active').count()


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view."""
    total_enrollments = serializers.SerializerMethodField()
    active_enrollments = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'duration_months',
            'fee', 'is_active', 'created_at', 'total_enrollments', 'active_enrollments'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_total_enrollments(self, obj):
        return obj.enrollments.count()
    
    def get_active_enrollments(self, obj):
        return obj.enrollments.filter(status='active').count()


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating courses."""
    modules = CourseModuleSerializer(many=True, required=False)
    schedules = CourseScheduleSerializer(many=True, required=False)
    
    class Meta:
        model = Course
        fields = [
            'name', 'code', 'description', 'syllabus', 'duration_months',
            'fee', 'is_active', 'modules', 'schedules'
        ]
    
    def validate_code(self, value):
        """Validate course code uniqueness."""
        if self.instance:
            # For updates, exclude current instance
            if Course.objects.filter(code=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Course with this code already exists.")
        else:
            # For creation
            if Course.objects.filter(code=value).exists():
                raise serializers.ValidationError("Course with this code already exists.")
        return value
    
    def create(self, validated_data):
        """Create course with modules and schedules."""
        modules_data = validated_data.pop('modules', [])
        schedules_data = validated_data.pop('schedules', [])
        
        course = Course.objects.create(**validated_data)
        
        # Create modules
        for module_data in modules_data:
            CourseModule.objects.create(course=course, **module_data)
        
        # Create schedules
        for schedule_data in schedules_data:
            CourseSchedule.objects.create(course=course, **schedule_data)
        
        return course
    
    def update(self, instance, validated_data):
        """Update course with modules and schedules."""
        modules_data = validated_data.pop('modules', [])
        schedules_data = validated_data.pop('schedules', [])
        
        # Update course fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update modules (simple approach: delete and recreate)
        if modules_data:
            instance.modules.all().delete()
            for module_data in modules_data:
                CourseModule.objects.create(course=instance, **module_data)
        
        # Update schedules (simple approach: delete and recreate)
        if schedules_data:
            instance.schedules.all().delete()
            for schedule_data in schedules_data:
                CourseSchedule.objects.create(course=instance, **schedule_data)
        
        return instance


class CourseStatsSerializer(serializers.Serializer):
    """Serializer for course statistics."""
    total_courses = serializers.IntegerField()
    active_courses = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    popular_courses = serializers.ListField()


class CourseEnrollmentStatsSerializer(serializers.Serializer):
    """Serializer for course enrollment statistics."""
    course_name = serializers.CharField()
    course_code = serializers.CharField()
    total_enrollments = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    completed_enrollments = serializers.IntegerField()
    monthly_enrollments = serializers.ListField()
