const mongoose = require('mongoose');
const { FEE_STATUS, PAYMENT_METHODS } = require('../config/constants');

const feeSchema = new mongoose.Schema({
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
  feeType: {
    type: String,
    enum: ['admission', 'tuition', 'examination', 'library', 'lab', 'certificate', 'miscellaneous'],
    required: [true, 'Fee type is required'],
    default: 'tuition'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', 'annual'],
    default: 'annual'
  },
  amount: {
    original: {
      type: Number,
      required: [true, 'Original amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    final: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: [0, 'Final amount cannot be negative']
    }
  },
  discounts: [{
    type: {
      type: String,
      enum: ['early_bird', 'bulk', 'referral', 'scholarship', 'sibling', 'merit', 'financial_aid', 'other']
    },
    name: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative']
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  installments: {
    enabled: {
      type: Boolean,
      default: false
    },
    plan: [{
      installmentNumber: {
        type: Number,
        required: true,
        min: [1, 'Installment number must be at least 1']
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Installment amount cannot be negative']
      },
      dueDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'waived'],
        default: 'pending'
      },
      paidAmount: {
        type: Number,
        default: 0,
        min: [0, 'Paid amount cannot be negative']
      },
      paidDate: Date,
      lateFee: {
        type: Number,
        default: 0,
        min: [0, 'Late fee cannot be negative']
      }
    }]
  },
  payments: [{
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: [true, 'Payment method is required']
    },
    transactionId: {
      type: String,
      trim: true
    },
    reference: {
      type: String,
      trim: true
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'paytm', 'phonepe', 'gpay', 'bank_transfer', 'cash', 'cheque', 'other']
    },
    gatewayTransactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    receipt: {
      number: String,
      url: String,
      generated: {
        type: Boolean,
        default: false
      }
    }
  }],
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: Object.values(FEE_STATUS),
    default: FEE_STATUS.PENDING
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Pending amount cannot be negative']
  },
  overdueAmount: {
    type: Number,
    default: 0,
    min: [0, 'Overdue amount cannot be negative']
  },
  lateFee: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative']
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Late fee percentage cannot be negative'],
      max: [100, 'Late fee percentage cannot exceed 100']
    },
    appliedDate: Date,
    waived: {
      type: Boolean,
      default: false
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waivedReason: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'notice'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    template: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'bounced'],
      default: 'sent'
    },
    response: String
  }],
  concessions: [{
    type: {
      type: String,
      enum: ['partial_waiver', 'full_waiver', 'installment_extension', 'late_fee_waiver']
    },
    amount: {
      type: Number,
      min: [0, 'Concession amount cannot be negative']
    },
    reason: {
      type: String,
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedAt: {
      type: Date,
      default: Date.now
    },
    documents: [{
      name: String,
      url: String,
      type: String
    }]
  }],
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
      enum: ['general', 'payment', 'reminder', 'concession', 'dispute'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
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
      enum: ['manual', 'bulk_import', 'system_generated', 'api'],
      default: 'manual'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days overdue
feeSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'overdue') return 0;
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Virtual for payment completion percentage
feeSchema.virtual('paymentPercentage').get(function() {
  if (this.amount.final === 0) return 100;
  return Math.round((this.paidAmount / this.amount.final) * 100);
});

// Virtual for next installment due
feeSchema.virtual('nextInstallmentDue').get(function() {
  if (!this.installments.enabled) return null;
  
  const pendingInstallment = this.installments.plan.find(
    installment => installment.status === 'pending'
  );
  
  return pendingInstallment || null;
});

// Virtual for total discount amount
feeSchema.virtual('totalDiscountAmount').get(function() {
  return this.discounts.reduce((total, discount) => {
    return total + (discount.amount || 0);
  }, 0) + this.amount.discount;
});

// Indexes
feeSchema.index({ student: 1, course: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ academicYear: 1 });
feeSchema.index({ feeType: 1 });
feeSchema.index({ 'payments.paymentId': 1 });
feeSchema.index({ createdAt: -1 });

// Compound indexes
feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ course: 1, academicYear: 1 });
feeSchema.index({ dueDate: 1, status: 1 });

// Pre-save middleware to calculate final amount
feeSchema.pre('save', function(next) {
  // Calculate final amount
  this.amount.final = this.amount.original - this.amount.discount + this.amount.tax;
  
  // Calculate pending amount
  this.pendingAmount = Math.max(0, this.amount.final - this.paidAmount);
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = new Date() > this.dueDate ? FEE_STATUS.OVERDUE : FEE_STATUS.PENDING;
  } else if (this.paidAmount >= this.amount.final) {
    this.status = FEE_STATUS.PAID;
    this.pendingAmount = 0;
  } else {
    this.status = FEE_STATUS.PARTIAL;
  }
  
  // Calculate overdue amount
  if (this.status === FEE_STATUS.OVERDUE) {
    this.overdueAmount = this.pendingAmount;
  } else {
    this.overdueAmount = 0;
  }
  
  next();
});

// Pre-save middleware to generate payment ID
feeSchema.pre('save', function(next) {
  this.payments.forEach(payment => {
    if (!payment.paymentId) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      payment.paymentId = `PAY${timestamp}${random}`;
    }
  });
  next();
});

// Instance method to add payment
feeSchema.methods.addPayment = function(paymentData) {
  const payment = {
    ...paymentData,
    paidAt: paymentData.paidAt || new Date()
  };
  
  this.payments.push(payment);
  
  // Update paid amount if payment is completed
  if (payment.status === 'completed') {
    this.paidAmount += payment.amount;
  }
  
  return this.save();
};

// Instance method to apply discount
feeSchema.methods.applyDiscount = function(discountData) {
  this.discounts.push({
    ...discountData,
    appliedAt: new Date()
  });
  
  // Update discount amount
  if (discountData.amount) {
    this.amount.discount += discountData.amount;
  } else if (discountData.percentage) {
    const discountAmount = (this.amount.original * discountData.percentage) / 100;
    this.amount.discount += discountAmount;
    this.discounts[this.discounts.length - 1].amount = discountAmount;
  }
  
  return this.save();
};

// Instance method to add reminder
feeSchema.methods.addReminder = function(reminderData) {
  this.reminders.push({
    ...reminderData,
    sentAt: new Date()
  });
  
  return this.save();
};

// Instance method to apply concession
feeSchema.methods.applyConcession = function(concessionData) {
  this.concessions.push({
    ...concessionData,
    approvedAt: new Date()
  });
  
  // Apply concession based on type
  if (concessionData.type === 'partial_waiver' || concessionData.type === 'full_waiver') {
    this.amount.discount += concessionData.amount || 0;
  } else if (concessionData.type === 'late_fee_waiver') {
    this.lateFee.waived = true;
    this.lateFee.waivedBy = concessionData.approvedBy;
    this.lateFee.waivedReason = concessionData.reason;
  }
  
  return this.save();
};

// Instance method to calculate late fee
feeSchema.methods.calculateLateFee = function() {
  if (this.status !== FEE_STATUS.OVERDUE || this.lateFee.waived) {
    return 0;
  }
  
  const daysOverdue = this.daysOverdue;
  let lateFeeAmount = 0;
  
  if (this.lateFee.percentage > 0) {
    lateFeeAmount = (this.pendingAmount * this.lateFee.percentage) / 100;
  } else {
    // Default late fee calculation: 1% per month overdue
    const monthsOverdue = Math.ceil(daysOverdue / 30);
    lateFeeAmount = (this.pendingAmount * monthsOverdue) / 100;
  }
  
  this.lateFee.amount = Math.min(lateFeeAmount, this.pendingAmount * 0.25); // Cap at 25%
  this.lateFee.appliedDate = new Date();
  
  return this.lateFee.amount;
};

// Static method to find overdue fees
feeSchema.statics.findOverdue = function(days = 0) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    dueDate: { $lt: cutoffDate },
    status: { $in: [FEE_STATUS.PENDING, FEE_STATUS.PARTIAL, FEE_STATUS.OVERDUE] }
  });
};

// Static method to find fees by student
feeSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId })
    .populate('course', 'name code')
    .sort({ dueDate: -1 });
};

// Static method to find fees by course
feeSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId })
    .populate('student', 'firstName lastName admissionUID')
    .sort({ dueDate: -1 });
};

// Static method to get fee statistics
feeSchema.statics.getStats = async function() {
  const totalFees = await this.countDocuments();
  const paidFees = await this.countDocuments({ status: FEE_STATUS.PAID });
  const overdueFees = await this.countDocuments({ status: FEE_STATUS.OVERDUE });
  
  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.final' },
        paidAmount: { $sum: '$paidAmount' },
        pendingAmount: { $sum: '$pendingAmount' }
      }
    }
  ]);
  
  const monthlyCollection = await this.aggregate([
    {
      $unwind: '$payments'
    },
    {
      $match: {
        'payments.status': 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$payments.paidAt' },
          month: { $month: '$payments.paidAt' }
        },
        totalAmount: { $sum: '$payments.amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  const feeTypeStats = await this.aggregate([
    {
      $group: {
        _id: '$feeType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.final' },
        collectedAmount: { $sum: '$paidAmount' }
      }
    }
  ]);
  
  return {
    total: totalFees,
    paid: paidFees,
    overdue: overdueFees,
    byStatus: statusStats,
    monthlyCollection,
    byFeeType: feeTypeStats
  };
};

// Static method to generate fee for student
feeSchema.statics.generateFeeForStudent = async function(studentId, courseId, feeData) {
  const fee = new this({
    student: studentId,
    course: courseId,
    ...feeData
  });
  
  return await fee.save();
};

module.exports = mongoose.model('Fee', feeSchema);
