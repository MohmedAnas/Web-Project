from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord, AttendanceSummary
from apps.courses.serializers import CourseSerializer


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    total_students = serializers.IntegerField(read_only=True)
    present_students = serializers.IntegerField(read_only=True)
    absent_students = serializers.IntegerField(read_only=True)
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'course', 'course_id', 'batch', 'date', 'start_time', 
            'end_time', 'topic_covered', 'notes', 'total_students', 
            'present_students', 'absent_students', 'attendance_percentage',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    session_date = serializers.DateField(source='session.date', read_only=True)
    session_topic = serializers.CharField(source='session.topic_covered', read_only=True)
    course_name = serializers.CharField(source='session.course.name', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.name', read_only=True)
    is_present = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'session', 'student', 'student_name', 'student_id', 
            'enrollment', 'status', 'check_in_time', 'notes', 'is_present',
            'session_date', 'session_topic', 'course_name', 
            'marked_by', 'marked_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['marked_by', 'created_at', 'updated_at']


class AttendanceRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = [
            'session', 'student', 'enrollment', 'status', 'check_in_time', 'notes'
        ]
    
    def validate(self, data):
        # Ensure student and enrollment match
        if data['student'] != data['enrollment'].student:
            raise serializers.ValidationError("Student and enrollment must match.")
        
        # Ensure enrollment course matches session course
        if data['enrollment'].course != data['session'].course:
            raise serializers.ValidationError("Enrollment course must match session course.")
        
        return data


class BulkAttendanceSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    attendance_records = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_attendance_records(self, value):
        required_fields = ['student_id', 'status']
        for record in value:
            for field in required_fields:
                if field not in record:
                    raise serializers.ValidationError(f"Missing required field: {field}")
            
            if record['status'] not in ['present', 'absent', 'late', 'excused']:
                raise serializers.ValidationError(f"Invalid status: {record['status']}")
        
        return value


class AttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    course_code = serializers.CharField(source='enrollment.course.code', read_only=True)
    month_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'student', 'student_name', 'student_id', 'enrollment',
            'course_name', 'course_code', 'month', 'month_name',
            'total_sessions', 'present_sessions', 'absent_sessions',
            'late_sessions', 'excused_sessions', 'attendance_percentage',
            'created_at', 'updated_at'
        ]
    
    def get_month_name(self, obj):
        return obj.month.strftime('%B %Y')


class AttendanceStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    total_students = serializers.IntegerField()
    average_attendance = serializers.DecimalField(max_digits=5, decimal_places=2)
    present_today = serializers.IntegerField()
    absent_today = serializers.IntegerField()
    late_today = serializers.IntegerField()


class StudentAttendanceStatsSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    student_name = serializers.CharField()
    course_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    present_sessions = serializers.IntegerField()
    absent_sessions = serializers.IntegerField()
    late_sessions = serializers.IntegerField()
    excused_sessions = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    last_attendance_date = serializers.DateField()


class AttendanceReportSerializer(serializers.Serializer):
    date = serializers.DateField()
    course_name = serializers.CharField()
    batch = serializers.CharField()
    total_students = serializers.IntegerField()
    present_students = serializers.IntegerField()
    absent_students = serializers.IntegerField()
    late_students = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class AttendanceCalendarSerializer(serializers.Serializer):
    date = serializers.DateField()
    status = serializers.CharField()
    session_topic = serializers.CharField()
    check_in_time = serializers.TimeField()
