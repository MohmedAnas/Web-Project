const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { 
  getPagination, 
  formatPaginationResponse,
  formatDate
} = require('../utils/helpers');
const logger = require('../utils/logger');
const { USER_ROLES, ATTENDANCE_STATUS, BATCH_TYPES } = require('../config/constants');

// @desc    Get attendance dashboard with all registered students
// @route   GET /api/attendance/dashboard
// @access  Private (Viewer+)
const getAttendanceDashboard = async (req, res) => {
  try {
    const { course, date, batch } = req.query;

    if (!course) {
      return res.status(400).json({
        success: false,
        error: 'Course ID is required'
      });
    }

    // Use today's date if not provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Check if it's Sunday
    if (targetDate.getDay() === 0) {
      return res.status(400).json({
        success: false,
        error: 'Attendance dashboard is not available on Sundays'
      });
    }

    // Verify course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const dashboardData = await Attendance.getAttendanceDashboard(course, targetDate, batch);

    // Add summary statistics
    const presentCount = dashboardData.students.filter(s => s.attendance.status === 'present').length;
    const absentCount = dashboardData.students.filter(s => s.attendance.status === 'absent').length;
    const lateCount = dashboardData.students.filter(s => s.attendance.status === 'late').length;
    const notMarkedCount = dashboardData.students.filter(s => s.attendance.status === 'not_marked').length;

    const summary = {
      totalStudents: dashboardData.totalStudents,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: dashboardData.students.filter(s => s.attendance.status === 'excused').length,
      notMarked: notMarkedCount,
      attendanceRate: dashboardData.totalStudents > 0 ? 
        Math.round(((presentCount + lateCount) / dashboardData.totalStudents) * 100) : 0
    };

    logger.info(`Attendance dashboard retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      course,
      date: targetDate,
      batch,
      totalStudents: dashboardData.totalStudents
    });

    res.status(200).json({
      success: true,
      message: 'Attendance dashboard retrieved successfully',
      data: {
        ...dashboardData,
        course: {
          _id: courseDoc._id,
          name: courseDoc.name,
          code: courseDoc.code
        },
        summary,
        formattedDate: formatDate(targetDate),
        dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' }),
        isToday: targetDate.toDateString() === new Date().toDateString()
      }
    });

  } catch (error) {
    logger.error('Error in getAttendanceDashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving attendance dashboard'
    });
  }
};

// @desc    Get all attendance records with pagination and filters
// @route   GET /api/attendance
// @access  Private (Viewer+)
const getAttendanceRecords = async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      course, 
      student, 
      batch, 
      status, 
      startDate, 
      endDate,
      academicYear,
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    if (course) query.course = course;
    if (student) query.student = student;
    if (batch) query.batch = batch;
    if (status && Object.values(ATTENDANCE_STATUS).includes(status)) {
      query.status = status;
    }
    if (academicYear) query['metadata.academicYear'] = academicYear;

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'firstName lastName admissionUID email')
      .populate('course', 'name code')
      .populate('markedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Attendance.countDocuments(query);

    // Format response
    const formattedRecords = attendanceRecords.map(record => ({
      ...record,
      formattedDate: formatDate(record.date),
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      markedByName: `${record.markedBy.firstName} ${record.markedBy.lastName}`
    }));

    const response = formatPaginationResponse(formattedRecords, total, pageNum, limitNum);

    logger.info(`Attendance records retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      query: req.query,
      resultCount: attendanceRecords.length
    });

    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      ...response
    });

  } catch (error) {
    logger.error('Error in getAttendanceRecords:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving attendance records'
    });
  }
};

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private (Editor+)
const markAttendance = async (req, res) => {
  try {
    const attendanceData = {
      ...req.body,
      markedBy: req.user.id,
      markedAt: new Date()
    };

    // Verify student exists
    const student = await Student.findById(attendanceData.student);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Verify course exists
    const course = await Course.findById(attendanceData.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      student: attendanceData.student,
      course: attendanceData.course,
      date: {
        $gte: new Date(attendanceData.date).setHours(0, 0, 0, 0),
        $lt: new Date(attendanceData.date).setHours(23, 59, 59, 999)
      }
    });

    let attendance;
    if (existingAttendance) {
      // Update existing attendance
      await existingAttendance.modifyAttendance(
        attendanceData.status,
        req.user.id,
        'Updated via attendance marking'
      );
      attendance = existingAttendance;
    } else {
      // Create new attendance record
      attendance = await Attendance.create(attendanceData);
    }

    // Populate the attendance record
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'firstName lastName admissionUID')
      .populate('course', 'name code')
      .populate('markedBy', 'firstName lastName');

    logger.info(`Attendance marked by user ${req.user.id}`, {
      userId: req.user.id,
      studentId: attendanceData.student,
      courseId: attendanceData.course,
      status: attendanceData.status,
      date: attendanceData.date
    });

    res.status(existingAttendance ? 200 : 201).json({
      success: true,
      message: existingAttendance ? 'Attendance updated successfully' : 'Attendance marked successfully',
      data: populatedAttendance
    });

  } catch (error) {
    logger.error('Error in markAttendance:', error);
    
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
      error: 'Server error while marking attendance'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Editor+)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    // If status is being changed, use the modify method to track changes
    if (updateData.status && updateData.status !== attendance.status) {
      await attendance.modifyAttendance(
        updateData.status,
        req.user.id,
        updateData.modificationReason || 'Updated via API'
      );
      delete updateData.status; // Remove from updateData as it's already handled
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'modificationReason') {
        attendance[key] = updateData[key];
      }
    });

    await attendance.save();

    // Populate the updated attendance
    const updatedAttendance = await Attendance.findById(id)
      .populate('student', 'firstName lastName admissionUID')
      .populate('course', 'name code')
      .populate('markedBy', 'firstName lastName');

    logger.info(`Attendance updated by user ${req.user.id}`, {
      userId: req.user.id,
      attendanceId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: updatedAttendance
    });

  } catch (error) {
    logger.error('Error in updateAttendance:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating attendance'
    });
  }
};

// @desc    Get student attendance records
// @route   GET /api/attendance/student/:studentId
// @access  Private (Viewer+)
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course, startDate, endDate, academicYear } = req.query;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    let query = { student: studentId };
    
    if (course) query.course = course;
    if (academicYear) query['metadata.academicYear'] = academicYear;
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('course', 'name code')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });

    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(r => 
      ['present', 'late'].includes(r.status)
    ).length;
    const absentClasses = attendanceRecords.filter(r => r.status === 'absent').length;
    const excusedClasses = attendanceRecords.filter(r => r.status === 'excused').length;
    const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    logger.info(`Student attendance retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      studentId,
      recordCount: attendanceRecords.length
    });

    res.status(200).json({
      success: true,
      message: 'Student attendance retrieved successfully',
      data: {
        student: {
          _id: student._id,
          fullName: `${student.firstName} ${student.lastName}`,
          admissionUID: student.admissionUID,
          email: student.email
        },
        records: attendanceRecords,
        statistics: {
          totalClasses,
          presentClasses,
          absentClasses,
          excusedClasses,
          attendanceRate
        }
      }
    });

  } catch (error) {
    logger.error('Error in getStudentAttendance:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving student attendance'
    });
  }
};

// @desc    Get course attendance records
// @route   GET /api/attendance/course/:courseId
// @access  Private (Viewer+)
const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, batch, status } = req.query;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    let query = { course: courseId };
    
    if (batch) query.batch = batch;
    if (status) query.status = status;
    
    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'firstName lastName admissionUID email')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1, 'student.firstName': 1 });

    // Calculate summary
    const summary = {
      totalRecords: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length
    };

    logger.info(`Course attendance retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      courseId,
      recordCount: attendanceRecords.length
    });

    res.status(200).json({
      success: true,
      message: 'Course attendance retrieved successfully',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          code: course.code
        },
        records: attendanceRecords,
        summary
      }
    });

  } catch (error) {
    logger.error('Error in getCourseAttendance:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving course attendance'
    });
  }
};

// @desc    Get attendance reports
// @route   GET /api/attendance/reports
// @access  Private (Viewer+)
const getAttendanceReports = async (req, res) => {
  try {
    const { type = 'summary', course, student, batch, startDate, endDate, academicYear } = req.query;

    const filters = {};
    if (course) filters.course = course;
    if (student) filters.student = student;
    if (batch) filters.batch = batch;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (academicYear) filters.academicYear = academicYear;

    let reportData = {};

    if (type === 'summary') {
      reportData = await Attendance.getAttendanceStats(filters);
    } else if (type === 'low_attendance') {
      if (!course) {
        return res.status(400).json({
          success: false,
          error: 'Course ID is required for low attendance report'
        });
      }
      
      const threshold = req.query.threshold || 75;
      reportData = await Attendance.findLowAttendanceStudents(course, threshold, academicYear);
    }

    logger.info(`Attendance reports retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      reportType: type,
      filters
    });

    res.status(200).json({
      success: true,
      message: 'Attendance reports retrieved successfully',
      data: reportData
    });

  } catch (error) {
    logger.error('Error in getAttendanceReports:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while generating reports'
    });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk-mark
// @access  Private (Editor+)
const bulkMarkAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body;

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Attendance data array is required and cannot be empty'
      });
    }

    // Add markedBy to each record
    const dataWithMarker = attendanceData.map(data => ({
      ...data,
      markedBy: req.user.id,
      markedAt: new Date(),
      method: 'bulk_import'
    }));

    const results = await Attendance.markBulkAttendance(dataWithMarker);

    logger.info(`Bulk attendance marked by user ${req.user.id}`, {
      userId: req.user.id,
      total: results.total,
      successful: results.successful.length,
      failed: results.failed.length
    });

    res.status(200).json({
      success: true,
      message: `Bulk attendance completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
    });

  } catch (error) {
    logger.error('Error in bulkMarkAttendance:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during bulk attendance marking'
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Viewer+)
const getAttendanceStats = async (req, res) => {
  try {
    const { course, student, batch, startDate, endDate, academicYear } = req.query;

    const filters = {};
    if (course) filters.course = course;
    if (student) filters.student = student;
    if (batch) filters.batch = batch;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (academicYear) filters.academicYear = academicYear;

    const stats = await Attendance.getAttendanceStats(filters);

    logger.info(`Attendance statistics retrieved by user ${req.user.id}`, {
      userId: req.user.id,
      filters
    });

    res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error in getAttendanceStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving statistics'
    });
  }
};

module.exports = {
  getAttendanceDashboard,
  getAttendanceRecords,
  markAttendance,
  updateAttendance,
  getStudentAttendance,
  getCourseAttendance,
  getAttendanceReports,
  bulkMarkAttendance,
  getAttendanceStats
};
