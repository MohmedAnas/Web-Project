import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rbcomputer_token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rbcomputer_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Field mapping utility for student data
const mapStudentFields = (frontendData) => {
  const fieldMapping = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'email': 'Email',
    'phone': 'Phone',
    'date_of_birth': 'Date of Birth',
    'address': 'Address',
    'course_interested': 'Course',
    'gender': 'Gender',
    'guardian_name': 'Guardian Name',
    'guardian_phone': 'Guardian Phone',
    'enrollment_date': 'Enrollment Date',
    'status': 'Status'
  };

  const backendData = {};
  
  // Map frontend fields to backend fields
  Object.keys(frontendData).forEach(key => {
    const backendKey = fieldMapping[key] || key;
    backendData[backendKey] = frontendData[key];
  });

  return backendData;
};

// Auth API - Updated to match backend endpoints
export const authAPI = {
  loginStudent: (credentials) => api.post('/auth/student/login/', credentials),
  loginAdmin: (credentials) => api.post('/auth/admin/login/', credentials),
  registerStudent: (data) => {
    const mappedData = mapStudentFields(data);
    return api.post('/students', mappedData);
  }, // Fixed: Use correct endpoint with field mapping
  registerAdmin: (data) => api.post('/auth/admin/register/', data),
  getCurrentUser: () => api.get('/auth/user/'),
  logout: () => api.post('/auth/logout/'),
  forgotPassword: (email) => api.post('/auth/password-reset/', { email }),
  resetPassword: (data) => api.post('/auth/password-reset/confirm/', data),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/students/profile/'),
  updateProfile: (data) => api.patch('/students/profile/', data),
  getCourses: () => api.get('/students/courses/'),
  getAttendance: (params) => api.get('/students/attendance/', { params }),
  getFees: () => api.get('/students/fees/'),
  getNotices: () => api.get('/students/notices/'),
  getCertificates: () => api.get('/students/certificates/'),
  getDashboardData: () => api.get('/students/dashboard/'),
};

// Admin API
export const adminAPI = {
  // Students
  getStudents: (params) => api.get('/admin/students/', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}/`),
  createStudent: (data) => api.post('/admin/students/', data),
  updateStudent: (id, data) => api.patch(`/admin/students/${id}/`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}/`),
  
  // Courses
  getCourses: (params) => api.get('/admin/courses/', { params }),
  getCourse: (id) => api.get(`/admin/courses/${id}/`),
  createCourse: (data) => api.post('/admin/courses/', data),
  updateCourse: (id, data) => api.patch(`/admin/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}/`),
  
  // Attendance
  getAttendance: (params) => api.get('/admin/attendance/', { params }),
  markAttendance: (data) => api.post('/admin/attendance/', data),
  
  // Fees
  getFees: (params) => api.get('/admin/fees/', { params }),
  recordFeePayment: (data) => api.post('/admin/fees/', data),
  
  // Notices
  getNotices: (params) => api.get('/admin/notices/', { params }),
  getNotice: (id) => api.get(`/admin/notices/${id}/`),
  createNotice: (data) => api.post('/admin/notices/', data),
  updateNotice: (id, data) => api.patch(`/admin/notices/${id}/`, data),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}/`),
  
  // Certificates
  getCertificates: (params) => api.get('/admin/certificates/', { params }),
  getCertificate: (id) => api.get(`/admin/certificates/${id}/`),
  issueCertificate: (data) => api.post('/admin/certificates/', data),
  
  // Dashboard
  getDashboardData: () => api.get('/admin/dashboard/'),
  
  // Settings
  getSettings: () => api.get('/admin/settings/'),
  updateSettings: (data) => api.patch('/admin/settings/', data),
  
  // Admin Approvals
  getPendingApprovals: (params) => api.get('/admin/pending-approvals/', { params }),
  approveAdmin: (id) => api.post(`/admin/approve/${id}/`),
  rejectAdmin: (id, reason) => api.post(`/admin/reject/${id}/`, { reason }),
  getAllAdmins: (params) => api.get('/admin/list/', { params }),
  getAdminStats: () => api.get('/admin/stats/'),
  getAdminById: (id) => api.get(`/admin/${id}/`),
  updateAdminPermissions: (id, permissions) => api.put(`/admin/${id}/permissions/`, { permissions }),
  deactivateAdmin: (id, reason) => api.put(`/admin/${id}/deactivate/`, { reason }),
};

export default api;
