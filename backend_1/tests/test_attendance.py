"""
Unit tests for attendance module
"""

import pytest
from datetime import date, time
from django.urls import reverse
from rest_framework import status
from apps.attendance.models import AttendanceSession, Attendance
from .base import BaseAPITestCase, APIResponseMixin
from .factories import AttendanceSessionFactory, AttendanceFactory, StudentFactory, CourseFactory


@pytest.mark.unit
class AttendanceModelTestCase(BaseAPITestCase):
    """Test Attendance models"""
    
    def test_attendance_session_creation(self):
        """Test attendance session creation"""
        course = CourseFactory()
        session = AttendanceSessionFactory(
            course=course,
            batch='morning',
            date=date.today(),
            topic='Python Basics'
        )
        self.assertEqual(session.course, course)
        self.assertEqual(session.batch, 'morning')
        self.assertEqual(session.topic, 'Python Basics')
    
    def test_attendance_creation(self):
        """Test attendance record creation"""
        session = AttendanceSessionFactory()
        student = StudentFactory()
        attendance = AttendanceFactory(
            session=session,
            student=student,
            status='present'
        )
        self.assertEqual(attendance.session, session)
        self.assertEqual(attendance.student, student)
        self.assertEqual(attendance.status, 'present')


@pytest.mark.api
class AttendanceAPITestCase(BaseAPITestCase, APIResponseMixin):
    """Test Attendance API endpoints"""
    
    def test_create_attendance_session(self):
        """Test creating attendance session"""
        self.authenticate_admin()
        course = CourseFactory()
        
        url = reverse('attendance:sessions')
        data = {
            'course': course.id,
            'batch': 'morning',
            'date': '2024-01-15',
            'start_time': '09:00:00',
            'end_time': '12:00:00',
            'topic': 'Python Variables'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_bulk_mark_attendance(self):
        """Test bulk attendance marking"""
        self.authenticate_admin()
        session = AttendanceSessionFactory()
        students = [StudentFactory() for _ in range(3)]
        
        url = reverse('attendance:bulk_mark')
        data = {
            'session': session.id,
            'attendance_records': [
                {'student': students[0].id, 'status': 'present'},
                {'student': students[1].id, 'status': 'absent'},
                {'student': students[2].id, 'status': 'present'}
            ]
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify attendance records created
        self.assertEqual(Attendance.objects.filter(session=session).count(), 3)
    
    def test_student_attendance_view(self):
        """Test student viewing own attendance"""
        self.authenticate_student()
        
        url = reverse('attendance:my_attendance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
