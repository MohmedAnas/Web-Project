from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Notice, NoticeReadStatus, NoticeComment
from .serializers import (
    NoticeSerializer, NoticeListSerializer, StudentNoticeSerializer,
    NoticeReadStatusSerializer, NoticeCommentSerializer, NoticeStatsSerializer,
    NoticeCreateSerializer
)
from apps.accounts.permissions import IsEditor


class NoticeListCreateView(generics.ListCreateAPIView):
    """List all notices or create a new one."""
    queryset = Notice.objects.select_related('created_by').prefetch_related('target_courses')
    permission_classes = [IsEditor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'priority', 'target_audience', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['publish_date', 'priority', 'created_at']
    ordering = ['-priority', '-publish_date']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return NoticeListSerializer
        return NoticeCreateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NoticeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a notice."""
    queryset = Notice.objects.select_related('created_by').prefetch_related('target_courses')
    serializer_class = NoticeSerializer
    permission_classes = [IsEditor]


class StudentNoticeListView(generics.ListAPIView):
    """List notices for current student."""
    serializer_class = StudentNoticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'priority']
    search_fields = ['title', 'content']
    ordering = ['-priority', '-publish_date']
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'student_profile'):
            return Notice.objects.none()
        
        student = self.request.user.student_profile
        now = timezone.now()
        
        # Get notices that are published, active, and not expired
        base_queryset = Notice.objects.filter(
            is_active=True,
            publish_date__lte=now
        ).filter(
            Q(expiry_date__isnull=True) | Q(expiry_date__gt=now)
        )
        
        # Filter based on target audience
        notices = base_queryset.filter(
            Q(target_audience='all') |
            Q(target_audience='course_specific', target_courses__in=student.enrollments.values('course')) |
            Q(target_audience='batch_specific', target_batches__icontains=student.enrollments.first().batch if student.enrollments.exists() else '')
        ).distinct()
        
        return notices.select_related('created_by')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notice_read(request, notice_id):
    """Mark a notice as read by the current student."""
    if not hasattr(request.user, 'student_profile'):
        return Response(
            {'error': 'Only students can mark notices as read'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        notice = Notice.objects.get(id=notice_id)
    except Notice.DoesNotExist:
        return Response(
            {'error': 'Notice not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    read_status, created = NoticeReadStatus.objects.get_or_create(
        notice=notice,
        student=request.user.student_profile
    )
    
    if not read_status.is_read:
        read_status.mark_as_read()
    
    serializer = NoticeReadStatusSerializer(read_status)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsEditor])
def notice_stats(request):
    """Get notice statistics."""
    total_notices = Notice.objects.count()
    active_notices = Notice.objects.filter(is_active=True).count()
    
    # Expired notices
    expired_notices = Notice.objects.filter(
        expiry_date__lt=timezone.now()
    ).count()
    
    # High priority notices
    high_priority_notices = Notice.objects.filter(
        priority='high',
        is_active=True
    ).count()
    
    # Recent notices (last 7 days)
    recent_notices = Notice.objects.filter(
        created_at__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    # Unread notices (for students)
    unread_notices = 0  # This would require more complex calculation
    
    stats = {
        'total_notices': total_notices,
        'active_notices': active_notices,
        'expired_notices': expired_notices,
        'high_priority_notices': high_priority_notices,
        'unread_notices': unread_notices,
        'recent_notices': recent_notices,
    }
    
    serializer = NoticeStatsSerializer(stats)
    return Response(serializer.data)
