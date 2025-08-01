from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from apps.accounts.models import StudentProfile
from apps.accounts.permissions import (
    IsAdmin, IsEditor, IsViewer, IsStudentOrAdmin, 
    IsOwnerOrAdmin, StudentSelfAccessPermission
)
from apps.accounts.decorators import (
    require_admin, require_viewer, student_self_access_only, log_access
)
from .models import StudentEnrollment
from .serializers import (
    StudentRegistrationSerializer, StudentListSerializer, StudentDetailSerializer,
    StudentUpdateSerializer, StudentEnrollmentSerializer
)


class StudentListCreateView(generics.ListCreateAPIView):
    """List all students or create a new student."""
    queryset = StudentProfile.objects.all().select_related('user')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['student_id', 'user__name', 'user__email', 'parent_name']
    ordering_fields = ['student_id', 'user__name', 'user__date_joined']
    ordering = ['-user__date_joined']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentRegistrationSerializer
        return StudentListSerializer
    
    def get_permissions(self):
        """Only admin users can create students, viewers can list."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated(), IsViewer()]


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a student."""
    queryset = StudentProfile.objects.all().select_related('user').prefetch_related('enrollments__course')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentUpdateSerializer
        return StudentDetailSerializer
    
    def get_permissions(self):
        """Students can view their own profile, admins can do everything."""
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated(), StudentSelfAccessPermission()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        else:  # DELETE
            return [permissions.IsAuthenticated(), IsAdmin()]
    
    def get_object(self):
        """Allow students to access their own profile via 'me' endpoint."""
        if self.kwargs.get('pk') == 'me' and self.request.user.is_student:
            return StudentProfile.objects.get(user=self.request.user)
        return super().get_object()


class StudentEnrollmentListView(generics.ListCreateAPIView):
    """List enrollments for a specific student or create new enrollment."""
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsViewer]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        return StudentEnrollment.objects.filter(
            student_id=student_id
        ).select_related('course', 'student__user')
    
    def get_permissions(self):
        """Viewers can list, editors can create."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsEditor()]
        return [permissions.IsAuthenticated(), IsViewer()]
    
    def perform_create(self, serializer):
        student_id = self.kwargs['student_id']
        student = StudentProfile.objects.get(id=student_id)
        serializer.save(student=student)


class StudentEnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a student enrollment."""
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditor]
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        return StudentEnrollment.objects.filter(
            student_id=student_id
        ).select_related('course', 'student__user')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@log_access
def student_dashboard_data(request, pk=None):
    """Get dashboard data for a student."""
    if pk == 'me' and request.user.is_student:
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    elif pk and request.user.is_admin_user:
        try:
            student = StudentProfile.objects.get(id=pk)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get enrollments
    enrollments = student.enrollments.all().select_related('course')
    active_enrollments = enrollments.filter(status='active')
    completed_enrollments = enrollments.filter(status='completed')
    
    # Calculate statistics
    total_courses = enrollments.count()
    active_courses = active_enrollments.count()
    completed_courses = completed_enrollments.count()
    
    # Get recent activities (you can expand this based on your needs)
    recent_enrollments = enrollments.order_by('-enrollment_date')[:5]
    
    dashboard_data = {
        'student': StudentDetailSerializer(student).data,
        'statistics': {
            'total_courses': total_courses,
            'active_courses': active_courses,
            'completed_courses': completed_courses,
        },
        'active_enrollments': StudentEnrollmentSerializer(active_enrollments, many=True).data,
        'recent_enrollments': StudentEnrollmentSerializer(recent_enrollments, many=True).data,
    }
    
    return Response(dashboard_data)


@api_view(['GET'])
@require_viewer
@log_access
def search_students(request):
    """Search students by various criteria."""
    query = request.GET.get('q', '')
    batch = request.GET.get('batch', '')
    course_id = request.GET.get('course_id', '')
    status_filter = request.GET.get('status', '')
    
    students = StudentProfile.objects.all().select_related('user')
    
    if query:
        students = students.filter(
            Q(student_id__icontains=query) |
            Q(user__name__icontains=query) |
            Q(user__email__icontains=query) |
            Q(parent_name__icontains=query)
        )
    
    if batch:
        students = students.filter(enrollments__batch=batch).distinct()
    
    if course_id:
        students = students.filter(enrollments__course_id=course_id).distinct()
    
    if status_filter:
        students = students.filter(enrollments__status=status_filter).distinct()
    
    serializer = StudentListSerializer(students, many=True)
    return Response(serializer.data)
