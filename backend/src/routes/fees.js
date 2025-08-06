const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, FEE_STATUS, PAYMENT_METHODS } = require('../config/constants');
const {
  getFees,
  createFee,
  getFeeById,
  updateFee,
  deleteFee,
  recordPayment,
  getStudentFees,
  getOverdueFees,
  getFeeReports,
  bulkCreateFees,
  getFeeStats,
  sendFeeReminders
} = require('../controllers/feeController');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication
router.use(protect);

// Validation middleware for fee creation/update
const feeValidation = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  body('feeType')
    .isIn(['admission', 'tuition', 'examination', 'library', 'lab', 'certificate', 'miscellaneous'])
    .withMessage('Invalid fee type'),
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
  body('amount.original')
    .isFloat({ min: 0 })
    .withMessage('Original amount must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
];

// Validation for payment
const paymentValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a positive number'),
  body('method')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID must be between 1 and 100 characters')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid fee ID')
];

const studentIdValidation = [
  param('studentId')
    .isMongoId()
    .withMessage('Please provide a valid student ID')
];

// Routes

// @route   GET /api/fees/stats
// @desc    Get fee statistics
// @access  Private (Viewer+)
router.get('/stats', 
  requireMinRole(USER_ROLES.VIEWER), 
  getFeeStats
);

// @route   GET /api/fees/overdue
// @desc    Get overdue fees
// @access  Private (Viewer+)
router.get('/overdue',
  requireMinRole(USER_ROLES.VIEWER),
  getOverdueFees
);

// @route   GET /api/fees/reports
// @desc    Get fee reports
// @access  Private (Viewer+)
router.get('/reports',
  requireMinRole(USER_ROLES.VIEWER),
  getFeeReports
);

// @route   POST /api/fees/bulk-create
// @desc    Bulk create fees
// @access  Private (Admin+)
router.post('/bulk-create',
  requireMinRole(USER_ROLES.ADMIN),
  bulkCreateFees
);

// @route   POST /api/fees/send-reminders
// @desc    Send fee reminders
// @access  Private (Editor+)
router.post('/send-reminders',
  requireMinRole(USER_ROLES.EDITOR),
  sendFeeReminders
);

// @route   GET /api/fees/student/:studentId
// @desc    Get student fees
// @access  Private (Viewer+)
router.get('/student/:studentId',
  requireMinRole(USER_ROLES.VIEWER),
  studentIdValidation,
  validateRequest,
  getStudentFees
);

// @route   GET /api/fees
// @desc    Get all fees with pagination, search, and filters
// @access  Private (Viewer+)
router.get('/',
  requireMinRole(USER_ROLES.VIEWER),
  getFees
);

// @route   POST /api/fees
// @desc    Create new fee record
// @access  Private (Editor+)
router.post('/',
  requireMinRole(USER_ROLES.EDITOR),
  feeValidation,
  validateRequest,
  createFee
);

// @route   GET /api/fees/:id
// @desc    Get fee details by ID
// @access  Private (Viewer+)
router.get('/:id',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getFeeById
);

// @route   PUT /api/fees/:id
// @desc    Update fee information
// @access  Private (Editor+)
router.put('/:id',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  validateRequest,
  updateFee
);

// @route   DELETE /api/fees/:id
// @desc    Delete fee
// @access  Private (Admin+)
router.delete('/:id',
  requireMinRole(USER_ROLES.ADMIN),
  idValidation,
  validateRequest,
  deleteFee
);

// @route   POST /api/fees/:id/payment
// @desc    Record payment for fee
// @access  Private (Editor+)
router.post('/:id/payment',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  paymentValidation,
  validateRequest,
  recordPayment
);

module.exports = router;
