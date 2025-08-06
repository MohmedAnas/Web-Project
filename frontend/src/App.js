import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import StudentLayout from './components/layouts/StudentLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import StudentRegistrationPage from './pages/auth/StudentRegistrationPage';
import AdminRegistrationPage from './pages/auth/AdminRegistrationPage';
import TermsPage from './pages/auth/TermsPage';
import PrivacyPage from './pages/auth/PrivacyPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import StudentDetails from './pages/admin/StudentDetails';
import CourseManagement from './pages/admin/CourseManagement';
import CourseDetails from './pages/admin/CourseDetails';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import FeesManagement from './pages/admin/FeesManagement';
import NoticesManagement from './pages/admin/NoticesManagement';
import CertificatesManagement from './pages/admin/CertificatesManagement';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import AdminApprovals from './pages/admin/AdminApprovals';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentFees from './pages/student/StudentFees';
import StudentNotices from './pages/student/StudentNotices';
import StudentCertificates from './pages/student/StudentCertificates';
import StudentProfile from './pages/student/StudentProfile';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it
  if (requiredRole && userType !== requiredRole) {
    // Redirect students to student dashboard
    if (userType === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // Redirect admins to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// App Component with Routing
const AppContent = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register/student" element={<StudentRegistrationPage />} />
        <Route path="/register/admin" element={<AdminRegistrationPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="fees" element={<FeesManagement />} />
          <Route path="notices" element={<NoticesManagement />} />
          <Route path="certificates" element={<CertificatesManagement />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
