import React from 'react';

const LoadingIndicator = ({ size = 'medium', fullScreen = false, message = 'Loading...' }) => {
  // Size variants
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  
  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <svg className={`animate-spin ${spinnerSize} text-blue-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {message && <p className="mt-3 text-gray-700 font-medium">{message}</p>}
        </div>
      </div>
    );
  }
  
  // Inline loading indicator
  return (
    <div className="flex items-center justify-center p-4">
      <svg className={`animate-spin ${spinnerSize} text-blue-600 mr-3`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {message && <p className="text-gray-700 font-medium">{message}</p>}
    </div>
  );
};

// Skeleton loading component for content placeholders
export const SkeletonLoader = ({ type = 'text', lines = 1, className = '' }) => {
  const renderSkeletonLine = (key) => (
    <div 
      key={key}
      className={`animate-pulse bg-gray-200 rounded ${
        type === 'text' ? 'h-4 mb-2' : 
        type === 'circle' ? 'rounded-full' : 
        type === 'button' ? 'h-10 rounded-md' : 
        type === 'image' ? 'h-40 rounded-md' : 'h-4'
      } ${className}`}
    ></div>
  );
  
  if (type === 'card') {
    return (
      <div className="animate-pulse bg-white p-4 rounded-lg shadow-md">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded-md w-1/3"></div>
      </div>
    );
  }
  
  if (type === 'table') {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-100 rounded-t-md mb-2"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 mb-2 rounded"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {Array.from({ length: lines }).map((_, i) => renderSkeletonLine(i))}
    </div>
  );
};

export default LoadingIndicator;
