const Notice = require('../models/Notice');
const User = require('../models/User');
const Student = require('../models/Student');
const { 
  getPagination, 
  formatPaginationResponse,
  formatDate
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, NOTICE_PRIORITY, NOTICE_TARGET } = require('../config/constants');

// @desc    Get all notices with pagination and filters
// @route   GET /api/notices
// @access  Private (Viewer+)
const getNotices = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      category, 
      priority, 
      targetType,
      isActive,
      isPinned,
      isUrgent,
      status,
      sortBy = 'publishDate', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (priority && Object.values(NOTICE_PRIORITY).includes(priority)) {
      query.priority = priority;
    }
    if (targetType && Object.values(NOTICE_TARGET).includes(targetType)) {
      query.targetType = targetType;
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (isUrgent !== undefined) query.isUrgent = isUrgent === 'true';
    if (status) query['metadata.status'] = status;

    // Build sort object
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const notices = await Notice.find(query)
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('metadata.updatedBy', 'firstName lastName')
      .populate('metadata.approvedBy', 'firstName lastName')
      .populate('targetAudience.courses', 'name code')
      .populate('targetAudience.students', 'firstName lastName admissionUID')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Notice.countDocuments(query);

    // Format response
    const formattedNotices = notices.map(notice => ({
      ...notice,
      formattedPublishDate: formatDate(notice.publishDate),
      formattedExpiryDate: notice.expiryDate ? formatDate(notice.expiryDate) : null,
      currentStatus: getCurrentStatus(notice),
      timeRemaining: getTimeRemaining(notice),
      readPercentage: notice.statistics.totalViews > 0 ? 
        Math.round((notice.statistics.totalReads / notice.statistics.totalViews) * 100) : 0
    }));

    const response = formatPaginationResponse(formattedNotices, total, pageNum, limitNum);

    logger.info(`Notices list retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: notices.length
    });

    res.status(200).json({
      success: true,
      message: 'Notices retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getNotices:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving notices'
    });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Editor+)
const createNotice = async (req, res) => {
  try {
    const noticeData = {
      ...req.body,
      metadata: {
        createdBy: req.user.id,
        status: 'draft'
      }
    };

    // Auto-approve if user has admin privileges
    if (req.user.role === USER_ROLES.SUPER_ADMIN || req.user.role === USER_ROLES.ADMIN) {
      noticeData.metadata.status = 'approved';
      noticeData.metadata.approvedBy = req.user.id;
      noticeData.metadata.approvedAt = new Date();
    }

    const notice = await Notice.create(noticeData);

    // Populate the created notice
    const populatedNotice = await Notice.findById(notice._id)
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('metadata.approvedBy', 'firstName lastName')
      .populate('targetAudience.courses', 'name code')
      .populate('targetAudience.students', 'firstName lastName admissionUID');

    logger.info(`New notice created by user ${req.user.id}`, {
      userId: req.user.id,
      noticeId: notice._id,
      title: notice.title,
      priority: notice.priority
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: populatedNotice
    });

  } catch (error) {
    logger.error('Error in createNotice:', error);
    
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
      error: 'Server error while creating notice'
    });
  }
};

// @desc    Get notice details by ID
// @route   GET /api/notices/:id
// @access  Private (Viewer+)
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id)
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.updatedBy', 'firstName lastName email')
      .populate('metadata.approvedBy', 'firstName lastName email')
      .populate('targetAudience.courses', 'name code')
      .populate('targetAudience.students', 'firstName lastName admissionUID')
      .populate('readBy.user', 'firstName lastName')
      .populate('acknowledgments.user', 'firstName lastName')
      .populate('comments.user', 'firstName lastName');

    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    // Check if user can view this notice
    if (!notice.canUserView(req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notice'
      });
    }

    // Mark as read if not already read
    const hasRead = notice.readBy.some(read => 
      read.user._id.toString() === req.user.id
    );

    if (!hasRead) {
      await notice.markAsRead(req.user.id, req.user.role === USER_ROLES.STUDENT ? 'student' : 'admin');
    }

    // Add computed fields
    const noticeData = {
      ...notice.toObject(),
      formattedPublishDate: formatDate(notice.publishDate),
      formattedExpiryDate: notice.expiryDate ? formatDate(notice.expiryDate) : null,
      currentStatus: getCurrentStatus(notice),
      timeRemaining: getTimeRemaining(notice),
      readPercentage: notice.statistics.totalViews > 0 ? 
        Math.round((notice.statistics.totalReads / notice.statistics.totalViews) * 100) : 0,
      acknowledgmentPercentage: notice.requiresAcknowledgment && notice.statistics.totalReads > 0 ?
        Math.round((notice.statistics.totalAcknowledgments / notice.statistics.totalReads) * 100) : 0,
      hasUserRead: true,
      hasUserAcknowledged: notice.acknowledgments.some(ack => 
        ack.user._id.toString() === req.user.id
      )
    };

    logger.info(`Notice details retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      noticeId: id
    });

    res.status(200).json({
      success: true,
      message: 'Notice details retrieved successfully',
      data: noticeData
    });

  } catch (error) {
    logger.error('Error in getNoticeById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving notice details'
    });
  }
};

// @desc    Update notice information
// @route   PUT /api/notices/:id
// @access  Private (Editor+)
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    // Check permissions - only creator or admin can update
    if (notice.metadata.createdBy.toString() !== req.user.id && 
        ![USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own notices.'
      });
    }

    // Add metadata
    updateData.metadata = {
      ...notice.metadata,
      updatedBy: req.user.id,
      version: (notice.metadata?.version || 1) + 1
    };

    // If content changed and notice was published, require re-approval
    if ((updateData.title || updateData.content) && notice.metadata.status === 'published') {
      updateData.metadata.status = 'pending_approval';
    }

    // Update notice
    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('metadata.createdBy', 'firstName lastName')
    .populate('metadata.updatedBy', 'firstName lastName')
    .populate('targetAudience.courses', 'name code')
    .populate('targetAudience.students', 'firstName lastName admissionUID');

    logger.info(`Notice updated by user ${req.user.id}`, {
      userId: req.user.id,
      noticeId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: updatedNotice
    });

  } catch (error) {
    logger.error('Error in updateNotice:', error);
    
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
      error: 'Server error while updating notice'
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin+)
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    // Check permissions
    if (notice.metadata.createdBy.toString() !== req.user.id && 
        ![USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only delete your own notices.'
      });
    }

    await Notice.findByIdAndDelete(id);

    logger.info(`Notice deleted by user ${req.user.id}`, {
      userId: req.user.id,
      noticeId: id,
      title: notice.title
    });

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteNotice:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting notice'
    });
  }
};

// @desc    Mark notice as read
// @route   POST /api/notices/:id/read
// @access  Private (All authenticated users)
const markNoticeAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    // Check if user can view this notice
    if (!notice.canUserView(req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notice'
      });
    }

    await notice.markAsRead(req.user.id, req.user.role === USER_ROLES.STUDENT ? 'student' : 'admin');

    logger.info(`Notice marked as read by user ${req.user.id}`, {
      userId: req.user.id,
      noticeId: id
    });

    res.status(200).json({
      success: true,
      message: 'Notice marked as read successfully'
    });

  } catch (error) {
    logger.error('Error in markNoticeAsRead:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notice as read'
    });
  }
};

// @desc    Get user-specific notices
// @route   GET /api/notices/my
// @access  Private (All authenticated users)
const getMyNotices = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      category, 
      priority, 
      unreadOnly,
      sortBy = 'publishDate', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build filters
    let filters = {};
    if (category) filters.category = category;
    if (priority) filters.priority = priority;

    // Get notices for user
    let query = Notice.findForUser(req.user, filters);

    // Filter unread notices if requested
    if (unreadOnly === 'true') {
      query = query.where({
        'readBy.user': { $ne: req.user.id }
      });
    }

    // Apply pagination and sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const notices = await query
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('targetAudience.courses', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalQuery = Notice.findForUser(req.user, filters);
    if (unreadOnly === 'true') {
      totalQuery.where({ 'readBy.user': { $ne: req.user.id } });
    }
    const total = await totalQuery.countDocuments();

    // Format response
    const formattedNotices = notices.map(notice => {
      const hasRead = notice.readBy.some(read => 
        read.user.toString() === req.user.id
      );
      const hasAcknowledged = notice.acknowledgments.some(ack => 
        ack.user.toString() === req.user.id
      );

      return {
        ...notice,
        formattedPublishDate: formatDate(notice.publishDate),
        formattedExpiryDate: notice.expiryDate ? formatDate(notice.expiryDate) : null,
        currentStatus: getCurrentStatus(notice),
        timeRemaining: getTimeRemaining(notice),
        hasUserRead: hasRead,
        hasUserAcknowledged: hasAcknowledged,
        requiresAction: notice.requiresAcknowledgment && !hasAcknowledged
      };
    });

    const response = formatPaginationResponse(formattedNotices, total, pageNum, limitNum);

    logger.info(`User notices retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      resultCount: notices.length,
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      message: 'Your notices retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getMyNotices:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving your notices'
    });
  }
};

// @desc    Get notice statistics
// @route   GET /api/notices/stats
// @access  Private (Viewer+)
const getNoticeStats = async (req, res) => {
  try {
    const { category, priority, startDate, endDate } = req.query;

    // Build filters
    let filters = {};
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (startDate && endDate) {
      filters.publishDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Notice.getStats(filters);

    logger.info(`Notice statistics retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      filters
    });

    res.status(200).json({
      success: true,
      message: 'Notice statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error in getNoticeStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving statistics'
    });
  }
};

// Helper functions
const getCurrentStatus = (notice) => {
  const now = new Date();
  
  if (!notice.isActive) return 'inactive';
  if (notice.expiryDate && now > notice.expiryDate) return 'expired';
  if (now < notice.publishDate) return 'scheduled';
  return 'active';
};

const getTimeRemaining = (notice) => {
  if (!notice.expiryDate) return null;
  
  const now = new Date();
  const remaining = notice.expiryDate - now;
  
  if (remaining <= 0) return 'expired';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return 'less than 1 hour';
};

module.exports = {
  getNotices,
  createNotice,
  getNoticeById,
  updateNotice,
  deleteNotice,
  markNoticeAsRead,
  getMyNotices,
  getNoticeStats
};
