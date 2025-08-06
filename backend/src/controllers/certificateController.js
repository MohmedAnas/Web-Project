const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { 
  getPagination, 
  formatPaginationResponse,
  formatDate
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, CERTIFICATE_STATUS } = require('../config/constants');

// @desc    Get all certificates with pagination and filters
// @route   GET /api/certificates
// @access  Private (Viewer+)
const getCertificates = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      status, 
      certificateType,
      student,
      course,
      isRevoked,
      sortBy = 'issueDate', 
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
        { certificateNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status && Object.values(CERTIFICATE_STATUS).includes(status)) {
      query.status = status;
    }
    if (certificateType) query.certificateType = certificateType;
    if (student) query.student = student;
    if (course) query.course = course;
    if (isRevoked !== undefined) query['revocation.isRevoked'] = isRevoked === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const certificates = await Certificate.find(query)
      .populate('student', 'firstName lastName admissionUID email')
      .populate('course', 'name code duration')
      .populate('audit.generatedBy', 'firstName lastName')
      .populate('audit.issuedBy', 'firstName lastName')
      .populate('revocation.revokedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Certificate.countDocuments(query);

    // Format response
    const formattedCertificates = certificates.map(cert => ({
      ...cert,
      studentName: `${cert.student.firstName} ${cert.student.lastName}`,
      formattedIssueDate: formatDate(cert.issueDate),
      formattedValidUntil: cert.validUntil ? formatDate(cert.validUntil) : 'No expiry',
      isValid: !cert.revocation.isRevoked && cert.status === CERTIFICATE_STATUS.ISSUED,
      daysUntilExpiry: cert.validUntil ? Math.max(0, Math.ceil((cert.validUntil - new Date()) / (1000 * 60 * 60 * 24))) : null,
      certificateAge: Math.floor((new Date() - cert.issueDate) / (1000 * 60 * 60 * 24))
    }));

    const response = formatPaginationResponse(formattedCertificates, total, pageNum, limitNum);

    logger.info(`Certificates list retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: certificates.length
    });

    res.status(200).json({
      success: true,
      message: 'Certificates retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getCertificates:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving certificates'
    });
  }
};

// @desc    Issue new certificate
// @route   POST /api/certificates
// @access  Private (Editor+)
const issueCertificate = async (req, res) => {
  try {
    const certificateData = {
      ...req.body,
      audit: {
        generatedBy: req.user.id
      }
    };

    // Verify student exists
    const student = await Student.findById(certificateData.student);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Verify course exists
    const course = await Course.findById(certificateData.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if certificate already exists for this student and course
    const existingCertificate = await Certificate.findOne({
      student: certificateData.student,
      course: certificateData.course,
      certificateType: certificateData.certificateType || 'completion',
      'revocation.isRevoked': false
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        error: 'Certificate already exists for this student and course'
      });
    }

    // Set course details from enrollment
    const studentEnrollment = student.enrollmentDetails.courses.find(
      c => c.course.toString() === certificateData.course
    );

    if (studentEnrollment) {
      certificateData.courseDetails = {
        duration: Math.ceil((studentEnrollment.expectedEndDate - studentEnrollment.startDate) / (1000 * 60 * 60 * 24)),
        startDate: studentEnrollment.startDate,
        endDate: studentEnrollment.actualEndDate || studentEnrollment.expectedEndDate,
        attendancePercentage: student.attendance.attendancePercentage || 0
      };
    }

    // Set grade information
    if (student.performance && student.performance.overallGrade) {
      certificateData.grade = {
        letter: student.performance.overallGrade,
        percentage: student.performance.tests.averageScore || 0
      };
    }

    const certificate = await Certificate.create(certificateData);

    // Auto-approve and issue if user has admin privileges
    if (req.user.role === USER_ROLES.SUPER_ADMIN || req.user.role === USER_ROLES.ADMIN) {
      certificate.audit.approvedBy = req.user.id;
      certificate.audit.approvedAt = new Date();
      await certificate.issueCertificate(req.user.id);
      await certificate.generateCertificate();
    }

    // Populate the created certificate
    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate('student', 'firstName lastName admissionUID email')
      .populate('course', 'name code duration')
      .populate('audit.generatedBy', 'firstName lastName')
      .populate('audit.issuedBy', 'firstName lastName');

    logger.info(`New certificate issued by user ${req.user.id}`, {
      userId: req.user.id,
      certificateId: certificate._id,
      certificateNumber: certificate.certificateNumber,
      studentId: certificateData.student
    });

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: populatedCertificate
    });

  } catch (error) {
    logger.error('Error in issueCertificate:', error);
    
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
      error: 'Server error while issuing certificate'
    });
  }
};

// @desc    Get certificate details by ID
// @route   GET /api/certificates/:id
// @access  Private (Viewer+)
const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('student', 'firstName lastName admissionUID email phone address')
      .populate('course', 'name code description duration')
      .populate('audit.generatedBy', 'firstName lastName email')
      .populate('audit.approvedBy', 'firstName lastName email')
      .populate('audit.issuedBy', 'firstName lastName email')
      .populate('revocation.revokedBy', 'firstName lastName email')
      .populate('notes.addedBy', 'firstName lastName');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Add computed fields
    const certificateData = {
      ...certificate.toObject(),
      studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
      formattedIssueDate: formatDate(certificate.issueDate),
      formattedValidFrom: formatDate(certificate.validFrom),
      formattedValidUntil: certificate.validUntil ? formatDate(certificate.validUntil) : 'No expiry',
      isValid: !certificate.revocation.isRevoked && certificate.status === CERTIFICATE_STATUS.ISSUED,
      daysUntilExpiry: certificate.validUntil ? 
        Math.max(0, Math.ceil((certificate.validUntil - new Date()) / (1000 * 60 * 60 * 24))) : null,
      certificateAge: Math.floor((new Date() - certificate.issueDate) / (1000 * 60 * 60 * 24)),
      canDownload: certificate.status === CERTIFICATE_STATUS.ISSUED && certificate.file.url
    };

    logger.info(`Certificate details retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      certificateId: id
    });

    res.status(200).json({
      success: true,
      message: 'Certificate details retrieved successfully',
      data: certificateData
    });

  } catch (error) {
    logger.error('Error in getCertificateById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving certificate details'
    });
  }
};

// @desc    Update certificate information
// @route   PUT /api/certificates/:id
// @access  Private (Editor+)
const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Check if certificate is already issued and prevent certain updates
    if (certificate.status === CERTIFICATE_STATUS.ISSUED) {
      const restrictedFields = ['student', 'course', 'certificateNumber', 'issueDate'];
      const hasRestrictedUpdate = restrictedFields.some(field => updateData[field]);
      
      if (hasRestrictedUpdate) {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify core details of an issued certificate'
        });
      }
    }

    // Add audit information
    updateData.audit = {
      ...certificate.audit,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date(),
      version: (certificate.audit?.version || 1) + 1
    };

    // Update certificate
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('student', 'firstName lastName admissionUID')
    .populate('course', 'name code')
    .populate('audit.lastModifiedBy', 'firstName lastName');

    logger.info(`Certificate updated by user ${req.user.id}`, {
      userId: req.user.id,
      certificateId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: updatedCertificate
    });

  } catch (error) {
    logger.error('Error in updateCertificate:', error);
    
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
      error: 'Server error while updating certificate'
    });
  }
};

// @desc    Revoke certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Admin+)
const revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    if (certificate.revocation.isRevoked) {
      return res.status(400).json({
        success: false,
        error: 'Certificate is already revoked'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Revocation reason is required'
      });
    }

    // Revoke certificate
    await certificate.revokeCertificate(req.user.id, reason);

    // Get updated certificate
    const revokedCertificate = await Certificate.findById(id)
      .populate('student', 'firstName lastName admissionUID')
      .populate('course', 'name code')
      .populate('revocation.revokedBy', 'firstName lastName');

    logger.info(`Certificate revoked by user ${req.user.id}`, {
      userId: req.user.id,
      certificateId: id,
      certificateNumber: certificate.certificateNumber,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: revokedCertificate
    });

  } catch (error) {
    logger.error('Error in revokeCertificate:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while revoking certificate'
    });
  }
};

// @desc    Get student certificates
// @route   GET /api/certificates/student/:studentId
// @access  Private (Viewer+ or own certificates)
const getStudentCertificates = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check permissions - students can only view their own certificates
    if (req.user.role === USER_ROLES.STUDENT && student.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const certificates = await Certificate.findByStudent(studentId);

    // Calculate summary
    const summary = {
      total: certificates.length,
      issued: certificates.filter(c => c.status === CERTIFICATE_STATUS.ISSUED).length,
      pending: certificates.filter(c => c.status === CERTIFICATE_STATUS.PENDING).length,
      revoked: certificates.filter(c => c.revocation.isRevoked).length
    };

    logger.info(`Student certificates retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId,
      certificateCount: certificates.length
    });

    res.status(200).json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: {
        student: {
          _id: student._id,
          fullName: `${student.firstName} ${student.lastName}`,
          admissionUID: student.admissionUID,
          email: student.email
        },
        certificates,
        summary
      }
    });

  } catch (error) {
    logger.error('Error in getStudentCertificates:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving student certificates'
    });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/download/:id
// @access  Private (Viewer+ or own certificate)
const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('student', 'firstName lastName admissionUID user')
      .populate('course', 'name code');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Check permissions
    if (req.user.role === USER_ROLES.STUDENT && 
        certificate.student.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if certificate is issued
    if (certificate.status !== CERTIFICATE_STATUS.ISSUED) {
      return res.status(400).json({
        success: false,
        error: 'Certificate is not yet issued'
      });
    }

    // Check if certificate is revoked
    if (certificate.revocation.isRevoked) {
      return res.status(400).json({
        success: false,
        error: 'Certificate has been revoked'
      });
    }

    // Generate certificate if not already generated
    if (!certificate.file.url) {
      await certificate.generateCertificate();
    }

    // Track download
    await certificate.trackDownload();

    logger.info(`Certificate downloaded by user ${req.user.id}`, {
      userId: req.user.id,
      certificateId: id,
      certificateNumber: certificate.certificateNumber
    });

    // In a real implementation, you would serve the actual PDF file
    // For now, we'll return the download information
    res.status(200).json({
      success: true,
      message: 'Certificate ready for download',
      data: {
        certificateNumber: certificate.certificateNumber,
        downloadUrl: certificate.file.url,
        filename: certificate.file.filename,
        studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
        courseName: certificate.course.name,
        issueDate: formatDate(certificate.issueDate)
      }
    });

  } catch (error) {
    logger.error('Error in downloadCertificate:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while downloading certificate'
    });
  }
};

module.exports = {
  getCertificates,
  issueCertificate,
  getCertificateById,
  updateCertificate,
  revokeCertificate,
  getStudentCertificates,
  downloadCertificate
};
