const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, authorize, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, STUDENT_STATUS, BATCH_TYPES } = require('../config/constants');
const {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyProfile,
  getStudentDashboard,
  enrollStudentInCourse,
  getStudentStats,
  bulkCreateStudents
} = require('../controllers/studentController');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication
router.use(protect);

// Validation middleware for student creation/update
const studentValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('parentDetails.fatherName')
    .trim()
    .notEmpty()
    .withMessage('Father name is required'),
  body('parentDetails.parentPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid parent mobile number'),
  body('academicDetails.qualification')
    .trim()
    .notEmpty()
    .withMessage('Educational qualification is required')
];

// Validation for enrollment
const enrollmentValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  body('batch')
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Please provide a valid batch type'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('expectedEndDate')
    .isISO8601()
    .withMessage('Please provide a valid expected end date')
];

// Validation for bulk creation
const bulkCreateValidation = [
  body('students')
    .isArray({ min: 1 })
    .withMessage('Students array is required and cannot be empty'),
  body('students.*.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each student must have a valid first name'),
  body('students.*.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each student must have a valid last name'),
  body('students.*.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Each student must have a valid email')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid student ID')
];

// Query validation for list endpoint
const listQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(STUDENT_STATUS))
    .withMessage('Invalid status value'),
  query('batch')
    .optional()
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Invalid batch value'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'firstName', 'lastName', 'admissionUID', 'enrollmentDetails.admissionDate'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Private (Viewer+)
router.get('/stats', 
  requireMinRole(USER_ROLES.VIEWER), 
  getStudentStats
);

// @route   GET /api/students/me
// @desc    Get current student profile
// @access  Private (Student)
router.get('/me', 
  authorize(USER_ROLES.STUDENT), 
  getMyProfile
);

// @route   POST /api/students/bulk-create
// @desc    Bulk create students
// @access  Private (Admin+)
router.post('/bulk-create',
  requireMinRole(USER_ROLES.ADMIN),
  bulkCreateValidation,
  validateRequest,
  bulkCreateStudents
);

// @route   GET /api/students
// @desc    Get all students with pagination, search, and filters
// @access  Private (Viewer+)
router.get('/',
  requireMinRole(USER_ROLES.VIEWER),
  listQueryValidation,
  validateRequest,
  getStudents
);

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Editor+)
router.post('/',
  requireMinRole(USER_ROLES.EDITOR),
  studentValidation,
  validateRequest,
  createStudent
);

// @route   GET /api/students/:id
// @desc    Get student details by ID
// @access  Private (Viewer+ or own profile)
router.get('/:id',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getStudentById
);

// @route   PUT /api/students/:id
// @desc    Update student information
// @access  Private (Editor+)
router.put('/:id',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  validateRequest,
  updateStudent
);

// @route   DELETE /api/students/:id
// @desc    Delete student (soft delete)
// @access  Private (Admin+)
router.delete('/:id',
  requireMinRole(USER_ROLES.ADMIN),
  idValidation,
  validateRequest,
  deleteStudent
);

// @route   GET /api/students/:id/dashboard
// @desc    Get student dashboard data
// @access  Private (Viewer+ or own profile)
router.get('/:id/dashboard',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getStudentDashboard
);

// @route   POST /api/students/:id/enroll
// @desc    Enroll student in course
// @access  Private (Editor+)
router.post('/:id/enroll',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  enrollmentValidation,
  validateRequest,
  enrollStudentInCourse
);

module.exports = router;
