import {
  setAuthTokens,
  getAuthToken,
  getRefreshToken,
  getUserData,
  updateUserData,
  clearAuthTokens,
  isAuthenticated,
  getUserRole,
  hasRole,
  isTokenExpired
} from '../auth';

describe('Auth Utilities', () => {
  // Mock localStorage
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('setAuthTokens stores tokens and user data in localStorage', () => {
    const token = 'test-token';
    const refreshToken = 'test-refresh-token';
    const userData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    
    setAuthTokens(token, refreshToken, userData);
    
    expect(localStorage.setItem).toHaveBeenCalledTimes(3);
    expect(localStorage.setItem).toHaveBeenCalledWith('rb_auth_token', token);
    expect(localStorage.setItem).toHaveBeenCalledWith('rb_refresh_token', refreshToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('rb_user_data', JSON.stringify(userData));
  });
  
  test('getAuthToken retrieves token from localStorage', () => {
    const token = 'test-token';
    localStorage.getItem.mockReturnValueOnce(token);
    
    const result = getAuthToken();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_auth_token');
    expect(result).toBe(token);
  });
  
  test('getRefreshToken retrieves refresh token from localStorage', () => {
    const refreshToken = 'test-refresh-token';
    localStorage.getItem.mockReturnValueOnce(refreshToken);
    
    const result = getRefreshToken();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_refresh_token');
    expect(result).toBe(refreshToken);
  });
  
  test('getUserData retrieves and parses user data from localStorage', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = getUserData();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toEqual(userData);
  });
  
  test('getUserData returns null if no user data is stored', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    const result = getUserData();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBeNull();
  });
  
  test('updateUserData merges new data with existing user data', () => {
    const existingData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    const newData = { name: 'Updated User', email: 'test@example.com' };
    const expectedData = { ...existingData, ...newData };
    
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(existingData));
    
    updateUserData(newData);
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(localStorage.setItem).toHaveBeenCalledWith('rb_user_data', JSON.stringify(expectedData));
  });
  
  test('clearAuthTokens removes all auth data from localStorage', () => {
    clearAuthTokens();
    
    expect(localStorage.removeItem).toHaveBeenCalledTimes(3);
    expect(localStorage.removeItem).toHaveBeenCalledWith('rb_auth_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('rb_refresh_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('rb_user_data');
  });
  
  test('isAuthenticated returns true if auth token exists', () => {
    localStorage.getItem.mockReturnValueOnce('test-token');
    
    const result = isAuthenticated();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_auth_token');
    expect(result).toBe(true);
  });
  
  test('isAuthenticated returns false if auth token does not exist', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    const result = isAuthenticated();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_auth_token');
    expect(result).toBe(false);
  });
  
  test('getUserRole returns user role from user data', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = getUserRole();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe('ADMIN');
  });
  
  test('getUserRole returns null if no user data exists', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    const result = getUserRole();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBeNull();
  });
  
  test('hasRole returns true if user has the specified role', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = hasRole('ADMIN');
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe(true);
  });
  
  test('hasRole returns true if user has one of the specified roles', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'ADMIN' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = hasRole(['EDITOR', 'ADMIN', 'VIEWER']);
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe(true);
  });
  
  test('hasRole returns false if user does not have the specified role', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'EDITOR' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = hasRole('ADMIN');
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe(false);
  });
  
  test('hasRole returns false if user does not have any of the specified roles', () => {
    const userData = { id: 'user-1', name: 'Test User', role: 'VIEWER' };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const result = hasRole(['EDITOR', 'ADMIN']);
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe(false);
  });
  
  test('hasRole returns false if no user data exists', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    const result = hasRole('ADMIN');
    
    expect(localStorage.getItem).toHaveBeenCalledWith('rb_user_data');
    expect(result).toBe(false);
  });
  
  test('isTokenExpired returns true for expired token', () => {
    // Create an expired token (payload with exp in the past)
    const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const payload = btoa(JSON.stringify({ exp: expiredTime }));
    const token = `header.${payload}.signature`;
    
    const result = isTokenExpired(token);
    
    expect(result).toBe(true);
  });
  
  test('isTokenExpired returns false for valid token', () => {
    // Create a valid token (payload with exp in the future)
    const validTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const payload = btoa(JSON.stringify({ exp: validTime }));
    const token = `header.${payload}.signature`;
    
    const result = isTokenExpired(token);
    
    expect(result).toBe(false);
  });
  
  test('isTokenExpired returns true for null or undefined token', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired(undefined)).toBe(true);
  });
  
  test('isTokenExpired returns false for token without expiration', () => {
    // Create a token without exp claim
    const payload = btoa(JSON.stringify({ sub: 'user-1' }));
    const token = `header.${payload}.signature`;
    
    const result = isTokenExpired(token);
    
    expect(result).toBe(false);
  });
  
  test('isTokenExpired handles invalid token format gracefully', () => {
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Test with invalid token
    const result = isTokenExpired('invalid-token');
    
    expect(result).toBe(true);
    expect(console.error).toHaveBeenCalled();
    
    console.error.mockRestore();
  });
});
