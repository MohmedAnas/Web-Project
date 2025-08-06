import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Create context
const ToastContext = createContext();

// Toast types with their respective styles
const TOAST_TYPES = {
  SUCCESS: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-800',
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  ERROR: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-800',
    icon: (
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  WARNING: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    icon: (
      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  INFO: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-800',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

// Toast item component
const ToastItem = ({ id, type, message, onClose, autoClose = true, duration = 5000 }) => {
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.INFO;
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, onClose, autoClose, duration]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center p-4 mb-3 rounded-md border-l-4 shadow-md ${toastStyle.bgColor} ${toastStyle.borderColor} max-w-md w-full`}
    >
      <div className="flex-shrink-0 mr-3">
        {toastStyle.icon}
      </div>
      <div className={`flex-grow ${toastStyle.textColor}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </motion.div>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (type, message, options = {}) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, type, message, ...options }]);
    return id;
  };
  
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  const clearToasts = () => {
    setToasts([]);
  };
  
  const contextValue = {
    success: (message, options) => addToast('SUCCESS', message, options),
    error: (message, options) => addToast('ERROR', message, options),
    warning: (message, options) => addToast('WARNING', message, options),
    info: (message, options) => addToast('INFO', message, options),
    removeToast,
    clearToasts,
  };
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default { ToastProvider, useToast };
