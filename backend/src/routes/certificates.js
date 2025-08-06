const express = require('express');
const { body, param } = require('express-validator');
const { protect, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, CERTIFICATE_STATUS } = require('../config/constants');
const {
  getCertificates,
  issueCertificate,
  getCertificateById,
  updateCertificate,
  revokeCertificate,
  getStudentCertificates,
  downloadCertificate
} = require('../controllers/certificateController');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication
router.use(protect);

// Validation middleware for certificate creation
const certificateValidation = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  body('certificateType')
    .optional()
    .isIn(['completion', 'participation', 'achievement', 'merit', 'excellence', 'custom'])
    .withMessage('Invalid certificate type'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid issue date'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
];

// Validation for certificate revocation
const revocationValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Revocation reason must be between 10 and 500 characters')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid certificate ID')
];

const studentIdValidation = [
  param('studentId')
    .isMongoId()
    .withMessage('Please provide a valid student ID')
];

// Routes

// @route   GET /api/certificates/student/:studentId
// @desc    Get student certificates
// @access  Private (Viewer+ or own certificates)
router.get('/student/:studentId',
  requireMinRole(USER_ROLES.VIEWER),
  studentIdValidation,
  validateRequest,
  getStudentCertificates
);

// @route   GET /api/certificates/download/:id
// @desc    Download certificate PDF
// @access  Private (Viewer+ or own certificate)
router.get('/download/:id',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  downloadCertificate
);

// @route   GET /api/certificates
// @desc    Get all certificates with pagination and filters
// @access  Private (Viewer+)
router.get('/',
  requireMinRole(USER_ROLES.VIEWER),
  getCertificates
);

// @route   POST /api/certificates
// @desc    Issue new certificate
// @access  Private (Editor+)
router.post('/',
  requireMinRole(USER_ROLES.EDITOR),
  certificateValidation,
  validateRequest,
  issueCertificate
);

// @route   GET /api/certificates/:id
// @desc    Get certificate details by ID
// @access  Private (Viewer+)
router.get('/:id',
  requireMinRole(USER_ROLES.VIEWER),
  idValidation,
  validateRequest,
  getCertificateById
);

// @route   PUT /api/certificates/:id
// @desc    Update certificate information
// @access  Private (Editor+)
router.put('/:id',
  requireMinRole(USER_ROLES.EDITOR),
  idValidation,
  validateRequest,
  updateCertificate
);

// @route   DELETE /api/certificates/:id
// @desc    Revoke certificate
// @access  Private (Admin+)
router.delete('/:id',
  requireMinRole(USER_ROLES.ADMIN),
  idValidation,
  revocationValidation,
  validateRequest,
  revokeCertificate
);

module.exports = router;
