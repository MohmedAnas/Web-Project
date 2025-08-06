const mongoose = require('mongoose');
const { ATTENDANCE_STATUS, BATCH_TYPES } = require('../config/constants');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  batch: {
    type: String,
    enum: Object.values(BATCH_TYPES),
    required: [true, 'Batch is required']
  },
  status: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS),
    required: [true, 'Attendance status is required'],
    default: ATTENDANCE_STATUS.ABSENT
  },
  timeIn: {
    type: Date
  },
  timeOut: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by is required']
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['manual', 'biometric', 'qr_code', 'mobile_app', 'bulk_import'],
    default: 'manual'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Late minutes cannot be negative']
  },
  isEarlyLeave: {
    type: Boolean,
    default: false
  },
  earlyLeaveMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Early leave minutes cannot be negative']
  },
  makeup: {
    isRequired: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    reason: String
  },
  modifications: [{
    previousStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS)
    },
    newStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS)
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true
    }
  }],
  metadata: {
    academicYear: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
    },
    semester: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', 'annual'],
      default: 'annual'
    },
    week: {
      type: Number,
      min: [1, 'Week must be at least 1'],
      max: [53, 'Week cannot exceed 53']
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true
    },
    isHoliday: {
      type: Boolean,
      default: false
    },
    holidayReason: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN');
});

// Virtual for attendance percentage (calculated per student)
attendanceSchema.virtual('attendanceRate').get(function() {
  // This will be calculated at query level
  return this._attendanceRate || 0;
});

// Indexes
attendanceSchema.index({ student: 1, date: 1, course: 1 }, { unique: true });
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ batch: 1, date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ 'metadata.academicYear': 1 });
attendanceSchema.index({ 'metadata.dayOfWeek': 1 });

// Compound indexes for dashboard queries
attendanceSchema.index({ date: 1, course: 1, batch: 1 });
attendanceSchema.index({ student: 1, 'metadata.academicYear': 1 });

// Pre-save middleware to calculate duration and late/early leave
attendanceSchema.pre('save', function(next) {
  // Calculate duration if both timeIn and timeOut are present
  if (this.timeIn && this.timeOut) {
    this.duration = Math.round((this.timeOut - this.timeIn) / (1000 * 60)); // in minutes
  }

  // Set metadata
  const date = new Date(this.date);
  this.metadata.week = this.getWeekNumber(date);
  this.metadata.dayOfWeek = this.getDayOfWeek(date);

  // Set academic year if not provided
  if (!this.metadata.academicYear) {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) { // April to March academic year
      this.metadata.academicYear = `${year}-${year + 1}`;
    } else {
      this.metadata.academicYear = `${year - 1}-${year}`;
    }
  }

  next();
});

// Helper method to get week number
attendanceSchema.methods.getWeekNumber = function(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Helper method to get day of week
attendanceSchema.methods.getDayOfWeek = function(date) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Instance method to modify attendance
attendanceSchema.methods.modifyAttendance = function(newStatus, modifiedBy, reason) {
  this.modifications.push({
    previousStatus: this.status,
    newStatus,
    modifiedBy,
    reason
  });
  
  this.status = newStatus;
  return this.save();
};

// Static method to mark bulk attendance
attendanceSchema.statics.markBulkAttendance = async function(attendanceData) {
  const results = {
    successful: [],
    failed: [],
    total: attendanceData.length
  };

  for (const data of attendanceData) {
    try {
      // Check if attendance already exists
      const existing = await this.findOne({
        student: data.student,
        course: data.course,
        date: data.date
      });

      if (existing) {
        // Update existing attendance
        existing.status = data.status;
        existing.markedBy = data.markedBy;
        existing.markedAt = new Date();
        existing.notes = data.notes || existing.notes;
        await existing.save();
        
        results.successful.push({
          student: data.student,
          status: 'updated'
        });
      } else {
        // Create new attendance
        const attendance = await this.create(data);
        results.successful.push({
          student: data.student,
          status: 'created',
          id: attendance._id
        });
      }
    } catch (error) {
      results.failed.push({
        student: data.student,
        error: error.message
      });
    }
  }

  return results;
};

// Static method to get attendance dashboard
attendanceSchema.statics.getAttendanceDashboard = async function(courseId, date, batch) {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  
  // Skip Sundays (0 = Sunday)
  if (dayOfWeek === 0) {
    throw new Error('Attendance dashboard is not available on Sundays');
  }

  // Get all students enrolled in the course
  const Student = mongoose.model('Student');
  let studentQuery = {
    'enrollmentDetails.courses.course': courseId,
    'enrollmentDetails.courses.status': { $in: ['enrolled', 'in_progress'] },
    status: 'active'
  };

  if (batch) {
    studentQuery['enrollmentDetails.currentBatch'] = batch;
  }

  const students = await Student.find(studentQuery)
    .select('firstName lastName email phone admissionUID enrollmentDetails.currentBatch')
    .sort({ firstName: 1, lastName: 1 });

  // Get attendance records for the date
  const attendanceRecords = await this.find({
    course: courseId,
    date: {
      $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
      $lt: new Date(targetDate.setHours(23, 59, 59, 999))
    },
    ...(batch && { batch })
  }).populate('markedBy', 'firstName lastName');

  // Create attendance map
  const attendanceMap = {};
  attendanceRecords.forEach(record => {
    attendanceMap[record.student.toString()] = record;
  });

  // Build dashboard data
  const dashboardData = students.map(student => {
    const attendance = attendanceMap[student._id.toString()];
    
    return {
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        phone: student.phone,
        uid: student.admissionUID,
        batch: student.enrollmentDetails.currentBatch
      },
      attendance: attendance ? {
        status: attendance.status,
        timeIn: attendance.timeIn,
        timeOut: attendance.timeOut,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes,
        notes: attendance.notes,
        markedBy: attendance.markedBy,
        markedAt: attendance.markedAt
      } : {
        status: 'not_marked',
        timeIn: null,
        timeOut: null,
        isLate: false,
        lateMinutes: 0,
        notes: null,
        markedBy: null,
        markedAt: null
      }
    };
  });

  return {
    date: targetDate,
    course: courseId,
    batch,
    totalStudents: students.length,
    markedCount: attendanceRecords.length,
    unmarkedCount: students.length - attendanceRecords.length,
    students: dashboardData
  };
};

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(filters = {}) {
  const matchQuery = {};
  
  if (filters.course) matchQuery.course = mongoose.Types.ObjectId(filters.course);
  if (filters.student) matchQuery.student = mongoose.Types.ObjectId(filters.student);
  if (filters.batch) matchQuery.batch = filters.batch;
  if (filters.startDate && filters.endDate) {
    matchQuery.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  if (filters.academicYear) matchQuery['metadata.academicYear'] = filters.academicYear;

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        },
        excusedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] }
        },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);

  const statusStats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const dailyStats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
        },
        totalStudents: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendanceRate: {
          $multiply: [
            { $divide: ['$presentCount', '$totalStudents'] },
            100
          ]
        }
      }
    },
    { $sort: { '_id.date': -1 } },
    { $limit: 30 }
  ]);

  return {
    overall: stats[0] || {
      totalRecords: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      averageDuration: 0
    },
    byStatus: statusStats,
    daily: dailyStats,
    attendanceRate: stats[0] ? Math.round((stats[0].presentCount / stats[0].totalRecords) * 100) : 0
  };
};

// Static method to find students with low attendance
attendanceSchema.statics.findLowAttendanceStudents = async function(courseId, threshold = 75, academicYear) {
  const matchQuery = {
    course: mongoose.Types.ObjectId(courseId)
  };
  
  if (academicYear) {
    matchQuery['metadata.academicYear'] = academicYear;
  }

  const lowAttendanceStudents = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$student',
        totalClasses: { $sum: 1 },
        presentClasses: {
          $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $multiply: [
            { $divide: ['$presentClasses', '$totalClasses'] },
            100
          ]
        }
      }
    },
    {
      $match: {
        attendancePercentage: { $lt: threshold }
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $project: {
        studentId: '$_id',
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        admissionUID: '$student.admissionUID',
        email: '$student.email',
        phone: '$student.phone',
        totalClasses: 1,
        presentClasses: 1,
        attendancePercentage: { $round: ['$attendancePercentage', 2] }
      }
    },
    { $sort: { attendancePercentage: 1 } }
  ]);

  return lowAttendanceStudents;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
