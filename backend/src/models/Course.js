const mongoose = require('mongoose');
const { COURSE_STATUS, BATCH_TYPES } = require('../config/constants');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [2, 'Course name must be at least 2 characters'],
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Course code must be 3-10 characters, letters and numbers only']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
    enum: ['programming', 'web_development', 'mobile_development', 'data_science', 'cybersecurity', 'networking', 'database', 'other']
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number,
    required: [true, 'Course duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  durationType: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    default: 'days'
  },
  fee: {
    amount: {
      type: Number,
      required: [true, 'Course fee is required'],
      min: [0, 'Fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    installments: {
      allowed: {
        type: Boolean,
        default: false
      },
      count: {
        type: Number,
        min: [2, 'Minimum 2 installments required'],
        max: [12, 'Maximum 12 installments allowed']
      },
      schedule: [{
        installmentNumber: Number,
        amount: Number,
        dueDate: Date,
        description: String
      }]
    },
    discounts: [{
      type: {
        type: String,
        enum: ['early_bird', 'bulk', 'referral', 'scholarship', 'other']
      },
      name: String,
      percentage: {
        type: Number,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100']
      },
      amount: {
        type: Number,
        min: [0, 'Discount amount cannot be negative']
      },
      validFrom: Date,
      validUntil: Date,
      conditions: String
    }]
  },
  modules: [{
    name: {
      type: String,
      required: [true, 'Module name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Module duration is required'],
      min: [1, 'Module duration must be at least 1 day']
    },
    order: {
      type: Number,
      required: [true, 'Module order is required']
    },
    topics: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      duration: Number, // in hours
      resources: [{
        type: {
          type: String,
          enum: ['video', 'document', 'link', 'assignment', 'quiz']
        },
        title: String,
        url: String,
        description: String
      }]
    }],
    assignments: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      dueDate: Date,
      maxMarks: {
        type: Number,
        default: 100
      },
      passingMarks: {
        type: Number,
        default: 40
      }
    }],
    assessments: [{
      type: {
        type: String,
        enum: ['quiz', 'test', 'project', 'practical'],
        required: true
      },
      title: String,
      description: String,
      maxMarks: {
        type: Number,
        default: 100
      },
      passingMarks: {
        type: Number,
        default: 40
      },
      duration: Number // in minutes
    }]
  }],
  schedule: {
    batches: [{
      type: {
        type: String,
        enum: Object.values(BATCH_TYPES),
        required: true
      },
      startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
      },
      endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
      },
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      maxStudents: {
        type: Number,
        min: [1, 'Maximum students must be at least 1'],
        max: [100, 'Maximum students cannot exceed 100'],
        default: 30
      },
      currentStudents: {
        type: Number,
        default: 0
      }
    }]
  },
  prerequisites: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    name: String,
    description: String,
    required: {
      type: Boolean,
      default: true
    }
  }],
  outcomes: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['knowledge', 'skill', 'competency'],
      default: 'skill'
    }
  }],
  instructor: {
    primary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assistants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  resources: {
    textbooks: [{
      title: String,
      author: String,
      isbn: String,
      required: {
        type: Boolean,
        default: false
      }
    }],
    software: [{
      name: String,
      version: String,
      license: String,
      downloadUrl: String,
      required: {
        type: Boolean,
        default: false
      }
    }],
    materials: [{
      name: String,
      description: String,
      type: {
        type: String,
        enum: ['hardware', 'software', 'book', 'other']
      },
      required: {
        type: Boolean,
        default: false
      }
    }]
  },
  status: {
    type: String,
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.ACTIVE
  },
  enrollment: {
    isOpen: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    maxStudents: {
      type: Number,
      min: [1, 'Maximum students must be at least 1'],
      default: 100
    },
    currentStudents: {
      type: Number,
      default: 0
    },
    waitingList: {
      type: Number,
      default: 0
    }
  },
  certification: {
    provided: {
      type: Boolean,
      default: true
    },
    name: String,
    template: String,
    criteria: {
      attendancePercentage: {
        type: Number,
        min: [0, 'Attendance percentage cannot be negative'],
        max: [100, 'Attendance percentage cannot exceed 100'],
        default: 75
      },
      assignmentCompletion: {
        type: Number,
        min: [0, 'Assignment completion cannot be negative'],
        max: [100, 'Assignment completion cannot exceed 100'],
        default: 80
      },
      assessmentScore: {
        type: Number,
        min: [0, 'Assessment score cannot be negative'],
        max: [100, 'Assessment score cannot exceed 100'],
        default: 60
      }
    }
  },
  statistics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completedStudents: {
      type: Number,
      default: 0
    },
    dropoutRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
    version: {
      type: Number,
      default: 1
    },
    lastReviewed: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total duration in hours
courseSchema.virtual('totalDurationHours').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.topics.reduce((moduleTotal, topic) => {
      return moduleTotal + (topic.duration || 0);
    }, 0);
  }, 0);
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.statistics.totalEnrollments === 0) return 0;
  return Math.round((this.statistics.completedStudents / this.statistics.totalEnrollments) * 100);
});

// Virtual for enrollment status
courseSchema.virtual('enrollmentStatus').get(function() {
  if (!this.enrollment.isOpen) return 'closed';
  if (this.enrollment.currentStudents >= this.enrollment.maxStudents) return 'full';
  return 'open';
});

// Virtual for available slots
courseSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.enrollment.maxStudents - this.enrollment.currentStudents);
});

// Indexes
courseSchema.index({ code: 1 });
courseSchema.index({ name: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'enrollment.isOpen': 1 });
courseSchema.index({ 'fee.amount': 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ createdAt: -1 });

// Pre-save middleware to update course code
courseSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    // Generate course code from name
    const nameWords = this.name.split(' ');
    let code = '';
    
    if (nameWords.length === 1) {
      code = nameWords[0].substring(0, 6).toUpperCase();
    } else {
      code = nameWords.map(word => word.charAt(0)).join('').toUpperCase();
      if (code.length < 3) {
        code += nameWords[0].substring(1, 4 - code.length).toUpperCase();
      }
    }
    
    // Add random number to ensure uniqueness
    code += Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.code = code;
  }
  next();
});

// Pre-save middleware to sort modules by order
courseSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.modules.sort((a, b) => a.order - b.order);
  }
  next();
});

// Instance method to add module
courseSchema.methods.addModule = function(moduleData) {
  const order = this.modules.length + 1;
  this.modules.push({ ...moduleData, order });
  return this.save();
};

// Instance method to update enrollment count
courseSchema.methods.updateEnrollmentCount = function(increment = true) {
  if (increment) {
    this.enrollment.currentStudents += 1;
    this.statistics.totalEnrollments += 1;
  } else {
    this.enrollment.currentStudents = Math.max(0, this.enrollment.currentStudents - 1);
  }
  return this.save();
};

// Instance method to add review
courseSchema.methods.addReview = function(studentId, rating, comment) {
  // Remove existing review from same student
  this.reviews = this.reviews.filter(review => 
    review.student.toString() !== studentId.toString()
  );
  
  // Add new review
  this.reviews.push({
    student: studentId,
    rating,
    comment
  });
  
  // Update statistics
  this.statistics.totalRatings = this.reviews.length;
  this.statistics.averageRating = this.reviews.reduce((sum, review) => 
    sum + review.rating, 0) / this.reviews.length;
  
  return this.save();
};

// Instance method to calculate fee with discounts
courseSchema.methods.calculateFee = function(discountCodes = []) {
  let finalAmount = this.fee.amount;
  let appliedDiscounts = [];
  
  for (const discount of this.fee.discounts) {
    const now = new Date();
    
    // Check if discount is valid
    if (discount.validFrom && discount.validFrom > now) continue;
    if (discount.validUntil && discount.validUntil < now) continue;
    
    // Apply discount
    let discountAmount = 0;
    if (discount.percentage) {
      discountAmount = (finalAmount * discount.percentage) / 100;
    } else if (discount.amount) {
      discountAmount = discount.amount;
    }
    
    finalAmount = Math.max(0, finalAmount - discountAmount);
    appliedDiscounts.push({
      name: discount.name,
      type: discount.type,
      amount: discountAmount
    });
  }
  
  return {
    originalAmount: this.fee.amount,
    finalAmount,
    discountAmount: this.fee.amount - finalAmount,
    appliedDiscounts
  };
};

// Static method to find by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static method to find by level
courseSchema.statics.findByLevel = function(level) {
  return this.find({ level, status: 'active' });
};

// Static method to find available courses
courseSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    'enrollment.isOpen': true,
    $expr: { $lt: ['$enrollment.currentStudents', '$enrollment.maxStudents'] }
  });
};

// Static method to search courses
courseSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'active'
  });
};

// Static method to get statistics
courseSchema.statics.getStats = async function() {
  const totalCourses = await this.countDocuments();
  const activeCourses = await this.countDocuments({ status: 'active' });
  
  const categoryStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalEnrollments: { $sum: '$statistics.totalEnrollments' },
        averageFee: { $avg: '$fee.amount' }
      }
    }
  ]);
  
  const levelStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        totalEnrollments: { $sum: '$statistics.totalEnrollments' }
      }
    }
  ]);
  
  const enrollmentStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: '$statistics.totalEnrollments' },
        totalCompletions: { $sum: '$statistics.completedStudents' },
        averageRating: { $avg: '$statistics.averageRating' }
      }
    }
  ]);
  
  return {
    total: totalCourses,
    active: activeCourses,
    byCategory: categoryStats,
    byLevel: levelStats,
    enrollment: enrollmentStats[0] || {
      totalEnrollments: 0,
      totalCompletions: 0,
      averageRating: 0
    }
  };
};

module.exports = mongoose.model('Course', courseSchema);
