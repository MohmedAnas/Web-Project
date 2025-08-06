import apiClient from './apiClient';
import { setAuthTokens, clearAuthTokens, getRefreshToken } from '../../utils/auth';

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

/**
 * Authentication service for handling login, logout, and token refresh
 */
const authService = {
  /**
   * Login with username and password
   * @param {string} username - User's username or email
   * @param {string} password - User's password
   * @param {string} userType - Type of user ('student' or 'admin')
   * @returns {Promise} Promise with user data
   */
  login: async (username, password, userType = 'admin') => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
        user_type: userType
      });
      
      const { token, refresh_token, user } = response.data;
      
      // Store tokens and user data
      setAuthTokens(token, refresh_token, user);
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Register a new student account
   * @param {Object} studentData - Student registration data
   * @returns {Promise} Promise with registration result
   */
  registerStudent: async (studentData) => {
    try {
      const mappedData = mapStudentFields(studentData);
      const response = await apiClient.post('/students', mappedData); // Fixed: Use correct endpoint with field mapping
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logout the current user
   * @returns {Promise} Promise with logout result
   */
  logout: async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of server response
      clearAuthTokens();
    }
  },
  
  /**
   * Refresh the authentication token
   * @returns {Promise} Promise with new token
   */
  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { token, refresh_token, user } = response.data;
      
      // Store new tokens
      setAuthTokens(token, refresh_token, user);
      
      return token;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      clearAuthTokens();
      throw error;
    }
  },
  
  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise} Promise with reset request result
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/password-reset/request', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} password - New password
   * @returns {Promise} Promise with reset result
   */
  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post('/auth/password-reset/confirm', {
        token,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Change password for authenticated user
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Promise with change result
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.post('/auth/password/change', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
