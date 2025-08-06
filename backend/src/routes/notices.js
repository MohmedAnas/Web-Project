const express = require('express');
const { body, param } = require('express-validator');
const { protect, requireMinRole } = require('../middleware/auth');
const { sanitizeInputs, validateRequest } = require('../middleware/validation');
const { USER_ROLES, NOTICE_PRIORITY, NOTICE_TARGET } = require('../config/constants');
const {
  getNotices,
  createNotice,
  getNoticeById,
  updateNotice,
  deleteNotice,
  markNoticeAsRead,
  getMyNotices,
  getNoticeStats
} = require('../controllers/noticeController');

const router = express.Router();

router.use(sanitizeInputs);
router.use(protect);

// Validation for notice creation/update
const noticeValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('priority')
    .isIn(Object.values(NOTICE_PRIORITY))
    .withMessage('Invalid priority level'),
  body('targetType')
    .isIn(Object.values(NOTICE_TARGET))
    .withMessage('Invalid target type'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid publish date')
];

const idValidation = [
  param('id').isMongoId().withMessage('Please provide a valid notice ID')
];

// Routes
router.get('/stats', requireMinRole(USER_ROLES.VIEWER), getNoticeStats);
router.get('/my', getMyNotices);
router.get('/', requireMinRole(USER_ROLES.VIEWER), getNotices);
router.post('/', requireMinRole(USER_ROLES.EDITOR), noticeValidation, validateRequest, createNotice);
router.get('/:id', requireMinRole(USER_ROLES.VIEWER), idValidation, validateRequest, getNoticeById);
router.put('/:id', requireMinRole(USER_ROLES.EDITOR), idValidation, validateRequest, updateNotice);
router.delete('/:id', requireMinRole(USER_ROLES.ADMIN), idValidation, validateRequest, deleteNotice);
router.post('/:id/read', idValidation, validateRequest, markNoticeAsRead);

module.exports = router;
