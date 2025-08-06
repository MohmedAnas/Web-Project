# 🔌 API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👨‍🎓 Students API

### Get All Students
```http
GET /api/students?page=1&limit=10&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

### Create Student
```http
POST /api/students
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "course": "Web Development"
}
```

### Update Student
```http
PUT /api/students/:id
Content-Type: application/json

{
  "firstName": "John Updated",
  "status": "active"
}
```

### Delete Student
```http
DELETE /api/students/:id
```

## 📚 Courses API

### Get All Courses
```http
GET /api/courses?page=1&limit=10
```

### Create Course
```http
POST /api/courses
Content-Type: application/json

{
  "courseName": "Advanced React",
  "description": "Learn advanced React concepts",
  "duration": "3 months",
  "fee": "15000",
  "instructor": "Jane Smith"
}
```

## 💰 Fees API

### Get Student Fees
```http
GET /api/fees/student/:studentId
```

### Mark Fee as Paid
```http
PUT /api/fees/:id/pay
Content-Type: application/json

{
  "paymentMethod": "cash",
  "paidDate": "2024-08-06"
}
```

## 📊 Dashboard API

### Get Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "students": {
      "total": 150,
      "active": 140,
      "byStatus": {...}
    },
    "courses": {
      "total": 10,
      "active": 8
    }
  }
}
```

## 🔍 Health Check

### System Health
```http
GET /health
```

### Google Sheets Status
```http
GET /api/sheets/status
```

## ❌ Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
