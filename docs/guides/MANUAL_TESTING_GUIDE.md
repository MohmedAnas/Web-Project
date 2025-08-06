# 🧪 Manual Testing Guide
## RB Computer Student Management System

## ⏱️ **Time Estimates**

| Testing Level | Duration | What You'll Check |
|---------------|----------|-------------------|
| **Quick Check** | 15-20 minutes | Basic functionality, login, navigation |
| **Feature Testing** | 45-60 minutes | All major features and workflows |
| **Comprehensive** | 1-2 hours | Complete system testing with edge cases |

## 🚀 **Quick Start (15-20 minutes)**

### Step 1: Setup and Launch
```bash
cd /home/master73/RBComputer
./quick_test_setup.sh
```

### Step 2: Basic Functionality Check
1. **Open Browser**: Go to `http://localhost:3000`
2. **Login Test**: Use `admin@rbcomputer.com` / `admin123`
3. **Navigation Test**: Check all menu items load
4. **Dashboard Test**: Verify statistics display correctly

### Step 3: Quick Feature Verification
- ✅ **Students**: Can you see the students list?
- ✅ **Courses**: Can you view available courses?
- ✅ **Fees**: Does the fee management load?
- ✅ **Attendance**: Can you access attendance features?

## 📋 **Comprehensive Testing (1-2 hours)**

### **Authentication & Authorization (10 minutes)**
- [ ] Admin login works
- [ ] Student login works (if student account exists)
- [ ] Logout functionality
- [ ] Password change
- [ ] Role-based access (admin vs student views)

### **Student Management (15 minutes)**
- [ ] View students list
- [ ] Search students by name/email
- [ ] Filter students by course/batch
- [ ] Create new student
- [ ] Edit student information
- [ ] View student details
- [ ] Student dashboard (if logged in as student)

### **Course Management (15 minutes)**
- [ ] View courses list
- [ ] Create new course
- [ ] Edit course details
- [ ] Add course modules
- [ ] Set course schedules
- [ ] View course statistics
- [ ] Course enrollment tracking

### **Fee Management (20 minutes)**
- [ ] View fees list
- [ ] Create new fee for student
- [ ] Process fee payment
- [ ] View payment history
- [ ] Generate fee reports
- [ ] Bulk fee creation
- [ ] Fee status tracking (pending/paid/overdue)

### **Attendance System (15 minutes)**
- [ ] Create attendance session
- [ ] Mark student attendance
- [ ] Bulk attendance marking
- [ ] View attendance reports
- [ ] Student attendance statistics
- [ ] Attendance analytics

### **Notice Board (10 minutes)**
- [ ] Create new notice
- [ ] View notices list
- [ ] Edit/delete notices
- [ ] Student notice view
- [ ] Notice priority system

### **Certificate Management (10 minutes)**
- [ ] Generate student certificate
- [ ] View certificates list
- [ ] Certificate verification
- [ ] Download certificate PDF
- [ ] Certificate statistics

### **Reports & Analytics (10 minutes)**
- [ ] Dashboard statistics
- [ ] Student reports
- [ ] Fee collection reports
- [ ] Attendance reports
- [ ] Course enrollment reports

## 🔧 **API Testing (Optional - 30 minutes)**

### Using Browser/Postman:
```bash
# Get authentication token
POST http://localhost:8000/api/auth/login/
{
  "email": "admin@rbcomputer.com",
  "password": "admin123"
}

# Test other endpoints with Bearer token
GET http://localhost:8000/api/students/
GET http://localhost:8000/api/courses/
GET http://localhost:8000/api/fees/
```

### API Documentation:
- **Swagger UI**: `http://localhost:8000/swagger/`
- **Admin Panel**: `http://localhost:8000/admin/`

## 🐛 **Common Issues to Check**

### Frontend Issues
- [ ] Pages load without errors
- [ ] Forms submit correctly
- [ ] Data displays properly
- [ ] Navigation works smoothly
- [ ] Responsive design on different screen sizes

### Backend Issues
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Authentication tokens valid
- [ ] Error handling works
- [ ] Data validation functions

### Integration Issues
- [ ] Frontend-backend communication
- [ ] Real-time data updates
- [ ] File upload/download
- [ ] Email notifications (if configured)

## 📊 **Performance Check**

### Response Times
- [ ] Page loads < 3 seconds
- [ ] API responses < 1 second
- [ ] Database queries optimized
- [ ] No memory leaks

### User Experience
- [ ] Smooth navigation
- [ ] Clear error messages
- [ ] Intuitive interface
- [ ] Consistent design

## 🎯 **Test Scenarios**

### **Scenario 1: New Student Enrollment (10 minutes)**
1. Create new course
2. Register new student
3. Assign student to course
4. Create fee for student
5. Process fee payment
6. Mark attendance
7. Generate certificate

### **Scenario 2: Admin Daily Tasks (10 minutes)**
1. Login as admin
2. Check dashboard statistics
3. Review pending fees
4. Mark today's attendance
5. Create notice for students
6. Generate daily reports

### **Scenario 3: Student Experience (10 minutes)**
1. Login as student
2. View personal dashboard
3. Check course progress
4. View attendance record
5. Check fee status
6. Read notices
7. Download certificates

## 🛑 **Stop Testing**

When done testing:
```bash
# Stop the servers
kill $(cat .backend_pid)
kill $(cat .frontend_pid)

# Or use Ctrl+C in the terminals
```

## 📝 **Testing Results Template**

```
✅ PASSED / ❌ FAILED / ⚠️ ISSUES

Authentication: ✅
Student Management: ✅
Course Management: ✅
Fee Management: ✅
Attendance System: ✅
Notice Board: ✅
Certificate Management: ✅
Performance: ✅
User Experience: ✅

Issues Found:
- [List any issues here]

Overall Status: ✅ READY FOR PRODUCTION
```

## 🎉 **Expected Results**

After testing, you should see:
- **Fully functional web application**
- **All features working correctly**
- **Good performance and responsiveness**
- **Professional user interface**
- **Comprehensive admin capabilities**
- **Secure authentication system**

**Total Time Investment**: 15 minutes (quick) to 2 hours (comprehensive)

The system should demonstrate a complete, production-ready student management solution!
