const mongoose = require('mongoose');
const { USER_ROLES } = require('../config/constants');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Employee ID must be at least 3 characters'],
    maxlength: [20, 'Employee ID cannot exceed 20 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Administration',
      'Academic Affairs',
      'Student Services',
      'IT Department',
      'Finance',
      'Human Resources',
      'Marketing',
      'Operations'
    ]
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: [
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
    ]
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  permissions: {
    students: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    courses: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    fees: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    attendance: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    notices: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    certificates: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    reports: {
      read: { type: Boolean, default: true },
      export: { type: Boolean, default: false }
    },
    settings: {
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false }
    }
  },
  workSchedule: {
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    workingHours: {
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      },
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      }
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number']
    }
  },
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    },
    grade: {
      type: String,
      trim: true
    }
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Experience description cannot exceed 500 characters']
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String,
    registrationCode: {
      type: String,
      select: false // Don't include in queries by default
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full admin info
adminSchema.virtual('fullInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Virtual for approval status display
adminSchema.virtual('approvalStatusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  return statusMap[this.approvalStatus] || this.approvalStatus;
});

// Virtual for years of experience
adminSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

// Indexes
adminSchema.index({ user: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ approvalStatus: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ designation: 1 });
adminSchema.index({ createdAt: -1 });

// Pre-save middleware to set default permissions based on designation
adminSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('designation')) {
    // Set permissions based on designation
    switch (this.designation) {
      case 'Director':
      case 'Assistant Director':
        // Full permissions for directors
        Object.keys(this.permissions).forEach(module => {
          Object.keys(this.permissions[module]).forEach(action => {
            this.permissions[module][action] = true;
          });
        });
        break;
        
      case 'Academic Coordinator':
      case 'Course Instructor':
        // Academic staff permissions
        this.permissions.settings.read = false;
        this.permissions.settings.update = false;
        this.permissions.reports.export = true;
        break;
        
      case 'Finance Manager':
        // Finance specific permissions
        this.permissions.fees.delete = true;
        this.permissions.reports.export = true;
        break;
        
      case 'IT Administrator':
        // IT specific permissions
        this.permissions.settings.read = true;
        this.permissions.settings.update = true;
        break;
        
      default:
        // Default permissions (already set in schema)
        break;
    }
  }
  next();
});

// Static method to get pending approvals count
adminSchema.statics.getPendingApprovalsCount = function() {
  return this.countDocuments({ approvalStatus: 'pending' });
};

// Static method to get admin statistics
adminSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$approvalStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const departmentStats = await this.aggregate([
    { $match: { approvalStatus: 'approved' } },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await this.countDocuments();
  const approved = await this.countDocuments({ approvalStatus: 'approved' });
  const pending = await this.countDocuments({ approvalStatus: 'pending' });
  const rejected = await this.countDocuments({ approvalStatus: 'rejected' });

  return {
    total,
    approved,
    pending,
    rejected,
    byStatus: stats,
    byDepartment: departmentStats
  };
};

// Static method to check if first two admins (auto-approve)
adminSchema.statics.shouldAutoApprove = async function() {
  const approvedCount = await this.countDocuments({ approvalStatus: 'approved' });
  return approvedCount < 2;
};

// Instance method to approve admin
adminSchema.methods.approve = function(approvedBy) {
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectedBy = null;
  this.rejectedAt = null;
  this.rejectionReason = null;
  return this.save();
};

// Instance method to reject admin
adminSchema.methods.reject = function(rejectedBy, reason) {
  this.approvalStatus = 'rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.approvedBy = null;
  this.approvedAt = null;
  return this.save();
};

// Instance method to check if admin has permission
adminSchema.methods.hasPermission = function(module, action) {
  return this.permissions[module] && this.permissions[module][action];
};

// Instance method to update last active time
adminSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// Pre-remove middleware to handle user cleanup
adminSchema.pre('remove', async function(next) {
  try {
    // Update the associated user status
    await mongoose.model('User').findByIdAndUpdate(
      this.user,
      { status: 'inactive' }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Admin', adminSchema);
