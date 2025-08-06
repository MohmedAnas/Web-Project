const Admin = require('../models/Admin');
const User = require('../models/User');
const { removeSensitiveFields } = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES } = require('../config/constants');

// @desc    Get all pending admin approvals
// @route   GET /api/admin/pending-approvals
// @access  Private (Super Admin only)
const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = { approvalStatus: 'pending' };
    
    if (search) {
      const userIds = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      searchQuery.$or = [
        { user: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const pendingAdmins = await Admin.find(searchQuery)
      .populate('user', 'firstName lastName email phone dateOfBirth address createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(searchQuery);

    const adminsData = pendingAdmins.map(admin => ({
      ...removeSensitiveFields(admin.toObject()),
      user: removeSensitiveFields(admin.user.toObject())
    }));

    res.status(200).json({
      success: true,
      data: {
        admins: adminsData,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching pending approvals'
    });
  }
};

// @desc    Approve admin registration
// @route   POST /api/admin/approve/:id
// @access  Private (Super Admin only)
const approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user._id;

    const admin = await Admin.findById(id).populate('user');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    if (admin.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Admin is already ${admin.approvalStatus}`
      });
    }

    // Approve the admin
    await admin.approve(approvedBy);

    // Activate the user account
    await User.findByIdAndUpdate(admin.user._id, { 
      status: 'active',
      'metadata.updatedBy': approvedBy
    });

    logger.info(`Admin approved: ${admin.user.email}`, {
      adminId: admin._id,
      userId: admin.user._id,
      approvedBy,
      ip: req.ip
    });

    // TODO: Send approval email to admin
    
    res.status(200).json({
      success: true,
      message: 'Admin approved successfully',
      data: {
        admin: removeSensitiveFields(admin.toObject()),
        user: removeSensitiveFields(admin.user.toObject())
      }
    });

  } catch (error) {
    logger.error('Approve admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while approving admin'
    });
  }
};

// @desc    Reject admin registration
// @route   POST /api/admin/reject/:id
// @access  Private (Super Admin only)
const rejectAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectedBy = req.user._id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    const admin = await Admin.findById(id).populate('user');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    if (admin.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Admin is already ${admin.approvalStatus}`
      });
    }

    // Reject the admin
    await admin.reject(rejectedBy, reason.trim());

    // Keep user account inactive
    await User.findByIdAndUpdate(admin.user._id, { 
      status: 'inactive',
      'metadata.updatedBy': rejectedBy
    });

    logger.info(`Admin rejected: ${admin.user.email}`, {
      adminId: admin._id,
      userId: admin.user._id,
      rejectedBy,
      reason: reason.trim(),
      ip: req.ip
    });

    // TODO: Send rejection email to admin
    
    res.status(200).json({
      success: true,
      message: 'Admin rejected successfully',
      data: {
        admin: removeSensitiveFields(admin.toObject()),
        user: removeSensitiveFields(admin.user.toObject())
      }
    });

  } catch (error) {
    logger.error('Reject admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while rejecting admin'
    });
  }
};

// @desc    Get all admins with filters
// @route   GET /api/admin/list
// @access  Private (Super Admin only)
const getAllAdmins = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      department = '',
      designation = ''
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (status) {
      searchQuery.approvalStatus = status;
    }
    
    if (department) {
      searchQuery.department = department;
    }
    
    if (designation) {
      searchQuery.designation = designation;
    }
    
    if (search) {
      const userIds = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      searchQuery.$or = [
        { user: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await Admin.find(searchQuery)
      .populate('user', 'firstName lastName email phone status createdAt lastLogin')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(searchQuery);

    const adminsData = admins.map(admin => ({
      ...removeSensitiveFields(admin.toObject()),
      user: removeSensitiveFields(admin.user.toObject()),
      approvedBy: admin.approvedBy ? removeSensitiveFields(admin.approvedBy.toObject()) : null,
      rejectedBy: admin.rejectedBy ? removeSensitiveFields(admin.rejectedBy.toObject()) : null
    }));

    res.status(200).json({
      success: true,
      data: {
        admins: adminsData,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching admins'
    });
  }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Super Admin only)
const getAdminStats = async (req, res) => {
  try {
    const stats = await Admin.getStats();
    const pendingCount = await Admin.getPendingApprovalsCount();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        pendingApprovals: pendingCount
      }
    });

  } catch (error) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching admin statistics'
    });
  }
};

// @desc    Get admin details by ID
// @route   GET /api/admin/:id
// @access  Private (Super Admin only)
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .populate('user', 'firstName lastName email phone dateOfBirth address status createdAt lastLogin')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email');

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    const adminData = {
      ...removeSensitiveFields(admin.toObject()),
      user: removeSensitiveFields(admin.user.toObject()),
      approvedBy: admin.approvedBy ? removeSensitiveFields(admin.approvedBy.toObject()) : null,
      rejectedBy: admin.rejectedBy ? removeSensitiveFields(admin.rejectedBy.toObject()) : null
    };

    res.status(200).json({
      success: true,
      data: adminData
    });

  } catch (error) {
    logger.error('Get admin by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching admin details'
    });
  }
};

// @desc    Update admin permissions
// @route   PUT /api/admin/:id/permissions
// @access  Private (Super Admin only)
const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const updatedBy = req.user._id;

    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    if (admin.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Can only update permissions for approved admins'
      });
    }

    // Update permissions
    admin.permissions = { ...admin.permissions, ...permissions };
    admin.metadata.updatedBy = updatedBy;
    await admin.save();

    logger.info(`Admin permissions updated: ${admin.employeeId}`, {
      adminId: admin._id,
      updatedBy,
      permissions,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Admin permissions updated successfully',
      data: removeSensitiveFields(admin.toObject())
    });

  } catch (error) {
    logger.error('Update admin permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating admin permissions'
    });
  }
};

// @desc    Deactivate admin
// @route   PUT /api/admin/:id/deactivate
// @access  Private (Super Admin only)
const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const deactivatedBy = req.user._id;

    const admin = await Admin.findById(id).populate('user');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // Update admin status
    admin.isActive = false;
    admin.notes = reason ? `Deactivated: ${reason}` : 'Deactivated by super admin';
    admin.metadata.updatedBy = deactivatedBy;
    await admin.save();

    // Update user status
    await User.findByIdAndUpdate(admin.user._id, { 
      status: 'inactive',
      'metadata.updatedBy': deactivatedBy
    });

    logger.info(`Admin deactivated: ${admin.user.email}`, {
      adminId: admin._id,
      userId: admin.user._id,
      deactivatedBy,
      reason,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully',
      data: removeSensitiveFields(admin.toObject())
    });

  } catch (error) {
    logger.error('Deactivate admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deactivating admin'
    });
  }
};

module.exports = {
  getPendingApprovals,
  approveAdmin,
  rejectAdmin,
  getAllAdmins,
  getAdminStats,
  getAdminById,
  updateAdminPermissions,
  deactivateAdmin
};
