import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Clock,
  CreditCard,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data - in a real app, this would come from API
const mockStudentData = {
  id: 1,
  student_id: "STU001",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  phone: "+91 9876543210",
  address: "123 Main Street, Mumbai, Maharashtra 400001",
  date_of_birth: "2000-05-15",
  parent_name: "Rajesh Sharma",
  parent_email: "rajesh.sharma@example.com",
  parent_phone: "+91 9876543211",
  join_date: "2023-08-15",
  status: "active",
  course: {
    name: "Web Development",
    code: "WD101",
    batch: "Morning",
    start_date: "2023-08-15",
    end_date: "2024-02-15",
    duration_months: 6,
    progress: 65
  },
  fee: {
    total_fee: 25000,
    paid_amount: 15000,
    due_amount: 10000,
    next_due_date: "2023-11-15"
  },
  attendance: {
    total_classes: 30,
    present: 26,
    absent: 4,
    percentage: 86.67
  }
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('course');

  useEffect(() => {
    // Simulate API call
    const fetchStudentDetails = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getStudent(id);
        // setStudentData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setStudentData(mockStudentData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching student details:', error);
        setLoading(false);
        toast.error('Failed to load student details');
      }
    };

    fetchStudentDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      // In a real app, this would call the API to delete the student
      // await adminAPI.deleteStudent(id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`Student ${studentData.name} deleted successfully`);
      navigate('/admin/students');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setShowDeleteModal(false);
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
      {/* Header with navigation and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link
            to="/admin/students"
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/admin/students/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-admin-primary hover:bg-admin-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
            Delete
          </button>
        </div>
      </div>

      {/* Student Basic Info Card */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex justify-center">
              <div className="h-32 w-32 rounded-full bg-admin-primary text-white flex items-center justify-center text-4xl font-bold">
                {studentData.name.charAt(0)}
              </div>
            </div>
            
            <div className="md:w-2/3 mt-6 md:mt-0">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
                  studentData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {studentData.status}
                </span>
              </div>
              <p className="text-admin-primary font-medium">Student ID: {studentData.student_id}</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900">{studentData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{studentData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{studentData.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">
                      {new Date(studentData.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('course')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'course'
                  ? 'border-admin-primary text-admin-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Course Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'fees'
                  ? 'border-admin-primary text-admin-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Fee Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-admin-primary text-admin-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Attendance
              </div>
            </button>
            <button
              onClick={() => setActiveTab('parent')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'parent'
                  ? 'border-admin-primary text-admin-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Parent Info
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Course Details Tab */}
          {activeTab === 'course' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Course Information</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {studentData.course.batch} Batch
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Course Name</p>
                  <p className="mt-1 text-gray-900">{studentData.course.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Course Code</p>
                  <p className="mt-1 text-gray-900">{studentData.course.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="mt-1 text-gray-900">{new Date(studentData.course.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="mt-1 text-gray-900">{new Date(studentData.course.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="mt-1 text-gray-900">{studentData.course.duration_months} months</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  <span className="text-sm font-medium text-gray-700">{studentData.course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${studentData.course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Fee Details Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Fee Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Fee</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">₹{studentData.fee.total_fee.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                  <p className="mt-1 text-xl font-semibold text-green-700">₹{studentData.fee.paid_amount.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Due Amount</p>
                  <p className="mt-1 text-xl font-semibold text-red-700">₹{studentData.fee.due_amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((studentData.fee.paid_amount / studentData.fee.total_fee) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${(studentData.fee.paid_amount / studentData.fee.total_fee) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {studentData.fee.due_amount > 0 && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Next Payment Due</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Amount: ₹{studentData.fee.due_amount.toLocaleString()}</p>
                        <p>Due Date: {new Date(studentData.fee.next_due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Attendance Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Classes</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{studentData.attendance.total_classes}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Present</p>
                  <p className="mt-1 text-xl font-semibold text-green-700">{studentData.attendance.present}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Absent</p>
                  <p className="mt-1 text-xl font-semibold text-red-700">{studentData.attendance.absent}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Percentage</p>
                  <p className="mt-1 text-xl font-semibold text-blue-700">{studentData.attendance.percentage}%</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance</span>
                  <span className="text-sm font-medium text-gray-700">{studentData.attendance.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      studentData.attendance.percentage >= 75 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${studentData.attendance.percentage}%` }}
                  ></div>
                </div>
                {studentData.attendance.percentage < 75 && (
                  <p className="mt-2 text-sm text-red-600">
                    Attendance below required 75%
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Parent Info Tab */}
          {activeTab === 'parent' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Parent/Guardian Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-gray-900">{studentData.parent_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-gray-900">{studentData.parent_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="mt-1 text-gray-900">{studentData.parent_phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete student <span className="font-medium">{studentData.name}</span> ({studentData.student_id})? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
