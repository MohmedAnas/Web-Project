# Frontend Integration Guide

## 🔗 API Base Configuration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### CORS Configuration
The backend is configured to accept requests from:
- **Development**: `http://localhost:3000`
- **Production**: Set via `FRONTEND_URL` environment variable

## 🔐 Authentication Flow

### 1. Login Request
```javascript
// POST /api/auth/login
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      userType: credentials.userType // 'admin' or 'student'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

### 2. API Request with Authentication
```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    credentials: 'include'
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry the request
    return makeAuthenticatedRequest(endpoint, options);
  }
  
  return response.json();
};
```

### 3. Token Refresh
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  } else {
    // Refresh failed, redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

## 📊 Standard API Response Format

All API responses follow this consistent format:

### Success Response
```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  // For paginated responses
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message",
  // For validation errors
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

## 🎯 Key API Endpoints for Frontend

### Authentication
```javascript
// Login
POST /api/auth/login
// Logout
POST /api/auth/logout
// Get Profile
GET /api/auth/profile
// Update Profile
PUT /api/auth/profile
// Change Password
POST /api/auth/change-password
```

### Students Management
```javascript
// Get all students (with pagination)
GET /api/students?page=1&limit=10&search=john
// Create student
POST /api/students
// Get student details
GET /api/students/:id
// Update student
PUT /api/students/:id
// Get student dashboard
GET /api/students/:id/dashboard
// Get my profile (for student users)
GET /api/students/me
```

### Courses Management
```javascript
// Get all courses
GET /api/courses?page=1&limit=10&category=programming
// Create course
POST /api/courses
// Get course details
GET /api/courses/:id
// Get course students
GET /api/courses/:id/students
// Get course modules
GET /api/courses/:id/modules
```

### Fee Management
```javascript
// Get all fees
GET /api/fees?status=pending&student=:studentId
// Create fee
POST /api/fees
// Record payment
POST /api/fees/:id/payment
// Get student fees
GET /api/fees/student/:studentId
// Get overdue fees
GET /api/fees/overdue
```

### Attendance Management
```javascript
// Get attendance dashboard
GET /api/attendance/dashboard?course=:courseId&date=2024-08-03
// Mark attendance
POST /api/attendance
// Get student attendance
GET /api/attendance/student/:studentId
// Bulk mark attendance
POST /api/attendance/bulk-mark
```

### Notice Board
```javascript
// Get all notices
GET /api/notices?category=academic&priority=high
// Create notice
POST /api/notices
// Get my notices
GET /api/notices/my
// Mark as read
POST /api/notices/:id/read
```

### Certificate Management
```javascript
// Get all certificates
GET /api/certificates?student=:studentId
// Issue certificate
POST /api/certificates
// Get student certificates
GET /api/certificates/student/:studentId
// Download certificate
GET /api/certificates/download/:id
```

## 🎨 Frontend Component Examples

### 1. Login Component
```javascript
import React, { useState } from 'react';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // Redirect based on user role
        window.location.href = data.data.user.role === 'student' ? '/student-dashboard' : '/admin-dashboard';
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
      </div>
      <div>
        <label>User Type:</label>
        <select
          value={credentials.userType}
          onChange={(e) => setCredentials({...credentials, userType: e.target.value})}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 2. Students List Component
```javascript
import React, { useState, useEffect } from 'react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`http://localhost:8000/api/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  return (
    <div>
      <h2>Students List</h2>
      
      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search students..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Students Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>UID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id}>
                <td>{student.admissionUID}</td>
                <td>{student.fullName}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.status}</td>
                <td>
                  <button onClick={() => viewStudent(student._id)}>View</button>
                  <button onClick={() => editStudent(student._id)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={!pagination.hasPrevPage}
          onClick={() => setFilters({...filters, page: filters.page - 1})}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button 
          disabled={!pagination.hasNextPage}
          onClick={() => setFilters({...filters, page: filters.page + 1})}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 3. Attendance Dashboard Component
```javascript
import React, { useState, useEffect } from 'react';

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState([]);

  const fetchAttendanceDashboard = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8000/api/attendance/dashboard?course=${selectedCourse}&date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance dashboard:', error);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          student: studentId,
          course: selectedCourse,
          date: selectedDate,
          status: status,
          batch: 'morning' // or get from student data
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh dashboard
        fetchAttendanceDashboard();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <div>
      <h2>Attendance Dashboard</h2>
      
      <div className="controls">
        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {attendanceData && (
        <div>
          <div className="summary">
            <h3>Summary</h3>
            <p>Total Students: {attendanceData.summary.totalStudents}</p>
            <p>Present: {attendanceData.summary.present}</p>
            <p>Absent: {attendanceData.summary.absent}</p>
            <p>Attendance Rate: {attendanceData.summary.attendanceRate}%</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>UID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.students.map(studentData => (
                <tr key={studentData.student._id}>
                  <td>{studentData.student.uid}</td>
                  <td>{studentData.student.name}</td>
                  <td>{studentData.student.email}</td>
                  <td>{studentData.student.phone}</td>
                  <td>
                    <span className={`status ${studentData.attendance.status}`}>
                      {studentData.attendance.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => markAttendance(studentData.student._id, 'present')}
                      className="present-btn"
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => markAttendance(studentData.student._id, 'absent')}
                      className="absent-btn"
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
```

## 🔧 Environment Configuration

### Frontend Environment Variables
```javascript
// .env.local (for Next.js) or .env (for React)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Backend Environment Variables
```bash
# Update these in backend/.env
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:8000
```

## 🚨 Important Notes for Frontend Integration

### 1. Error Handling
Always check the `success` field in API responses:
```javascript
const response = await fetch(endpoint);
const data = await response.json();

if (!data.success) {
  // Handle error
  console.error(data.error);
  if (data.details) {
    // Handle validation errors
    data.details.forEach(detail => {
      console.error(`${detail.field}: ${detail.message}`);
    });
  }
}
```

### 2. File Uploads
For file uploads, use FormData:
```javascript
const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    credentials: 'include',
    body: formData
  });
  
  return response.json();
};
```

### 3. Date Handling
The backend expects ISO date strings:
```javascript
// Convert date input to ISO string
const dateValue = new Date(inputDate).toISOString();
```

### 4. Pagination
Handle pagination consistently:
```javascript
const [pagination, setPagination] = useState({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false
});
```

## ✅ Frontend Integration Checklist

- [ ] Configure CORS in backend
- [ ] Set up authentication flow
- [ ] Implement token refresh mechanism
- [ ] Handle API errors consistently
- [ ] Set up file upload handling
- [ ] Implement pagination
- [ ] Add loading states
- [ ] Handle role-based access
- [ ] Set up environment variables
- [ ] Test all API endpoints

The backend is fully ready for frontend integration with consistent API responses, proper CORS configuration, and comprehensive authentication flow! 🚀
