const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const { 
  getPagination, 
  formatPaginationResponse,
  hashPassword,
  generateRandomPassword,
  removeSensitiveFields,
  calculateAge,
  formatDate
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, STUDENT_STATUS, BATCH_TYPES } = require('../config/constants');

// @desc    Get all students with pagination, search, and filters
// @route   GET /api/students
// @access  Private (Viewer+)
const getStudents = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      status, 
      batch, 
      course, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionUID: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && Object.values(STUDENT_STATUS).includes(status)) {
      query.status = status;
    }

    // Filter by batch
    if (batch && Object.values(BATCH_TYPES).includes(batch)) {
      query['enrollmentDetails.currentBatch'] = batch;
    }

    // Filter by course
    if (course) {
      query['enrollmentDetails.courses.course'] = course;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const students = await Student.find(query)
      .populate('user', 'email isActive lastLogin')
      .populate('enrollmentDetails.courses.course', 'name code duration')
      .populate('metadata.createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Format response
    const formattedStudents = students.map(student => ({
      ...student,
      fullName: `${student.firstName} ${student.lastName}`,
      age: calculateAge(student.dateOfBirth),
      fullAddress: `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}`,
      formattedAdmissionDate: formatDate(student.enrollmentDetails.admissionDate)
    }));

    const response = formatPaginationResponse(formattedStudents, total, pageNum, limitNum);

    logger.info(`Students list retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: students.length
    });

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving students'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Editor+)
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      parentDetails,
      academicDetails,
      enrollmentDetails,
      profileImage,
      documents,
      notes,
      metadata
    } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Student with this email already exists'
      });
    }

    // Check if phone number already exists
    const existingPhone = await Student.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: 'Student with this phone number already exists'
      });
    }

    // Create user account for student
    const randomPassword = generateRandomPassword(8);
    const hashedPassword = await hashPassword(randomPassword);

    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: USER_ROLES.STUDENT,
      isActive: true,
      createdBy: req.user.id
    };

    const user = await User.create(userData);

    // Create student record
    const studentData = {
      user: user._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender,
      address,
      parentDetails,
      academicDetails,
      enrollmentDetails: {
        ...enrollmentDetails,
        admissionDate: enrollmentDetails?.admissionDate || new Date()
      },
      profileImage,
      documents: documents || [],
      notes: notes || [],
      metadata: {
        ...metadata,
        createdBy: req.user.id,
        source: metadata?.source || 'offline'
      }
    };

    const student = await Student.create(studentData);

    // Populate the created student
    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'email isActive')
      .populate('enrollmentDetails.courses.course', 'name code duration')
      .populate('metadata.createdBy', 'firstName lastName');

    logger.info(`New student created by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: student._id,
      admissionUID: student.admissionUID,
      email: student.email
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student: populatedStudent,
        temporaryPassword: randomPassword // Send this via email in production
      }
    });

  } catch (error) {
    logger.error('Error in createStudent:', error);
    
    // Handle validation errors
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
      error: 'Server error while creating student'
    });
  }
};

// @desc    Get student details by ID
// @route   GET /api/students/:id
// @access  Private (Viewer+)
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('user', 'email isActive lastLogin createdAt')
      .populate('enrollmentDetails.courses.course', 'name code duration fees')
      .populate('notes.addedBy', 'firstName lastName')
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('metadata.updatedBy', 'firstName lastName');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if user has permission to view this student
    if (req.user.role === USER_ROLES.STUDENT && student.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Add computed fields
    const studentData = {
      ...student.toObject(),
      fullName: `${student.firstName} ${student.lastName}`,
      age: calculateAge(student.dateOfBirth),
      fullAddress: `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}`,
      formattedAdmissionDate: formatDate(student.enrollmentDetails.admissionDate),
      formattedDateOfBirth: formatDate(student.dateOfBirth)
    };

    logger.info(`Student details retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: id
    });

    res.status(200).json({
      success: true,
      message: 'Student details retrieved successfully',
      data: studentData
    });

  } catch (error) {
    logger.error('Error in getStudentById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving student details'
    });
  }
};

// @desc    Update student information
// @route   PUT /api/students/:id
// @access  Private (Editor+)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== student.email) {
      const existingStudent = await Student.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Student with this email already exists'
        });
      }
    }

    // Check for phone uniqueness if phone is being updated
    if (updateData.phone && updateData.phone !== student.phone) {
      const existingPhone = await Student.findOne({ 
        phone: updateData.phone,
        _id: { $ne: id }
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          error: 'Student with this phone number already exists'
        });
      }
    }

    // Add metadata
    updateData.metadata = {
      ...student.metadata,
      updatedBy: req.user.id
    };

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'email isActive')
    .populate('enrollmentDetails.courses.course', 'name code duration')
    .populate('metadata.createdBy', 'firstName lastName')
    .populate('metadata.updatedBy', 'firstName lastName');

    // Update associated user if email or name changed
    if (updateData.email || updateData.firstName || updateData.lastName) {
      const userUpdateData = {};
      if (updateData.email) userUpdateData.email = updateData.email.toLowerCase();
      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      
      await User.findByIdAndUpdate(student.user, userUpdateData);
    }

    logger.info(`Student updated by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    logger.error('Error in updateStudent:', error);
    
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
      error: 'Server error while updating student'
    });
  }
};

// @desc    Delete student (soft delete)
// @route   DELETE /api/students/:id
// @access  Private (Admin+)
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Soft delete - update status to inactive
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { 
        status: STUDENT_STATUS.INACTIVE,
        'metadata.updatedBy': req.user.id
      },
      { new: true }
    );

    // Deactivate associated user account
    await User.findByIdAndUpdate(student.user, { isActive: false });

    logger.info(`Student deleted by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: id,
      admissionUID: student.admissionUID
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: updatedStudent
    });

  } catch (error) {
    logger.error('Error in deleteStudent:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting student'
    });
  }
};

// @desc    Get current student profile (for student users)
// @route   GET /api/students/me
// @access  Private (Student)
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'email isActive lastLogin createdAt')
      .populate('enrollmentDetails.courses.course', 'name code duration fees')
      .populate('notes.addedBy', 'firstName lastName');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Add computed fields
    const studentData = {
      ...student.toObject(),
      fullName: `${student.firstName} ${student.lastName}`,
      age: calculateAge(student.dateOfBirth),
      fullAddress: `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}`,
      formattedAdmissionDate: formatDate(student.enrollmentDetails.admissionDate),
      formattedDateOfBirth: formatDate(student.dateOfBirth)
    };

    logger.info(`Student profile retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: student._id
    });

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: studentData
    });

  } catch (error) {
    logger.error('Error in getMyProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving profile'
    });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/students/:id/dashboard
// @access  Private (Viewer+ or own profile)
const getStudentDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('enrollmentDetails.courses.course', 'name code duration fees');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check permissions
    if (req.user.role === USER_ROLES.STUDENT && student.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Prepare dashboard data
    const dashboardData = {
      basicInfo: {
        fullName: `${student.firstName} ${student.lastName}`,
        admissionUID: student.admissionUID,
        email: student.email,
        phone: student.phone,
        currentBatch: student.enrollmentDetails.currentBatch,
        status: student.status
      },
      attendance: {
        totalClasses: student.attendance.totalClasses,
        attendedClasses: student.attendance.attendedClasses,
        attendancePercentage: student.attendance.attendancePercentage,
        lastUpdated: student.attendance.lastUpdated
      },
      fees: {
        totalFees: student.fees.totalFees,
        paidFees: student.fees.paidFees,
        pendingFees: student.fees.pendingFees,
        lastPaymentDate: student.fees.lastPaymentDate
      },
      performance: {
        overallGrade: student.performance.overallGrade,
        assignments: student.performance.assignments,
        tests: student.performance.tests
      },
      courses: student.enrollmentDetails.courses.map(course => ({
        course: course.course,
        batch: course.batch,
        status: course.status,
        progress: course.progress,
        startDate: course.startDate,
        expectedEndDate: course.expectedEndDate
      })),
      recentNotes: student.notes.slice(-5).reverse() // Last 5 notes
    };

    logger.info(`Student dashboard retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: id
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    logger.error('Error in getStudentDashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving dashboard data'
    });
  }
};

// @desc    Enroll student in course
// @route   POST /api/students/:id/enroll
// @access  Private (Editor+)
const enrollStudentInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, batch, startDate, expectedEndDate } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = student.enrollmentDetails.courses.find(
      c => c.course.toString() === courseId && c.status !== 'dropped'
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Student is already enrolled in this course'
      });
    }

    // Enroll student
    await student.enrollInCourse(courseId, batch, startDate, expectedEndDate);

    // Get updated student with populated course data
    const updatedStudent = await Student.findById(id)
      .populate('enrollmentDetails.courses.course', 'name code duration fees');

    logger.info(`Student enrolled in course by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: id,
      courseId,
      batch
    });

    res.status(200).json({
      success: true,
      message: 'Student enrolled in course successfully',
      data: updatedStudent
    });

  } catch (error) {
    logger.error('Error in enrollStudentInCourse:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while enrolling student'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private (Viewer+)
const getStudentStats = async (req, res) => {
  try {
    const stats = await Student.getStats();

    logger.info(`Student statistics retrieved by user ${req.user.id}`, {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Student statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error in getStudentStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving statistics'
    });
  }
};

// @desc    Bulk create students
// @route   POST /api/students/bulk-create
// @access  Private (Admin+)
const bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Students array is required and cannot be empty'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: students.length
    };

    for (let i = 0; i < students.length; i++) {
      try {
        const studentData = students[i];
        
        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          email: studentData.email.toLowerCase() 
        });
        
        if (existingStudent) {
          results.failed.push({
            index: i,
            data: studentData,
            error: 'Student with this email already exists'
          });
          continue;
        }

        // Create user account
        const randomPassword = generateRandomPassword(8);
        const hashedPassword = await hashPassword(randomPassword);

        const userData = {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email.toLowerCase(),
          password: hashedPassword,
          role: USER_ROLES.STUDENT,
          isActive: true,
          createdBy: req.user.id
        };

        const user = await User.create(userData);

        // Create student
        const newStudentData = {
          ...studentData,
          user: user._id,
          email: studentData.email.toLowerCase(),
          metadata: {
            createdBy: req.user.id,
            source: 'bulk_import'
          }
        };

        const student = await Student.create(newStudentData);

        results.successful.push({
          index: i,
          student: {
            id: student._id,
            admissionUID: student.admissionUID,
            fullName: `${student.firstName} ${student.lastName}`,
            email: student.email
          },
          temporaryPassword: randomPassword
        });

      } catch (error) {
        results.failed.push({
          index: i,
          data: students[i],
          error: error.message
        });
      }
    }

    logger.info(`Bulk student creation by user ${req.user.id}`, {
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
    logger.error('Error in bulkCreateStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during bulk creation'
    });
  }
};

module.exports = {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyProfile,
  getStudentDashboard,
  enrollStudentInCourse,
  getStudentStats,
  bulkCreateStudents
};
