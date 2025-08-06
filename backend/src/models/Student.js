const mongoose = require('mongoose');
const { generateAdmissionUID } = require('../utils/helpers');
const { STUDENT_STATUS, BATCH_TYPES } = require('../config/constants');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionUID: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  parentDetails: {
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true
    },
    motherName: {
      type: String,
      trim: true
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid parent mobile number']
    },
    parentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid parent email']
    },
    occupation: {
      type: String,
      trim: true
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative']
    }
  },
  academicDetails: {
    qualification: {
      type: String,
      required: [true, 'Educational qualification is required'],
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    yearOfPassing: {
      type: Number,
      min: [1950, 'Year of passing must be after 1950'],
      max: [new Date().getFullYear(), 'Year of passing cannot be in the future']
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    }
  },
  enrollmentDetails: {
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
      default: Date.now
    },
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
      enrollmentDate: {
        type: Date,
        default: Date.now
      },
      batch: {
        type: String,
        enum: Object.values(BATCH_TYPES),
        required: true
      },
      startDate: {
        type: Date,
        required: true
      },
      expectedEndDate: {
        type: Date,
        required: true
      },
      actualEndDate: {
        type: Date
      },
      status: {
        type: String,
        enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
        default: 'enrolled'
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }],
    currentBatch: {
      type: String,
      enum: Object.values(BATCH_TYPES)
    }
  },
  status: {
    type: String,
    enum: Object.values(STUDENT_STATUS),
    default: STUDENT_STATUS.ACTIVE
  },
  profileImage: {
    type: String,
    default: null
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['photo', 'id_proof', 'address_proof', 'educational_certificate', 'other']
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attendance: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  fees: {
    totalFees: {
      type: Number,
      default: 0
    },
    paidFees: {
      type: Number,
      default: 0
    },
    pendingFees: {
      type: Number,
      default: 0
    },
    lastPaymentDate: {
      type: Date
    }
  },
  performance: {
    overallGrade: {
      type: String,
      default: 'N/A'
    },
    assignments: {
      completed: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    tests: {
      passed: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      },
      averageScore: {
        type: Number,
        default: 0
      }
    }
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'academic', 'behavioral', 'fee', 'attendance'],
      default: 'general'
    }
  }],
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    source: {
      type: String,
      enum: ['online', 'offline', 'referral', 'walk_in'],
      default: 'offline'
    },
    referredBy: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  const { street, city, state, pincode } = this.address;
  return `${street}, ${city}, ${state} - ${pincode}`;
});

// Virtual for current course
studentSchema.virtual('currentCourse').get(function() {
  const activeCourse = this.enrollmentDetails.courses.find(
    course => course.status === 'in_progress' || course.status === 'enrolled'
  );
  return activeCourse || null;
});

// Indexes
studentSchema.index({ admissionUID: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ 'enrollmentDetails.admissionDate': -1 });
studentSchema.index({ 'enrollmentDetails.courses.course': 1 });
studentSchema.index({ 'enrollmentDetails.currentBatch': 1 });
studentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate admission UID
studentSchema.pre('save', async function(next) {
  if (this.isNew && !this.admissionUID) {
    let uid;
    let isUnique = false;
    
    while (!isUnique) {
      uid = generateAdmissionUID();
      const existingStudent = await this.constructor.findOne({ admissionUID: uid });
      if (!existingStudent) {
        isUnique = true;
      }
    }
    
    this.admissionUID = uid;
  }
  next();
});

// Pre-save middleware to update attendance percentage
studentSchema.pre('save', function(next) {
  if (this.attendance.totalClasses > 0) {
    this.attendance.attendancePercentage = Math.round(
      (this.attendance.attendedClasses / this.attendance.totalClasses) * 100
    );
  }
  next();
});

// Pre-save middleware to calculate pending fees
studentSchema.pre('save', function(next) {
  this.fees.pendingFees = this.fees.totalFees - this.fees.paidFees;
  next();
});

// Instance method to enroll in course
studentSchema.methods.enrollInCourse = function(courseId, batch, startDate, expectedEndDate) {
  const enrollment = {
    course: courseId,
    batch,
    startDate,
    expectedEndDate,
    status: 'enrolled'
  };
  
  this.enrollmentDetails.courses.push(enrollment);
  this.enrollmentDetails.currentBatch = batch;
  
  return this.save();
};

// Instance method to update course status
studentSchema.methods.updateCourseStatus = function(courseId, status, actualEndDate = null) {
  const courseEnrollment = this.enrollmentDetails.courses.find(
    course => course.course.toString() === courseId.toString()
  );
  
  if (courseEnrollment) {
    courseEnrollment.status = status;
    if (actualEndDate) {
      courseEnrollment.actualEndDate = actualEndDate;
    }
  }
  
  return this.save();
};

// Instance method to add note
studentSchema.methods.addNote = function(content, addedBy, type = 'general') {
  this.notes.push({
    content,
    addedBy,
    type
  });
  
  return this.save();
};

// Instance method to update attendance
studentSchema.methods.updateAttendance = function(totalClasses, attendedClasses) {
  this.attendance.totalClasses = totalClasses;
  this.attendance.attendedClasses = attendedClasses;
  this.attendance.lastUpdated = new Date();
  
  return this.save();
};

// Static method to find by admission UID
studentSchema.statics.findByAdmissionUID = function(uid) {
  return this.findOne({ admissionUID: uid });
};

// Static method to find by course
studentSchema.statics.findByCourse = function(courseId) {
  return this.find({ 'enrollmentDetails.courses.course': courseId });
};

// Static method to find by batch
studentSchema.statics.findByBatch = function(batch) {
  return this.find({ 'enrollmentDetails.currentBatch': batch });
};

// Static method to get statistics
studentSchema.statics.getStats = async function() {
  const totalStudents = await this.countDocuments();
  const activeStudents = await this.countDocuments({ status: 'active' });
  
  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const batchStats = await this.aggregate([
    {
      $group: {
        _id: '$enrollmentDetails.currentBatch',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const monthlyAdmissions = await this.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$enrollmentDetails.admissionDate' },
          month: { $month: '$enrollmentDetails.admissionDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  return {
    total: totalStudents,
    active: activeStudents,
    byStatus: statusStats,
    byBatch: batchStats,
    monthlyAdmissions
  };
};

module.exports = mongoose.model('Student', studentSchema);
