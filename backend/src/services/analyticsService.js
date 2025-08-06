const Student = require('../models/Student');
const Course = require('../models/Course');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Notice = require('../models/Notice');
const logger = require('../utils/logger');
const { formatCurrency } = require('../utils/helpers');

class AnalyticsService {
  constructor() {
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.cache = new Map();
  }

  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(filters = {}) {
    try {
      const cacheKey = `dashboard_${JSON.stringify(filters)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const analytics = await Promise.all([
        this.getStudentAnalytics(filters),
        this.getCourseAnalytics(filters),
        this.getFeeAnalytics(filters),
        this.getAttendanceAnalytics(filters),
        this.getCertificateAnalytics(filters),
        this.getNoticeAnalytics(filters)
      ]);

      const dashboardData = {
        students: analytics[0],
        courses: analytics[1],
        fees: analytics[2],
        attendance: analytics[3],
        certificates: analytics[4],
        notices: analytics[5],
        summary: this.generateSummary(analytics),
        trends: await this.getTrendAnalytics(filters),
        generatedAt: new Date()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      });

      logger.info('Dashboard analytics generated', { filters });
      return dashboardData;

    } catch (error) {
      logger.error('Error generating dashboard analytics:', error);
      throw error;
    }
  }

  // Student analytics
  async getStudentAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters);

      const totalStudents = await Student.countDocuments(matchQuery);
      const activeStudents = await Student.countDocuments({ 
        ...matchQuery, 
        status: 'active' 
      });

      const statusDistribution = await Student.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const batchDistribution = await Student.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$enrollmentDetails.currentBatch',
            count: { $sum: 1 }
          }
        }
      ]);

      const monthlyAdmissions = await Student.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$enrollmentDetails.admissionDate' },
              month: { $month: '$enrollmentDetails.admissionDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      const ageDistribution = await Student.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), '$dateOfBirth'] },
                  365.25 * 24 * 60 * 60 * 1000
                ]
              }
            }
          }
        },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [16, 20, 25, 30, 35, 100],
            default: 'Other',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);

      return {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
        statusDistribution,
        batchDistribution,
        monthlyAdmissions,
        ageDistribution,
        growthRate: await this.calculateGrowthRate('students', filters)
      };

    } catch (error) {
      logger.error('Error in student analytics:', error);
      throw error;
    }
  }

  // Course analytics
  async getCourseAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters);

      const totalCourses = await Course.countDocuments(matchQuery);
      const activeCourses = await Course.countDocuments({ 
        ...matchQuery, 
        status: 'active' 
      });

      const categoryDistribution = await Course.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalEnrollments: { $sum: '$statistics.totalEnrollments' },
            averageFee: { $avg: '$fee.amount' }
          }
        }
      ]);

      const popularCourses = await Course.aggregate([
        { $match: matchQuery },
        {
          $project: {
            name: 1,
            code: 1,
            enrollments: '$statistics.totalEnrollments',
            completionRate: {
              $cond: [
                { $eq: ['$statistics.totalEnrollments', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$statistics.completedStudents', '$statistics.totalEnrollments'] },
                    100
                  ]
                }
              ]
            }
          }
        },
        { $sort: { enrollments: -1 } },
        { $limit: 10 }
      ]);

      const enrollmentTrends = await Course.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: '$statistics.totalEnrollments' },
            totalCompletions: { $sum: '$statistics.completedStudents' },
            averageRating: { $avg: '$statistics.averageRating' }
          }
        }
      ]);

      return {
        total: totalCourses,
        active: activeCourses,
        categoryDistribution,
        popularCourses,
        enrollmentTrends: enrollmentTrends[0] || {},
        averageCompletionRate: await this.calculateAverageCompletionRate()
      };

    } catch (error) {
      logger.error('Error in course analytics:', error);
      throw error;
    }
  }

  // Fee analytics
  async getFeeAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters);

      const totalFees = await Fee.countDocuments(matchQuery);
      const paidFees = await Fee.countDocuments({ 
        ...matchQuery, 
        status: 'paid' 
      });

      const revenueAnalytics = await Fee.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount.final' },
            collectedRevenue: { $sum: '$paidAmount' },
            pendingRevenue: { $sum: '$pendingAmount' },
            overdueRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, '$pendingAmount', 0]
              }
            }
          }
        }
      ]);

      const monthlyCollection = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: { ...matchQuery, 'payments.status': 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$payments.paidAt' },
              month: { $month: '$payments.paidAt' }
            },
            amount: { $sum: '$payments.amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      const feeTypeAnalytics = await Fee.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$feeType',
            totalAmount: { $sum: '$amount.final' },
            collectedAmount: { $sum: '$paidAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const paymentMethodAnalytics = await Fee.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': 'completed' } },
        {
          $group: {
            _id: '$payments.method',
            amount: { $sum: '$payments.amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const revenue = revenueAnalytics[0] || {};
      const collectionRate = revenue.totalRevenue > 0 ? 
        (revenue.collectedRevenue / revenue.totalRevenue) * 100 : 0;

      return {
        total: totalFees,
        paid: paidFees,
        pending: totalFees - paidFees,
        revenue,
        collectionRate: Math.round(collectionRate),
        monthlyCollection,
        feeTypeAnalytics,
        paymentMethodAnalytics
      };

    } catch (error) {
      logger.error('Error in fee analytics:', error);
      throw error;
    }
  }

  // Attendance analytics
  async getAttendanceAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters, 'date');

      const totalRecords = await Attendance.countDocuments(matchQuery);
      const presentRecords = await Attendance.countDocuments({ 
        ...matchQuery, 
        status: 'present' 
      });

      const attendanceRate = totalRecords > 0 ? 
        Math.round((presentRecords / totalRecords) * 100) : 0;

      const dailyAttendance = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
            },
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            rate: {
              $multiply: [{ $divide: ['$present', '$total'] }, 100]
            }
          }
        },
        { $sort: { '_id.date': -1 } },
        { $limit: 30 }
      ]);

      const batchWiseAttendance = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$batch',
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            rate: {
              $multiply: [{ $divide: ['$present', '$total'] }, 100]
            }
          }
        }
      ]);

      const lowAttendanceStudents = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$student',
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            rate: {
              $multiply: [{ $divide: ['$present', '$total'] }, 100]
            }
          }
        },
        { $match: { rate: { $lt: 75 } } },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        { $limit: 10 }
      ]);

      return {
        totalRecords,
        presentRecords,
        attendanceRate,
        dailyAttendance,
        batchWiseAttendance,
        lowAttendanceStudents: lowAttendanceStudents.length
      };

    } catch (error) {
      logger.error('Error in attendance analytics:', error);
      throw error;
    }
  }

  // Certificate analytics
  async getCertificateAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters, 'issueDate');

      const totalCertificates = await Certificate.countDocuments(matchQuery);
      const issuedCertificates = await Certificate.countDocuments({ 
        ...matchQuery, 
        status: 'issued' 
      });

      const typeDistribution = await Certificate.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$certificateType',
            count: { $sum: 1 }
          }
        }
      ]);

      const monthlyIssued = await Certificate.aggregate([
        { $match: { ...matchQuery, status: 'issued' } },
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

      const downloadStats = await Certificate.aggregate([
        { $match: matchQuery },
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
        pending: totalCertificates - issuedCertificates,
        typeDistribution,
        monthlyIssued,
        downloadStats: downloadStats[0] || { totalDownloads: 0, averageDownloads: 0 }
      };

    } catch (error) {
      logger.error('Error in certificate analytics:', error);
      throw error;
    }
  }

  // Notice analytics
  async getNoticeAnalytics(filters = {}) {
    try {
      const matchQuery = this.buildDateFilter(filters, 'publishDate');

      const totalNotices = await Notice.countDocuments(matchQuery);
      const activeNotices = await Notice.countDocuments({ 
        ...matchQuery, 
        isActive: true 
      });

      const categoryDistribution = await Notice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$statistics.totalViews' },
            totalReads: { $sum: '$statistics.totalReads' }
          }
        }
      ]);

      const engagementStats = await Notice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$statistics.totalViews' },
            totalReads: { $sum: '$statistics.totalReads' },
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
        categoryDistribution,
        engagement: engagementStats[0] || { totalViews: 0, totalReads: 0, averageReadRate: 0 }
      };

    } catch (error) {
      logger.error('Error in notice analytics:', error);
      throw error;
    }
  }

  // Generate summary from all analytics
  generateSummary(analytics) {
    const [students, courses, fees, attendance, certificates, notices] = analytics;

    return {
      totalStudents: students.total,
      activeStudents: students.active,
      totalCourses: courses.total,
      totalRevenue: fees.revenue.totalRevenue || 0,
      collectedRevenue: fees.revenue.collectedRevenue || 0,
      attendanceRate: attendance.attendanceRate,
      certificatesIssued: certificates.issued,
      activeNotices: notices.active,
      keyMetrics: {
        studentGrowthRate: students.growthRate,
        feeCollectionRate: fees.collectionRate,
        courseCompletionRate: courses.averageCompletionRate,
        noticeEngagementRate: notices.engagement.averageReadRate
      }
    };
  }

  // Get trend analytics
  async getTrendAnalytics(filters = {}) {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const trends = await Promise.all([
        this.getStudentTrends(last30Days),
        this.getRevenueTrends(last30Days),
        this.getAttendanceTrends(last30Days)
      ]);

      return {
        students: trends[0],
        revenue: trends[1],
        attendance: trends[2]
      };

    } catch (error) {
      logger.error('Error in trend analytics:', error);
      throw error;
    }
  }

  // Helper methods
  buildDateFilter(filters, dateField = 'createdAt') {
    const query = {};
    
    if (filters.startDate && filters.endDate) {
      query[dateField] = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    return query;
  }

  async calculateGrowthRate(type, filters) {
    try {
      const currentPeriod = new Date();
      const previousPeriod = new Date();
      previousPeriod.setMonth(previousPeriod.getMonth() - 1);

      let Model;
      switch (type) {
        case 'students':
          Model = Student;
          break;
        case 'courses':
          Model = Course;
          break;
        default:
          return 0;
      }

      const currentCount = await Model.countDocuments({
        createdAt: { $gte: previousPeriod }
      });

      const previousCount = await Model.countDocuments({
        createdAt: { 
          $gte: new Date(previousPeriod.getTime() - 30 * 24 * 60 * 60 * 1000),
          $lt: previousPeriod
        }
      });

      if (previousCount === 0) return currentCount > 0 ? 100 : 0;
      
      return Math.round(((currentCount - previousCount) / previousCount) * 100);

    } catch (error) {
      return 0;
    }
  }

  async calculateAverageCompletionRate() {
    try {
      const result = await Course.aggregate([
        {
          $addFields: {
            completionRate: {
              $cond: [
                { $eq: ['$statistics.totalEnrollments', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$statistics.completedStudents', '$statistics.totalEnrollments'] },
                    100
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageCompletionRate: { $avg: '$completionRate' }
          }
        }
      ]);

      return Math.round(result[0]?.averageCompletionRate || 0);

    } catch (error) {
      return 0;
    }
  }

  async getStudentTrends(fromDate) {
    return await Student.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  async getRevenueTrends(fromDate) {
    return await Fee.aggregate([
      { $unwind: '$payments' },
      { $match: { 'payments.paidAt': { $gte: fromDate }, 'payments.status': 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$payments.paidAt' } },
          amount: { $sum: '$payments.amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  async getAttendanceTrends(fromDate) {
    return await Attendance.aggregate([
      { $match: { date: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    logger.info('Analytics cache cleared');
  }
}

module.exports = new AnalyticsService();
