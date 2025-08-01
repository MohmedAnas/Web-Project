from django.urls import path
from . import views

urlpatterns = [
    # Fee Structure URLs
    path('structures/', views.FeeStructureListCreateView.as_view(), name='fee-structure-list'),
    path('structures/<int:pk>/', views.FeeStructureDetailView.as_view(), name='fee-structure-detail'),
    
    # Student Fee URLs
    path('', views.StudentFeeListCreateView.as_view(), name='student-fee-list'),
    path('<int:pk>/', views.StudentFeeDetailView.as_view(), name='student-fee-detail'),
    path('my-fees/', views.MyFeesView.as_view(), name='my-fees'),
    path('overdue/', views.overdue_fees, name='overdue-fees'),
    path('bulk-create/', views.bulk_fee_creation, name='bulk-fee-creation'),
    
    # Fee Payment URLs
    path('<int:student_fee_id>/payments/', views.StudentFeePaymentListCreateView.as_view(), name='fee-payment-list'),
    path('payments/<int:pk>/', views.FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
    # Fee Reminder URLs
    path('<int:student_fee_id>/reminders/', views.StudentFeeReminderListCreateView.as_view(), name='fee-reminder-list'),
    path('<int:student_fee_id>/send-reminder/', views.send_fee_reminder, name='send-fee-reminder'),
    
    # Statistics and Reports
    path('stats/', views.fee_stats, name='fee-stats'),
    path('reports/', views.fee_reports, name='fee-reports'),
]
