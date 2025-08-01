"""
Base test classes and utilities for RB Computer API tests
"""

import json
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .factories import (
    UserFactory, AdminUserFactory, SuperAdminUserFactory, 
    StudentUserFactory, StudentFactory, CourseFactory
)

User = get_user_model()


class BaseTestCase(TestCase):
    """Base test case with common setup"""
    
    def setUp(self):
        self.user = UserFactory()
        self.admin_user = AdminUserFactory()
        self.super_admin_user = SuperAdminUserFactory()
        self.student_user = StudentUserFactory()
        self.course = CourseFactory()
        self.student = StudentFactory(user=self.student_user, course=self.course)


class BaseAPITestCase(APITestCase):
    """Base API test case with authentication helpers"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.admin_user = AdminUserFactory()
        self.super_admin_user = SuperAdminUserFactory()
        self.student_user = StudentUserFactory()
        self.course = CourseFactory()
        self.student = StudentFactory(user=self.student_user, course=self.course)
    
    def get_jwt_token(self, user):
        """Get JWT token for user"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def authenticate_user(self, user):
        """Authenticate user for API requests"""
        token = self.get_jwt_token(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return token
    
    def authenticate_admin(self):
        """Authenticate admin user"""
        return self.authenticate_user(self.admin_user)
    
    def authenticate_super_admin(self):
        """Authenticate super admin user"""
        return self.authenticate_user(self.super_admin_user)
    
    def authenticate_student(self):
        """Authenticate student user"""
        return self.authenticate_user(self.student_user)
    
    def post_json(self, url, data, **kwargs):
        """POST request with JSON data"""
        return self.client.post(
            url, 
            json.dumps(data), 
            content_type='application/json',
            **kwargs
        )
    
    def put_json(self, url, data, **kwargs):
        """PUT request with JSON data"""
        return self.client.put(
            url, 
            json.dumps(data), 
            content_type='application/json',
            **kwargs
        )
    
    def patch_json(self, url, data, **kwargs):
        """PATCH request with JSON data"""
        return self.client.patch(
            url, 
            json.dumps(data), 
            content_type='application/json',
            **kwargs
        )


class BaseTransactionTestCase(TransactionTestCase):
    """Base transaction test case for testing database transactions"""
    
    def setUp(self):
        self.user = UserFactory()
        self.admin_user = AdminUserFactory()
        self.super_admin_user = SuperAdminUserFactory()
        self.student_user = StudentUserFactory()
        self.course = CourseFactory()
        self.student = StudentFactory(user=self.student_user, course=self.course)


class TestDataMixin:
    """Mixin for creating test data"""
    
    def create_test_users(self, count=5):
        """Create multiple test users"""
        return [UserFactory() for _ in range(count)]
    
    def create_test_students(self, count=5):
        """Create multiple test students"""
        return [StudentFactory() for _ in range(count)]
    
    def create_test_courses(self, count=3):
        """Create multiple test courses"""
        return [CourseFactory() for _ in range(count)]


class APIResponseMixin:
    """Mixin for API response assertions"""
    
    def assertAPISuccess(self, response, status_code=200):
        """Assert API response is successful"""
        self.assertEqual(response.status_code, status_code)
        if hasattr(response, 'json'):
            data = response.json()
            self.assertIn('success', data)
            self.assertTrue(data['success'])
    
    def assertAPIError(self, response, status_code=400):
        """Assert API response is an error"""
        self.assertEqual(response.status_code, status_code)
        if hasattr(response, 'json'):
            data = response.json()
            self.assertIn('error', data)
    
    def assertPaginatedResponse(self, response):
        """Assert response is paginated"""
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('results', data)
        self.assertIn('count', data)
        self.assertIn('next', data)
        self.assertIn('previous', data)
    
    def assertValidationError(self, response, field=None):
        """Assert response contains validation errors"""
        self.assertEqual(response.status_code, 400)
        data = response.json()
        if field:
            self.assertIn(field, data)
        else:
            self.assertTrue(any(key in data for key in ['error', 'errors', 'detail']))


class PerformanceTestMixin:
    """Mixin for performance testing"""
    
    def assertQueryCountLessThan(self, count):
        """Assert query count is less than specified number"""
        from django.test.utils import override_settings
        from django.db import connection
        
        def decorator(func):
            def wrapper(*args, **kwargs):
                with override_settings(DEBUG=True):
                    initial_queries = len(connection.queries)
                    result = func(*args, **kwargs)
                    final_queries = len(connection.queries)
                    query_count = final_queries - initial_queries
                    self.assertLess(
                        query_count, 
                        count, 
                        f"Expected less than {count} queries, got {query_count}"
                    )
                    return result
            return wrapper
        return decorator
