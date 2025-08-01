import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary, ToastProvider } from './components/common';

// Admin pages
import FeeManagement from './pages/admin/FeeManagement';
// Import other admin pages as needed

// Student pages
import StudentFees from './pages/student/StudentFees';
// Import other student pages as needed

// Layout components (placeholder - you would implement these)
const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    {/* Admin sidebar, header, etc. would go here */}
    <main className="admin-main">{children}</main>
  </div>
);

const StudentLayout = ({ children }) => (
  <div className="student-layout">
    {/* Student sidebar, header, etc. would go here */}
    <main className="student-main">{children}</main>
  </div>
);

// Error fallback component
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">We're sorry, but there was an error loading the application.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Reload Application
      </button>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout><div>Admin Dashboard</div></AdminLayout>} />
            <Route path="/admin/fees" element={<AdminLayout><FeeManagement /></AdminLayout>} />
            {/* Add more admin routes as needed */}
            
            {/* Student routes */}
            <Route path="/student" element={<StudentLayout><div>Student Dashboard</div></StudentLayout>} />
            <Route path="/student/fees" element={<StudentLayout><StudentFees /></StudentLayout>} />
            {/* Add more student routes as needed */}
            
            {/* Auth routes */}
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
            
            {/* Default route */}
            <Route path="/" element={<div>Landing Page</div>} />
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page not found</p>
                  <a 
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
