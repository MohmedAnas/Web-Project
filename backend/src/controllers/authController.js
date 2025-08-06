const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyToken, 
  hashPassword,
  removeSensitiveFields 
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES } = require('../config/constants');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, userType = 'student' } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Check user type matches role
    if (userType === 'student' && user.role !== USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        error: 'Invalid user type for this account'
      });
    }

    if (userType === 'admin' && user.role === USER_ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        error: 'Invalid user type for this account'
      });
    }

    // For admin users, check approval status
    if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN) {
      const admin = await Admin.findOne({ user: user._id });
      if (admin && admin.approvalStatus === 'pending') {
        return res.status(403).json({
          success: false,
          error: 'Your admin account is pending approval. Please wait for approval from super admin.'
        });
      }
      if (admin && admin.approvalStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          error: 'Your admin account has been rejected. Please contact the administrator.'
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      userType
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    // Get additional user data based on role
    let userData = removeSensitiveFields(user.toObject());
    
    if (user.role === USER_ROLES.STUDENT) {
      const student = await Student.findOne({ user: user._id })
        .populate('enrollmentDetails.courses.course', 'name code');
      
      if (student) {
        userData.studentProfile = removeSensitiveFields(student.toObject());
      }
    }

    logger.info(`User logged in successfully: ${email}`, {
      userId: user._id,
      role: user.role,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRE || '24h'
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Remove specific refresh token
      await user.removeRefreshToken(refreshToken);
    } else {
      // Clear all refresh tokens
      await user.clearRefreshTokens();
    }

    logger.info(`User logged out: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const newAccessToken = generateToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRE || '24h'
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during token refresh'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let userData = removeSensitiveFields(user.toObject());

    // Get additional data for students and admins
    if (user.role === USER_ROLES.STUDENT) {
      const student = await Student.findOne({ user: user._id })
        .populate('enrollmentDetails.courses.course', 'name code fee duration')
        .populate('metadata.createdBy', 'firstName lastName email');
      
      if (student) {
        userData.studentProfile = removeSensitiveFields(student.toObject());
      }
    } else if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN) {
      const admin = await Admin.findOne({ user: user._id })
        .populate('approvedBy', 'firstName lastName email')
        .populate('rejectedBy', 'firstName lastName email');
      
      if (admin) {
        userData.adminProfile = removeSensitiveFields(admin.toObject());
      }
    }

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const allowedFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'preferences'];
    
    // Filter allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { ...updates, 'metadata.updatedBy': user._id },
      { new: true, runValidators: true }
    );

    // Update student profile if user is a student
    if (user.role === USER_ROLES.STUDENT && req.body.studentProfile) {
      const studentUpdates = req.body.studentProfile;
      await Student.findOneAndUpdate(
        { user: user._id },
        { ...studentUpdates, 'metadata.updatedBy': user._id },
        { new: true, runValidators: true }
      );
    }

    logger.info(`Profile updated: ${user.email}`, {
      userId: user._id,
      updates: Object.keys(updates)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: removeSensitiveFields(updatedUser.toObject())
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens to force re-login
    await user.clearRefreshTokens();

    logger.info(`Password changed: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while changing password'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token (in production, implement proper token generation and email sending)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // TODO: Send email with reset link
    logger.info(`Password reset requested: ${email}`, {
      userId: user._id,
      resetToken,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing password reset'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Clear all refresh tokens
    await user.clearRefreshTokens();

    logger.info(`Password reset completed: ${user.email}`, {
      userId: user._id,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resetting password'
    });
  }
};

// @desc    Register student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      course_interested,
      password
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      firstName: first_name,
      lastName: last_name,
      email: email.toLowerCase(),
      phone,
      dateOfBirth: date_of_birth,
      address,
      password,
      role: USER_ROLES.STUDENT,
      status: 'active',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await user.save();

    // Create student profile
    const student = new Student({
      user: user._id,
      studentId: await generateStudentId(),
      personalInfo: {
        firstName: first_name,
        lastName: last_name,
        email: email.toLowerCase(),
        phone,
        dateOfBirth: date_of_birth,
        address
      },
      courseInterested: course_interested,
      status: 'active',
      metadata: {
        createdBy: user._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await student.save();

    logger.info(`Student registered successfully: ${email}`, {
      userId: user._id,
      studentId: student.studentId,
      ip: req.ip
    });

    // Remove sensitive data
    const userData = removeSensitiveFields(user.toObject());
    const studentData = removeSensitiveFields(student.toObject());

    res.status(201).json({
      success: true,
      message: 'Student registration successful! You can now login with your credentials.',
      data: {
        user: userData,
        student: studentData
      }
    });

  } catch (error) {
    logger.error('Student registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during student registration'
    });
  }
};

// @desc    Register admin
// @route   POST /api/auth/admin/register
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      phone,
      employee_id,
      department,
      designation,
      password,
      admin_code
    } = req.body;

    // Verify admin registration code
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'RBCOMPUTER2024';
    if (admin_code !== validAdminCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid admin registration code'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Check if employee ID already exists
    const existingEmployeeId = await Admin.findOne({ employeeId: employee_id.toUpperCase() });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID already exists'
      });
    }

    // Check if this should be auto-approved (first 2 admins)
    const shouldAutoApprove = await Admin.shouldAutoApprove();

    // Create user
    const user = new User({
      firstName: first_name,
      lastName: last_name,
      email: email.toLowerCase(),
      phone,
      password,
      role: USER_ROLES.ADMIN,
      status: shouldAutoApprove ? 'active' : 'inactive', // Inactive until approved
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await user.save();

    // Create admin profile
    const admin = new Admin({
      user: user._id,
      employeeId: employee_id.toUpperCase(),
      username: username.toLowerCase(),
      department,
      designation,
      approvalStatus: shouldAutoApprove ? 'approved' : 'pending',
      approvedBy: shouldAutoApprove ? user._id : null,
      approvedAt: shouldAutoApprove ? new Date() : null,
      metadata: {
        createdBy: user._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        registrationCode: admin_code
      }
    });

    await admin.save();

    // If auto-approved, update user status
    if (shouldAutoApprove) {
      user.status = 'active';
      await user.save();
    }

    logger.info(`Admin registered: ${email}`, {
      userId: user._id,
      employeeId: employee_id,
      autoApproved: shouldAutoApprove,
      ip: req.ip
    });

    // Remove sensitive data
    const userData = removeSensitiveFields(user.toObject());
    const adminData = removeSensitiveFields(admin.toObject());

    const message = shouldAutoApprove 
      ? 'Admin registration successful! You can now login with your credentials.'
      : 'Admin registration submitted successfully! Please wait for approval from super admin before you can login.';

    res.status(201).json({
      success: true,
      message,
      data: {
        user: userData,
        admin: adminData,
        autoApproved: shouldAutoApprove
      }
    });

  } catch (error) {
    logger.error('Admin registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let fieldName = field;
      
      // Make error messages more user-friendly
      if (field === 'employeeId') fieldName = 'Employee ID';
      if (field === 'username') fieldName = 'Username';
      
      return res.status(400).json({
        success: false,
        error: `${fieldName} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during admin registration'
    });
  }
};

module.exports = {
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
};

// Helper function to generate unique student ID
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `STU${currentYear}`;
  
  // Find the last student ID for current year
  const lastStudent = await Student.findOne({
    studentId: { $regex: `^${prefix}` }
  }).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.studentId.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};
