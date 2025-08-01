/**
 * Error handling utility functions
 */

// Parse API error responses
export const parseApiError = (error) => {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // Handle axios error objects
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    // Handle different status codes
    switch (status) {
      case 400:
        // Bad request - typically validation errors
        if (data.errors && typeof data.errors === 'object') {
          // Format validation errors
          return Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        }
        return data.message || data.error || 'Invalid request data';
        
      case 401:
        // Unauthorized
        return 'Authentication required. Please log in again.';
        
      case 403:
        // Forbidden
        return 'You do not have permission to perform this action.';
        
      case 404:
        // Not found
        return 'The requested resource was not found.';
        
      case 422:
        // Unprocessable entity - typically validation errors
        if (data.errors && typeof data.errors === 'object') {
          return Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        }
        return data.message || 'The provided data was invalid.';
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        return 'A server error occurred. Please try again later.';
        
      default:
        // Other status codes
        return data.message || data.error || `Error: ${status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server. Please check your internet connection.';
  } else if (error.message) {
    // Something happened in setting up the request that triggered an Error
    return error.message;
  }
  
  // For non-axios errors or unknown structures
  return error.toString();
};

// Log errors to console or external service
export const logError = (error, context = {}) => {
  console.error('Error:', error);
  console.error('Context:', context);
  
  // Here you could add integration with external error logging services
  // like Sentry, LogRocket, etc.
  
  // Example with Sentry (commented out)
  // if (window.Sentry) {
  //   window.Sentry.withScope((scope) => {
  //     Object.keys(context).forEach((key) => {
  //       scope.setExtra(key, context[key]);
  //     });
  //     window.Sentry.captureException(error);
  //   });
  // }
};

// Handle form validation errors
export const handleFormErrors = (error, setFieldError, setStatus) => {
  if (error.response && error.response.data && error.response.data.errors) {
    // Map backend validation errors to form fields
    const { errors } = error.response.data;
    Object.keys(errors).forEach((field) => {
      // Convert snake_case to camelCase if needed
      const formField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      setFieldError(formField, Array.isArray(errors[field]) ? errors[field][0] : errors[field]);
    });
    
    setStatus({ error: 'Please correct the errors below.' });
  } else {
    // Generic error message
    setStatus({ error: parseApiError(error) });
  }
};

// Create a retry mechanism for failed requests
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        throw error;
      }
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};

export default {
  parseApiError,
  logError,
  handleFormErrors,
  retryOperation
};
