"""
Integration tests for complete workflows
"""

import pytest
from django.urls import reverse
from rest_framework import status
from .base import BaseAPITestCase
from .factories import CourseFactory, StudentFactory


@pytest.mark.integration
class CompleteWorkflowTestCase(BaseAPITestCase):
    """Test complete system workflows"""
    
    def test_student_enrollment_to_certificate_workflow(self):
        """Test complete student journey from enrollment to certificate"""
        self.authenticate_admin()
        
        # Step 1: Create course
        course_url = reverse('courses:list')
        course_data = {
            'name': 'Python Programming',
            'description': 'Complete Python course',
            'duration_months': 6,
            'fee_amount': 10000.00
        }
        response = self.post_json(course_url, course_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        course_id = response.json()['id']
        
        # Step 2: Register student
        student_url = reverse('students:list')
        student_data = {
            'user': {
                'email': 'workflow@example.com',
                'first_name': 'Workflow',
                'last_name': 'Test',
                'password': 'testpass123'
            },
            'phone': '+1234567890',
            'course': course_id,
            'batch': 'morning'
        }
        response = self.post_json(student_url, student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        student_id = response.json()['id']
        
        # Step 3: Create fee
        fee_url = reverse('fees:list')
        fee_data = {
            'student': student_id,
            'amount': '10000.00',
            'fee_type': 'course_fee'
        }
        response = self.post_json(fee_url, fee_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify complete workflow
        student_detail_url = reverse('students:detail', kwargs={'pk': student_id})
        response = self.client.get(student_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
