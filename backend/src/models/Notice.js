const mongoose = require('mongoose');
const { NOTICE_PRIORITY, NOTICE_TARGET, USER_ROLES } = require('../config/constants');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: Object.values(NOTICE_PRIORITY),
    required: [true, 'Priority is required'],
    default: NOTICE_PRIORITY.MEDIUM
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'event', 'holiday', 'examination', 'fee', 'general', 'urgent'],
    required: [true, 'Category is required'],
    default: 'general'
  },
  targetType: {
    type: String,
    enum: Object.values(NOTICE_TARGET),
    required: [true, 'Target type is required'],
    default: NOTICE_TARGET.ALL
  },
  targetAudience: {
    // For specific targeting
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    batches: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening']
    }],
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    userRoles: [{
      type: String,
      enum: Object.values(USER_ROLES)
    }]
  },
  publishDate: {
    type: Date,
    required: [true, 'Publish date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.publishDate;
      },
      message: 'Expiry date must be after publish date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  attachments: [{
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
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    },
    userType: {
      type: String,
      enum: ['admin', 'student', 'instructor'],
      required: true
    }
  }],
  acknowledgments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    },
    response: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    }
  }],
  requiresAcknowledgment: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: false
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    commentedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalReads: {
      type: Number,
      default: 0
    },
    totalAcknowledgments: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [{
        email: String,
        status: {
          type: String,
          enum: ['sent', 'delivered', 'failed', 'bounced'],
          default: 'sent'
        }
      }]
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [{
        phone: String,
        status: {
          type: String,
          enum: ['sent', 'delivered', 'failed'],
          default: 'sent'
        }
      }]
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'published', 'expired', 'archived'],
      default: 'draft'
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    source: {
      type: String,
      enum: ['manual', 'system_generated', 'imported', 'api'],
      default: 'manual'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for read percentage
noticeSchema.virtual('readPercentage').get(function() {
  if (this.statistics.totalViews === 0) return 0;
  return Math.round((this.statistics.totalReads / this.statistics.totalViews) * 100);
});

// Virtual for acknowledgment percentage
noticeSchema.virtual('acknowledgmentPercentage').get(function() {
  if (!this.requiresAcknowledgment || this.statistics.totalReads === 0) return 0;
  return Math.round((this.statistics.totalAcknowledgments / this.statistics.totalReads) * 100);
});

// Virtual for status check
noticeSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (this.expiryDate && now > this.expiryDate) return 'expired';
  if (now < this.publishDate) return 'scheduled';
  return 'active';
});

// Virtual for time remaining
noticeSchema.virtual('timeRemaining').get(function() {
  if (!this.expiryDate) return null;
  
  const now = new Date();
  const remaining = this.expiryDate - now;
  
  if (remaining <= 0) return 'expired';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return 'less than 1 hour';
});

// Indexes
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ targetType: 1 });
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ isPinned: 1 });
noticeSchema.index({ isUrgent: 1 });
noticeSchema.index({ 'metadata.status': 1 });
noticeSchema.index({ 'metadata.tags': 1 });

// Compound indexes
noticeSchema.index({ isActive: 1, publishDate: -1 });
noticeSchema.index({ targetType: 1, isActive: 1 });
noticeSchema.index({ category: 1, priority: 1 });

// Text search index
noticeSchema.index({ 
  title: 'text', 
  content: 'text', 
  summary: 'text',
  'metadata.tags': 'text'
});

// Pre-save middleware to update statistics
noticeSchema.pre('save', function(next) {
  // Update statistics
  this.statistics.totalReads = this.readBy.length;
  this.statistics.totalAcknowledgments = this.acknowledgments.length;
  this.statistics.totalComments = this.comments.length;
  
  // Auto-generate summary if not provided
  if (!this.summary && this.content) {
    this.summary = this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
  }
  
  // Set urgent flag based on priority
  this.isUrgent = this.priority === NOTICE_PRIORITY.URGENT;
  
  // Update status based on dates
  const now = new Date();
  if (this.expiryDate && now > this.expiryDate) {
    this.metadata.status = 'expired';
    this.isActive = false;
  } else if (now >= this.publishDate && this.metadata.status === 'approved') {
    this.metadata.status = 'published';
  }
  
  next();
});

// Instance method to mark as read
noticeSchema.methods.markAsRead = function(userId, userType) {
  // Check if already read
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      userType,
      readAt: new Date()
    });
    this.statistics.totalViews += 1;
  }
  
  return this.save();
};

// Instance method to add acknowledgment
noticeSchema.methods.addAcknowledgment = function(userId, response = '') {
  // Check if already acknowledged
  const existingAck = this.acknowledgments.find(ack => 
    ack.user.toString() === userId.toString()
  );
  
  if (!existingAck) {
    this.acknowledgments.push({
      user: userId,
      response,
      acknowledgedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to add comment
noticeSchema.methods.addComment = function(userId, content) {
  if (!this.allowComments) {
    throw new Error('Comments are not allowed on this notice');
  }
  
  this.comments.push({
    user: userId,
    content,
    commentedAt: new Date()
  });
  
  return this.save();
};

// Instance method to check if user can view notice
noticeSchema.methods.canUserView = function(user) {
  // Check if notice is active and published
  if (!this.isActive || this.metadata.status !== 'published') {
    return false;
  }
  
  // Check publish date
  if (new Date() < this.publishDate) {
    return false;
  }
  
  // Check expiry date
  if (this.expiryDate && new Date() > this.expiryDate) {
    return false;
  }
  
  // Check target audience
  if (this.targetType === NOTICE_TARGET.ALL) {
    return true;
  }
  
  if (this.targetType === NOTICE_TARGET.INDIVIDUAL) {
    return this.targetAudience.students.includes(user._id) ||
           this.targetAudience.userRoles.includes(user.role);
  }
  
  // Add more specific targeting logic here
  return true;
};

// Static method to find active notices
noticeSchema.statics.findActive = function(filters = {}) {
  const query = {
    isActive: true,
    'metadata.status': 'published',
    publishDate: { $lte: new Date() },
    ...filters
  };
  
  // Add expiry date filter
  query.$or = [
    { expiryDate: { $exists: false } },
    { expiryDate: null },
    { expiryDate: { $gt: new Date() } }
  ];
  
  return this.find(query).sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Static method to find notices for user
noticeSchema.statics.findForUser = function(user, filters = {}) {
  const baseQuery = {
    isActive: true,
    'metadata.status': 'published',
    publishDate: { $lte: new Date() },
    ...filters
  };
  
  // Add expiry date filter
  baseQuery.$or = [
    { expiryDate: { $exists: false } },
    { expiryDate: null },
    { expiryDate: { $gt: new Date() } }
  ];
  
  // Add targeting filters
  const targetQuery = {
    $or: [
      { targetType: NOTICE_TARGET.ALL },
      { 
        targetType: NOTICE_TARGET.INDIVIDUAL,
        $or: [
          { 'targetAudience.students': user._id },
          { 'targetAudience.userRoles': user.role }
        ]
      }
    ]
  };
  
  return this.find({ ...baseQuery, ...targetQuery })
    .sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Static method to get notice statistics
noticeSchema.statics.getStats = async function(filters = {}) {
  const totalNotices = await this.countDocuments(filters);
  const activeNotices = await this.countDocuments({ ...filters, isActive: true });
  const expiredNotices = await this.countDocuments({ 
    ...filters, 
    expiryDate: { $lt: new Date() } 
  });
  
  const categoryStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$statistics.totalViews' },
        totalReads: { $sum: '$statistics.totalReads' }
      }
    }
  ]);
  
  const priorityStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const readStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$statistics.totalViews' },
        totalReads: { $sum: '$statistics.totalReads' },
        totalAcknowledgments: { $sum: '$statistics.totalAcknowledgments' },
        averageReadRate: { 
          $avg: { 
            $cond: [
              { $eq: ['$statistics.totalViews', 0] },
              0,
              { $multiply: [{ $divide: ['$statistics.totalReads', '$statistics.totalViews'] }, 100] }
            ]
          }
        }
      }
    }
  ]);
  
  return {
    total: totalNotices,
    active: activeNotices,
    expired: expiredNotices,
    byCategory: categoryStats,
    byPriority: priorityStats,
    engagement: readStats[0] || {
      totalViews: 0,
      totalReads: 0,
      totalAcknowledgments: 0,
      averageReadRate: 0
    }
  };
};

module.exports = mongoose.model('Notice', noticeSchema);
