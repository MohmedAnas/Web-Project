const express = require('express');
const {
  getPendingApprovals,
  approveAdmin,
  rejectAdmin,
  getAllAdmins,
  getAdminStats,
  getAdminById,
  updateAdminPermissions,
  deactivateAdmin
} = require('../controllers/adminController');

const { protect, requireSuperAdmin } = require('../middleware/auth');
const { 
  validateAdminApproval,
  validateAdminRejection,
  validatePermissionUpdate,
  sanitizeInputs 
} = require('../middleware/validation');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// All routes require authentication and super admin role
router.use(protect);
router.use(requireSuperAdmin);

// Admin management routes
router.get('/pending-approvals', getPendingApprovals);
router.get('/list', getAllAdmins);
router.get('/stats', getAdminStats);
router.get('/:id', getAdminById);

// Admin approval routes
router.post('/approve/:id', validateAdminApproval, approveAdmin);
router.post('/reject/:id', validateAdminRejection, rejectAdmin);

// Admin management routes
router.put('/:id/permissions', validatePermissionUpdate, updateAdminPermissions);
router.put('/:id/deactivate', deactivateAdmin);

module.exports = router;
