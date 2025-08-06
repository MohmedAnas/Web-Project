// Token storage keys
const AUTH_TOKEN_KEY = 'rb_auth_token';
const REFRESH_TOKEN_KEY = 'rb_refresh_token';
const USER_DATA_KEY = 'rb_user_data';

/**
 * Store authentication tokens and user data in localStorage
 * @param {string} token - JWT auth token
 * @param {string} refreshToken - JWT refresh token
 * @param {Object} userData - User data object
 */
export const setAuthTokens = (token, refreshToken, userData) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Get the current authentication token
 * @returns {string|null} The stored auth token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get the current refresh token
 * @returns {string|null} The stored refresh token or null
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get the current user data
 * @returns {Object|null} The stored user data or null
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Update stored user data
 * @param {Object} userData - Updated user data
 */
export const updateUserData = (userData) => {
  const currentData = getUserData();
  localStorage.setItem(USER_DATA_KEY, JSON.stringify({
    ...currentData,
    ...userData
  }));
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get the user's role
 * @returns {string|null} The user's role or null
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData ? userData.role : null;
};

/**
 * Check if the user has a specific role
 * @param {string|Array} roles - Role or array of roles to check
 * @returns {boolean} True if user has the role, false otherwise
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Check if the token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get the payload part of the JWT
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if the token has an expiration time
    if (!decodedPayload.exp) return false;
    
    // Compare expiration time with current time
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};
