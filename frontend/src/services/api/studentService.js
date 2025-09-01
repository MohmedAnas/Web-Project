import apiClient from './apiClient';

/**
 * Student service for handling student-related API calls
 */
const studentService = {
  /**
   * Get all students
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} Promise with students data
   */
  getAllStudents: async (params = {}) => {
    try {
      const response = await apiClient.get('/students', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get a specific student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with student details
   */
  getStudentById: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise} Promise with created student
   */
  createStudent: async (studentData) => {
  try {
    const response = await apiClient.post('/api/auth/student/register', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
},
  
  /**
   * Update a student
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise} Promise with updated student
   */
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await apiClient.put(`/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Delete a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with deletion result
   */
  deleteStudent: async (studentId) => {
    try {
      const response = await apiClient.delete(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get courses for a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with student's courses
   */
  getStudentCourses: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/courses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Enroll a student in a course
   * @param {string} studentId - Student ID
   * @param {Object} enrollmentData - Enrollment details
   * @returns {Promise} Promise with enrollment result
   */
  enrollStudentInCourse: async (studentId, enrollmentData) => {
    try {
      const response = await apiClient.post(`/students/${studentId}/courses`, enrollmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get attendance records for a student
   * @param {string} studentId - Student ID
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Promise with attendance records
   */
  getStudentAttendance: async (studentId, params = {}) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/attendance`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get certificates for a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with certificates
   */
  getStudentCertificates: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/certificates`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get notices for a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with notices
   */
  getStudentNotices: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/notices`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update student profile
   * @param {string} studentId - Student ID
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise with updated profile
   */
  updateStudentProfile: async (studentId, profileData) => {
    try {
      const response = await apiClient.put(`/students/${studentId}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Upload student photo
   * @param {string} studentId - Student ID
   * @param {File} photoFile - Photo file
   * @returns {Promise} Promise with upload result
   */
  uploadStudentPhoto: async (studentId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await apiClient.post(`/students/${studentId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default studentService;
