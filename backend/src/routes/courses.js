const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, COURSE_STATUS, BATCH_TYPES } = require('../config/constants');
const {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  addCourseModule,
  getCourseModules,
  updateCourseModule,
  deleteCourseModule,
  getCourseSchedule,
  updateCourseSchedule,
  getCourseStats
} = require('../controllers/courseController');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication
router.use(protect);

// Validation middleware for course creation/update
const courseValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Course description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['programming', 'web_development', 'mobile_development', 'data_science', 'cybersecurity', 'networking', 'database', 'other'])
    .withMessage('Invalid course category'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Course level must be beginner, intermediate, or advanced'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('fee.amount')
    .isFloat({ min: 0 })
    .withMessage('Fee amount must be a positive number'),
  body('code')
    .optional()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Course code must be 3-10 characters, letters and numbers only')
];

// Validation for module creation/update
const moduleValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Module name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Module description cannot exceed 500 characters'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Module duration must be at least 1 day'),
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
  body('topics.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Topic name must be between 1 and 100 characters')
];

// Validation for schedule
const scheduleValidation = [
  body('batches')
    .isArray({ min: 1 })
    .withMessage('At least one batch is required'),
  body('batches.*.type')
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Invalid batch type'),
  body('batches.*.startTime')
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('batches.*.endTime')
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('batches.*.days')
    .isArray({ min: 1 })
    .withMessage('At least one day is required'),
  body('batches.*.days.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('batches.*.maxStudents')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max students must be between 1 and 100')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid course ID')
];

const moduleIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  param('moduleId')
    .isMongoId()
    .withMessage('Please provide a valid module ID')
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
  query('category')
    .optional()
    .isIn(['programming', 'web_development', 'mobile_development', 'data_science', 'cybersecurity', 'networking', 'database', 'other'])
    .withMessage('Invalid category'),
  query('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),
  query('status')
    .optional()
    .isIn(Object.values(COURSE_STATUS))
    .withMessage('Invalid status'),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be true or false'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'code', 'fee.amount', 'duration', 'statistics.totalEnrollments'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes

// @route   GET /api/courses/stats
// @desc    Get course statistics
// @access  Private (Viewer+)
router.get('/stats', 
  requireMinRole(USER_ROLES.VIEWER), 
  getCourseStats
);

// @route   GET /api/courses
// @desc    Get all courses with pagination, search, and filters
// @access  Private (Viewer+)
router.get('/',
  requireMinRole(USER_ROLES.VIEWER),
  listQueryValidation,
  validateRequest,
  getCourses
);

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Editor+)
router.post('/',
  requireMinRole(USER_ROLES.EDITOR),
  courseValidation,
  validateRequest,
  createCourse
);

// @route   GET /api/courses/:id
// @desc    Get course details by ID
// @access  Private (Viewer+)
router.get('/:id',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getCourseById
);

// @route   PUT /api/courses/:id
// @desc    Update course information
// @access  Private (Editor+)
router.put('/:id',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  validateRequest,
  updateCourse
);

// @route   DELETE /api/courses/:id
// @desc    Delete course (soft delete)
// @access  Private (Admin+)
router.delete('/:id',
  requireMinRole(USER_ROLES.ADMIN),
  idValidation,
  validateRequest,
  deleteCourse
);

// @route   GET /api/courses/:id/students
// @desc    Get enrolled students for a course
// @access  Private (Viewer+)
router.get('/:id/students',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getCourseStudents
);

// @route   GET /api/courses/:id/modules
// @desc    Get course modules
// @access  Private (Viewer+)
router.get('/:id/modules',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getCourseModules
);

// @route   POST /api/courses/:id/modules
// @desc    Add module to course
// @access  Private (Editor+)
router.post('/:id/modules',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  moduleValidation,
  validateRequest,
  addCourseModule
);

// @route   PUT /api/courses/:id/modules/:moduleId
// @desc    Update course module
// @access  Private (Editor+)
router.put('/:id/modules/:moduleId',
  requireMinRole(USER_ROLES.EDITOR),
  moduleIdValidation,
  validateRequest,
  updateCourseModule
);

// @route   DELETE /api/courses/:id/modules/:moduleId
// @desc    Delete course module
// @access  Private (Editor+)
router.delete('/:id/modules/:moduleId',
  requireMinRole(USER_ROLES.EDITOR),
  moduleIdValidation,
  validateRequest,
  deleteCourseModule
);

// @route   GET /api/courses/:id/schedule
// @desc    Get course schedule
// @access  Private (Viewer+)
router.get('/:id/schedule',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getCourseSchedule
);

// @route   POST /api/courses/:id/schedule
// @desc    Create/Update course schedule
// @access  Private (Editor+)
router.post('/:id/schedule',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  scheduleValidation,
  validateRequest,
  updateCourseSchedule
);

module.exports = router;
