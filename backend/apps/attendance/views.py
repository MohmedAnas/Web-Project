from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import AttendanceSession, AttendanceRecord, AttendanceSummary
from .serializers import (
    AttendanceSessionSerializer, AttendanceRecordSerializer, 
    AttendanceRecordCreateSerializer, BulkAttendanceSerializer,
    AttendanceSummarySerializer, AttendanceStatsSerializer
)
from apps.accounts.permissions import IsEditor


class AttendanceSessionListCreateView(generics.ListCreateAPIView):
    """List all attendance sessions or create a new one."""
    queryset = AttendanceSession.objects.select_related('course', 'created_by')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'batch', 'date']
    search_fields = ['course__name', 'topic_covered']
    ordering_fields = ['date', 'start_time']
    ordering = ['-date', 'start_time']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AttendanceSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an attendance session."""
    queryset = AttendanceSession.objects.select_related('course', 'created_by')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsEditor]


class AttendanceRecordListCreateView(generics.ListCreateAPIView):
    """List attendance records for a session or create new records."""
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'student', 'session__course']
    search_fields = ['student__student_id', 'student__user__name']
    ordering = ['student__student_id']
    
    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        if session_id:
            return AttendanceRecord.objects.filter(
                session_id=session_id
            ).select_related('student__user', 'enrollment__course', 'marked_by')
        return AttendanceRecord.objects.select_related(
            'student__user', 'enrollment__course', 'marked_by', 'session'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AttendanceRecordCreateSerializer
        return AttendanceRecordSerializer
    
    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)


class AttendanceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an attendance record."""
    queryset = AttendanceRecord.objects.select_related(
        'student__user', 'enrollment__course', 'marked_by', 'session'
    )
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsEditor]


@api_view(['POST'])
@permission_classes([IsEditor])
def bulk_attendance(request):
    """Mark attendance for multiple students in bulk."""
    serializer = BulkAttendanceSerializer(data=request.data)
    if serializer.is_valid():
        session_id = serializer.validated_data['session_id']
        attendance_records = serializer.validated_data['attendance_records']
        
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        from apps.accounts.models import StudentProfile
        from apps.students.models import StudentEnrollment
        
        created_records = []
        errors = []
        
        for record_data in attendance_records:
            try:
                student = StudentProfile.objects.get(student_id=record_data['student_id'])
                enrollment = StudentEnrollment.objects.get(
                    student=student, 
                    course=session.course,
                    status='active'
                )
                
                # Update or create attendance record
                attendance_record, created = AttendanceRecord.objects.update_or_create(
                    session=session,
                    student=student,
                    defaults={
                        'enrollment': enrollment,
                        'status': record_data['status'],
                        'check_in_time': record_data.get('check_in_time'),
                        'notes': record_data.get('notes', ''),
                        'marked_by': request.user
                    }
                )
                created_records.append(attendance_record)
                
            except StudentProfile.DoesNotExist:
                errors.append(f"Student {record_data['student_id']} not found")
            except StudentEnrollment.DoesNotExist:
                errors.append(f"Active enrollment not found for student {record_data['student_id']}")
        
        response_data = {
            'created_count': len(created_records),
            'errors': errors
        }
        
        if created_records:
            response_data['records'] = AttendanceRecordSerializer(created_records, many=True).data
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsEditor])
def attendance_stats(request):
    """Get attendance statistics."""
    today = timezone.now().date()
    
    # Overall statistics
    total_sessions = AttendanceSession.objects.count()
    total_students = AttendanceRecord.objects.values('student').distinct().count()
    
    # Calculate average attendance
    sessions_with_attendance = AttendanceSession.objects.annotate(
        attendance_rate=Count('attendance_records', filter=models.Q(attendance_records__status__in=['present', 'late'])) * 100.0 / Count('attendance_records')
    ).aggregate(avg_attendance=Avg('attendance_rate'))
    
    average_attendance = sessions_with_attendance['avg_attendance'] or 0
    
    # Today's statistics
    today_records = AttendanceRecord.objects.filter(session__date=today)
    present_today = today_records.filter(status__in=['present', 'late']).count()
    absent_today = today_records.filter(status='absent').count()
    late_today = today_records.filter(status='late').count()
    
    stats = {
        'total_sessions': total_sessions,
        'total_students': total_students,
        'average_attendance': round(average_attendance, 2),
        'present_today': present_today,
        'absent_today': absent_today,
        'late_today': late_today,
    }
    
    serializer = AttendanceStatsSerializer(stats)
    return Response(serializer.data)


class MyAttendanceView(generics.ListAPIView):
    """Get current student's attendance records."""
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'student_profile'):
            return AttendanceRecord.objects.none()
        
        return AttendanceRecord.objects.filter(
            student=self.request.user.student_profile
        ).select_related('session__course', 'enrollment__course')


class AttendanceSummaryListView(generics.ListAPIView):
    """List attendance summaries."""
    queryset = AttendanceSummary.objects.select_related(
        'student__user', 'enrollment__course'
    )
    serializer_class = AttendanceSummarySerializer
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['month', 'enrollment__course', 'student']
    search_fields = ['student__student_id', 'student__user__name']
    ordering = ['-month', 'student__student_id']
