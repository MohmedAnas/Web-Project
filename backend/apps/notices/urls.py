from django.urls import path
from . import views

urlpatterns = [
    # Admin Notice URLs
    path('', views.NoticeListCreateView.as_view(), name='notice-list'),
    path('<int:pk>/', views.NoticeDetailView.as_view(), name='notice-detail'),
    
    # Student Notice URLs
    path('student/', views.StudentNoticeListView.as_view(), name='student-notice-list'),
    path('<int:notice_id>/mark-read/', views.mark_notice_read, name='mark-notice-read'),
    
    # Statistics
    path('stats/', views.notice_stats, name='notice-stats'),
]
