from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import FeeStructure, StudentFee, FeePayment, FeeReminder
from .serializers import (
    FeeStructureSerializer, StudentFeeSerializer, StudentFeeCreateSerializer,
    FeePaymentSerializer, FeePaymentCreateSerializer, FeeReminderSerializer,
    FeeStatsSerializer, FeeReportSerializer
)
from apps.accounts.permissions import IsEditor, IsOwnerOrAdmin


class FeeStructureListCreateView(generics.ListCreateAPIView):
    """List all fee structures or create a new one."""
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'duration_months', 'is_active']
    search_fields = ['course__name', 'course__code']
    ordering_fields = ['course__name', 'duration_months', 'base_fee']
    ordering = ['course__name', 'duration_months']


class FeeStructureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a fee structure."""
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsEditor]


class StudentFeeListCreateView(generics.ListCreateAPIView):
    """List all student fees or create a new one."""
    queryset = StudentFee.objects.select_related(
        'student__user', 'enrollment__course', 'fee_structure'
    ).prefetch_related('payments')
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'enrollment__course', 'enrollment__batch']
    search_fields = ['student__student_id', 'student__user__name', 'enrollment__course__name']
    ordering_fields = ['due_date', 'total_amount', 'paid_amount']
    ordering = ['-due_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentFeeCreateSerializer
        return StudentFeeSerializer


class StudentFeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a student fee."""
    queryset = StudentFee.objects.select_related(
        'student__user', 'enrollment__course', 'fee_structure'
    ).prefetch_related('payments')
    serializer_class = StudentFeeSerializer
    permission_classes = [IsEditor]


class StudentFeePaymentListCreateView(generics.ListCreateAPIView):
    """List payments for a student fee or create a new payment."""
    serializer_class = FeePaymentSerializer
    permission_classes = [IsEditor]
    
    def get_queryset(self):
        student_fee_id = self.kwargs['student_fee_id']
        return FeePayment.objects.filter(student_fee_id=student_fee_id).select_related(
            'created_by', 'student_fee__student__user'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeePaymentCreateSerializer
        return FeePaymentSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FeePaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a fee payment."""
    queryset = FeePayment.objects.select_related('created_by', 'student_fee__student__user')
    serializer_class = FeePaymentSerializer
    permission_classes = [IsEditor]


class StudentFeeReminderListCreateView(generics.ListCreateAPIView):
    """List reminders for a student fee or create a new reminder."""
    serializer_class = FeeReminderSerializer
    permission_classes = [IsEditor]
    
    def get_queryset(self):
        student_fee_id = self.kwargs['student_fee_id']
        return FeeReminder.objects.filter(student_fee_id=student_fee_id).select_related(
            'created_by', 'student_fee__student__user'
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MyFeesView(generics.ListAPIView):
    """Get current student's fees."""
    serializer_class = StudentFeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'student_profile'):
            return StudentFee.objects.none()
        
        return StudentFee.objects.filter(
            student=self.request.user.student_profile
        ).select_related(
            'enrollment__course', 'fee_structure'
        ).prefetch_related('payments')


@api_view(['GET'])
@permission_classes([IsEditor])
def fee_stats(request):
    """Get fee statistics."""
    # Calculate overall fee statistics
    total_fees = StudentFee.objects.aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    collected_fees = StudentFee.objects.aggregate(
        collected=Sum('paid_amount')
    )['collected'] or 0
    
    pending_fees = total_fees - collected_fees
    
    overdue_fees = StudentFee.objects.filter(
        due_date__lt=timezone.now().date(),
        status__in=['pending', 'partial', 'overdue']
    ).aggregate(
        overdue=Sum('total_amount') - Sum('paid_amount')
    )
    overdue_amount = overdue_fees['overdue'] or 0
    
    collection_percentage = (collected_fees / total_fees * 100) if total_fees > 0 else 0
    
    # Student statistics
    total_students = StudentFee.objects.values('student').distinct().count()
    paid_students = StudentFee.objects.filter(status='paid').values('student').distinct().count()
    pending_students = StudentFee.objects.filter(
        status__in=['pending', 'partial']
    ).values('student').distinct().count()
    overdue_students = StudentFee.objects.filter(status='overdue').values('student').distinct().count()
    
    stats = {
        'total_fees': total_fees,
        'collected_fees': collected_fees,
        'pending_fees': pending_fees,
        'overdue_fees': overdue_amount,
        'collection_percentage': round(collection_percentage, 2),
        'total_students': total_students,
        'paid_students': paid_students,
        'pending_students': pending_students,
        'overdue_students': overdue_students,
    }
    
    serializer = FeeStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsEditor])
def fee_reports(request):
    """Get fee reports by course."""
    from django.db.models import Case, When, DecimalField
    from apps.courses.models import Course
    
    reports = []
    courses = Course.objects.all()
    
    for course in courses:
        course_fees = StudentFee.objects.filter(enrollment__course=course)
        
        total_students = course_fees.values('student').distinct().count()
        total_fees = course_fees.aggregate(total=Sum('total_amount'))['total'] or 0
        collected_fees = course_fees.aggregate(collected=Sum('paid_amount'))['collected'] or 0
        pending_fees = total_fees - collected_fees
        collection_percentage = (collected_fees / total_fees * 100) if total_fees > 0 else 0
        
        reports.append({
            'course_name': course.name,
            'course_code': course.code,
            'total_students': total_students,
            'total_fees': total_fees,
            'collected_fees': collected_fees,
            'pending_fees': pending_fees,
            'collection_percentage': round(collection_percentage, 2),
        })
    
    serializer = FeeReportSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsEditor])
def send_fee_reminder(request, student_fee_id):
    """Send fee reminder to student."""
    try:
        student_fee = StudentFee.objects.get(id=student_fee_id)
    except StudentFee.DoesNotExist:
        return Response(
            {'error': 'Student fee not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    reminder_type = request.data.get('reminder_type', 'email')
    message = request.data.get('message', '')
    
    # Create reminder record
    reminder = FeeReminder.objects.create(
        student_fee=student_fee,
        reminder_type=reminder_type,
        message=message,
        created_by=request.user,
        is_successful=True  # In real implementation, this would depend on actual sending
    )
    
    # TODO: Implement actual email/SMS sending logic here
    
    serializer = FeeReminderSerializer(reminder)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsEditor])
def overdue_fees(request):
    """Get list of overdue fees."""
    overdue_fees = StudentFee.objects.filter(
        due_date__lt=timezone.now().date(),
        status__in=['pending', 'partial', 'overdue']
    ).select_related(
        'student__user', 'enrollment__course', 'fee_structure'
    ).prefetch_related('payments')
    
    serializer = StudentFeeSerializer(overdue_fees, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsEditor])
def bulk_fee_creation(request):
    """Create fees for multiple students in bulk."""
    enrollment_ids = request.data.get('enrollment_ids', [])
    fee_structure_id = request.data.get('fee_structure_id')
    due_date = request.data.get('due_date')
    
    if not enrollment_ids or not fee_structure_id or not due_date:
        return Response(
            {'error': 'enrollment_ids, fee_structure_id, and due_date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        fee_structure = FeeStructure.objects.get(id=fee_structure_id)
    except FeeStructure.DoesNotExist:
        return Response(
            {'error': 'Fee structure not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    from apps.students.models import StudentEnrollment
    
    created_fees = []
    errors = []
    
    for enrollment_id in enrollment_ids:
        try:
            enrollment = StudentEnrollment.objects.get(id=enrollment_id)
            
            # Check if fee already exists
            if StudentFee.objects.filter(
                student=enrollment.student,
                enrollment=enrollment
            ).exists():
                errors.append(f"Fee already exists for enrollment {enrollment_id}")
                continue
            
            student_fee = StudentFee.objects.create(
                student=enrollment.student,
                enrollment=enrollment,
                fee_structure=fee_structure,
                total_amount=fee_structure.total_fee,
                due_date=due_date
            )
            created_fees.append(student_fee)
            
        except StudentEnrollment.DoesNotExist:
            errors.append(f"Enrollment {enrollment_id} not found")
    
    response_data = {
        'created_count': len(created_fees),
        'errors': errors
    }
    
    if created_fees:
        response_data['created_fees'] = StudentFeeSerializer(created_fees, many=True).data
    
    return Response(response_data, status=status.HTTP_201_CREATED)
