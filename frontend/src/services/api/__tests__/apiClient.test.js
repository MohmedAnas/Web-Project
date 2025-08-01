import axios from 'axios';
import apiClient from '../apiClient';
import { getAuthToken, clearAuthTokens } from '../../../utils/auth';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock auth utils
jest.mock('../../../utils/auth', () => ({
  getAuthToken: jest.fn(),
  clearAuthTokens: jest.fn(),
}));

describe('API Client', () => {
  let mockAxiosInstance;
  let requestInterceptor;
  let responseInterceptor;
  let responseErrorInterceptor;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mock axios instance
    mockAxiosInstance = axios.create();
    
    // Capture the interceptors
    requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
    responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    console.error.mockRestore();
  });
  
  test('creates axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: expect.any(Number),
    });
  });
  
  test('request interceptor adds auth token to headers if available', () => {
    // Mock token
    const token = 'test-token';
    getAuthToken.mockReturnValue(token);
    
    // Create a mock config
    const config = {
      headers: {},
    };
    
    // Call the interceptor
    const result = requestInterceptor(config);
    
    // Check if token was added to headers
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    expect(getAuthToken).toHaveBeenCalled();
  });
  
  test('request interceptor does not add auth token if not available', () => {
    // Mock no token
    getAuthToken.mockReturnValue(null);
    
    // Create a mock config
    const config = {
      headers: {},
    };
    
    // Call the interceptor
    const result = requestInterceptor(config);
    
    // Check that no Authorization header was added
    expect(result.headers.Authorization).toBeUndefined();
    expect(getAuthToken).toHaveBeenCalled();
  });
  
  test('response interceptor returns response unchanged', () => {
    // Create a mock response
    const response = {
      data: { test: 'data' },
      status: 200,
    };
    
    // Call the interceptor
    const result = responseInterceptor(response);
    
    // Check that response is unchanged
    expect(result).toBe(response);
  });
  
  test('response error interceptor handles 401 unauthorized', () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '', pathname: '/dashboard' };
    
    // Create a mock error with 401 response
    const error = {
      config: {},
      response: {
        status: 401,
        data: { detail: 'Token expired' },
      },
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that tokens were cleared and redirect happened
    expect(clearAuthTokens).toHaveBeenCalled();
    expect(window.location.href).toBe('/login?session_expired=true');
    
    // Restore window.location
    window.location = originalLocation;
  });
  
  test('response error interceptor does not redirect on 401 if already on login page', () => {
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '', pathname: '/login' };
    
    // Create a mock error with 401 response
    const error = {
      config: {},
      response: {
        status: 401,
        data: { detail: 'Invalid credentials' },
      },
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that tokens were not cleared and no redirect happened
    expect(clearAuthTokens).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
    
    // Restore window.location
    window.location = originalLocation;
  });
  
  test('response error interceptor handles 403 forbidden', () => {
    // Create a mock error with 403 response
    const error = {
      config: {},
      response: {
        status: 403,
        data: { detail: 'Permission denied' },
      },
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('Permission denied:', error.response.data);
  });
  
  test('response error interceptor handles 500 server error', () => {
    // Create a mock error with 500 response
    const error = {
      config: {},
      response: {
        status: 500,
        data: { detail: 'Internal server error' },
      },
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('Server error:', error.response.data);
  });
  
  test('response error interceptor handles network error', () => {
    // Create a mock network error
    const error = {
      message: 'Network Error',
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('Network error - please check your connection');
  });
  
  test('response error interceptor handles timeout', () => {
    // Create a mock timeout error
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded',
    };
    
    // Call the interceptor
    expect(() => responseErrorInterceptor(error)).toThrow();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('Request timeout - server took too long to respond');
  });
});
