import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create auth context
const AuthContext = createContext();

// User types
export const USER_TYPES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('rbcomputer_token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Configure axios with token
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // Verify token and get user data
        const response = await axios.get('/api/auth/user/');
        
        if (response.data) {
          setCurrentUser(response.data);
          setUserType(response.data.user_type);
          
          // Redirect to appropriate dashboard if on login page
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            if (response.data.user_type === USER_TYPES.STUDENT) {
              navigate('/student/dashboard');
            } else {
              navigate('/admin/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('rbcomputer_token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  // Login function for both student and admin
  const login = async (credentials, userType) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Different endpoints for student and admin login
      const endpoint = userType === USER_TYPES.STUDENT 
        ? '/api/auth/student/login/' 
        : '/api/auth/admin/login/';
      
      const response = await axios.post(endpoint, credentials);
      
      if (response.data.token) {
        localStorage.setItem('rbcomputer_token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
        
        // Get user details
        const userResponse = await axios.get('/api/auth/user/');
        setCurrentUser(userResponse.data);
        setUserType(userResponse.data.user_type);
        
        toast.success(`Welcome back, ${userResponse.data.name || userResponse.data.username}!`);
        
        // Redirect based on user type
        if (userResponse.data.user_type === USER_TYPES.STUDENT) {
          navigate('/student/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('rbcomputer_token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setUserType(null);
    toast.success('You have been logged out successfully');
    navigate('/login');
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    
    // Super admin has access to everything
    if (userType === USER_TYPES.SUPER_ADMIN) return true;
    
    // Check specific role
    return userType === requiredRole;
  };

  const value = {
    currentUser,
    userType,
    loading,
    authError,
    login,
    logout,
    hasRole,
    isStudent: userType === USER_TYPES.STUDENT,
    isAdmin: [USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN, USER_TYPES.EDITOR, USER_TYPES.VIEWER].includes(userType),
    isSuperAdmin: userType === USER_TYPES.SUPER_ADMIN,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
