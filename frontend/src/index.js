import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { logError } from './utils/errorHandler';

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  logError(event.error, {
    type: 'uncaught_exception',
    message: event.message,
    source: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
  
  // Optionally show a user-friendly message
  // This could use a simple alert or a more sophisticated UI
  // that doesn't depend on your React components (which might be broken)
  const errorMessage = document.createElement('div');
  errorMessage.style.position = 'fixed';
  errorMessage.style.top = '20px';
  errorMessage.style.left = '50%';
  errorMessage.style.transform = 'translateX(-50%)';
  errorMessage.style.backgroundColor = '#FEE2E2';
  errorMessage.style.color = '#B91C1C';
  errorMessage.style.padding = '12px 16px';
  errorMessage.style.borderRadius = '4px';
  errorMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  errorMessage.style.zIndex = '9999';
  errorMessage.textContent = 'An unexpected error occurred. Please refresh the page.';
  
  document.body.appendChild(errorMessage);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorMessage)) {
      document.body.removeChild(errorMessage);
    }
  }, 5000);
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, {
    type: 'unhandled_promise_rejection',
    reason: event.reason ? event.reason.toString() : 'Unknown reason'
  });
});

// Add viewport meta tag for responsive design
if (!document.querySelector('meta[name="viewport"]')) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
