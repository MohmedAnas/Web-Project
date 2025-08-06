from rest_framework import serializers
from .models import Notice, NoticeReadStatus, NoticeComment
from apps.courses.serializers import CourseSerializer


class NoticeSerializer(serializers.ModelSerializer):
    target_courses = CourseSerializer(many=True, read_only=True)
    target_course_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    total_readers = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_published = serializers.BooleanField(read_only=True)
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'content', 'category', 'priority', 'target_audience',
            'target_courses', 'target_course_ids', 'target_batches', 'is_active',
            'publish_date', 'expiry_date', 'attachment', 'attachment_url',
            'created_by', 'created_by_name', 'total_readers', 'is_expired',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None
    
    def create(self, validated_data):
        target_course_ids = validated_data.pop('target_course_ids', [])
        notice = Notice.objects.create(**validated_data)
        
        if target_course_ids:
            notice.target_courses.set(target_course_ids)
        
        return notice
    
    def update(self, instance, validated_data):
        target_course_ids = validated_data.pop('target_course_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if target_course_ids is not None:
            instance.target_courses.set(target_course_ids)
        
        return instance


class NoticeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for notice list views."""
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    total_readers = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    target_courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'category', 'priority', 'target_audience',
            'target_courses_count', 'is_active', 'publish_date', 'expiry_date',
            'created_by_name', 'total_readers', 'is_expired', 'created_at'
        ]
    
    def get_target_courses_count(self, obj):
        return obj.target_courses.count()


class StudentNoticeSerializer(serializers.ModelSerializer):
    """Serializer for student notice view with read status."""
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    is_read = serializers.SerializerMethodField()
    read_at = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'content', 'category', 'priority', 'publish_date',
            'expiry_date', 'attachment', 'attachment_url', 'created_by_name',
            'is_read', 'read_at', 'created_at'
        ]
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            try:
                read_status = obj.read_status.get(student=request.user.student_profile)
                return read_status.is_read
            except NoticeReadStatus.DoesNotExist:
                return False
        return False
    
    def get_read_at(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            try:
                read_status = obj.read_status.get(student=request.user.student_profile)
                return read_status.read_at
            except NoticeReadStatus.DoesNotExist:
                return None
        return None
    
    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None


class NoticeReadStatusSerializer(serializers.ModelSerializer):
    notice_title = serializers.CharField(source='notice.title', read_only=True)
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = NoticeReadStatus
        fields = [
            'id', 'notice', 'notice_title', 'student', 'student_name',
            'student_id', 'is_read', 'read_at'
        ]
        read_only_fields = ['read_at']


class NoticeCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    
    class Meta:
        model = NoticeComment
        fields = [
            'id', 'notice', 'user', 'user_name', 'user_type',
            'comment', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class NoticeStatsSerializer(serializers.Serializer):
    total_notices = serializers.IntegerField()
    active_notices = serializers.IntegerField()
    expired_notices = serializers.IntegerField()
    high_priority_notices = serializers.IntegerField()
    unread_notices = serializers.IntegerField()
    recent_notices = serializers.IntegerField()


class NoticeCreateSerializer(serializers.ModelSerializer):
    target_course_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    
    class Meta:
        model = Notice
        fields = [
            'title', 'content', 'category', 'priority', 'target_audience',
            'target_course_ids', 'target_batches', 'is_active',
            'publish_date', 'expiry_date', 'attachment'
        ]
    
    def validate(self, data):
        target_audience = data.get('target_audience')
        target_course_ids = data.get('target_course_ids', [])
        target_batches = data.get('target_batches', '')
        
        if target_audience == 'course_specific' and not target_course_ids:
            raise serializers.ValidationError(
                "Target courses must be specified for course-specific notices."
            )
        
        if target_audience == 'batch_specific' and not target_batches:
            raise serializers.ValidationError(
                "Target batches must be specified for batch-specific notices."
            )
        
        return data
