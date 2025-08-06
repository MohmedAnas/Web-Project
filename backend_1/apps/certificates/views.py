from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CertificateTemplate, StudentCertificate, CertificateVerification, CertificateDownload
from .serializers import (
    CertificateTemplateSerializer, StudentCertificateSerializer,
    StudentCertificateCreateSerializer, StudentCertificateListSerializer,
    CertificateStatsSerializer, CertificateVerifySerializer,
    CertificateVerifyResponseSerializer, BulkCertificateCreateSerializer
)
from apps.accounts.permissions import IsEditor


class CertificateTemplateListCreateView(generics.ListCreateAPIView):
    """List all certificate templates or create a new one."""
    queryset = CertificateTemplate.objects.select_related('course', 'created_by')
    serializer_class = CertificateTemplateSerializer
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'is_active']
    search_fields = ['name', 'course__name']
    ordering = ['course__name', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CertificateTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a certificate template."""
    queryset = CertificateTemplate.objects.select_related('course', 'created_by')
    serializer_class = CertificateTemplateSerializer
    permission_classes = [IsEditor]


class StudentCertificateListCreateView(generics.ListCreateAPIView):
    """List all student certificates or create a new one."""
    queryset = StudentCertificate.objects.select_related(
        'student__user', 'enrollment__course', 'template', 'issued_by'
    )
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'enrollment__course', 'grade']
    search_fields = ['certificate_number', 'student__student_id', 'student__user__name']
    ordering_fields = ['issue_date', 'completion_date']
    ordering = ['-issue_date']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return StudentCertificateListSerializer
        return StudentCertificateCreateSerializer
    
    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)


class StudentCertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a student certificate."""
    queryset = StudentCertificate.objects.select_related(
        'student__user', 'enrollment__course', 'template', 'issued_by'
    )
    serializer_class = StudentCertificateSerializer
    permission_classes = [IsEditor]


class MyCertificatesView(generics.ListAPIView):
    """Get current student's certificates."""
    serializer_class = StudentCertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'student_profile'):
            return StudentCertificate.objects.none()
        
        return StudentCertificate.objects.filter(
            student=self.request.user.student_profile
        ).select_related('enrollment__course', 'template', 'issued_by')


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_certificate(request):
    """Verify a certificate using verification code."""
    serializer = CertificateVerifySerializer(data=request.data)
    if serializer.is_valid():
        verification_code = serializer.validated_data['verification_code']
        
        try:
            certificate = StudentCertificate.objects.get(verification_code=verification_code)
            
            # Record verification attempt
            CertificateVerification.objects.create(
                certificate=certificate,
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            response_data = {
                'is_valid': certificate.is_valid,
                'certificate_number': certificate.certificate_number,
                'student_name': certificate.student.user.name,
                'student_id': certificate.student.student_id,
                'course_name': certificate.enrollment.course.name,
                'course_code': certificate.enrollment.course.code,
                'issue_date': certificate.issue_date,
                'completion_date': certificate.completion_date,
                'grade': certificate.grade or '',
                'percentage': certificate.percentage,
                'status': certificate.status,
            }
            
            response_serializer = CertificateVerifyResponseSerializer(response_data)
            return Response(response_serializer.data)
            
        except StudentCertificate.DoesNotExist:
            return Response(
                {'error': 'Invalid verification code'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsEditor])
def certificate_stats(request):
    """Get certificate statistics."""
    total_certificates = StudentCertificate.objects.count()
    issued_certificates = StudentCertificate.objects.filter(status='issued').count()
    draft_certificates = StudentCertificate.objects.filter(status='draft').count()
    revoked_certificates = StudentCertificate.objects.filter(status='revoked').count()
    
    # Certificates issued this month
    current_month = timezone.now().replace(day=1)
    certificates_this_month = StudentCertificate.objects.filter(
        issue_date__gte=current_month
    ).count()
    
    # Download and verification counts
    total_downloads = CertificateDownload.objects.count()
    total_verifications = CertificateVerification.objects.count()
    
    stats = {
        'total_certificates': total_certificates,
        'issued_certificates': issued_certificates,
        'draft_certificates': draft_certificates,
        'revoked_certificates': revoked_certificates,
        'certificates_this_month': certificates_this_month,
        'total_downloads': total_downloads,
        'total_verifications': total_verifications,
    }
    
    serializer = CertificateStatsSerializer(stats)
    return Response(serializer.data)
