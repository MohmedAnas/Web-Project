# R.B Computer Backend

This is the backend API for the R.B Computer Student Management System, built with Django and Django REST Framework.

## Project Structure

The backend is organized into the following apps:

- **core**: User authentication and common functionality
- **students**: Student, course, enrollment, and certificate management
- **fees**: Fee structures, fee records, and payment tracking
- **attendance**: Attendance records and statistics
- **notices**: Announcements and notifications

## Models

### Core Models
- **User**: Custom user model with role-based authentication (Admin, Editor, Viewer, Student)

### Student Models
- **Student**: Student profile information
- **Course**: Course offerings and details
- **Enrollment**: Student enrollment in courses
- **Certificate**: Course completion certificates

### Fee Models
- **FeeStructure**: Fee structure definitions for courses
- **FeeRecord**: Student fee records
- **Payment**: Fee payment tracking

### Attendance Models
- **AttendanceRecord**: Daily attendance tracking
- **AttendanceSummary**: Monthly attendance statistics

### Notice Models
- **Notice**: Announcements and notifications
- **NoticeRead**: Tracking which students have read notices

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   ```
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

Alternatively, you can use the provided script to run all these steps:
```
./run_migrations.sh
```

## API Endpoints

The following API endpoints will be implemented:

### Authentication
- `POST /api/token/`: Obtain JWT token
- `POST /api/token/refresh/`: Refresh JWT token
- `POST /api/auth/register/`: Register a new user
- `POST /api/auth/login/`: Login user
- `POST /api/auth/logout/`: Logout user
- `POST /api/auth/password-reset/request/`: Request password reset
- `POST /api/auth/password-reset/confirm/`: Confirm password reset

### Students
- `GET /api/students/`: List all students
- `POST /api/students/`: Create a new student
- `GET /api/students/{id}/`: Get student details
- `PUT /api/students/{id}/`: Update student
- `DELETE /api/students/{id}/`: Delete student
- `GET /api/students/{id}/courses/`: Get student courses
- `POST /api/students/{id}/courses/`: Enroll student in course
- `GET /api/students/{id}/certificates/`: Get student certificates
- `POST /api/students/{id}/certificates/`: Issue certificate to student

### Courses
- `GET /api/courses/`: List all courses
- `POST /api/courses/`: Create a new course
- `GET /api/courses/{id}/`: Get course details
- `PUT /api/courses/{id}/`: Update course
- `DELETE /api/courses/{id}/`: Delete course
- `GET /api/courses/{id}/students/`: Get students enrolled in course

### Fees
- `GET /api/fees/`: List all fee records
- `POST /api/fees/`: Create a new fee record
- `GET /api/fees/{id}/`: Get fee record details
- `PUT /api/fees/{id}/`: Update fee record
- `DELETE /api/fees/{id}/`: Delete fee record
- `POST /api/fees/{id}/payments/`: Record payment for fee
- `GET /api/fees/{id}/payments/`: Get payment history for fee
- `GET /api/fees/statistics/`: Get fee statistics

### Attendance
- `GET /api/attendance/`: List attendance records
- `POST /api/attendance/`: Create attendance record
- `GET /api/attendance/{id}/`: Get attendance record details
- `PUT /api/attendance/{id}/`: Update attendance record
- `DELETE /api/attendance/{id}/`: Delete attendance record
- `GET /api/attendance/summary/`: Get attendance summary
- `GET /api/attendance/summary/{student_id}/`: Get student attendance summary

### Notices
- `GET /api/notices/`: List all notices
- `POST /api/notices/`: Create a new notice
- `GET /api/notices/{id}/`: Get notice details
- `PUT /api/notices/{id}/`: Update notice
- `DELETE /api/notices/{id}/`: Delete notice
- `POST /api/notices/{id}/read/`: Mark notice as read
- `GET /api/notices/student/`: Get notices for current student

## Development

### Running Tests
```
python manage.py test
```

### Code Coverage
```
coverage run --source='.' manage.py test
coverage report
```

## Deployment

For production deployment:

1. Update `settings.py` with production settings
2. Set environment variables for sensitive information
3. Use PostgreSQL instead of SQLite
4. Configure WSGI server (e.g., Gunicorn)
5. Set up static files serving with Whitenoise or a CDN
6. Configure HTTPS with a proper SSL certificate
