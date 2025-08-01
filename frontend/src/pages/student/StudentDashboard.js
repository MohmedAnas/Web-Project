import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Bell, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mock data - in a real app, this would come from API
const mockStudentData = {
  name: "Rahul Sharma",
  studentId: "STU001",
  course: "Web Development",
  batch: "Morning",
  joinDate: "2023-08-15",
  endDate: "2024-02-15",
  attendance: 85,
  feeStatus: {
    total: 25000,
    paid: 15000,
    due: 10000,
    nextDueDate: "2023-11-15"
  },
  upcomingClasses: [
    { id: 1, subject: "HTML & CSS Advanced", date: "2023-10-25", time: "10:00 AM - 12:00 PM" },
    { id: 2, subject: "JavaScript Fundamentals", date: "2023-10-26", time: "10:00 AM - 12:00 PM" },
    { id: 3, subject: "React Basics", date: "2023-10-27", time: "10:00 AM - 12:00 PM" }
  ],
  recentNotices: [
    { id: 1, title: "Holiday Notice", content: "Institute will remain closed on 25th October for Diwali.", date: "2023-10-20" },
    { id: 2, title: "New Course Announcement", content: "New course on AI & Machine Learning starting from November.", date: "2023-10-18" }
  ]
};

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchStudentData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await axios.get('/api/student/dashboard');
        // setStudentData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setStudentData(mockStudentData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setLoading(false);
      }
    };

    fetchStudentData();
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Welcome Card */}
      <motion.div 
        className="bg-gradient-to-r from-student-primary to-student-secondary rounded-xl shadow-lg overflow-hidden text-white"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold">Welcome back, {studentData.name}!</h2>
          <p className="mt-2 opacity-90">You're currently enrolled in {studentData.course} ({studentData.batch} batch)</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="text-sm opacity-80">Student ID</p>
              <p className="font-semibold">{studentData.studentId}</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="text-sm opacity-80">Course Duration</p>
              <p className="font-semibold">{new Date(studentData.joinDate).toLocaleDateString()} - {new Date(studentData.endDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="text-sm opacity-80">Attendance</p>
              <p className="font-semibold">{studentData.attendance}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Course Progress */}
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
                <p className="text-sm font-medium text-gray-500">Course Progress</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">65%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/student/courses" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View course details
            </Link>
          </div>
        </motion.div>

        {/* Attendance */}
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
                <p className="text-sm font-medium text-gray-500">Attendance</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{studentData.attendance}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${
                studentData.attendance >= 75 ? 'bg-green-600' : 'bg-amber-600'
              }`} style={{ width: `${studentData.attendance}%` }}></div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/student/attendance" 
              className="text-sm font-medium text-amber-600 hover:text-amber-800"
            >
              View attendance details
            </Link>
          </div>
        </motion.div>

        {/* Fee Status */}
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
                <p className="text-sm font-medium text-gray-500">Fee Status</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">₹{studentData.feeStatus.paid.toLocaleString()}</p>
                  <p className="ml-2 text-sm text-gray-500">/ ₹{studentData.feeStatus.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(studentData.feeStatus.paid / studentData.feeStatus.total) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/student/fees" 
              className="text-sm font-medium text-green-600 hover:text-green-800"
            >
              View fee details
            </Link>
          </div>
        </motion.div>

        {/* Next Due */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Next Fee Due</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">₹{studentData.feeStatus.due.toLocaleString()}</p>
                </div>
                <p className="text-sm text-red-600">Due on {new Date(studentData.feeStatus.nextDueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link 
              to="/student/fees" 
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Pay now
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Upcoming Classes and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {studentData.upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{classItem.subject}</h3>
                  <span className="text-xs text-gray-500">{classItem.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{new Date(classItem.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link 
              to="/student/courses" 
              className="text-sm font-medium text-student-primary hover:text-student-secondary"
            >
              View all classes
            </Link>
          </div>
        </motion.div>

        {/* Notices */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-100">
            {studentData.recentNotices.map((notice) => (
              <div key={notice.id} className="px-6 py-4 hover:bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">{notice.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(notice.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link 
              to="/student/notices" 
              className="text-sm font-medium text-student-primary hover:text-student-secondary"
            >
              View all notices
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
