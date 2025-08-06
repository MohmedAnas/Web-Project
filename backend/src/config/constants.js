// User Roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  STUDENT: 'student'
};

// Role Hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.EDITOR]: 3,
  [USER_ROLES.VIEWER]: 2,
  [USER_ROLES.STUDENT]: 1
};

// Batch Types
const BATCH_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

// Course Status
const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
};

// Student Status
const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  DROPPED: 'dropped'
};

// Fee Status
const FEE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial'
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  CHEQUE: 'cheque'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

// Certificate Status
const CERTIFICATE_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  REVOKED: 'revoked'
};

// Notice Priority
const NOTICE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notice Target
const NOTICE_TARGET = {
  ALL: 'all',
  STUDENTS: 'students',
  COURSE: 'course',
  BATCH: 'batch',
  INDIVIDUAL: 'individual'
};

// Grade Classifications
const GRADE_CLASSIFICATIONS = {
  EXCELLENT: { min: 90, max: 100, grade: 'A+' },
  VERY_GOOD: { min: 80, max: 89, grade: 'A' },
  GOOD: { min: 70, max: 79, grade: 'B+' },
  SATISFACTORY: { min: 60, max: 69, grade: 'B' },
  NEEDS_IMPROVEMENT: { min: 50, max: 59, grade: 'C' },
  POOR: { min: 0, max: 49, grade: 'F' }
};

// Rate Limits by Role
const RATE_LIMITS = {
  [USER_ROLES.SUPER_ADMIN]: 5000,
  [USER_ROLES.ADMIN]: 2000,
  [USER_ROLES.EDITOR]: 1000,
  [USER_ROLES.VIEWER]: 500,
  [USER_ROLES.STUDENT]: 200,
  DEFAULT: 100
};

// File Upload Limits
const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt']
};

// Email Templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  FEE_REMINDER: 'fee_reminder',
  ATTENDANCE_ALERT: 'attendance_alert',
  CERTIFICATE_ISSUED: 'certificate_issued',
  PASSWORD_RESET: 'password_reset',
  WEEKLY_REPORT: 'weekly_report'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Date Formats
const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm:ss',
  TIME: 'HH:mm'
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  UID_LENGTH: 8
};

module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY,
  BATCH_TYPES,
  COURSE_STATUS,
  STUDENT_STATUS,
  FEE_STATUS,
  PAYMENT_METHODS,
  ATTENDANCE_STATUS,
  CERTIFICATE_STATUS,
  NOTICE_PRIORITY,
  NOTICE_TARGET,
  GRADE_CLASSIFICATIONS,
  RATE_LIMITS,
  FILE_LIMITS,
  EMAIL_TEMPLATES,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION_RULES
};
