from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import ValidationError
from django.http import Http404
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get request information
    request = context.get('request')
    view = context.get('view')
    
    # Log the exception
    if request:
        user_info = "Anonymous"
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_info = f"{request.user.email} ({request.user.user_type})"
        
        logger.error(f"Exception in {request.method} {request.path} by {user_info}: {str(exc)}")
    
    # Handle JWT token errors
    if isinstance(exc, (InvalidToken, TokenError)):
        custom_response_data = {
            'error': 'authentication_failed',
            'message': 'Invalid or expired token',
            'details': str(exc),
            'code': 'INVALID_TOKEN'
        }
        return Response(custom_response_data, status=status.HTTP_401_UNAUTHORIZED)
    
    # Handle validation errors
    if isinstance(exc, ValidationError):
        custom_response_data = {
            'error': 'validation_error',
            'message': 'Invalid input data',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
            'code': 'VALIDATION_ERROR'
        }
        return Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404 errors
    if isinstance(exc, Http404):
        custom_response_data = {
            'error': 'not_found',
            'message': 'The requested resource was not found',
            'details': str(exc),
            'code': 'NOT_FOUND'
        }
        return Response(custom_response_data, status=status.HTTP_404_NOT_FOUND)
    
    # If response is None, it means the exception wasn't handled by DRF
    if response is None:
        # Handle unexpected errors
        custom_response_data = {
            'error': 'internal_server_error',
            'message': 'An unexpected error occurred',
            'details': str(exc) if settings.DEBUG else 'Internal server error',
            'code': 'INTERNAL_ERROR'
        }
        return Response(custom_response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Customize the response data for handled exceptions
    if response is not None:
        custom_response_data = {
            'error': 'request_failed',
            'message': 'The request could not be processed',
            'details': response.data,
            'code': get_error_code(response.status_code)
        }
        
        # Handle specific status codes
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_response_data['error'] = 'bad_request'
            custom_response_data['message'] = 'Invalid request data'
            custom_response_data['code'] = 'BAD_REQUEST'
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            custom_response_data['error'] = 'unauthorized'
            custom_response_data['message'] = 'Authentication credentials were not provided or are invalid'
            custom_response_data['code'] = 'UNAUTHORIZED'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            custom_response_data['error'] = 'forbidden'
            custom_response_data['message'] = 'You do not have permission to perform this action'
            custom_response_data['code'] = 'FORBIDDEN'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            custom_response_data['error'] = 'not_found'
            custom_response_data['message'] = 'The requested resource was not found'
            custom_response_data['code'] = 'NOT_FOUND'
        elif response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
            custom_response_data['error'] = 'method_not_allowed'
            custom_response_data['message'] = 'The requested method is not allowed for this resource'
            custom_response_data['code'] = 'METHOD_NOT_ALLOWED'
        elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            custom_response_data['error'] = 'rate_limit_exceeded'
            custom_response_data['message'] = 'Too many requests. Please try again later'
            custom_response_data['code'] = 'RATE_LIMIT_EXCEEDED'
        
        response.data = custom_response_data
    
    return response


def get_error_code(status_code):
    """
    Get error code based on HTTP status code
    """
    error_codes = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        406: 'NOT_ACCEPTABLE',
        409: 'CONFLICT',
        410: 'GONE',
        422: 'UNPROCESSABLE_ENTITY',
        429: 'RATE_LIMIT_EXCEEDED',
        500: 'INTERNAL_ERROR',
        501: 'NOT_IMPLEMENTED',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
        504: 'GATEWAY_TIMEOUT',
    }
    return error_codes.get(status_code, 'UNKNOWN_ERROR')


class CustomAPIException(Exception):
    """
    Custom API exception class
    """
    def __init__(self, message, code=None, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code or 'API_ERROR'
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationFailedException(CustomAPIException):
    """
    Exception for authentication failures
    """
    def __init__(self, message="Authentication failed"):
        super().__init__(message, 'AUTHENTICATION_FAILED', status.HTTP_401_UNAUTHORIZED)


class PermissionDeniedException(CustomAPIException):
    """
    Exception for permission denied
    """
    def __init__(self, message="Permission denied"):
        super().__init__(message, 'PERMISSION_DENIED', status.HTTP_403_FORBIDDEN)


class ValidationException(CustomAPIException):
    """
    Exception for validation errors
    """
    def __init__(self, message="Validation error", details=None):
        self.details = details
        super().__init__(message, 'VALIDATION_ERROR', status.HTTP_400_BAD_REQUEST)


class RateLimitExceededException(CustomAPIException):
    """
    Exception for rate limit exceeded
    """
    def __init__(self, message="Rate limit exceeded"):
        super().__init__(message, 'RATE_LIMIT_EXCEEDED', status.HTTP_429_TOO_MANY_REQUESTS)
