import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data - in a real app, this would come from API
const mockCoursesData = [
  {
    id: 1,
    name: "Web Development",
    code: "WD101",
    description: "Comprehensive web development course covering HTML, CSS, JavaScript, and React.",
    batch: "Morning",
    start_date: "2023-08-15",
    end_date: "2024-02-15",
    progress: 65,
    status: "active",
    instructor: "Amit Kumar",
    schedule: [
      { day: "Monday", time: "10:00 AM - 12:00 PM" },
      { day: "Wednesday", time: "10:00 AM - 12:00 PM" },
      { day: "Friday", time: "10:00 AM - 12:00 PM" }
    ],
    modules: [
      { id: 1, name: "HTML & CSS Fundamentals", progress: 100, status: "completed" },
      { id: 2, name: "JavaScript Basics", progress: 100, status: "completed" },
      { id: 3, name: "Advanced JavaScript", progress: 80, status: "in_progress" },
      { id: 4, name: "React Fundamentals", progress: 40, status: "in_progress" },
      { id: 5, name: "Building React Applications", progress: 0, status: "not_started" },
      { id: 6, name: "Backend Integration", progress: 0, status: "not_started" }
    ]
  },
  {
    id: 2,
    name: "Digital Marketing",
    code: "DM201",
    description: "Learn digital marketing strategies, SEO, social media marketing, and analytics.",
    batch: "Evening",
    start_date: "2023-09-10",
    end_date: "2023-12-10",
    progress: 30,
    status: "active",
    instructor: "Priya Singh",
    schedule: [
      { day: "Tuesday", time: "6:00 PM - 8:00 PM" },
      { day: "Thursday", time: "6:00 PM - 8:00 PM" }
    ],
    modules: [
      { id: 1, name: "Introduction to Digital Marketing", progress: 100, status: "completed" },
      { id: 2, name: "Search Engine Optimization", progress: 70, status: "in_progress" },
      { id: 3, name: "Social Media Marketing", progress: 0, status: "not_started" },
      { id: 4, name: "Email Marketing", progress: 0, status: "not_started" },
      { id: 5, name: "Analytics & Reporting", progress: 0, status: "not_started" }
    ]
  }
];

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchCourses = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getCourses();
        // setCourses(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setCourses(mockCoursesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
        toast.error('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  const toggleCourseExpand = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };

  const downloadSyllabus = (courseCode) => {
    // In a real app, this would trigger a file download
    toast.success(`Downloading syllabus for ${courseCode}`);
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
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Courses Found</h2>
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <motion.div 
              key={course.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-student-primary text-white flex items-center justify-center">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
                        <p className="text-sm text-gray-500">Course Code: {course.code}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' : 
                      course.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'active' ? 'Active' : 
                       course.status === 'completed' ? 'Completed' : 'On Hold'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.batch} Batch</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Instructor: {course.instructor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Course Progress</span>
                    <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-student-primary h-2.5 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => toggleCourseExpand(course.id)}
                    className="flex items-center text-student-primary hover:text-student-secondary transition-colors"
                  >
                    {expandedCourse === course.id ? (
                      <>
                        <ChevronUp className="h-5 w-5 mr-1" />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-5 w-5 mr-1" />
                        <span>Show Details</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => downloadSyllabus(course.code)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-1" />
                    <span>Syllabus</span>
                  </button>
                </div>
                
                {expandedCourse === course.id && (
                  <motion.div 
                    className="mt-6 pt-6 border-t border-gray-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Course Description</h3>
                      <p className="text-gray-600">{course.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {course.schedule.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">{item.day}: {item.time}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Course Modules</h3>
                      <div className="space-y-4">
                        {course.modules.map((module) => (
                          <div key={module.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start">
                                <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    module.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    module.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {module.status === 'completed' ? 'Completed' : 
                                     module.status === 'in_progress' ? 'In Progress' : 
                                     'Not Started'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{module.progress}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  module.status === 'completed' ? 'bg-green-500' : 
                                  module.status === 'in_progress' ? 'bg-blue-500' : 
                                  'bg-gray-300'
                                }`}
                                style={{ width: `${module.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
