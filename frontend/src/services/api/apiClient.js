import axios from 'axios';
import { getAuthToken, clearAuthTokens } from '../../utils/auth';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we're not already on the login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        clearAuthTokens();
        window.location.href = '/login?session_expired=true';
        return Promise.reject(error);
      }
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      console.error('Permission denied:', error.response.data);
    }
    
    // Handle 500 server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection');
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
