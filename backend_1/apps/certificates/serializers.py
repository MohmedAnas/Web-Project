from rest_framework import serializers
from .models import CertificateTemplate, StudentCertificate, CertificateVerification, CertificateDownload
from apps.courses.serializers import CourseSerializer


class CertificateTemplateSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    certificates_issued = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    background_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'name', 'course', 'course_id', 'template_content',
            'background_image', 'background_image_url', 'is_active',
            'certificates_issued', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_background_image_url(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
        return None


class StudentCertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    course_code = serializers.CharField(source='enrollment.course.code', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.name', read_only=True)
    certificate_file_url = serializers.SerializerMethodField()
    verification_url = serializers.CharField(read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StudentCertificate
        fields = [
            'id', 'student', 'student_name', 'student_id', 'enrollment',
            'course_name', 'course_code', 'template', 'template_name',
            'certificate_number', 'issue_date', 'completion_date',
            'grade', 'percentage', 'status', 'certificate_file',
            'certificate_file_url', 'verification_code', 'verification_url',
            'notes', 'issued_by', 'issued_by_name', 'is_valid',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'certificate_number', 'verification_code', 'verification_url',
            'issued_by', 'created_at', 'updated_at'
        ]
    
    def get_certificate_file_url(self, obj):
        if obj.certificate_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_file.url)
        return None


class StudentCertificateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCertificate
        fields = [
            'student', 'enrollment', 'template', 'issue_date',
            'completion_date', 'grade', 'percentage', 'notes'
        ]
    
    def validate(self, data):
        # Ensure student and enrollment match
        if data['student'] != data['enrollment'].student:
            raise serializers.ValidationError("Student and enrollment must match.")
        
        # Ensure template course matches enrollment course
        if data['template'].course != data['enrollment'].course:
            raise serializers.ValidationError("Template course must match enrollment course.")
        
        # Ensure completion date is not before enrollment start date
        if data['completion_date'] < data['enrollment'].start_date:
            raise serializers.ValidationError(
                "Completion date cannot be before enrollment start date."
            )
        
        return data


class StudentCertificateListSerializer(serializers.ModelSerializer):
    """Simplified serializer for certificate list views."""
    student_name = serializers.CharField(source='student.user.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    course_code = serializers.CharField(source='enrollment.course.code', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StudentCertificate
        fields = [
            'id', 'certificate_number', 'student_name', 'student_id',
            'course_name', 'course_code', 'issue_date', 'completion_date',
            'grade', 'status', 'is_valid'
        ]


class CertificateVerificationSerializer(serializers.ModelSerializer):
    certificate_number = serializers.CharField(source='certificate.certificate_number', read_only=True)
    student_name = serializers.CharField(source='certificate.student.user.name', read_only=True)
    student_id = serializers.CharField(source='certificate.student.student_id', read_only=True)
    course_name = serializers.CharField(source='certificate.enrollment.course.name', read_only=True)
    
    class Meta:
        model = CertificateVerification
        fields = [
            'id', 'certificate', 'certificate_number', 'student_name',
            'student_id', 'course_name', 'verified_at', 'ip_address'
        ]
        read_only_fields = ['verified_at']


class CertificateDownloadSerializer(serializers.ModelSerializer):
    certificate_number = serializers.CharField(source='certificate.certificate_number', read_only=True)
    downloaded_by_name = serializers.CharField(source='downloaded_by.name', read_only=True)
    
    class Meta:
        model = CertificateDownload
        fields = [
            'id', 'certificate', 'certificate_number', 'downloaded_by',
            'downloaded_by_name', 'downloaded_at', 'ip_address'
        ]
        read_only_fields = ['downloaded_at']


class CertificateStatsSerializer(serializers.Serializer):
    total_certificates = serializers.IntegerField()
    issued_certificates = serializers.IntegerField()
    draft_certificates = serializers.IntegerField()
    revoked_certificates = serializers.IntegerField()
    certificates_this_month = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    total_verifications = serializers.IntegerField()


class CertificateVerifySerializer(serializers.Serializer):
    verification_code = serializers.UUIDField()
    
    def validate_verification_code(self, value):
        try:
            certificate = StudentCertificate.objects.get(verification_code=value)
            if not certificate.is_valid:
                raise serializers.ValidationError("Certificate is not valid.")
            return value
        except StudentCertificate.DoesNotExist:
            raise serializers.ValidationError("Invalid verification code.")


class CertificateVerifyResponseSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    certificate_number = serializers.CharField()
    student_name = serializers.CharField()
    student_id = serializers.CharField()
    course_name = serializers.CharField()
    course_code = serializers.CharField()
    issue_date = serializers.DateField()
    completion_date = serializers.DateField()
    grade = serializers.CharField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    status = serializers.CharField()


class BulkCertificateCreateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    enrollment_ids = serializers.ListField(child=serializers.IntegerField())
    issue_date = serializers.DateField()
    completion_date = serializers.DateField()
    
    def validate_enrollment_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one enrollment ID is required.")
        return value
