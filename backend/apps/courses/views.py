from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Course, CourseModule, CourseSchedule
from .serializers import (
    CourseSerializer, CourseListSerializer, CourseCreateUpdateSerializer,
    CourseModuleSerializer, CourseScheduleSerializer, CourseStatsSerializer,
    CourseEnrollmentStatsSerializer
)


class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_admin_user


class CourseListCreateView(generics.ListCreateAPIView):
    """List all courses or create a new course."""
    queryset = Course.objects.all().prefetch_related('modules', 'schedules', 'enrollments')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'duration_months']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at', 'fee']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseListSerializer
    
    def get_permissions(self):
        """Only admin users can create courses."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course."""
    queryset = Course.objects.all().prefetch_related('modules', 'schedules', 'enrollments')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CourseCreateUpdateSerializer
        return CourseSerializer
    
    def get_permissions(self):
        """Only admin users can modify courses."""
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminUser()]


class CourseModuleListCreateView(generics.ListCreateAPIView):
    """List modules for a course or create a new module."""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseModule.objects.filter(course_id=course_id).order_by('order')
    
    def get_permissions(self):
        """Only admin users can create modules."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = Course.objects.get(id=course_id)
        serializer.save(course=course)


class CourseModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course module."""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseModule.objects.filter(course_id=course_id)


class CourseScheduleListCreateView(generics.ListCreateAPIView):
    """List schedules for a course or create a new schedule."""
    serializer_class = CourseScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseSchedule.objects.filter(course_id=course_id)
    
    def get_permissions(self):
        """Only admin users can create schedules."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = Course.objects.get(id=course_id)
        serializer.save(course=course)


class CourseScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course schedule."""
    serializer_class = CourseScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseSchedule.objects.filter(course_id=course_id)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_stats(request):
    """Get course statistics."""
    if not request.user.is_admin_user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Basic stats
    total_courses = Course.objects.count()
    active_courses = Course.objects.filter(is_active=True).count()
    
    # Enrollment stats
    from apps.students.models import StudentEnrollment
    total_enrollments = StudentEnrollment.objects.count()
    active_enrollments = StudentEnrollment.objects.filter(status='active').count()
    
    # Popular courses (top 5 by enrollment count)
    popular_courses = Course.objects.annotate(
        enrollment_count=Count('enrollments')
    ).order_by('-enrollment_count')[:5]
    
    popular_courses_data = []
    for course in popular_courses:
        popular_courses_data.append({
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'enrollment_count': course.enrollment_count
        })
    
    stats_data = {
        'total_courses': total_courses,
        'active_courses': active_courses,
        'total_enrollments': total_enrollments,
        'active_enrollments': active_enrollments,
        'popular_courses': popular_courses_data
    }
    
    return Response(stats_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_enrollment_stats(request, pk):
    """Get enrollment statistics for a specific course."""
    if not request.user.is_admin_user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = Course.objects.get(id=pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    from apps.students.models import StudentEnrollment
    
    # Basic enrollment stats
    enrollments = StudentEnrollment.objects.filter(course=course)
    total_enrollments = enrollments.count()
    active_enrollments = enrollments.filter(status='active').count()
    completed_enrollments = enrollments.filter(status='completed').count()
    
    # Monthly enrollment data for the last 12 months
    monthly_enrollments = []
    current_date = timezone.now().date()
    
    for i in range(12):
        month_start = current_date.replace(day=1) - timedelta(days=30*i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_enrollments = enrollments.filter(
            enrollment_date__date__gte=month_start,
            enrollment_date__date__lte=month_end
        ).count()
        
        monthly_enrollments.append({
            'month': month_start.strftime('%Y-%m'),
            'enrollments': month_enrollments
        })
    
    monthly_enrollments.reverse()  # Show oldest to newest
    
    stats_data = {
        'course_name': course.name,
        'course_code': course.code,
        'total_enrollments': total_enrollments,
        'active_enrollments': active_enrollments,
        'completed_enrollments': completed_enrollments,
        'monthly_enrollments': monthly_enrollments
    }
    
    return Response(stats_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_courses(request):
    """Search courses by various criteria."""
    query = request.GET.get('q', '')
    is_active = request.GET.get('is_active', '')
    min_fee = request.GET.get('min_fee', '')
    max_fee = request.GET.get('max_fee', '')
    duration = request.GET.get('duration', '')
    
    courses = Course.objects.all()
    
    if query:
        courses = courses.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )
    
    if is_active:
        courses = courses.filter(is_active=is_active.lower() == 'true')
    
    if min_fee:
        try:
            courses = courses.filter(fee__gte=float(min_fee))
        except ValueError:
            pass
    
    if max_fee:
        try:
            courses = courses.filter(fee__lte=float(max_fee))
        except ValueError:
            pass
    
    if duration:
        try:
            courses = courses.filter(duration_months=int(duration))
        except ValueError:
            pass
    
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def active_courses(request):
    """Get all active courses."""
    courses = Course.objects.filter(is_active=True).order_by('name')
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)
