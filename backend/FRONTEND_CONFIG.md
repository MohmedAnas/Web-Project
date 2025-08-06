# Frontend Integration Configuration

## 🔗 API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 🔐 Authentication Setup

### Login Request
```javascript
const login = async (email, password, userType) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, userType })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};
```

### Authenticated Requests
```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  return response.json();
};
```

## 📊 API Endpoints Ready for Frontend

### Authentication (8 endpoints)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout  
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password

### Students (10 endpoints)
- `GET /students` - List students
- `POST /students` - Create student
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `GET /students/stats` - Statistics

### Courses (13 endpoints)
- `GET /courses` - List courses
- `POST /courses` - Create course
- `GET /courses/:id` - Get course details
- `GET /courses/stats` - Statistics

### Fees (12 endpoints)
- `GET /fees` - List fees
- `POST /fees` - Create fee
- `GET /fees/overdue` - Overdue fees
- `GET /fees/stats` - Statistics

### Attendance (9 endpoints)
- `GET /attendance/dashboard` - Main dashboard
- `GET /attendance` - List attendance
- `POST /attendance` - Mark attendance
- `GET /attendance/stats` - Statistics

### Notices (8 endpoints)
- `GET /notices` - List notices
- `POST /notices` - Create notice
- `GET /notices/my` - User notices
- `GET /notices/stats` - Statistics

### Certificates (7 endpoints)
- `GET /certificates` - List certificates
- `POST /certificates` - Issue certificate
- `GET /certificates/download/:id` - Download PDF

## 🌐 CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative port)
- `https://your-app.netlify.app` (Production)

## 🔒 Security Headers
All responses include security headers:
- CORS enabled
- Rate limiting applied
- JWT token validation
- Input sanitization

## 📱 Response Format
All API responses follow this format:
```javascript
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": { ... } // For list endpoints
}
```

## ⚠️ Error Handling
```javascript
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```
