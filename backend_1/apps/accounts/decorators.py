from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def require_authentication(view_func):
    """
    Decorator to ensure user is authenticated
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            logger.warning("Unauthenticated access attempt")
            raise NotAuthenticated("Authentication credentials were not provided.")
        
        if not request.user.is_active:
            logger.warning(f"Inactive user access attempt: {request.user.email}")
            raise PermissionDenied("User account is disabled.")
        
        return view_func(request, *args, **kwargs)
    return wrapper


def require_roles(*allowed_roles):
    """
    Decorator to require specific user roles
    Usage: @require_roles('admin', 'super_admin')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                logger.warning("Unauthenticated access attempt")
                raise NotAuthenticated("Authentication credentials were not provided.")
            
            if not request.user.is_active:
                logger.warning(f"Inactive user access attempt: {request.user.email}")
                raise PermissionDenied("User account is disabled.")
            
            user_role = request.user.user_type
            if user_role not in allowed_roles:
                logger.warning(f"Role permission denied for user {request.user.email} with role {user_role}. Required: {allowed_roles}")
                raise PermissionDenied(f"Required roles: {', '.join(allowed_roles)}")
            
            logger.info(f"Role access granted for user {request.user.email} with role {user_role}")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_super_admin(view_func):
    """
    Decorator to require super admin role
    """
    return require_roles('super_admin')(view_func)


def require_admin(view_func):
    """
    Decorator to require admin or super admin role
    """
    return require_roles('admin', 'super_admin')(view_func)


def require_editor(view_func):
    """
    Decorator to require editor, admin, or super admin role
    """
    return require_roles('editor', 'admin', 'super_admin')(view_func)


def require_viewer(view_func):
    """
    Decorator to require any admin role (viewer, editor, admin, super_admin)
    """
    return require_roles('viewer', 'editor', 'admin', 'super_admin')(view_func)


def require_student(view_func):
    """
    Decorator to require student role
    """
    return require_roles('student')(view_func)


def require_student_or_admin(view_func):
    """
    Decorator to require student or any admin role
    """
    return require_roles('student', 'viewer', 'editor', 'admin', 'super_admin')(view_func)


def student_self_access_only(view_func):
    """
    Decorator to ensure students can only access their own data
    Admins can access any data
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            raise NotAuthenticated("Authentication credentials were not provided.")
        
        if not request.user.is_active:
            raise PermissionDenied("User account is disabled.")
        
        # Admin users can access any data
        if request.user.user_type in ['super_admin', 'admin', 'editor', 'viewer']:
            return view_func(request, *args, **kwargs)
        
        # Students can only access their own data
        if request.user.user_type == 'student':
            # Check if accessing own profile via 'me' endpoint
            if kwargs.get('pk') == 'me':
                return view_func(request, *args, **kwargs)
            
            # Check if the pk matches the student's profile ID
            try:
                student_profile = request.user.student_profile
                if str(kwargs.get('pk')) == str(student_profile.id):
                    return view_func(request, *args, **kwargs)
            except:
                pass
            
            logger.warning(f"Student {request.user.email} attempted to access unauthorized data")
            raise PermissionDenied("Students can only access their own data.")
        
        raise PermissionDenied("Invalid user type.")
    return wrapper


def method_permission_required(permissions_map):
    """
    Decorator to apply different permissions based on HTTP method
    Usage: @method_permission_required({
        'GET': ['viewer', 'editor', 'admin', 'super_admin'],
        'POST': ['editor', 'admin', 'super_admin'],
        'PUT': ['admin', 'super_admin'],
        'DELETE': ['super_admin']
    })
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise NotAuthenticated("Authentication credentials were not provided.")
            
            if not request.user.is_active:
                raise PermissionDenied("User account is disabled.")
            
            method = request.method
            required_roles = permissions_map.get(method, [])
            
            if not required_roles:
                # If no specific permission defined for method, deny access
                logger.warning(f"No permission defined for method {method}")
                raise PermissionDenied(f"Method {method} not allowed.")
            
            user_role = request.user.user_type
            if user_role not in required_roles:
                logger.warning(f"Method permission denied for user {request.user.email} with role {user_role} for method {method}")
                raise PermissionDenied(f"Required roles for {method}: {', '.join(required_roles)}")
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def log_access(view_func):
    """
    Decorator to log access attempts
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_info = "Anonymous"
        if request.user and request.user.is_authenticated:
            user_info = f"{request.user.email} ({request.user.user_type})"
        
        logger.info(f"Access attempt: {request.method} {request.path} by {user_info}")
        
        try:
            response = view_func(request, *args, **kwargs)
            logger.info(f"Access granted: {request.method} {request.path} by {user_info}")
            return response
        except Exception as e:
            logger.warning(f"Access denied: {request.method} {request.path} by {user_info} - {str(e)}")
            raise
    return wrapper


def rate_limit_by_user(max_requests=100, time_window=3600):
    """
    Simple rate limiting decorator by user
    max_requests: Maximum number of requests allowed
    time_window: Time window in seconds (default: 1 hour)
    """
    from django.core.cache import cache
    from django.utils import timezone
    
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                # For anonymous users, use IP-based rate limiting
                identifier = request.META.get('REMOTE_ADDR', 'unknown')
            else:
                identifier = f"user_{request.user.id}"
            
            cache_key = f"rate_limit_{identifier}"
            current_time = timezone.now().timestamp()
            
            # Get current request count and timestamps
            request_data = cache.get(cache_key, {'count': 0, 'window_start': current_time})
            
            # Reset if time window has passed
            if current_time - request_data['window_start'] > time_window:
                request_data = {'count': 0, 'window_start': current_time}
            
            # Check if rate limit exceeded
            if request_data['count'] >= max_requests:
                logger.warning(f"Rate limit exceeded for {identifier}")
                return Response(
                    {'error': 'Rate limit exceeded. Please try again later.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Increment request count
            request_data['count'] += 1
            cache.set(cache_key, request_data, time_window)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def admin_required_for_write(view_func):
    """
    Decorator that allows read access to all authenticated users
    but requires admin role for write operations
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            raise NotAuthenticated("Authentication credentials were not provided.")
        
        if not request.user.is_active:
            raise PermissionDenied("User account is disabled.")
        
        # Allow read operations for all authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return view_func(request, *args, **kwargs)
        
        # Require admin role for write operations
        if request.user.user_type not in ['admin', 'super_admin', 'editor']:
            logger.warning(f"Write permission denied for user {request.user.email} with role {request.user.user_type}")
            raise PermissionDenied("Admin privileges required for this operation.")
        
        return view_func(request, *args, **kwargs)
    return wrapper


# Class-based view decorators
def class_decorator(decorator):
    """
    Convert function decorator to class decorator for Django views
    """
    def decorate(cls):
        for attr in dir(cls):
            if not attr.startswith('_'):
                attr_value = getattr(cls, attr)
                if callable(attr_value):
                    setattr(cls, attr, decorator(attr_value))
        return cls
    return decorate
