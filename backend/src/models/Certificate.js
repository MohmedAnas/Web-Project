const mongoose = require('mongoose');
const { CERTIFICATE_STATUS } = require('../config/constants');

const certificateSchema = new mongoose.Schema({
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
  certificateNumber: {
    type: String,
    unique: true,
    required: [true, 'Certificate number is required']
  },
  certificateType: {
    type: String,
    enum: ['completion', 'participation', 'achievement', 'merit', 'excellence', 'custom'],
    required: [true, 'Certificate type is required'],
    default: 'completion'
  },
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.validFrom;
      },
      message: 'Valid until date must be after valid from date'
    }
  },
  status: {
    type: String,
    enum: Object.values(CERTIFICATE_STATUS),
    default: CERTIFICATE_STATUS.PENDING
  },
  grade: {
    letter: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'P', 'N/A'],
      default: 'N/A'
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [10, 'GPA cannot exceed 10']
    }
  },
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    score: Number,
    maxScore: Number,
    category: {
      type: String,
      enum: ['academic', 'practical', 'project', 'assignment', 'attendance', 'behavior']
    }
  }],
  courseDetails: {
    duration: {
      type: Number, // in days
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalHours: {
      type: Number,
      min: [0, 'Total hours cannot be negative']
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100']
    },
    modules: [{
      name: String,
      completed: {
        type: Boolean,
        default: false
      },
      score: Number,
      maxScore: Number
    }]
  },
  template: {
    templateId: {
      type: String,
      required: true,
      default: 'default'
    },
    templateName: {
      type: String,
      required: true,
      default: 'Default Certificate Template'
    },
    layout: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'landscape'
    },
    design: {
      type: String,
      enum: ['classic', 'modern', 'elegant', 'simple', 'custom'],
      default: 'classic'
    },
    colors: {
      primary: {
        type: String,
        default: '#1f4e79'
      },
      secondary: {
        type: String,
        default: '#d4af37'
      },
      text: {
        type: String,
        default: '#333333'
      }
    },
    logo: {
      url: String,
      position: {
        type: String,
        enum: ['top-left', 'top-center', 'top-right', 'center'],
        default: 'top-center'
      }
    },
    signature: [{
      name: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      imageUrl: String,
      position: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'right'
      }
    }]
  },
  verification: {
    verificationCode: {
      type: String,
      unique: true,
      required: true
    },
    qrCode: {
      data: String,
      imageUrl: String
    },
    verificationUrl: String,
    isVerifiable: {
      type: Boolean,
      default: true
    },
    verifiedCount: {
      type: Number,
      default: 0
    },
    lastVerified: Date
  },
  file: {
    filename: String,
    originalName: String,
    path: String,
    url: String,
    size: Number,
    mimeType: {
      type: String,
      default: 'application/pdf'
    },
    generatedAt: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date
  },
  delivery: {
    method: {
      type: String,
      enum: ['email', 'download', 'print', 'postal'],
      default: 'email'
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      sentTo: String,
      deliveryStatus: {
        type: String,
        enum: ['sent', 'delivered', 'failed', 'bounced'],
        default: 'sent'
      }
    },
    print: {
      requested: {
        type: Boolean,
        default: false
      },
      requestedAt: Date,
      printed: {
        type: Boolean,
        default: false
      },
      printedAt: Date,
      copies: {
        type: Number,
        default: 1,
        min: [1, 'Copies must be at least 1']
      }
    },
    postal: {
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
          type: String,
          default: 'India'
        }
      },
      trackingNumber: String,
      dispatched: {
        type: Boolean,
        default: false
      },
      dispatchedAt: Date,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date
    }
  },
  revocation: {
    isRevoked: {
      type: Boolean,
      default: false
    },
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Revocation reason cannot exceed 500 characters']
    },
    revokedCertificateNumber: String
  },
  audit: {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedAt: Date,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedAt: Date,
    version: {
      type: Number,
      default: 1
    }
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
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
      enum: ['general', 'approval', 'issue', 'delivery', 'verification'],
      default: 'general'
    }
  }],
  metadata: {
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    category: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    source: {
      type: String,
      enum: ['manual', 'auto_generated', 'bulk_import', 'api'],
      default: 'manual'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for certificate validity status
certificateSchema.virtual('isValid').get(function() {
  if (this.revocation.isRevoked) return false;
  if (this.status !== CERTIFICATE_STATUS.ISSUED) return false;
  
  const now = new Date();
  if (now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  
  return true;
});

// Virtual for days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validUntil) return null;
  
  const now = new Date();
  const diffTime = this.validUntil - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for certificate age
certificateSchema.virtual('certificateAge').get(function() {
  const now = new Date();
  const diffTime = now - this.issueDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
});

// Indexes
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issueDate: -1 });
certificateSchema.index({ 'verification.verificationCode': 1 });
certificateSchema.index({ certificateType: 1 });
certificateSchema.index({ 'revocation.isRevoked': 1 });

// Compound indexes
certificateSchema.index({ student: 1, status: 1 });
certificateSchema.index({ course: 1, issueDate: -1 });
certificateSchema.index({ status: 1, issueDate: -1 });

// Pre-save middleware to generate certificate number and verification code
certificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate certificate number if not provided
    if (!this.certificateNumber) {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = await this.constructor.countDocuments({
        issueDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      
      this.certificateNumber = `RBC${year}${month}${String(count + 1).padStart(4, '0')}`;
    }
    
    // Generate verification code if not provided
    if (!this.verification.verificationCode) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.verification.verificationCode = `${timestamp}${random}`;
    }
    
    // Generate verification URL
    this.verification.verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${this.verification.verificationCode}`;
  }
  
  next();
});

// Instance method to generate certificate file
certificateSchema.methods.generateCertificate = async function() {
  // This would integrate with PDF generation service
  // For now, we'll just update the file metadata
  
  const filename = `certificate_${this.certificateNumber}.pdf`;
  const path = `certificates/${filename}`;
  
  this.file = {
    filename,
    originalName: `${this.title}.pdf`,
    path,
    url: `${process.env.BASE_URL || 'http://localhost:8000'}/uploads/${path}`,
    generatedAt: new Date(),
    mimeType: 'application/pdf'
  };
  
  return this.save();
};

// Instance method to issue certificate
certificateSchema.methods.issueCertificate = function(issuedBy) {
  this.status = CERTIFICATE_STATUS.ISSUED;
  this.audit.issuedBy = issuedBy;
  this.audit.issuedAt = new Date();
  
  return this.save();
};

// Instance method to revoke certificate
certificateSchema.methods.revokeCertificate = function(revokedBy, reason) {
  this.revocation.isRevoked = true;
  this.revocation.revokedAt = new Date();
  this.revocation.revokedBy = revokedBy;
  this.revocation.reason = reason;
  this.revocation.revokedCertificateNumber = this.certificateNumber;
  this.status = CERTIFICATE_STATUS.REVOKED;
  
  return this.save();
};

// Instance method to verify certificate
certificateSchema.methods.verifyCertificate = function() {
  this.verification.verifiedCount += 1;
  this.verification.lastVerified = new Date();
  
  return this.save();
};

// Instance method to track download
certificateSchema.methods.trackDownload = function() {
  this.file.downloadCount += 1;
  this.file.lastDownloaded = new Date();
  
  return this.save();
};

// Static method to find by verification code
certificateSchema.statics.findByVerificationCode = function(code) {
  return this.findOne({ 'verification.verificationCode': code })
    .populate('student', 'firstName lastName admissionUID')
    .populate('course', 'name code');
};

// Static method to find certificates by student
certificateSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId })
    .populate('course', 'name code duration')
    .sort({ issueDate: -1 });
};

// Static method to get certificate statistics
certificateSchema.statics.getStats = async function(filters = {}) {
  const totalCertificates = await this.countDocuments(filters);
  const issuedCertificates = await this.countDocuments({ 
    ...filters, 
    status: CERTIFICATE_STATUS.ISSUED 
  });
  const revokedCertificates = await this.countDocuments({ 
    ...filters, 
    'revocation.isRevoked': true 
  });
  
  const statusStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const typeStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$certificateType',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const monthlyIssued = await this.aggregate([
    { 
      $match: { 
        ...filters, 
        status: CERTIFICATE_STATUS.ISSUED 
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  const downloadStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalDownloads: { $sum: '$file.downloadCount' },
        averageDownloads: { $avg: '$file.downloadCount' }
      }
    }
  ]);
  
  return {
    total: totalCertificates,
    issued: issuedCertificates,
    revoked: revokedCertificates,
    byStatus: statusStats,
    byType: typeStats,
    monthlyIssued,
    downloads: downloadStats[0] || {
      totalDownloads: 0,
      averageDownloads: 0
    }
  };
};

module.exports = mongoose.model('Certificate', certificateSchema);
