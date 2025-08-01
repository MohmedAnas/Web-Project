from django.urls import path
from .views import (
    StudentListCreateView, StudentDetailView, StudentEnrollmentListView,
    StudentEnrollmentDetailView, student_dashboard_data, search_students
)

urlpatterns = [
    # Student CRUD
    path('', StudentListCreateView.as_view(), name='student-list-create'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    path('me/', StudentDetailView.as_view(), name='student-me'),
    
    # Student search
    path('search/', search_students, name='student-search'),
    
    # Student dashboard
    path('<int:pk>/dashboard/', student_dashboard_data, name='student-dashboard'),
    path('me/dashboard/', student_dashboard_data, name='student-dashboard-me'),
    
    # Student enrollments
    path('<int:student_id>/enrollments/', StudentEnrollmentListView.as_view(), name='student-enrollments'),
    path('<int:student_id>/enrollments/<int:pk>/', StudentEnrollmentDetailView.as_view(), name='student-enrollment-detail'),
]
