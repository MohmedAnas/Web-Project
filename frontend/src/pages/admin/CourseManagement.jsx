import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Mock data - replace with API calls later
const initialCourses = [
  { 
    id: 1, 
    name: 'Advanced Web Development', 
    duration: '3 months', 
    fee: 15000, 
    description: 'Learn modern web development with React, Node.js and MongoDB',
    enrolledStudents: 24,
    startDate: '2025-01-15',
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Python Programming', 
    duration: '2 months', 
    fee: 12000, 
    description: 'Comprehensive Python programming from basics to advanced concepts',
    enrolledStudents: 18,
    startDate: '2025-02-01',
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Data Science Fundamentals', 
    duration: '4 months', 
    fee: 20000, 
    description: 'Introduction to data analysis, visualization and machine learning',
    enrolledStudents: 15,
    startDate: '2025-01-10',
    status: 'active'
  },
  { 
    id: 4, 
    name: 'Office Automation', 
    duration: '1 month', 
    fee: 8000, 
    description: 'MS Office suite including Word, Excel, PowerPoint and Access',
    enrolledStudents: 30,
    startDate: '2025-02-15',
    status: 'active'
  },
  { 
    id: 5, 
    name: 'Graphic Design', 
    duration: '3 months', 
    fee: 18000, 
    description: 'Design principles and practical skills with Adobe Creative Suite',
    enrolledStudents: 12,
    startDate: '2025-03-01',
    status: 'upcoming'
  }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  
  // Filtered courses based on search and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCourse = () => {
    setCurrentCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setCurrentCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const handleSaveCourse = (courseData) => {
    if (currentCourse) {
      // Edit existing course
      setCourses(courses.map(course => 
        course.id === currentCourse.id ? { ...course, ...courseData } : course
      ));
    } else {
      // Add new course
      const newCourse = {
        id: courses.length + 1,
        ...courseData,
        enrolledStudents: 0,
        status: 'upcoming'
      };
      setCourses([...courses, newCourse]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={handleAddCourse}
        >
          <FiPlus /> Add New Course
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{course.name}</div>
                    <div className="text-sm text-gray-500">{course.description.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.fee.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.enrolledStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${course.status === 'active' ? 'bg-green-100 text-green-800' : 
                        course.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No courses found matching your criteria.
          </div>
        )}
      </div>

      {isModalOpen && (
        <CourseFormModal 
          course={currentCourse} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveCourse} 
        />
      )}
    </div>
  );
};

// Course Form Modal Component
const CourseFormModal = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    duration: course?.duration || '',
    fee: course?.fee || '',
    description: course?.description || '',
    startDate: course?.startDate || '',
    status: course?.status || 'upcoming'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'fee' ? parseInt(value) || '' : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {course ? 'Edit Course' : 'Add New Course'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Course Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
              Duration
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              placeholder="e.g. 3 months"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fee">
              Fee (₹)
            </label>
            <input
              type="number"
              id="fee"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          {course && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {course ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CourseManagement;
