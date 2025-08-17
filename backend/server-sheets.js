const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

// Import Google Sheets services
const googleSheetsService = require('./src/services/googleSheetsService');
const studentSheetsService = require('./src/services/studentSheetsService');
const courseSheetsService = require('./src/services/courseSheetsService');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "https://68a1580ae42a050008e291eb--rbcomputers.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the RB Computer Backend API!'
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const sheetsStatus = await googleSheetsService.testConnection();
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: {
                type: 'Google Sheets',
                status: sheetsStatus.connected ? 'connected' : 'disconnected',
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
            },
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: {
                type: 'Google Sheets',
                status: 'error',
                error: error.message
            }
        });
    }
});

// Google Sheets status endpoint
app.get('/api/sheets/status', async (req, res) => {
    try {
        const status = await googleSheetsService.testConnection();
        
        if (status.connected) {
            res.json({
                connected: true,
                spreadsheetId: status.spreadsheetId,
                spreadsheetTitle: status.spreadsheetTitle,
                sheets: googleSheetsService.worksheetNames,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                connected: false,
                error: status.error,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Authentication Routes
app.post('/api/auth/student/register', async (req, res) => {
    try {
        const result = await studentSheetsService.createStudent(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: result.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/auth/student/login', async (req, res) => {
    try {
        // For now, we'll implement a basic login check
        // In a real app, you'd verify credentials against your data
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Mock authentication - replace with real logic
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token: mockToken,
                user: {
                    email: email,
                    role: 'student'
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/auth/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Mock admin authentication
        const mockToken = 'mock-admin-jwt-token-' + Date.now();
        
        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                token: mockToken,
                user: {
                    email: email,
                    role: 'admin'
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/auth/user', async (req, res) => {
    try {
        // Mock user data - replace with real token verification
        res.json({
            success: true,
            data: {
                email: 'user@example.com',
                role: 'student'
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Students API Routes
app.get('/api/students', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let result;
        if (search) {
            result = await studentSheetsService.searchStudents(search, parseInt(page), parseInt(limit));
        } else {
            result = await studentSheetsService.getAllStudents(parseInt(page), parseInt(limit));
        }
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await studentSheetsService.getStudentById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const result = await studentSheetsService.createStudent(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: result.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const result = await studentSheetsService.updateStudent(req.params.id, req.body);
        
        res.json({
            success: true,
            message: 'Student updated successfully',
            data: result.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await studentSheetsService.deleteStudent(req.params.id);
        
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});



app.get('/api/students/stats/overview', async (req, res) => {
    try {
        const stats = await studentSheetsService.getStudentStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Courses API Routes
app.get('/api/courses', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let result;
        if (search) {
            result = await courseSheetsService.searchCourses(search, parseInt(page), parseInt(limit));
        } else {
            result = await courseSheetsService.getAllCourses(parseInt(page), parseInt(limit));
        }
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    try {
        const course = await courseSheetsService.getCourseById(req.params.id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/courses', async (req, res) => {
    try {
        const result = await courseSheetsService.createCourse(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: result.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.put('/api/courses/:id', async (req, res) => {
    try {
        const result = await courseSheetsService.updateCourse(req.params.id, req.body);
        
        res.json({
            success: true,
            message: 'Course updated successfully',
            data: result.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        await courseSheetsService.deleteCourse(req.params.id);
        
        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/courses/stats/overview', async (req, res) => {
    try {
        const stats = await courseSheetsService.getCourseStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/courses/select/options', async (req, res) => {
    try {
        const courses = await courseSheetsService.getCoursesForSelect();
        
        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Dashboard API Routes
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [studentStats, courseStats] = await Promise.all([
            studentSheetsService.getStudentStats(),
            courseSheetsService.getCourseStats()
        ]);

        const recentStudents = await studentSheetsService.getRecentStudents(5);
        const upcomingCourses = await courseSheetsService.getUpcomingCourses(5);

        res.json({
            success: true,
            data: {
                students: studentStats,
                courses: courseStats,
                recent: {
                    students: recentStudents,
                    courses: upcomingCourses
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Bulk operations
app.post('/api/students/bulk-import', async (req, res) => {
    try {
        const { students } = req.body;
        
        if (!Array.isArray(students)) {
            return res.status(400).json({
                success: false,
                message: 'Students data must be an array'
            });
        }

        const result = await studentSheetsService.bulkImportStudents(students);
        
        res.json({
            success: true,
            message: `Bulk import completed. ${result.imported} imported, ${result.errors} errors.`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/courses/bulk-import', async (req, res) => {
    try {
        const { courses } = req.body;
        
        if (!Array.isArray(courses)) {
            return res.status(400).json({
                success: false,
                message: 'Courses data must be an array'
            });
        }

        const result = await courseSheetsService.bulkImportCourses(courses);
        
        res.json({
            success: true,
            message: `Bulk import completed. ${result.imported} imported, ${result.errors} errors.`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log('🚀 RB Computer Backend (Google Sheets) Server Started!');
        console.log('='.repeat(50));
        console.log(`📡 Server running on: http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Database: Google Sheets`);
        console.log(`🆔 Spreadsheet ID: ${process.env.GOOGLE_SPREADSHEET_ID || 'Not configured'}`);
        console.log('='.repeat(50));
        console.log('📋 Available endpoints:');
        console.log(`   Health Check: http://localhost:${PORT}/health`);
        console.log(`   Sheets Status: http://localhost:${PORT}/api/sheets/status`);
        console.log(`   Students API: http://localhost:${PORT}/api/students`);
        console.log(`   Courses API: http://localhost:${PORT}/api/courses`);
        console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
        console.log('='.repeat(50));
    });
}

module.exports = app;
