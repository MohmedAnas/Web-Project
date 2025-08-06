const { body, param, query, validationResult } = require('express-validator');
const { sanitizeInput, isValidEmail, isValidPhone } = require('../utils/helpers');
const { USER_ROLES, BATCH_TYPES, PAYMENT_METHODS } = require('../config/constants');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitize input middleware
const sanitizeInputs = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    }
  }
  
  next();
};

// Authentication validations
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateRegister = [
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
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role'),
  handleValidationErrors
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

// Registration validations
const validateStudentRegistration = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  body('date_of_birth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        throw new Error('Age must be between 16 and 100 years');
      }
      return true;
    }),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('course_interested')
    .notEmpty()
    .withMessage('Please select a course you are interested in'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

const validateAdminRegistration = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  body('employee_id')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('department')
    .isIn([
      'Administration',
      'Academic Affairs',
      'Student Services',
      'IT Department',
      'Finance',
      'Human Resources',
      'Marketing',
      'Operations'
    ])
    .withMessage('Please select a valid department'),
  body('designation')
    .isIn([
      'Director',
      'Assistant Director',
      'Academic Coordinator',
      'Course Instructor',
      'Student Counselor',
      'IT Administrator',
      'Finance Manager',
      'HR Manager',
      'Marketing Executive',
      'Operations Manager'
    ])
    .withMessage('Please select a valid designation'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('admin_code')
    .notEmpty()
    .withMessage('Admin registration code is required'),
  handleValidationErrors
];

// Admin approval validations
const validateAdminApproval = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),
  handleValidationErrors
];

const validateAdminRejection = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  handleValidationErrors
];

const validatePermissionUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),
  body('permissions')
    .isObject()
    .withMessage('Permissions must be an object'),
  handleValidationErrors
];

// Student validations
const validateStudent = [
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
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('parentName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Parent name must be between 2 and 50 characters'),
  body('parentPhone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid parent mobile number'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid parent email')
    .normalizeEmail(),
  handleValidationErrors
];

// Course validations
const validateCourse = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Course description must be between 10 and 500 characters'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('fee')
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number'),
  body('batch')
    .isIn(Object.values(BATCH_TYPES))
    .withMessage('Invalid batch type'),
  handleValidationErrors
];

// Fee validations
const validateFee = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  handleValidationErrors
];

const validatePayment = [
  body('feeId')
    .isMongoId()
    .withMessage('Invalid fee ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('paymentMethod')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID must be between 1 and 100 characters'),
  handleValidationErrors
];

// Attendance validations
const validateAttendance = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('status')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Invalid attendance status'),
  handleValidationErrors
];

// Notice validations
const validateNotice = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('targetType')
    .isIn(['all', 'students', 'course', 'batch', 'individual'])
    .withMessage('Invalid target type'),
  handleValidationErrors
];

// Certificate validations
const validateCertificate = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid issue date'),
  handleValidationErrors
];

// Parameter validations
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

// Query validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  handleValidationErrors
];

// Standalone validation request handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  sanitizeInputs,
  handleValidationErrors,
  validateRequest,
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateStudentRegistration,
  validateAdminRegistration,
  validateAdminApproval,
  validateAdminRejection,
  validatePermissionUpdate,
  validateStudent,
  validateCourse,
  validateFee,
  validatePayment,
  validateAttendance,
  validateNotice,
  validateCertificate,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateDateRange
};
