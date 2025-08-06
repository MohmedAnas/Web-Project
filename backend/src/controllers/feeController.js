const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { 
  getPagination, 
  formatPaginationResponse,
  formatDate,
  formatCurrency,
  generateUID
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, FEE_STATUS, PAYMENT_METHODS } = require('../config/constants');

// @desc    Get all fees with pagination, search, and filters
// @route   GET /api/fees
// @access  Private (Viewer+)
const getFees = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      status, 
      feeType,
      academicYear,
      student,
      course,
      overdue,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      const students = await Student.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { admissionUID: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.$or = [
        { student: { $in: students.map(s => s._id) } },
        { 'payments.paymentId': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && Object.values(FEE_STATUS).includes(status)) {
      query.status = status;
    }

    // Filter by fee type
    if (feeType) {
      query.feeType = feeType;
    }

    // Filter by academic year
    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Filter by student
    if (student) {
      query.student = student;
    }

    // Filter by course
    if (course) {
      query.course = course;
    }

    // Filter overdue fees
    if (overdue === 'true') {
      query.status = { $in: [FEE_STATUS.OVERDUE, FEE_STATUS.PARTIAL] };
      query.dueDate = { $lt: new Date() };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const fees = await Fee.find(query)
      .populate('student', 'firstName lastName admissionUID email phone')
      .populate('course', 'name code')
      .populate('metadata.createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Fee.countDocuments(query);

    // Format response
    const formattedFees = fees.map(fee => ({
      ...fee,
      formattedAmount: formatCurrency(fee.amount.final),
      formattedPaidAmount: formatCurrency(fee.paidAmount),
      formattedPendingAmount: formatCurrency(fee.pendingAmount),
      formattedDueDate: formatDate(fee.dueDate),
      daysOverdue: fee.status === 'overdue' ? Math.max(0, Math.ceil((new Date() - fee.dueDate) / (1000 * 60 * 60 * 24))) : 0,
      paymentPercentage: fee.amount.final > 0 ? Math.round((fee.paidAmount / fee.amount.final) * 100) : 100
    }));

    const response = formatPaginationResponse(formattedFees, total, pageNum, limitNum);

    logger.info(`Fees list retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: fees.length
    });

    res.status(200).json({
      success: true,
      message: 'Fees retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getFees:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving fees'
    });
  }
};

// @desc    Create new fee record
// @route   POST /api/fees
// @access  Private (Editor+)
const createFee = async (req, res) => {
  try {
    const feeData = {
      ...req.body,
      metadata: {
        createdBy: req.user.id,
        source: 'manual'
      }
    };

    // Verify student exists
    const student = await Student.findById(feeData.student);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Verify course exists
    const course = await Course.findById(feeData.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if fee already exists for this student, course, and type
    const existingFee = await Fee.findOne({
      student: feeData.student,
      course: feeData.course,
      feeType: feeData.feeType,
      academicYear: feeData.academicYear,
      semester: feeData.semester
    });

    if (existingFee) {
      return res.status(400).json({
        success: false,
        error: 'Fee record already exists for this student, course, and type'
      });
    }

    const fee = await Fee.create(feeData);

    // Populate the created fee
    const populatedFee = await Fee.findById(fee._id)
      .populate('student', 'firstName lastName admissionUID')
      .populate('course', 'name code')
      .populate('metadata.createdBy', 'firstName lastName');

    logger.info(`New fee created by user ${req.user.id}`, {
      userId: req.user.id,
      feeId: fee._id,
      studentId: feeData.student,
      amount: feeData.amount.original
    });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: populatedFee
    });

  } catch (error) {
    logger.error('Error in createFee:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating fee'
    });
  }
};

// @desc    Get fee details by ID
// @route   GET /api/fees/:id
// @access  Private (Viewer+)
const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id)
      .populate('student', 'firstName lastName admissionUID email phone address')
      .populate('course', 'name code fee')
      .populate('payments.receivedBy', 'firstName lastName')
      .populate('discounts.appliedBy', 'firstName lastName')
      .populate('concessions.approvedBy', 'firstName lastName')
      .populate('notes.addedBy', 'firstName lastName')
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('metadata.updatedBy', 'firstName lastName');

    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found'
      });
    }

    // Add computed fields
    const feeData = {
      ...fee.toObject(),
      formattedAmount: formatCurrency(fee.amount.final),
      formattedPaidAmount: formatCurrency(fee.paidAmount),
      formattedPendingAmount: formatCurrency(fee.pendingAmount),
      formattedDueDate: formatDate(fee.dueDate),
      daysOverdue: fee.status === 'overdue' ? Math.max(0, Math.ceil((new Date() - fee.dueDate) / (1000 * 60 * 60 * 24))) : 0,
      paymentPercentage: fee.amount.final > 0 ? Math.round((fee.paidAmount / fee.amount.final) * 100) : 100,
      totalDiscountAmount: fee.discounts.reduce((total, discount) => total + (discount.amount || 0), 0) + fee.amount.discount
    };

    logger.info(`Fee details retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      feeId: id
    });

    res.status(200).json({
      success: true,
      message: 'Fee details retrieved successfully',
      data: feeData
    });

  } catch (error) {
    logger.error('Error in getFeeById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving fee details'
    });
  }
};

// @desc    Update fee information
// @route   PUT /api/fees/:id
// @access  Private (Editor+)
const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found'
      });
    }

    // Add metadata
    updateData.metadata = {
      ...fee.metadata,
      updatedBy: req.user.id
    };

    // Update fee
    const updatedFee = await Fee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('student', 'firstName lastName admissionUID')
    .populate('course', 'name code')
    .populate('metadata.updatedBy', 'firstName lastName');

    logger.info(`Fee updated by user ${req.user.id}`, {
      userId: req.user.id,
      feeId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Fee updated successfully',
      data: updatedFee
    });

  } catch (error) {
    logger.error('Error in updateFee:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while updating fee'
    });
  }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private (Admin+)
const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found'
      });
    }

    // Check if fee has payments
    if (fee.payments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete fee with existing payments'
      });
    }

    await Fee.findByIdAndDelete(id);

    logger.info(`Fee deleted by user ${req.user.id}`, {
      userId: req.user.id,
      feeId: id
    });

    res.status(200).json({
      success: true,
      message: 'Fee deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteFee:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting fee'
    });
  }
};

// @desc    Record payment for fee
// @route   POST /api/fees/:id/payment
// @access  Private (Editor+)
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = {
      ...req.body,
      receivedBy: req.user.id,
      status: 'completed'
    };

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found'
      });
    }

    // Validate payment amount
    if (paymentData.amount > fee.pendingAmount) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount cannot exceed pending amount'
      });
    }

    // Add payment
    await fee.addPayment(paymentData);

    // Get updated fee
    const updatedFee = await Fee.findById(id)
      .populate('student', 'firstName lastName admissionUID')
      .populate('course', 'name code');

    logger.info(`Payment recorded by user ${req.user.id}`, {
      userId: req.user.id,
      feeId: id,
      amount: paymentData.amount,
      method: paymentData.method
    });

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: updatedFee
    });

  } catch (error) {
    logger.error('Error in recordPayment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while recording payment'
    });
  }
};

// @desc    Get student fees
// @route   GET /api/fees/student/:studentId
// @access  Private (Viewer+)
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, academicYear } = req.query;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    let query = { student: studentId };
    
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const fees = await Fee.find(query)
      .populate('course', 'name code')
      .sort({ dueDate: -1 });

    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount.final, 0);
    const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const pendingAmount = fees.reduce((sum, fee) => sum + fee.pendingAmount, 0);

    logger.info(`Student fees retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId,
      feeCount: fees.length
    });

    res.status(200).json({
      success: true,
      message: 'Student fees retrieved successfully',
      data: {
        student: {
          _id: student._id,
          fullName: `${student.firstName} ${student.lastName}`,
          admissionUID: student.admissionUID
        },
        fees,
        summary: {
          totalFees: fees.length,
          totalAmount: formatCurrency(totalAmount),
          paidAmount: formatCurrency(paidAmount),
          pendingAmount: formatCurrency(pendingAmount)
        }
      }
    });

  } catch (error) {
    logger.error('Error in getStudentFees:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving student fees'
    });
  }
};

// @desc    Get overdue fees
// @route   GET /api/fees/overdue
// @access  Private (Viewer+)
const getOverdueFees = async (req, res) => {
  try {
    const { days = 0 } = req.query;
    
    const overdueFees = await Fee.findOverdue(parseInt(days))
      .populate('student', 'firstName lastName admissionUID email phone')
      .populate('course', 'name code')
      .sort({ dueDate: 1 });

    const totalOverdueAmount = overdueFees.reduce((sum, fee) => sum + fee.pendingAmount, 0);

    logger.info(`Overdue fees retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      overdueCount: overdueFees.length,
      days
    });

    res.status(200).json({
      success: true,
      message: 'Overdue fees retrieved successfully',
      data: {
        fees: overdueFees,
        summary: {
          totalOverdueFees: overdueFees.length,
          totalOverdueAmount: formatCurrency(totalOverdueAmount)
        }
      }
    });

  } catch (error) {
    logger.error('Error in getOverdueFees:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving overdue fees'
    });
  }
};

// @desc    Get fee reports
// @route   GET /api/fees/reports
// @access  Private (Viewer+)
const getFeeReports = async (req, res) => {
  try {
    const { type = 'summary', startDate, endDate, course, feeType } = req.query;

    let matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (course) matchQuery.course = course;
    if (feeType) matchQuery.feeType = feeType;

    let reportData = {};

    if (type === 'summary') {
      reportData = await Fee.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalFees: { $sum: 1 },
            totalAmount: { $sum: '$amount.final' },
            totalPaid: { $sum: '$paidAmount' },
            totalPending: { $sum: '$pendingAmount' },
            totalOverdue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, '$pendingAmount', 0]
              }
            }
          }
        }
      ]);
    } else if (type === 'collection') {
      reportData = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: { ...matchQuery, 'payments.status': 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$payments.paidAt' },
              month: { $month: '$payments.paidAt' }
            },
            totalCollection: { $sum: '$payments.amount' },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]);
    }

    logger.info(`Fee reports retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      reportType: type
    });

    res.status(200).json({
      success: true,
      message: 'Fee reports retrieved successfully',
      data: reportData
    });

  } catch (error) {
    logger.error('Error in getFeeReports:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while generating reports'
    });
  }
};

// @desc    Bulk create fees
// @route   POST /api/fees/bulk-create
// @access  Private (Admin+)
const bulkCreateFees = async (req, res) => {
  try {
    const { fees } = req.body;

    if (!Array.isArray(fees) || fees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Fees array is required and cannot be empty'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: fees.length
    };

    for (let i = 0; i < fees.length; i++) {
      try {
        const feeData = {
          ...fees[i],
          metadata: {
            createdBy: req.user.id,
            source: 'bulk_import'
          }
        };

        const fee = await Fee.create(feeData);
        results.successful.push({
          index: i,
          feeId: fee._id,
          student: feeData.student,
          amount: feeData.amount.original
        });

      } catch (error) {
        results.failed.push({
          index: i,
          data: fees[i],
          error: error.message
        });
      }
    }

    logger.info(`Bulk fee creation by user ${req.user.id}`, {
      userId: req.user.id,
      total: results.total,
      successful: results.successful.length,
      failed: results.failed.length
    });

    res.status(200).json({
      success: true,
      message: `Bulk creation completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
    });

  } catch (error) {
    logger.error('Error in bulkCreateFees:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during bulk creation'
    });
  }
};

// @desc    Get fee statistics
// @route   GET /api/fees/stats
// @access  Private (Viewer+)
const getFeeStats = async (req, res) => {
  try {
    const stats = await Fee.getStats();

    logger.info(`Fee statistics retrieved by user ${req.user.id}`, {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Fee statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error in getFeeStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving statistics'
    });
  }
};

// @desc    Send fee reminders
// @route   POST /api/fees/send-reminders
// @access  Private (Editor+)
const sendFeeReminders = async (req, res) => {
  try {
    const { feeIds, reminderType = 'email', template } = req.body;

    if (!Array.isArray(feeIds) || feeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Fee IDs array is required'
      });
    }

    const results = {
      sent: [],
      failed: [],
      total: feeIds.length
    };

    for (const feeId of feeIds) {
      try {
        const fee = await Fee.findById(feeId)
          .populate('student', 'firstName lastName email phone');

        if (!fee) {
          results.failed.push({ feeId, error: 'Fee not found' });
          continue;
        }

        // Add reminder record
        await fee.addReminder({
          type: reminderType,
          sentBy: req.user.id,
          template,
          status: 'sent'
        });

        results.sent.push({
          feeId,
          studentName: `${fee.student.firstName} ${fee.student.lastName}`,
          amount: fee.pendingAmount
        });

      } catch (error) {
        results.failed.push({ feeId, error: error.message });
      }
    }

    logger.info(`Fee reminders sent by user ${req.user.id}`, {
      userId: req.user.id,
      total: results.total,
      sent: results.sent.length,
      failed: results.failed.length
    });

    res.status(200).json({
      success: true,
      message: `Reminders sent. ${results.sent.length} successful, ${results.failed.length} failed.`,
      data: results
    });

  } catch (error) {
    logger.error('Error in sendFeeReminders:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sending reminders'
    });
  }
};

module.exports = {
  getFees,
  createFee,
  getFeeById,
  updateFee,
  deleteFee,
  recordPayment,
  getStudentFees,
  getOverdueFees,
  getFeeReports,
  bulkCreateFees,
  getFeeStats,
  sendFeeReminders
};
