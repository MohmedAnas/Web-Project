import time
import json
import logging
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.utils import timezone
from rest_framework import status
import re

logger = logging.getLogger(__name__)


class RateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting middleware with different limits for different user types
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.rate_limits = {
            'anonymous': {'requests': 50, 'window': 3600},  # 50 requests per hour
            'student': {'requests': 200, 'window': 3600},   # 200 requests per hour
            'viewer': {'requests': 500, 'window': 3600},    # 500 requests per hour
            'editor': {'requests': 1000, 'window': 3600},   # 1000 requests per hour
            'admin': {'requests': 2000, 'window': 3600},    # 2000 requests per hour
            'super_admin': {'requests': 5000, 'window': 3600},  # 5000 requests per hour
        }
    
    def process_request(self, request):
        # Skip rate limiting for certain paths
        skip_paths = ['/admin/', '/swagger/', '/redoc/']
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Determine user type and identifier
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_type = request.user.user_type
            identifier = f"user_{request.user.id}"
        else:
            user_type = 'anonymous'
            identifier = f"ip_{self._get_client_ip(request)}"
        
        # Get rate limit settings
        rate_limit = self.rate_limits.get(user_type, self.rate_limits['anonymous'])
        max_requests = rate_limit['requests']
        time_window = rate_limit['window']
        
        # Check rate limit
        cache_key = f"rate_limit_{identifier}"
        current_time = time.time()
        
        request_data = cache.get(cache_key, {'count': 0, 'window_start': current_time})
        
        # Reset if time window has passed
        if current_time - request_data['window_start'] > time_window:
            request_data = {'count': 0, 'window_start': current_time}
        
        # Check if rate limit exceeded
        if request_data['count'] >= max_requests:
            logger.warning(f"Rate limit exceeded for {identifier} ({user_type})")
            return JsonResponse(
                {
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {max_requests} requests per hour allowed',
                    'retry_after': int(time_window - (current_time - request_data['window_start']))
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Increment request count
        request_data['count'] += 1
        cache.set(cache_key, request_data, time_window)
        
        # Add rate limit headers to response
        request.rate_limit_remaining = max_requests - request_data['count']
        request.rate_limit_limit = max_requests
        request.rate_limit_reset = int(request_data['window_start'] + time_window)
        
        return None
    
    def process_response(self, request, response):
        # Add rate limit headers
        if hasattr(request, 'rate_limit_remaining'):
            response['X-RateLimit-Limit'] = str(request.rate_limit_limit)
            response['X-RateLimit-Remaining'] = str(request.rate_limit_remaining)
            response['X-RateLimit-Reset'] = str(request.rate_limit_reset)
        
        return response
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class InputSanitizationMiddleware(MiddlewareMixin):
    """
    Middleware to sanitize input data and prevent common attacks
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        # Common XSS patterns
        self.xss_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>.*?</iframe>',
            r'<object[^>]*>.*?</object>',
            r'<embed[^>]*>.*?</embed>',
        ]
        
        # SQL injection patterns
        self.sql_patterns = [
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
            r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
            r'(\b(OR|AND)\s+[\'"][^\'"]*[\'"])',
            r'(--|#|/\*|\*/)',
        ]
    
    def process_request(self, request):
        # Skip for certain content types
        content_type = request.META.get('CONTENT_TYPE', '')
        if 'multipart/form-data' in content_type or 'application/octet-stream' in content_type:
            return None
        
        # Sanitize GET parameters
        if request.GET:
            sanitized_get = {}
            for key, value in request.GET.items():
                sanitized_get[key] = self._sanitize_input(value)
            request.GET = sanitized_get
        
        # Sanitize POST data
        if request.method == 'POST' and hasattr(request, 'body'):
            try:
                if request.content_type == 'application/json':
                    data = json.loads(request.body.decode('utf-8'))
                    sanitized_data = self._sanitize_dict(data)
                    request._body = json.dumps(sanitized_data).encode('utf-8')
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass
        
        return None
    
    def _sanitize_input(self, value):
        """Sanitize individual input value"""
        if not isinstance(value, str):
            return value
        
        # Check for XSS patterns
        for pattern in self.xss_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(f"XSS attempt detected: {value[:100]}")
                value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        # Check for SQL injection patterns
        for pattern in self.sql_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(f"SQL injection attempt detected: {value[:100]}")
                # Don't remove SQL patterns, just log them
                # The ORM should handle SQL injection prevention
        
        return value
    
    def _sanitize_dict(self, data):
        """Recursively sanitize dictionary data"""
        if isinstance(data, dict):
            return {key: self._sanitize_dict(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_dict(item) for item in data]
        elif isinstance(data, str):
            return self._sanitize_input(data)
        else:
            return data


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to responses
    """
    
    def process_response(self, request, response):
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Add HSTS header for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
        ]
        response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        return response


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log API requests and responses
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.sensitive_fields = ['password', 'token', 'secret', 'key']
    
    def process_request(self, request):
        # Log request details
        user_info = "Anonymous"
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_info = f"{request.user.email} ({request.user.user_type})"
        
        request.start_time = time.time()
        
        # Log basic request info
        logger.info(f"Request: {request.method} {request.path} by {user_info}")
        
        # Log request body for POST/PUT/PATCH (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, 'body'):
            try:
                if request.content_type == 'application/json':
                    data = json.loads(request.body.decode('utf-8'))
                    sanitized_data = self._sanitize_sensitive_data(data)
                    logger.debug(f"Request body: {json.dumps(sanitized_data)}")
            except (json.JSONDecodeError, UnicodeDecodeError):
                logger.debug("Request body: [Binary or invalid JSON]")
        
        return None
    
    def process_response(self, request, response):
        # Calculate response time
        if hasattr(request, 'start_time'):
            response_time = time.time() - request.start_time
            response['X-Response-Time'] = f"{response_time:.3f}s"
            
            # Log response details
            user_info = "Anonymous"
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_info = f"{request.user.email} ({request.user.user_type})"
            
            logger.info(f"Response: {request.method} {request.path} - {response.status_code} ({response_time:.3f}s) by {user_info}")
        
        return response
    
    def _sanitize_sensitive_data(self, data):
        """Remove sensitive data from logs"""
        if isinstance(data, dict):
            sanitized = {}
            for key, value in data.items():
                if any(sensitive in key.lower() for sensitive in self.sensitive_fields):
                    sanitized[key] = "[REDACTED]"
                else:
                    sanitized[key] = self._sanitize_sensitive_data(value)
            return sanitized
        elif isinstance(data, list):
            return [self._sanitize_sensitive_data(item) for item in data]
        else:
            return data


class TokenValidationMiddleware(MiddlewareMixin):
    """
    Middleware to validate JWT tokens and handle token refresh
    """
    
    def process_request(self, request):
        # Skip for certain paths
        skip_paths = ['/api/auth/login/', '/api/auth/token/refresh/', '/admin/', '/swagger/', '/redoc/']
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Check for Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        try:
            from rest_framework_simplejwt.tokens import UntypedToken
            from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
            
            token = auth_header.split(' ')[1]
            
            # Validate token
            try:
                UntypedToken(token)
            except (InvalidToken, TokenError) as e:
                logger.warning(f"Invalid token used: {str(e)}")
                return JsonResponse(
                    {'error': 'Invalid or expired token'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if token is about to expire (within 5 minutes)
            try:
                untyped_token = UntypedToken(token)
                current_time = time.time()
                exp_time = untyped_token['exp']
                
                if exp_time - current_time < 300:  # 5 minutes
                    request.token_refresh_required = True
            except Exception:
                pass
        
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
        
        return None
    
    def process_response(self, request, response):
        # Add token refresh header if needed
        if hasattr(request, 'token_refresh_required') and request.token_refresh_required:
            response['X-Token-Refresh-Required'] = 'true'
        
        return response


class CORSMiddleware(MiddlewareMixin):
    """
    Enhanced CORS middleware with additional security
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        self.allowed_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        self.allowed_headers = [
            'Accept',
            'Accept-Language',
            'Content-Language',
            'Content-Type',
            'Authorization',
            'X-Requested-With',
        ]
    
    def process_request(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            origin = request.META.get('HTTP_ORIGIN')
            if origin in self.allowed_origins:
                response = JsonResponse({})
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Methods'] = ', '.join(self.allowed_methods)
                response['Access-Control-Allow-Headers'] = ', '.join(self.allowed_headers)
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Max-Age'] = '86400'  # 24 hours
                return response
        
        return None
    
    def process_response(self, request, response):
        origin = request.META.get('HTTP_ORIGIN')
        if origin in self.allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
        
        return response
