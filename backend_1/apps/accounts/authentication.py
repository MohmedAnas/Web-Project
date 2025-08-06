from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication with enhanced error handling and logging
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a two-tuple of (user, token).
        """
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Inactive user attempted to authenticate: {user.email}")
                raise exceptions.AuthenticationFailed(_('User account is disabled.'))
            
            # Log successful authentication
            logger.info(f"User authenticated successfully: {user.email}")
            
            return (user, validated_token)
            
        except TokenError as e:
            logger.warning(f"Token authentication failed: {str(e)}")
            raise exceptions.AuthenticationFailed(_('Given token not valid for any token type'))
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed(_('Authentication failed'))

    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token[self.user_id_claim]
        except KeyError:
            raise InvalidToken(_('Token contained no recognizable user identification'))

        try:
            user = User.objects.get(**{self.user_id_field: user_id})
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed(_('User not found'), code='user_not_found')

        return user


class TokenRefreshMiddleware:
    """
    Middleware to handle automatic token refresh
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Check if token is about to expire and add refresh header
        if hasattr(request, 'user') and request.user.is_authenticated:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                try:
                    token = auth_header.split(' ')[1]
                    untyped_token = UntypedToken(token)
                    
                    # Check if token expires in less than 5 minutes
                    import time
                    current_time = time.time()
                    exp_time = untyped_token['exp']
                    
                    if exp_time - current_time < 300:  # 5 minutes
                        response['X-Token-Refresh-Required'] = 'true'
                        
                except Exception:
                    pass
        
        return response
