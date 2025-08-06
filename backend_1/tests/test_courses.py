"""
Unit tests for courses module
"""

import pytest
from django.urls import reverse
from rest_framework import status
from apps.courses.models import Course, CourseModule, CourseSchedule
from .base import BaseAPITestCase, APIResponseMixin, TestDataMixin
from .factories import CourseFactory, CourseModuleFactory, CourseScheduleFactory, StudentFactory


@pytest.mark.unit
class CourseModelTestCase(BaseAPITestCase):
    """Test Course model"""
    
    def test_course_creation(self):
        """Test course creation"""
        course = CourseFactory(
            name='Python Programming',
            duration_months=6,
            fee_amount=5000.00
        )
        self.assertEqual(course.name, 'Python Programming')
        self.assertEqual(course.duration_months, 6)
        self.assertEqual(course.fee_amount, 5000.00)
        self.assertTrue(course.is_active)
    
    def test_course_string_representation(self):
        """Test course string representation"""
        course = CourseFactory(name='Python Programming')
        self.assertEqual(str(course), 'Python Programming')
    
    def test_course_student_count(self):
        """Test course student count property"""
        course = CourseFactory()
        
        # Create students for this course
        StudentFactory.create_batch(3, course=course)
        
        self.assertEqual(course.student_count, 3)
    
    def test_course_active_students(self):
        """Test course active students"""
        course = CourseFactory()
        
        # Create active and inactive students
        active_students = StudentFactory.create_batch(2, course=course, is_active=True)
        inactive_student = StudentFactory(course=course, is_active=False)
        
        active_count = course.students.filter(is_active=True).count()
        self.assertEqual(active_count, 2)


@pytest.mark.unit
class CourseModuleModelTestCase(BaseAPITestCase):
    """Test CourseModule model"""
    
    def test_module_creation(self):
        """Test course module creation"""
        course = CourseFactory()
        module = CourseModuleFactory(
            course=course,
            name='Introduction to Python',
            order=1
        )
        self.assertEqual(module.course, course)
        self.assertEqual(module.name, 'Introduction to Python')
        self.assertEqual(module.order, 1)
    
    def test_module_ordering(self):
        """Test course module ordering"""
        course = CourseFactory()
        module1 = CourseModuleFactory(course=course, order=2)
        module2 = CourseModuleFactory(course=course, order=1)
        module3 = CourseModuleFactory(course=course, order=3)
        
        modules = course.modules.all().order_by('order')
        self.assertEqual(list(modules), [module2, module1, module3])


@pytest.mark.unit
class CourseScheduleModelTestCase(BaseAPITestCase):
    """Test CourseSchedule model"""
    
    def test_schedule_creation(self):
        """Test course schedule creation"""
        course = CourseFactory()
        schedule = CourseScheduleFactory(
            course=course,
            batch='morning',
            days_of_week='monday,wednesday,friday'
        )
        self.assertEqual(schedule.course, course)
        self.assertEqual(schedule.batch, 'morning')
        self.assertEqual(schedule.days_of_week, 'monday,wednesday,friday')


@pytest.mark.api
class CourseAPITestCase(BaseAPITestCase, APIResponseMixin, TestDataMixin):
    """Test Course API endpoints"""
    
    def test_list_courses(self):
        """Test listing courses"""
        self.authenticate_admin()
        courses = self.create_test_courses(3)
        
        url = reverse('courses:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['results']), 3)
    
    def test_list_courses_student_access(self):
        """Test student can view courses"""
        self.authenticate_student()
        courses = self.create_test_courses(3)
        
        url = reverse('courses:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_course(self):
        """Test creating a new course"""
        self.authenticate_admin()
        
        url = reverse('courses:list')
        data = {
            'name': 'Advanced Python',
            'description': 'Advanced Python programming course',
            'duration_months': 8,
            'fee_amount': 8000.00,
            'is_active': True
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify course was created
        course = Course.objects.get(name='Advanced Python')
        self.assertEqual(course.duration_months, 8)
        self.assertEqual(float(course.fee_amount), 8000.00)
    
    def test_create_course_student_forbidden(self):
        """Test student cannot create courses"""
        self.authenticate_student()
        
        url = reverse('courses:list')
        data = {
            'name': 'Unauthorized Course',
            'description': 'This should not be created',
            'duration_months': 6,
            'fee_amount': 5000.00
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_course_detail(self):
        """Test getting course details"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('courses:detail', kwargs={'pk': course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['id'], course.id)
        self.assertEqual(data['name'], course.name)
    
    def test_update_course(self):
        """Test updating course information"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('courses:detail', kwargs={'pk': course.id})
        data = {
            'name': 'Updated Course Name',
            'fee_amount': 7500.00
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        course.refresh_from_db()
        self.assertEqual(course.name, 'Updated Course Name')
        self.assertEqual(float(course.fee_amount), 7500.00)
    
    def test_delete_course(self):
        """Test deleting a course (soft delete)"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('courses:detail', kwargs={'pk': course.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        course.refresh_from_db()
        self.assertFalse(course.is_active)
    
    def test_course_statistics(self):
        """Test course statistics endpoint"""
        self.authenticate_admin()
        course = CourseFactory()
        
        # Create students for this course
        StudentFactory.create_batch(5, course=course)
        
        url = reverse('courses:stats', kwargs={'pk': course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('total_students', data)
        self.assertIn('active_students', data)
        self.assertEqual(data['total_students'], 5)
    
    def test_course_modules(self):
        """Test course modules endpoint"""
        self.authenticate_admin()
        course = CourseFactory()
        
        # Create modules for this course
        modules = CourseModuleFactory.create_batch(3, course=course)
        
        url = reverse('courses:modules', kwargs={'pk': course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data), 3)
    
    def test_course_schedules(self):
        """Test course schedules endpoint"""
        self.authenticate_admin()
        course = CourseFactory()
        
        # Create schedules for this course
        schedules = CourseScheduleFactory.create_batch(2, course=course)
        
        url = reverse('courses:schedules', kwargs={'pk': course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data), 2)
    
    def test_search_courses(self):
        """Test searching courses"""
        self.authenticate_admin()
        course1 = CourseFactory(name='Python Programming')
        course2 = CourseFactory(name='Java Development')
        course3 = CourseFactory(name='Web Development')
        
        url = reverse('courses:list')
        response = self.client.get(url, {'search': 'Python'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], course1.id)
    
    def test_filter_courses_by_duration(self):
        """Test filtering courses by duration"""
        self.authenticate_admin()
        course1 = CourseFactory(duration_months=6)
        course2 = CourseFactory(duration_months=12)
        
        url = reverse('courses:list')
        response = self.client.get(url, {'duration_months': 6})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], course1.id)


@pytest.mark.api
class CourseModuleAPITestCase(BaseAPITestCase, APIResponseMixin):
    """Test CourseModule API endpoints"""
    
    def test_create_course_module(self):
        """Test creating a course module"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('courses:modules', kwargs={'pk': course.id})
        data = {
            'name': 'Variables and Data Types',
            'description': 'Learn about Python variables and data types',
            'order': 1
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify module was created
        module = CourseModule.objects.get(name='Variables and Data Types')
        self.assertEqual(module.course, course)
        self.assertEqual(module.order, 1)
    
    def test_update_course_module(self):
        """Test updating a course module"""
        self.authenticate_admin()
        course = CourseFactory()
        module = CourseModuleFactory(course=course)
        
        url = reverse('courses:module_detail', kwargs={'course_pk': course.id, 'pk': module.id})
        data = {
            'name': 'Updated Module Name',
            'order': 2
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        module.refresh_from_db()
        self.assertEqual(module.name, 'Updated Module Name')
        self.assertEqual(module.order, 2)
    
    def test_delete_course_module(self):
        """Test deleting a course module"""
        self.authenticate_admin()
        course = CourseFactory()
        module = CourseModuleFactory(course=course)
        
        url = reverse('courses:module_detail', kwargs={'course_pk': course.id, 'pk': module.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify module was deleted
        self.assertFalse(CourseModule.objects.filter(id=module.id).exists())


@pytest.mark.api
class CourseScheduleAPITestCase(BaseAPITestCase, APIResponseMixin):
    """Test CourseSchedule API endpoints"""
    
    def test_create_course_schedule(self):
        """Test creating a course schedule"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('courses:schedules', kwargs={'pk': course.id})
        data = {
            'batch': 'morning',
            'start_time': '09:00:00',
            'end_time': '12:00:00',
            'days_of_week': 'monday,wednesday,friday'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify schedule was created
        schedule = CourseSchedule.objects.get(batch='morning', course=course)
        self.assertEqual(schedule.days_of_week, 'monday,wednesday,friday')
    
    def test_update_course_schedule(self):
        """Test updating a course schedule"""
        self.authenticate_admin()
        course = CourseFactory()
        schedule = CourseScheduleFactory(course=course)
        
        url = reverse('courses:schedule_detail', kwargs={'course_pk': course.id, 'pk': schedule.id})
        data = {
            'batch': 'evening',
            'start_time': '18:00:00',
            'end_time': '21:00:00'
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        schedule.refresh_from_db()
        self.assertEqual(schedule.batch, 'evening')


@pytest.mark.integration
class CourseIntegrationTestCase(BaseAPITestCase):
    """Integration tests for course workflows"""
    
    def test_complete_course_creation_workflow(self):
        """Test complete course creation with modules and schedules"""
        self.authenticate_admin()
        
        # Step 1: Create course
        course_url = reverse('courses:list')
        course_data = {
            'name': 'Full Stack Development',
            'description': 'Complete full stack development course',
            'duration_months': 12,
            'fee_amount': 15000.00,
            'is_active': True
        }
        response = self.post_json(course_url, course_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        course_id = response.json()['id']
        
        # Step 2: Add modules
        modules_url = reverse('courses:modules', kwargs={'pk': course_id})
        module_data = [
            {'name': 'HTML & CSS', 'description': 'Frontend basics', 'order': 1},
            {'name': 'JavaScript', 'description': 'Programming fundamentals', 'order': 2},
            {'name': 'React.js', 'description': 'Frontend framework', 'order': 3}
        ]
        
        for module in module_data:
            response = self.post_json(modules_url, module)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Step 3: Add schedules
        schedules_url = reverse('courses:schedules', kwargs={'pk': course_id})
        schedule_data = [
            {
                'batch': 'morning',
                'start_time': '09:00:00',
                'end_time': '12:00:00',
                'days_of_week': 'monday,wednesday,friday'
            },
            {
                'batch': 'evening',
                'start_time': '18:00:00',
                'end_time': '21:00:00',
                'days_of_week': 'tuesday,thursday,saturday'
            }
        ]
        
        for schedule in schedule_data:
            response = self.post_json(schedules_url, schedule)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Step 4: Verify complete course structure
        course_detail_url = reverse('courses:detail', kwargs={'pk': course_id})
        response = self.client.get(course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify modules
        modules_response = self.client.get(modules_url)
        self.assertEqual(len(modules_response.json()), 3)
        
        # Verify schedules
        schedules_response = self.client.get(schedules_url)
        self.assertEqual(len(schedules_response.json()), 2)


@pytest.mark.performance
class CoursePerformanceTestCase(BaseAPITestCase):
    """Performance tests for course operations"""
    
    def test_list_courses_performance(self):
        """Test performance of listing courses"""
        self.authenticate_admin()
        
        # Create many courses
        courses = self.create_test_courses(50)
        
        url = reverse('courses:list')
        
        # Test query count
        with self.assertNumQueries(3):  # Should be optimized
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_course_with_modules_performance(self):
        """Test performance when loading course with modules"""
        self.authenticate_admin()
        course = CourseFactory()
        
        # Create many modules
        CourseModuleFactory.create_batch(20, course=course)
        
        url = reverse('courses:modules', kwargs={'pk': course.id})
        
        with self.assertNumQueries(2):  # Should be optimized
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
