const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../utils/helpers');
const logger = require('../utils/logger');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No user found with this token'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: 'User account is not active'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user has minimum role level
const requireMinRole = (minRole) => {
  const { USER_ROLES, ROLE_HIERARCHY } = require('../config/constants');
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < minRoleLevel) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to access this route'
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
        logger.debug('Optional auth token error:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns resource or has admin privileges
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    const { USER_ROLES } = require('../config/constants');
    
    // Allow if user is admin or super admin
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(req.user.role)) {
      return next();
    }

    // For students, check if they own the resource
    if (req.user.role === USER_ROLES.STUDENT) {
      // Resource ID should match user ID or be accessible to student
      const resourceId = req.params.id || req.params.studentId;
      
      if (resourceId && resourceId.toString() === req.user._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  };
};

// Rate limiting by user role
const roleBasedRateLimit = () => {
  const rateLimit = require('express-rate-limit');
  const { RATE_LIMITS } = require('../config/constants');

  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: (req) => {
      if (req.user && req.user.role) {
        return RATE_LIMITS[req.user.role] || RATE_LIMITS.DEFAULT;
      }
      return RATE_LIMITS.DEFAULT;
    },
    message: {
      error: 'Too many requests from this user, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user ? req.user._id.toString() : req.ip;
    }
  });
};

// Check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  const { USER_ROLES } = require('../config/constants');
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  requireMinRole,
  requireSuperAdmin,
  optionalAuth,
  ownerOrAdmin,
  roleBasedRateLimit
};
