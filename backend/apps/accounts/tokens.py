from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomRefreshToken(RefreshToken):
    """
    Custom refresh token with additional claims and validation
    """
    
    @classmethod
    def for_user(cls, user):
        """
        Create a refresh token for the given user with custom claims
        """
        token = super().for_user(user)
        
        # Add custom claims
        token['user_type'] = user.user_type
        token['email'] = user.email
        token['name'] = user.name
        token['is_active'] = user.is_active
        token['last_login'] = str(user.last_login) if user.last_login else None
        
        # Add role-specific claims
        if user.is_student:
            try:
                student_profile = user.student_profile
                token['student_id'] = student_profile.student_id
            except:
                pass
        
        # Log token creation
        logger.info(f"Refresh token created for user: {user.email}")
        
        return token
    
    def validate(self, attrs):
        """
        Validate token with additional checks
        """
        data = super().validate(attrs)
        
        # Check if user is still active
        try:
            user = User.objects.get(id=self['user_id'])
            if not user.is_active:
                logger.warning(f"Token validation failed - user inactive: {user.email}")
                raise TokenError('User account is disabled')
        except User.DoesNotExist:
            logger.warning(f"Token validation failed - user not found: {self.get('user_id')}")
            raise TokenError('User not found')
        
        return data


class CustomAccessToken(AccessToken):
    """
    Custom access token with additional claims
    """
    
    def __init__(self, token=None, verify=True):
        super().__init__(token, verify)
        
        if token is None:
            # Add custom claims for new tokens
            user_id = self.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    self['user_type'] = user.user_type
                    self['email'] = user.email
                    self['permissions'] = self._get_user_permissions(user)
                except User.DoesNotExist:
                    pass
    
    def _get_user_permissions(self, user):
        """
        Get user permissions based on role
        """
        permissions = {
            'can_view_students': user.user_type in ['super_admin', 'admin', 'editor', 'viewer'],
            'can_edit_students': user.user_type in ['super_admin', 'admin', 'editor'],
            'can_delete_students': user.user_type in ['super_admin', 'admin'],
            'can_view_courses': user.user_type in ['super_admin', 'admin', 'editor', 'viewer'],
            'can_edit_courses': user.user_type in ['super_admin', 'admin', 'editor'],
            'can_delete_courses': user.user_type in ['super_admin', 'admin'],
            'can_view_fees': user.user_type in ['super_admin', 'admin', 'editor', 'viewer'],
            'can_edit_fees': user.user_type in ['super_admin', 'admin', 'editor'],
            'can_view_attendance': user.user_type in ['super_admin', 'admin', 'editor', 'viewer'],
            'can_edit_attendance': user.user_type in ['super_admin', 'admin', 'editor'],
            'can_view_notices': True,  # All users can view notices
            'can_edit_notices': user.user_type in ['super_admin', 'admin', 'editor'],
            'can_view_certificates': user.user_type in ['super_admin', 'admin', 'editor', 'viewer'],
            'can_edit_certificates': user.user_type in ['super_admin', 'admin'],
            'is_super_admin': user.user_type == 'super_admin',
            'is_admin': user.user_type in ['super_admin', 'admin'],
            'is_student': user.user_type == 'student',
        }
        return permissions


def create_tokens_for_user(user):
    """
    Create both access and refresh tokens for a user
    """
    refresh = CustomRefreshToken.for_user(user)
    access = refresh.access_token
    
    # Update user's last login
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])
    
    return {
        'refresh': str(refresh),
        'access': str(access),
        'access_expires_in': refresh.access_token.lifetime.total_seconds(),
        'refresh_expires_in': refresh.lifetime.total_seconds(),
    }


def blacklist_user_tokens(user):
    """
    Blacklist all tokens for a user (useful for logout all devices)
    """
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            try:
                refresh_token = RefreshToken(token.token)
                refresh_token.blacklist()
                logger.info(f"Token blacklisted for user: {user.email}")
            except Exception as e:
                logger.error(f"Error blacklisting token: {str(e)}")
    except ImportError:
        logger.warning("Token blacklist not available")
    except Exception as e:
        logger.error(f"Error blacklisting user tokens: {str(e)}")
