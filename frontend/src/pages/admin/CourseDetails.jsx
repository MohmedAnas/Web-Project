import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiUsers, FiCalendar, FiClock, FiDollarSign, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Mock data - replace with API calls later
const coursesData = [
  { 
    id: 1, 
    name: 'Advanced Web Development', 
    duration: '3 months', 
    fee: 15000, 
    description: 'Learn modern web development with React, Node.js and MongoDB. This comprehensive course covers frontend and backend development, database design, and deployment strategies. Students will build multiple projects including a full-stack web application.',
    enrolledStudents: 24,
    startDate: '2025-01-15',
    endDate: '2025-04-15',
    status: 'active',
    instructor: 'Rahul Sharma',
    schedule: 'Mon, Wed, Fri (10:00 AM - 12:00 PM)',
    prerequisites: 'Basic HTML, CSS, and JavaScript knowledge',
    syllabus: [
      { week: 1, topic: 'HTML5 and CSS3 Advanced Concepts', description: 'Semantic HTML, CSS Grid, Flexbox' },
      { week: 2, topic: 'JavaScript ES6+ Features', description: 'Arrow functions, destructuring, modules' },
      { week: 3, topic: 'React Fundamentals', description: 'Components, props, state, hooks' },
      { week: 4, topic: 'React Router and State Management', description: 'Navigation, context API, Redux' },
      { week: 5, topic: 'Node.js and Express', description: 'Server setup, routing, middleware' },
      { week: 6, topic: 'MongoDB and Mongoose', description: 'Database design, CRUD operations' },
      { week: 7, topic: 'Authentication and Authorization', description: 'JWT, OAuth, security best practices' },
      { week: 8, topic: 'API Development', description: 'RESTful APIs, GraphQL' },
      { week: 9, topic: 'Testing and Debugging', description: 'Unit tests, integration tests, debugging tools' },
      { week: 10, topic: 'Deployment and CI/CD', description: 'Heroku, Netlify, GitHub Actions' },
      { week: 11, topic: 'Performance Optimization', description: 'Lazy loading, code splitting, caching' },
      { week: 12, topic: 'Final Project', description: 'Building and presenting a full-stack application' }
    ]
  },
  { 
    id: 2, 
    name: 'Python Programming', 
    duration: '2 months', 
    fee: 12000, 
    description: 'Comprehensive Python programming from basics to advanced concepts. Learn syntax, data structures, object-oriented programming, and practical applications in automation, web development, and data analysis.',
    enrolledStudents: 18,
    startDate: '2025-02-01',
    endDate: '2025-04-01',
    status: 'active',
    instructor: 'Priya Patel',
    schedule: 'Tue, Thu, Sat (2:00 PM - 4:00 PM)',
    prerequisites: 'No prior programming experience required',
    syllabus: [
      { week: 1, topic: 'Python Basics', description: 'Syntax, variables, data types, operators' },
      { week: 2, topic: 'Control Flow', description: 'Conditionals, loops, error handling' },
      { week: 3, topic: 'Data Structures', description: 'Lists, tuples, dictionaries, sets' },
      { week: 4, topic: 'Functions and Modules', description: 'Function definitions, arguments, imports' },
      { week: 5, topic: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism' },
      { week: 6, topic: 'File I/O and Exception Handling', description: 'Reading/writing files, error handling' },
      { week: 7, topic: 'Libraries and Frameworks', description: 'NumPy, Pandas, Matplotlib' },
      { week: 8, topic: 'Final Project', description: 'Building a complete Python application' }
    ]
  }
];

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call
    const fetchCourse = () => {
      setLoading(true);
      setTimeout(() => {
        const foundCourse = coursesData.find(c => c.id === parseInt(courseId));
        setCourse(foundCourse);
        setLoading(false);
      }, 500);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Course not found. The requested course may have been deleted or does not exist.
        </div>
        <button 
          onClick={() => navigate('/admin/courses')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/admin/courses')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FiArrowLeft className="mr-2" /> Back to Courses
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.name}</h1>
            <p className="text-gray-600">{course.description.split('.')[0]}.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
          >
            <FiEdit2 /> Edit Course
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiCalendar className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-semibold">{new Date(course.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiClock className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{course.duration}</p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FiDollarSign className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fee</p>
              <p className="font-semibold">₹{course.fee.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <FiUsers className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled Students</p>
              <p className="font-semibold">{course.enrolledStudents}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'syllabus'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('syllabus')}
            >
              Syllabus
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Course Description</h2>
              <p className="text-gray-700">{course.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Course Details</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="font-medium w-32">Instructor:</span>
                    <span>{course.instructor}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Schedule:</span>
                    <span>{course.schedule}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Status:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${course.status === 'active' ? 'bg-green-100 text-green-800' : 
                        course.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Start Date:</span>
                    <span>{new Date(course.startDate).toLocaleDateString()}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">End Date:</span>
                    <span>{new Date(course.endDate).toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">Prerequisites</h2>
                <p className="text-gray-700">{course.prerequisites}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'syllabus' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Course Syllabus</h2>
            <div className="space-y-4">
              {course.syllabus.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FiBook className="text-blue-600" />
                    </div>
                    <h3 className="font-medium">Week {item.week}: {item.topic}</h3>
                  </div>
                  <p className="text-gray-600 ml-12">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Enrolled Students</h2>
            <p className="text-gray-600 mb-4">
              Total students enrolled: {course.enrolledStudents}
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Student details will be loaded from the database when connected to the backend.
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => navigate(`/admin/courses/${courseId}/students`)}
            >
              View All Students
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
