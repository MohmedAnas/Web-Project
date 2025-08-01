/**
 * API Configuration for RBComputer Frontend
 * Handles environment-based API endpoints and configuration
 */

// Get environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';

// API Configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/token/refresh/',
    profile: '/auth/profile/',
    changePassword: '/auth/change-password/',
    forgotPassword: '/auth/forgot-password/',
  },
  
  // Students
  students: {
    list: '/students/',
    create: '/students/',
    detail: (id) => `/students/${id}/`,
    me: '/students/me/',
    dashboard: (id) => `/students/${id}/dashboard/`,
    courses: (id) => `/students/${id}/courses/`,
    fees: (id) => `/students/${id}/fees/`,
    attendance: (id) => `/students/${id}/attendance/`,
    certificates: (id) => `/students/${id}/certificates/`,
  },
  
  // Courses
  courses: {
    list: '/courses/',
    create: '/courses/',
    detail: (id) => `/courses/${id}/`,
    stats: (id) => `/courses/${id}/stats/`,
    modules: (id) => `/courses/${id}/modules/`,
    schedules: (id) => `/courses/${id}/schedules/`,
    students: (id) => `/courses/${id}/students/`,
  },
  
  // Fees
  fees: {
    list: '/fees/',
    create: '/fees/',
    detail: (id) => `/fees/${id}/`,
    myFees: '/fees/my-fees/',
    payment: (id) => `/fees/${id}/payment/`,
    receipt: (id) => `/fees/${id}/receipt/`,
    stats: '/fees/stats/',
    reports: '/fees/reports/',
  },
  
  // Attendance
  attendance: {
    sessions: '/attendance/sessions/',
    create: '/attendance/sessions/',
    bulkMark: '/attendance/bulk-mark/',
    myAttendance: '/attendance/my-attendance/',
    stats: '/attendance/stats/',
    reports: '/attendance/reports/',
  },
  
  // Notices
  notices: {
    list: '/notices/',
    create: '/notices/',
    detail: (id) => `/notices/${id}/`,
    student: '/notices/student/',
    markRead: (id) => `/notices/${id}/mark-read/`,
    stats: '/notices/stats/',
  },
  
  // Certificates
  certificates: {
    list: '/certificates/',
    create: '/certificates/',
    detail: (id) => `/certificates/${id}/`,
    myCertificates: '/certificates/my-certificates/',
    verify: '/certificates/verify/',
    download: (id) => `/certificates/${id}/download/`,
    stats: '/certificates/stats/',
  },
  
  // Health checks
  health: '/health/',
  ready: '/ready/',
};

// Request interceptor configuration
export const requestInterceptor = (config) => {
  // Add auth token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request timestamp for debugging
  if (ENVIRONMENT === 'development') {
    config.metadata = { startTime: new Date() };
  }
  
  return config;
};

// Response interceptor configuration
export const responseInterceptor = {
  success: (response) => {
    // Log response time in development
    if (ENVIRONMENT === 'development' && response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  
  error: (error) => {
    // Handle token refresh
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    // Log errors in development
    if (ENVIRONMENT === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  },
};

// Utility functions
export const buildUrl = (endpoint, params = {}) => {
  let url = typeof endpoint === 'function' ? endpoint(params.id) : endpoint;
  
  // Add query parameters
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (key !== 'id' && params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// Export configuration
export default {
  apiConfig,
  endpoints,
  requestInterceptor,
  responseInterceptor,
  buildUrl,
  ENVIRONMENT,
};
