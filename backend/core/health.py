"""
Health check endpoints for monitoring and deployment verification.
"""

from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import sys
import os

def health_check(request):
    """
    Basic health check endpoint for Render deployment monitoring.
    Returns system status and basic information.
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Get system information
    health_data = {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": "2024-08-01T05:00:00Z",
        "version": "1.0.0",
        "environment": "production" if not settings.DEBUG else "development",
        "database": db_status,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "django_version": settings.DJANGO_VERSION if hasattr(settings, 'DJANGO_VERSION') else "4.2.4",
        "services": {
            "api": "running",
            "database": db_status,
            "static_files": "configured" if settings.STATIC_ROOT else "not_configured"
        }
    }
    
    # Return appropriate status code
    status_code = 200 if health_data["status"] == "healthy" else 503
    
    return JsonResponse(health_data, status=status_code)

def readiness_check(request):
    """
    Readiness check for deployment verification.
    Ensures all critical services are ready.
    """
    checks = {
        "database": False,
        "migrations": False,
        "static_files": False
    }
    
    try:
        # Database check
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations")
            checks["database"] = True
            
            # Check if migrations are applied
            cursor.execute("SELECT COUNT(*) FROM django_migrations WHERE app = 'core'")
            if cursor.fetchone()[0] > 0:
                checks["migrations"] = True
    except Exception:
        pass
    
    # Static files check
    if os.path.exists(settings.STATIC_ROOT):
        checks["static_files"] = True
    
    all_ready = all(checks.values())
    
    return JsonResponse({
        "ready": all_ready,
        "checks": checks,
        "timestamp": "2024-08-01T05:00:00Z"
    }, status=200 if all_ready else 503)
