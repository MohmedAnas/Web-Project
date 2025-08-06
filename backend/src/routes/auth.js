const express = require('express');
const {
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  registerStudent,
  registerAdmin
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { 
  validateLogin,
  validateChangePassword,
  validateStudentRegistration,
  validateAdminRegistration,
  sanitizeInputs 
} = require('../middleware/validation');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// Public routes
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Registration routes
router.post('/student/register', validateStudentRegistration, registerStudent);
router.post('/admin/register', validateAdminRegistration, registerAdmin);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', validateChangePassword, changePassword);

module.exports = router;
