import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Bell, 
  Award,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - in a real app, this would come from API
const mockStats = {
  totalStudents: 248,
  activeCourses: 12,
  feesCollected: 125000,
  feesDue: 35000,
  attendanceToday: 92,
  certificatesIssued: 78,
};

const mockRecentStudents = [
  { id: 'STU001', name: 'Rahul Sharma', course: 'Web Development', joinDate: '2023-10-15', status: 'active' },
  { id: 'STU002', name: 'Priya Patel', course: 'Digital Marketing', joinDate: '2023-10-12', status: 'active' },
  { id: 'STU003', name: 'Amit Kumar', course: 'Python Programming', joinDate: '2023-10-10', status: 'active' },
  { id: 'STU004', name: 'Neha Singh', course: 'Graphic Design', joinDate: '2023-10-05', status: 'inactive' },
];

const mockNotices = [
  { id: 1, title: 'Holiday Notice', content: 'Institute will remain closed on 25th October for Diwali.', date: '2023-10-20' },
  { id: 2, title: 'New Course Announcement', content: 'New course on AI & Machine Learning starting from November.', date: '2023-10-18' },
  { id: 3, title: 'Fee Payment Reminder', content: 'Last date for fee payment is 30th October.', date: '2023-10-15' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentStudents, setRecentStudents] = useState(mockRecentStudents);
  const [notices, setNotices] = useState(mockNotices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await axios.get('/api/admin/dashboard');
        // setStats(response.data.stats);
        // setRecentStudents(response.data.recentStudents);
        // setNotices(response.data.notices);
        
        // Simulate API delay
        setTimeout(() => {
          setStats(mockStats);
          setRecentStudents(mockRecentStudents);
          setNotices(mockNotices);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total Students */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-admin-primary/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-admin-primary" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    8%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/students" 
              className="text-sm font-medium text-admin-primary hover:text-admin-secondary"
            >
              View all students
            </Link>
          </div>
        </motion.div>

        {/* Active Courses */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Active Courses</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeCourses}</p>
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    2
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/courses" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Manage courses
            </Link>
          </div>
        </motion.div>

        {/* Fees Collected */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Fees Collected</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.feesCollected.toLocaleString()}</p>
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    12%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/fees" 
              className="text-sm font-medium text-green-600 hover:text-green-800"
            >
              View fee details
            </Link>
          </div>
        </motion.div>

        {/* Fees Due */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Fees Due</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.feesDue.toLocaleString()}</p>
                  <p className="ml-2 flex items-center text-sm text-red-600">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    5%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/fees" 
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Send reminders
            </Link>
          </div>
        </motion.div>

        {/* Today's Attendance */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-50 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stats.attendanceToday}%</p>
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    3%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/attendance" 
              className="text-sm font-medium text-amber-600 hover:text-amber-800"
            >
              View attendance
            </Link>
          </div>
        </motion.div>

        {/* Certificates Issued */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Certificates Issued</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stats.certificatesIssued}</p>
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    15%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/admin/certificates" 
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              Manage certificates
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Students and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Recent Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link 
              to="/admin/students" 
              className="text-sm font-medium text-admin-primary hover:text-admin-secondary"
            >
              View all students
            </Link>
          </div>
        </motion.div>

        {/* Notices */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-100">
            {notices.map((notice) => (
              <div key={notice.id} className="px-6 py-4 hover:bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">{notice.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(notice.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link 
              to="/admin/notices" 
              className="text-sm font-medium text-admin-primary hover:text-admin-secondary"
            >
              Manage notices
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
