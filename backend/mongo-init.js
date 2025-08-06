// MongoDB Initialization Script
// This script runs when MongoDB container starts for the first time

// Switch to rbcomputer database
db = db.getSiblingDB('rbcomputer');

// Create collections
db.createCollection('users');
db.createCollection('students');
db.createCollection('courses');
db.createCollection('fees');
db.createCollection('attendance');
db.createCollection('notices');
db.createCollection('certificates');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.students.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "studentId": 1 }, { unique: true });
db.courses.createIndex({ "code": 1 }, { unique: true });
db.courses.createIndex({ "category": 1 });
db.fees.createIndex({ "student": 1 });
db.fees.createIndex({ "dueDate": 1 });
db.attendance.createIndex({ "student": 1, "date": 1 });
db.notices.createIndex({ "createdAt": -1 });
db.certificates.createIndex({ "student": 1 });

print('✅ MongoDB initialized successfully with collections and indexes');
print('📊 Collections created: users, students, courses, fees, attendance, notices, certificates');
print('🔍 Indexes created for optimal performance');
print('🚀 Database ready for RB Computer application!');
