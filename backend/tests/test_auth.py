"""
Unit tests for authentication system
"""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .base import BaseAPITestCase, APIResponseMixin
from .factories import UserFactory, AdminUserFactory, StudentUserFactory

User = get_user_model()


@pytest.mark.unit
class AuthenticationTestCase(BaseAPITestCase, APIResponseMixin):
    """Test authentication endpoints"""
    
    def test_user_registration(self):
        """Test user registration"""
        url = reverse('auth:register')
        data = {
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'student'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertEqual(user.first_name, 'Test')
        self.assertEqual(user.role, 'student')
    
    def test_user_login(self):
        """Test user login"""
        user = UserFactory(email='test@example.com')
        user.set_password('testpass123')
        user.save()
        
        url = reverse('auth:login')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertIn('user', data)
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        url = reverse('auth:login')
        data = {
            'email': 'invalid@example.com',
            'password': 'wrongpass'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_token_refresh(self):
        """Test JWT token refresh"""
        user = UserFactory()
        refresh = RefreshToken.for_user(user)
        
        url = reverse('auth:token_refresh')
        data = {'refresh': str(refresh)}
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('access', data)
    
    def test_user_logout(self):
        """Test user logout"""
        self.authenticate_user(self.user)
        
        url = reverse('auth:logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_profile_view(self):
        """Test user profile view"""
        self.authenticate_user(self.user)
        
        url = reverse('auth:profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['email'], self.user.email)
    
    def test_profile_update(self):
        """Test user profile update"""
        self.authenticate_user(self.user)
        
        url = reverse('auth:profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
    
    def test_change_password(self):
        """Test password change"""
        self.user.set_password('oldpass123')
        self.user.save()
        self.authenticate_user(self.user)
        
        url = reverse('auth:change_password')
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))
    
    def test_forgot_password(self):
        """Test forgot password functionality"""
        user = UserFactory(email='test@example.com')
        
        url = reverse('auth:forgot_password')
        data = {'email': 'test@example.com'}
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        url = reverse('auth:profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.unit
class RoleBasedAccessTestCase(BaseAPITestCase):
    """Test role-based access control"""
    
    def test_admin_access(self):
        """Test admin user access"""
        self.authenticate_admin()
        
        # Admin should access admin endpoints
        url = reverse('students:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_student_access_restriction(self):
        """Test student access restrictions"""
        self.authenticate_student()
        
        # Student should not access admin endpoints
        url = reverse('students:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_student_own_data_access(self):
        """Test student can access own data"""
        self.authenticate_student()
        
        # Student should access own profile
        url = reverse('students:me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@pytest.mark.unit
class UserModelTestCase(BaseAPITestCase):
    """Test User model"""
    
    def test_user_creation(self):
        """Test user creation"""
        user = UserFactory(
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.get_full_name(), 'Test User')
        self.assertTrue(user.is_active)
    
    def test_user_string_representation(self):
        """Test user string representation"""
        user = UserFactory(email='test@example.com')
        self.assertEqual(str(user), 'test@example.com')
    
    def test_user_roles(self):
        """Test user role assignments"""
        admin = AdminUserFactory()
        student = StudentUserFactory()
        
        self.assertEqual(admin.role, 'admin')
        self.assertEqual(student.role, 'student')
        self.assertTrue(admin.is_staff)
        self.assertFalse(student.is_staff)
    
    def test_user_permissions(self):
        """Test user permission methods"""
        admin = AdminUserFactory()
        student = StudentUserFactory()
        
        # Test role-based permissions
        self.assertTrue(admin.has_admin_access())
        self.assertFalse(student.has_admin_access())


@pytest.mark.security
class SecurityTestCase(BaseAPITestCase):
    """Test security features"""
    
    def test_password_validation(self):
        """Test password validation"""
        url = reverse('auth:register')
        data = {
            'email': 'test@example.com',
            'password': '123',  # Weak password
            'password_confirm': '123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_email_uniqueness(self):
        """Test email uniqueness constraint"""
        UserFactory(email='test@example.com')
        
        url = reverse('auth:register')
        data = {
            'email': 'test@example.com',  # Duplicate email
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_token_blacklisting(self):
        """Test JWT token blacklisting on logout"""
        self.authenticate_user(self.user)
        
        # Get current token
        token = self.get_jwt_token(self.user)
        
        # Logout (should blacklist token)
        url = reverse('auth:logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to use blacklisted token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('auth:profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
