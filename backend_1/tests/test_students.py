"""
Unit tests for students module
"""

import pytest
from django.urls import reverse
from rest_framework import status
from apps.students.models import Student
from .base import BaseAPITestCase, APIResponseMixin, TestDataMixin
from .factories import StudentFactory, CourseFactory, UserFactory


@pytest.mark.unit
class StudentModelTestCase(BaseAPITestCase):
    """Test Student model"""
    
    def test_student_creation(self):
        """Test student creation"""
        student = StudentFactory()
        self.assertIsNotNone(student.admission_uid)
        self.assertIsNotNone(student.user)
        self.assertIsNotNone(student.course)
        self.assertTrue(student.is_active)
    
    def test_student_string_representation(self):
        """Test student string representation"""
        student = StudentFactory()
        expected = f"{student.user.get_full_name()} ({student.admission_uid})"
        self.assertEqual(str(student), expected)
    
    def test_admission_uid_uniqueness(self):
        """Test admission UID uniqueness"""
        student1 = StudentFactory()
        student2 = StudentFactory()
        self.assertNotEqual(student1.admission_uid, student2.admission_uid)
    
    def test_student_age_calculation(self):
        """Test student age calculation"""
        from datetime import date, timedelta
        
        # Create student with known birth date
        birth_date = date.today() - timedelta(days=365 * 20)  # 20 years old
        student = StudentFactory(date_of_birth=birth_date)
        
        self.assertEqual(student.age, 20)
    
    def test_student_course_relationship(self):
        """Test student-course relationship"""
        course = CourseFactory()
        student = StudentFactory(course=course)
        
        self.assertEqual(student.course, course)
        self.assertIn(student, course.students.all())


@pytest.mark.api
class StudentAPITestCase(BaseAPITestCase, APIResponseMixin, TestDataMixin):
    """Test Student API endpoints"""
    
    def test_list_students_admin(self):
        """Test listing students as admin"""
        self.authenticate_admin()
        self.create_test_students(5)
        
        url = reverse('students:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertPaginatedResponse(response)
    
    def test_list_students_unauthorized(self):
        """Test listing students without authentication"""
        url = reverse('students:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_students_student_forbidden(self):
        """Test student cannot list all students"""
        self.authenticate_student()
        
        url = reverse('students:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_student(self):
        """Test creating a new student"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('students:list')
        data = {
            'user': {
                'email': 'newstudent@example.com',
                'first_name': 'New',
                'last_name': 'Student',
                'password': 'testpass123'
            },
            'phone': '+1234567890',
            'address': '123 Test Street',
            'date_of_birth': '2000-01-01',
            'course': course.id,
            'batch': 'morning',
            'parent_name': 'Parent Name',
            'parent_email': 'parent@example.com',
            'parent_phone': '+1234567891'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify student was created
        student = Student.objects.get(user__email='newstudent@example.com')
        self.assertEqual(student.course, course)
        self.assertEqual(student.batch, 'morning')
    
    def test_get_student_detail(self):
        """Test getting student details"""
        self.authenticate_admin()
        student = StudentFactory()
        
        url = reverse('students:detail', kwargs={'pk': student.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['id'], student.id)
        self.assertEqual(data['admission_uid'], student.admission_uid)
    
    def test_update_student(self):
        """Test updating student information"""
        self.authenticate_admin()
        student = StudentFactory()
        
        url = reverse('students:detail', kwargs={'pk': student.id})
        data = {
            'phone': '+9876543210',
            'address': 'Updated Address'
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        student.refresh_from_db()
        self.assertEqual(student.phone, '+9876543210')
        self.assertEqual(student.address, 'Updated Address')
    
    def test_delete_student(self):
        """Test deleting a student (soft delete)"""
        self.authenticate_admin()
        student = StudentFactory()
        
        url = reverse('students:detail', kwargs={'pk': student.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        student.refresh_from_db()
        self.assertFalse(student.is_active)
    
    def test_student_me_endpoint(self):
        """Test student accessing own profile"""
        self.authenticate_student()
        
        url = reverse('students:me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['id'], self.student.id)
    
    def test_student_dashboard(self):
        """Test student dashboard data"""
        self.authenticate_student()
        
        url = reverse('students:dashboard', kwargs={'pk': self.student.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('student_info', data)
        self.assertIn('course_progress', data)
        self.assertIn('attendance_summary', data)
        self.assertIn('fee_status', data)
    
    def test_search_students(self):
        """Test searching students"""
        self.authenticate_admin()
        student1 = StudentFactory(user__first_name='John')
        student2 = StudentFactory(user__first_name='Jane')
        student3 = StudentFactory(user__first_name='Bob')
        
        url = reverse('students:list')
        response = self.client.get(url, {'search': 'John'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], student1.id)
    
    def test_filter_students_by_course(self):
        """Test filtering students by course"""
        self.authenticate_admin()
        course1 = CourseFactory(name='Python Course')
        course2 = CourseFactory(name='Java Course')
        
        student1 = StudentFactory(course=course1)
        student2 = StudentFactory(course=course2)
        
        url = reverse('students:list')
        response = self.client.get(url, {'course': course1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], student1.id)
    
    def test_filter_students_by_batch(self):
        """Test filtering students by batch"""
        self.authenticate_admin()
        student1 = StudentFactory(batch='morning')
        student2 = StudentFactory(batch='evening')
        
        url = reverse('students:list')
        response = self.client.get(url, {'batch': 'morning'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], student1.id)


@pytest.mark.integration
class StudentIntegrationTestCase(BaseAPITestCase):
    """Integration tests for student workflows"""
    
    def test_complete_student_registration_workflow(self):
        """Test complete student registration workflow"""
        self.authenticate_admin()
        course = CourseFactory()
        
        # Step 1: Create student
        url = reverse('students:list')
        student_data = {
            'user': {
                'email': 'integration@example.com',
                'first_name': 'Integration',
                'last_name': 'Test',
                'password': 'testpass123'
            },
            'phone': '+1234567890',
            'address': '123 Integration Street',
            'date_of_birth': '1995-05-15',
            'course': course.id,
            'batch': 'morning',
            'parent_name': 'Parent Name',
            'parent_email': 'parent@example.com',
            'parent_phone': '+1234567891'
        }
        response = self.post_json(url, student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        student_id = response.json()['id']
        
        # Step 2: Verify student can login
        login_url = reverse('auth:login')
        login_data = {
            'email': 'integration@example.com',
            'password': 'testpass123'
        }
        response = self.post_json(login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 3: Student accesses own profile
        token = response.json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        profile_url = reverse('students:me')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['user']['email'], 'integration@example.com')
    
    def test_student_course_enrollment_workflow(self):
        """Test student course enrollment workflow"""
        self.authenticate_admin()
        
        # Create courses
        course1 = CourseFactory(name='Basic Python')
        course2 = CourseFactory(name='Advanced Python')
        
        # Create student
        student = StudentFactory(course=course1)
        
        # Update student's course
        url = reverse('students:detail', kwargs={'pk': student.id})
        data = {'course': course2.id}
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        student.refresh_from_db()
        self.assertEqual(student.course, course2)


@pytest.mark.performance
class StudentPerformanceTestCase(BaseAPITestCase):
    """Performance tests for student operations"""
    
    def test_list_students_performance(self):
        """Test performance of listing students"""
        self.authenticate_admin()
        
        # Create many students
        students = self.create_test_students(100)
        
        url = reverse('students:list')
        
        # Test query count
        with self.assertNumQueries(5):  # Should be optimized
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_student_dashboard_performance(self):
        """Test performance of student dashboard"""
        self.authenticate_student()
        
        url = reverse('students:dashboard', kwargs={'pk': self.student.id})
        
        # Should not exceed reasonable query count
        with self.assertNumQueries(10):  # Adjust based on actual optimization
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
