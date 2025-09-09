const Course = require('../models/Course');
const Student = require('../models/Student');
const { escapeRegex } = require('../utils/regexHelpers');
const User = require('../models/User');
const { 
  getPagination, 
  formatPaginationResponse,
  formatDate
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, COURSE_STATUS, BATCH_TYPES } = require('../config/constants');

// @desc    Get all courses with pagination, search, and filters
// @route   GET /api/courses
// @access  Private (Viewer+)
const getCourses = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      category, 
      level, 
      status, 
      available,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by level
    if (level) {
      query.level = level;
    }

    // Filter by status
    if (status && Object.values(COURSE_STATUS).includes(status)) {
      query.status = status;
    }

    // Filter by availability
    if (available === 'true') {
      query.status = 'active';
      query['enrollment.isOpen'] = true;
      query.$expr = { $lt: ['$enrollment.currentStudents', '$enrollment.maxStudents'] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const courses = await Course.find(query)
      .populate('instructor.primary', 'firstName lastName email')
      .populate('instructor.assistants', 'firstName lastName email')
      .populate('metadata.createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    // Format response with computed fields
    const formattedCourses = courses.map(course => ({
      ...course,
      totalDurationHours: course.modules?.reduce((total, module) => {
        return total + (module.topics?.reduce((moduleTotal, topic) => {
          return moduleTotal + (topic.duration || 0);
        }, 0) || 0);
      }, 0) || 0,
      completionRate: course.statistics?.totalEnrollments > 0 
        ? Math.round((course.statistics.completedStudents / course.statistics.totalEnrollments) * 100)
        : 0,
      enrollmentStatus: !course.enrollment?.isOpen ? 'closed' 
        : course.enrollment.currentStudents >= course.enrollment.maxStudents ? 'full' 
        : 'open',
      availableSlots: Math.max(0, (course.enrollment?.maxStudents || 0) - (course.enrollment?.currentStudents || 0)),
      formattedCreatedAt: formatDate(course.createdAt)
    }));

    const response = formatPaginationResponse(formattedCourses, total, pageNum, limitNum);

    logger.info(`Courses list retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: courses.length
    });

    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getCourses:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving courses'
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Editor+)
const createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      metadata: {
        createdBy: req.user.id,
        version: 1
      }
    };

    // Check if course with same name already exists
    const existingCourse = await Course.findOne({ 
      name: { $regex: new RegExp(`^${courseData.name}$`, 'i') }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course with this name already exists'
      });
    }

    // Check if course code already exists (if provided)
    if (courseData.code) {
      const existingCode = await Course.findOne({ code: courseData.code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          error: 'Course with this code already exists'
        });
      }
    }

    const course = await Course.create(courseData);

    // Populate the created course
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor.primary', 'firstName lastName email')
      .populate('instructor.assistants', 'firstName lastName email')
      .populate('metadata.createdBy', 'firstName lastName');

    logger.info(`New course created by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: course._id,
      courseName: course.name,
      courseCode: course.code
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });

  } catch (error) {
    logger.error('Error in createCourse:', error);
    
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
      error: 'Server error while creating course'
    });
  }
};

// @desc    Get course details by ID
// @route   GET /api/courses/:id
// @access  Private (Viewer+)
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor.primary', 'firstName lastName email phone')
      .populate('instructor.assistants', 'firstName lastName email phone')
      .populate('prerequisites.course', 'name code')
      .populate('reviews.student', 'firstName lastName')
      .populate('metadata.createdBy', 'firstName lastName')
      .populate('metadata.updatedBy', 'firstName lastName')
      .populate('metadata.reviewedBy', 'firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Add computed fields
    const courseData = {
      ...course.toObject(),
      totalDurationHours: course.modules?.reduce((total, module) => {
        return total + (module.topics?.reduce((moduleTotal, topic) => {
          return moduleTotal + (topic.duration || 0);
        }, 0) || 0);
      }, 0) || 0,
      completionRate: course.statistics?.totalEnrollments > 0 
        ? Math.round((course.statistics.completedStudents / course.statistics.totalEnrollments) * 100)
        : 0,
      enrollmentStatus: !course.enrollment?.isOpen ? 'closed' 
        : course.enrollment.currentStudents >= course.enrollment.maxStudents ? 'full' 
        : 'open',
      availableSlots: Math.max(0, (course.enrollment?.maxStudents || 0) - (course.enrollment?.currentStudents || 0)),
      formattedCreatedAt: formatDate(course.createdAt),
      formattedUpdatedAt: formatDate(course.updatedAt)
    };

    logger.info(`Course details retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id
    });

    res.status(200).json({
      success: true,
      message: 'Course details retrieved successfully',
      data: courseData
    });

  } catch (error) {
    logger.error('Error in getCourseById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving course details'
    });
  }
};

// @desc    Update course information
// @route   PUT /api/courses/:id
// @access  Private (Editor+)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check for name uniqueness if name is being updated
    iif (updateData.name && updateData.name !== course.name) {
  // Escape user data for regex
  const safeName = escapeRegex(updateData.name);
  // Build ^...$ pattern as a string
  const pattern = `^${safeName}$`;

  const existingCourse = await Course.findOne({
    name: { $regex: pattern, $options: 'i' }, // no RegExp, just a string!
    _id: { $ne: id }
  });
}
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          error: 'Course with this name already exists'
        });
      }
    }

    // Check for code uniqueness if code is being updated
    if (updateData.code && updateData.code !== course.code) {
      const existingCode = await Course.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingCode) {
        return res.status(400).json({
          success: false,
          error: 'Course with this code already exists'
        });
      }
    }

    // Add metadata
    updateData.metadata = {
      ...course.metadata,
      updatedBy: req.user.id,
      version: (course.metadata?.version || 1) + 1
    };

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('instructor.primary', 'firstName lastName email')
    .populate('instructor.assistants', 'firstName lastName email')
    .populate('metadata.createdBy', 'firstName lastName')
    .populate('metadata.updatedBy', 'firstName lastName');

    logger.info(`Course updated by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    logger.error('Error in updateCourse:', error);
    
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
      error: 'Server error while updating course'
    });
  }
};

// @desc    Delete course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private (Admin+)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course has enrolled students
    const enrolledStudents = await Student.countDocuments({
      'enrollmentDetails.courses.course': id,
      'enrollmentDetails.courses.status': { $in: ['enrolled', 'in_progress'] }
    });

    if (enrolledStudents > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete course. ${enrolledStudents} students are currently enrolled.`
      });
    }

    // Soft delete - update status to inactive
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { 
        status: COURSE_STATUS.INACTIVE,
        'enrollment.isOpen': false,
        'metadata.updatedBy': req.user.id
      },
      { new: true }
    );

    logger.info(`Course deleted by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      courseName: course.name
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: updatedCourse
    });

  } catch (error) {
    logger.error('Error in deleteCourse:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting course'
    });
  }
};

// @desc    Get enrolled students for a course
// @route   GET /api/courses/:id/students
// @access  Private (Viewer+)
const getCourseStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, status, batch } = req.query;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query for students enrolled in this course
    let query = {
      'enrollmentDetails.courses.course': id
    };

    // Filter by enrollment status
    if (status) {
      query['enrollmentDetails.courses.status'] = status;
    }

    // Filter by batch
    if (batch) {
      query['enrollmentDetails.courses.batch'] = batch;
    }

    const students = await Student.find(query)
      .populate('user', 'email isActive lastLogin')
      .populate('enrollmentDetails.courses.course', 'name code')
      .sort({ 'enrollmentDetails.admissionDate': -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Student.countDocuments(query);

    // Format student data with course-specific information
    const formattedStudents = students.map(student => {
      const courseEnrollment = student.enrollmentDetails.courses.find(
        c => c.course._id.toString() === id
      );

      return {
        _id: student._id,
        admissionUID: student.admissionUID,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        fullName: `${student.firstName} ${student.lastName}`,
        courseEnrollment: {
          enrollmentDate: courseEnrollment?.enrollmentDate,
          batch: courseEnrollment?.batch,
          status: courseEnrollment?.status,
          progress: courseEnrollment?.progress,
          startDate: courseEnrollment?.startDate,
          expectedEndDate: courseEnrollment?.expectedEndDate,
          actualEndDate: courseEnrollment?.actualEndDate
        },
        attendance: student.attendance,
        performance: student.performance,
        status: student.status
      };
    });

    const response = formatPaginationResponse(formattedStudents, total, pageNum, limitNum);

    logger.info(`Course students retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      resultCount: students.length
    });

    res.status(200).json({
      success: true,
      message: 'Course students retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getCourseStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving course students'
    });
  }
};

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Private (Editor+)
const addCourseModule = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Add module using the instance method
    await course.addModule(moduleData);

    // Get updated course with populated data
    const updatedCourse = await Course.findById(id)
      .populate('instructor.primary', 'firstName lastName')
      .populate('metadata.updatedBy', 'firstName lastName');

    logger.info(`Module added to course by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      moduleName: moduleData.name
    });

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: updatedCourse
    });

  } catch (error) {
    logger.error('Error in addCourseModule:', error);
    
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
      error: 'Server error while adding module'
    });
  }
};

// @desc    Get course modules
// @route   GET /api/courses/:id/modules
// @access  Private (Viewer+)
const getCourseModules = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select('modules name code');
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Sort modules by order
    const sortedModules = course.modules.sort((a, b) => a.order - b.order);

    // Calculate total duration for each module
    const modulesWithDuration = sortedModules.map(module => ({
      ...module.toObject(),
      totalDuration: module.topics?.reduce((total, topic) => total + (topic.duration || 0), 0) || 0,
      totalTopics: module.topics?.length || 0,
      totalAssignments: module.assignments?.length || 0,
      totalAssessments: module.assessments?.length || 0
    }));

    logger.info(`Course modules retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      moduleCount: modulesWithDuration.length
    });

    res.status(200).json({
      success: true,
      message: 'Course modules retrieved successfully',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          code: course.code
        },
        modules: modulesWithDuration,
        totalModules: modulesWithDuration.length,
        totalDuration: modulesWithDuration.reduce((total, module) => total + module.totalDuration, 0)
      }
    });

  } catch (error) {
    logger.error('Error in getCourseModules:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving course modules'
    });
  }
};

// @desc    Update course module
// @route   PUT /api/courses/:id/modules/:moduleId
// @access  Private (Editor+)
const updateCourseModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const updateData = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Find and update the module
    const moduleIndex = course.modules.findIndex(
      module => module._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Update module data
    course.modules[moduleIndex] = {
      ...course.modules[moduleIndex].toObject(),
      ...updateData
    };

    // Update metadata
    course.metadata.updatedBy = req.user.id;
    course.metadata.version = (course.metadata?.version || 1) + 1;

    await course.save();

    logger.info(`Course module updated by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      moduleId,
      moduleName: updateData.name || course.modules[moduleIndex].name
    });

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: course.modules[moduleIndex]
    });

  } catch (error) {
    logger.error('Error in updateCourseModule:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating module'
    });
  }
};

// @desc    Delete course module
// @route   DELETE /api/courses/:id/modules/:moduleId
// @access  Private (Editor+)
const deleteCourseModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Find module
    const moduleIndex = course.modules.findIndex(
      module => module._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const moduleName = course.modules[moduleIndex].name;

    // Remove module
    course.modules.splice(moduleIndex, 1);

    // Reorder remaining modules
    course.modules.forEach((module, index) => {
      module.order = index + 1;
    });

    // Update metadata
    course.metadata.updatedBy = req.user.id;
    course.metadata.version = (course.metadata?.version || 1) + 1;

    await course.save();

    logger.info(`Course module deleted by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id,
      moduleId,
      moduleName
    });

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteCourseModule:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting module'
    });
  }
};

// @desc    Get course schedule
// @route   GET /api/courses/:id/schedule
// @access  Private (Viewer+)
const getCourseSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select('name code schedule');
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    logger.info(`Course schedule retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id
    });

    res.status(200).json({
      success: true,
      message: 'Course schedule retrieved successfully',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          code: course.code
        },
        schedule: course.schedule
      }
    });

  } catch (error) {
    logger.error('Error in getCourseSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving course schedule'
    });
  }
};

// @desc    Create/Update course schedule
// @route   POST /api/courses/:id/schedule
// @access  Private (Editor+)
const updateCourseSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleData = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Update schedule
    course.schedule = scheduleData;
    course.metadata.updatedBy = req.user.id;
    course.metadata.version = (course.metadata?.version || 1) + 1;

    await course.save();

    logger.info(`Course schedule updated by user ${req.user.id}`, {
      userId: req.user.id,
      courseId: id
    });

    res.status(200).json({
      success: true,
      message: 'Course schedule updated successfully',
      data: course.schedule
    });

  } catch (error) {
    logger.error('Error in updateCourseSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating course schedule'
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Viewer+)
const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.getStats();

    logger.info(`Course statistics retrieved by user ${req.user.id}`, {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Course statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error in getCourseStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving statistics'
    });
  }
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  addCourseModule,
  getCourseModules,
  updateCourseModule,
  deleteCourseModule,
  getCourseSchedule,
  updateCourseSchedule,
  getCourseStats
};
