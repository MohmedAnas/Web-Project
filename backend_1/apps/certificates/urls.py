from django.urls import path
from . import views

urlpatterns = [
    # Certificate Template URLs
    path('templates/', views.CertificateTemplateListCreateView.as_view(), name='certificate-template-list'),
    path('templates/<int:pk>/', views.CertificateTemplateDetailView.as_view(), name='certificate-template-detail'),
    
    # Student Certificate URLs
    path('', views.StudentCertificateListCreateView.as_view(), name='student-certificate-list'),
    path('<int:pk>/', views.StudentCertificateDetailView.as_view(), name='student-certificate-detail'),
    path('my-certificates/', views.MyCertificatesView.as_view(), name='my-certificates'),
    
    # Certificate Verification
    path('verify/', views.verify_certificate, name='verify-certificate'),
    
    # Statistics
    path('stats/', views.certificate_stats, name='certificate-stats'),
]
