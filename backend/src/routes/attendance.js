const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, ATTENDANCE_STATUS, BATCH_TYPES } = require('../config/constants');
const {
  getAttendanceDashboard,
  getAttendanceRecords,
  markAttendance,
  updateAttendance,
  getStudentAttendance,
  getCourseAttendance,
  getAttendanceReports,
  bulkMarkAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication
router.use(protect);

// Validation middleware for attendance marking
const attendanceValidation = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('batch')
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Invalid batch type'),
  body('status')
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage('Invalid attendance status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Validation for bulk attendance
const bulkAttendanceValidation = [
  body('attendanceData')
    .isArray({ min: 1 })
    .withMessage('Attendance data array is required and cannot be empty'),
  body('attendanceData.*.student')
    .isMongoId()
    .withMessage('Each record must have a valid student ID'),
  body('attendanceData.*.course')
    .isMongoId()
    .withMessage('Each record must have a valid course ID'),
  body('attendanceData.*.status')
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage('Each record must have a valid attendance status')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid attendance ID')
];

const studentIdValidation = [
  param('studentId')
    .isMongoId()
    .withMessage('Please provide a valid student ID')
];

const courseIdValidation = [
  param('courseId')
    .isMongoId()
    .withMessage('Please provide a valid course ID')
];

// Dashboard query validation
const dashboardQueryValidation = [
  query('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  query('batch')
    .optional()
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Invalid batch type')
];

// Routes

// @route   GET /api/attendance/dashboard
// @desc    Get attendance dashboard with all registered students
// @access  Private (Viewer+)
router.get('/dashboard',
  requireMinRole(USER_ROLES.VIEWER),
  dashboardQueryValidation,
  validateRequest,
  getAttendanceDashboard
);

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private (Viewer+)
router.get('/stats', 
  requireMinRole(USER_ROLES.VIEWER), 
  getAttendanceStats
);

// @route   GET /api/attendance/reports
// @desc    Get attendance reports
// @access  Private (Viewer+)
router.get('/reports',
  requireMinRole(USER_ROLES.VIEWER),
  getAttendanceReports
);

// @route   POST /api/attendance/bulk-mark
// @desc    Bulk mark attendance
// @access  Private (Editor+)
router.post('/bulk-mark',
  requireMinRole(USER_ROLES.EDITOR),
  bulkAttendanceValidation,
  validateRequest,
  bulkMarkAttendance
);

// @route   GET /api/attendance/student/:studentId
// @desc    Get student attendance records
// @access  Private (Viewer+)
router.get('/student/:studentId',
  requireMinRole(USER_ROLES.VIEWER),
  studentIdValidation,
  validateRequest,
  getStudentAttendance
);

// @route   GET /api/attendance/course/:courseId
// @desc    Get course attendance records
// @access  Private (Viewer+)
router.get('/course/:courseId',
  requireMinRole(USER_ROLES.VIEWER),
  courseIdValidation,
  validateRequest,
  getCourseAttendance
);

// @route   GET /api/attendance
// @desc    Get all attendance records with pagination and filters
// @access  Private (Viewer+)
router.get('/',
  requireMinRole(USER_ROLES.VIEWER),
  getAttendanceRecords
);

// @route   POST /api/attendance
// @desc    Mark attendance for a student
// @access  Private (Editor+)
router.post('/',
  requireMinRole(USER_ROLES.EDITOR),
  attendanceValidation,
  validateRequest,
  markAttendance
);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Editor+)
router.put('/:id',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  validateRequest,
  updateAttendance
);

module.exports = router;
