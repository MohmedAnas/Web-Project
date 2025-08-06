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
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token and get user data
        const response = await axios.get('/api/auth/profile');
        
        if (response.data.success) {
          const user = response.data.data;
          setCurrentUser(user);
          setUserType(user.role);
          
          // Redirect to appropriate dashboard if on login page
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            if (user.role === USER_TYPES.STUDENT) {
              navigate('/student/dashboard');
            } else if (user.role === USER_TYPES.ADMIN || user.role === USER_TYPES.SUPER_ADMIN) {
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
      // Use the unified login endpoint
      const response = await axios.post('/api/auth/login', {
        ...credentials,
        userType
      });
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store token
        localStorage.setItem('rbcomputer_token', tokens.accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        // Set user data
        setCurrentUser(user);
        setUserType(user.role);
        
        toast.success(`Welcome back, ${user.firstName} ${user.lastName}!`);
        
        // Redirect based on user role
        if (user.role === USER_TYPES.STUDENT) {
          navigate('/student/dashboard');
        } else if (user.role === USER_TYPES.ADMIN || user.role === USER_TYPES.SUPER_ADMIN) {
          navigate('/admin/dashboard');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
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
