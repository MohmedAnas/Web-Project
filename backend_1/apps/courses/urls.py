from django.urls import path
from .views import (
    CourseListCreateView, CourseDetailView, CourseModuleListCreateView,
    CourseModuleDetailView, CourseScheduleListCreateView, CourseScheduleDetailView,
    course_stats, course_enrollment_stats, search_courses, active_courses
)

urlpatterns = [
    # Course CRUD
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    
    # Course search and filtering
    path('search/', search_courses, name='course-search'),
    path('active/', active_courses, name='active-courses'),
    
    # Course statistics
    path('stats/', course_stats, name='course-stats'),
    path('<int:pk>/stats/', course_enrollment_stats, name='course-enrollment-stats'),
    
    # Course modules
    path('<int:course_id>/modules/', CourseModuleListCreateView.as_view(), name='course-modules'),
    path('<int:course_id>/modules/<int:pk>/', CourseModuleDetailView.as_view(), name='course-module-detail'),
    
    # Course schedules
    path('<int:course_id>/schedules/', CourseScheduleListCreateView.as_view(), name='course-schedules'),
    path('<int:course_id>/schedules/<int:pk>/', CourseScheduleDetailView.as_view(), name='course-schedule-detail'),
]
