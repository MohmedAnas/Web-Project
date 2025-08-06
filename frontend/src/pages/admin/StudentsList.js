import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data - in a real app, this would come from API
const mockStudentsData = {
  students: [
    {
      id: 1,
      student_id: "STU001",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 9876543210",
      course: "Web Development",
      batch: "Morning",
      join_date: "2023-08-15",
      status: "active"
    },
    {
      id: 2,
      student_id: "STU002",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 9876543211",
      course: "Digital Marketing",
      batch: "Evening",
      join_date: "2023-09-10",
      status: "active"
    },
    {
      id: 3,
      student_id: "STU003",
      name: "Amit Kumar",
      email: "amit.kumar@example.com",
      phone: "+91 9876543212",
      course: "Python Programming",
      batch: "Afternoon",
      join_date: "2023-10-05",
      status: "active"
    },
    {
      id: 4,
      student_id: "STU004",
      name: "Neha Singh",
      email: "neha.singh@example.com",
      phone: "+91 9876543213",
      course: "Graphic Design",
      batch: "Morning",
      join_date: "2023-07-20",
      status: "inactive"
    },
    {
      id: 5,
      student_id: "STU005",
      name: "Rajesh Verma",
      email: "rajesh.verma@example.com",
      phone: "+91 9876543214",
      course: "Web Development",
      batch: "Evening",
      join_date: "2023-08-01",
      status: "active"
    }
  ],
  total: 5,
  page: 1,
  limit: 10
};

const StudentsList = () => {
  const [studentsData, setStudentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    batch: 'all'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchStudents = async () => {
      try {
        // In a real app, you would fetch data from your API with pagination
        // const response = await adminAPI.getStudents({ page: currentPage, limit: 10, ...filters });
        // setStudentsData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setStudentsData(mockStudentsData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
        toast.error('Failed to load students');
      }
    };

    fetchStudents();
  }, [currentPage, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new API call with the search term
    toast.success(`Searching for: ${searchTerm}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // In a real app, this would call the API to delete the student
      // await adminAPI.deleteStudent(studentToDelete.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state to remove the deleted student
      setStudentsData(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentToDelete.id),
        total: prev.total - 1
      }));
      
      toast.success(`Student ${studentToDelete.name} deleted successfully`);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const exportStudents = () => {
    // In a real app, this would trigger a CSV/Excel export
    toast.success('Exporting students data');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Get unique courses and batches for filters
  const courses = ['all', ...new Set(studentsData.students.map(student => student.course))];
  const batches = ['all', ...new Set(studentsData.students.map(student => student.batch))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/students/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-admin-primary hover:bg-admin-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, ID, or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
            <div className="flex items-center space-x-2 md:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={exportStudents}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.course}
                  onChange={handleFilterChange}
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course === 'all' ? 'All Courses' : course}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.batch}
                  onChange={handleFilterChange}
                >
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch === 'all' ? 'All Batches' : batch}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentsData.students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-admin-primary text-white flex items-center justify-center text-sm font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.batch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.join_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/students/${student.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={studentsData.students.length < studentsData.limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{studentsData.students.length}</span> of{' '}
                <span className="font-medium">{studentsData.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={studentsData.students.length < studentsData.limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete student <span className="font-medium">{studentToDelete.name}</span> ({studentToDelete.student_id})? 
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
                onClick={confirmDelete}
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

export default StudentsList;
