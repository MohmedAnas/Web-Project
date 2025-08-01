from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class BaseRolePermission(permissions.BasePermission):
    """
    Base permission class for role-based access control
    """
    required_roles = []
    message = "You do not have permission to perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            logger.warning(f"Inactive user attempted access: {request.user.email}")
            return False
        
        user_role = request.user.user_type
        has_permission = user_role in self.required_roles
        
        if not has_permission:
            logger.warning(f"Permission denied for user {request.user.email} with role {user_role}")
        
        return has_permission


class IsSuperAdmin(BaseRolePermission):
    """
    Permission class for Super Admin only access
    """
    required_roles = ['super_admin']
    message = "Only Super Administrators can perform this action."


class IsAdmin(BaseRolePermission):
    """
    Permission class for Admin and Super Admin access
    """
    required_roles = ['super_admin', 'admin']
    message = "Only Administrators can perform this action."


class IsEditor(BaseRolePermission):
    """
    Permission class for Editor, Admin, and Super Admin access
    """
    required_roles = ['super_admin', 'admin', 'editor']
    message = "You need editor privileges to perform this action."


class IsViewer(BaseRolePermission):
    """
    Permission class for all admin roles (including viewer)
    """
    required_roles = ['super_admin', 'admin', 'editor', 'viewer']
    message = "You need administrative access to perform this action."


class IsStudent(BaseRolePermission):
    """
    Permission class for Student access only
    """
    required_roles = ['student']
    message = "Only students can perform this action."


class IsStudentOrAdmin(BaseRolePermission):
    """
    Permission class for Student or Admin access
    """
    required_roles = ['student', 'super_admin', 'admin', 'editor', 'viewer']


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class that allows owners of an object or admin users to access it
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin users can access any object
        if request.user.user_type in ['super_admin', 'admin', 'editor', 'viewer']:
            return True
        
        # Students can only access their own objects
        if request.user.user_type == 'student':
            # Check if the object belongs to the student
            if hasattr(obj, 'user') and obj.user == request.user:
                return True
            if hasattr(obj, 'student') and hasattr(obj.student, 'user') and obj.student.user == request.user:
                return True
        
        logger.warning(f"Object permission denied for user {request.user.email}")
        return False


class DynamicRolePermission(permissions.BasePermission):
    """
    Dynamic permission class that checks permissions based on action and resource
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Get the action and resource from the view
        action = getattr(view, 'action', None) or request.method.lower()
        resource = getattr(view, 'permission_resource', None) or view.__class__.__name__.lower()
        
        return self._check_permission(request.user, action, resource)
    
    def _check_permission(self, user, action, resource):
        """
        Check if user has permission for the given action on the resource
        """
        permission_map = {
            'student': {
                'get': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'post': [],
                'put': ['students'],  # Only their own profile
                'patch': ['students'],  # Only their own profile
                'delete': [],
            },
            'viewer': {
                'get': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'post': [],
                'put': [],
                'patch': [],
                'delete': [],
            },
            'editor': {
                'get': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'post': ['students', 'courses', 'notices', 'attendance'],
                'put': ['students', 'courses', 'notices', 'attendance'],
                'patch': ['students', 'courses', 'notices', 'attendance'],
                'delete': ['notices'],
            },
            'admin': {
                'get': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'post': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'put': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'patch': ['students', 'courses', 'notices', 'certificates', 'attendance', 'fees'],
                'delete': ['students', 'courses', 'notices', 'attendance', 'fees'],
            },
            'super_admin': {
                'get': ['*'],
                'post': ['*'],
                'put': ['*'],
                'patch': ['*'],
                'delete': ['*'],
            }
        }
        
        user_permissions = permission_map.get(user.user_type, {})
        allowed_resources = user_permissions.get(action, [])
        
        # Super admin has access to everything
        if '*' in allowed_resources:
            return True
        
        # Check if the specific resource is allowed
        return any(resource.startswith(allowed_resource) for allowed_resource in allowed_resources)


class ReadOnlyOrAdmin(permissions.BasePermission):
    """
    Permission class that allows read-only access to all authenticated users
    but write access only to admin users
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admin users
        return request.user.user_type in ['super_admin', 'admin', 'editor']


class StudentSelfAccessPermission(permissions.BasePermission):
    """
    Permission class that allows students to access only their own data
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin users can access everything
        if request.user.user_type in ['super_admin', 'admin', 'editor', 'viewer']:
            return True
        
        # Students can only access their own data
        if request.user.user_type == 'student':
            # Check if accessing own profile
            pk = view.kwargs.get('pk')
            if pk == 'me':
                return True
            
            # Check if the pk matches the student's profile ID
            try:
                student_profile = request.user.student_profile
                return str(pk) == str(student_profile.id)
            except:
                return False
        
        return False


# Decorator for method-level permissions
def require_roles(*roles):
    """
    Decorator to require specific roles for a view method
    """
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required.")
            
            if request.user.user_type not in roles:
                logger.warning(f"Role permission denied for user {request.user.email} with role {request.user.user_type}")
                raise PermissionDenied(f"Required roles: {', '.join(roles)}")
            
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def check_user_permission(user, action, resource):
    """
    Utility function to check if a user has permission for an action on a resource
    """
    permission_checker = DynamicRolePermission()
    
    class MockView:
        def __init__(self, action, resource):
            self.action = action
            self.permission_resource = resource
    
    class MockRequest:
        def __init__(self, user, method):
            self.user = user
            self.method = method
    
    mock_view = MockView(action, resource)
    mock_request = MockRequest(user, action.upper())
    
    return permission_checker.has_permission(mock_request, mock_view)
