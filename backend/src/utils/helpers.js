const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { VALIDATION_RULES, PAGINATION } = require('../config/constants');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' 
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

/**
 * Generate unique ID
 */
const generateUID = (prefix = '') => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return prefix ? `${prefix}${uuid}` : uuid;
};

/**
 * Generate admission UID
 */
const generateAdmissionUID = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RB${year}${month}${random}`;
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  return password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

/**
 * Format date for display
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  return moment().diff(moment(dateOfBirth), 'years');
};

/**
 * Get pagination parameters
 */
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || PAGINATION.DEFAULT_PAGE;
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;
  
  return { page: pageNum, limit: limitNum, skip };
};

/**
 * Format pagination response
 */
const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Generate random password
 */
const generateRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get grade from percentage
 */
const getGradeFromPercentage = (percentage) => {
  const { GRADE_CLASSIFICATIONS } = require('../config/constants');
  
  for (const [key, grade] of Object.entries(GRADE_CLASSIFICATIONS)) {
    if (percentage >= grade.min && percentage <= grade.max) {
      return grade.grade;
    }
  }
  
  return 'F';
};

/**
 * Format currency (Indian Rupees)
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Sleep function for delays
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove sensitive fields from object
 */
const removeSensitiveFields = (obj, fields = ['password', 'refreshToken']) => {
  const cloned = deepClone(obj);
  
  fields.forEach(field => {
    if (cloned[field]) {
      delete cloned[field];
    }
  });
  
  return cloned;
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate slug from string
 */
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateUID,
  generateAdmissionUID,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  formatDate,
  calculateAge,
  getPagination,
  formatPaginationResponse,
  generateRandomPassword,
  calculatePercentage,
  getGradeFromPercentage,
  formatCurrency,
  generateOTP,
  sleep,
  deepClone,
  removeSensitiveFields,
  capitalize,
  generateSlug
};
