from django.urls import path
from . import views

urlpatterns = [
    # Attendance Session URLs
    path('sessions/', views.AttendanceSessionListCreateView.as_view(), name='attendance-session-list'),
    path('sessions/<int:pk>/', views.AttendanceSessionDetailView.as_view(), name='attendance-session-detail'),
    
    # Attendance Record URLs
    path('records/', views.AttendanceRecordListCreateView.as_view(), name='attendance-record-list'),
    path('records/<int:pk>/', views.AttendanceRecordDetailView.as_view(), name='attendance-record-detail'),
    path('sessions/<int:session_id>/records/', views.AttendanceRecordListCreateView.as_view(), name='session-attendance-records'),
    
    # Bulk Operations
    path('bulk-mark/', views.bulk_attendance, name='bulk-attendance'),
    
    # Student Views
    path('my-attendance/', views.MyAttendanceView.as_view(), name='my-attendance'),
    
    # Summary and Statistics
    path('summaries/', views.AttendanceSummaryListView.as_view(), name='attendance-summary-list'),
    path('stats/', views.attendance_stats, name='attendance-stats'),
]
