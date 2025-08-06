import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth, USER_TYPES } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Validation schemas
const studentLoginSchema = Yup.object().shape({
  student_id: Yup.string().required('Student ID is required'),
  password: Yup.string().required('Password is required'),
});

const adminLoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const { login, loading, authError } = useAuth();

  const handleSubmit = async (values) => {
    const userType = activeTab === 'student' ? USER_TYPES.STUDENT : USER_TYPES.ADMIN;
    await login(values, userType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">R.B Computer</h1>
            <p className="text-gray-600 mt-2">Student Management System</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'student'
                  ? 'bg-student-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-admin-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {authError}
            </div>
          )}

          {/* Student Login Form */}
          {activeTab === 'student' && (
            <Formik
              initialValues={{ student_id: '', password: '' }}
              validationSchema={studentLoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <Field
                      type="text"
                      name="student_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      placeholder="Enter your student ID"
                    />
                    <ErrorMessage name="student_id" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      placeholder="Enter your password"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full bg-student-primary hover:bg-student-secondary text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Logging in...
                        </>
                      ) : (
                        'Login as Student'
                      )}
                    </button>
                    
                    <Link
                      to="/register/student"
                      className="w-full bg-white hover:bg-gray-50 text-student-primary border-2 border-student-primary font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary flex items-center justify-center"
                    >
                      New Student? Register Here
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Admin Login Form */}
          {activeTab === 'admin' && (
            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={adminLoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Field
                      type="text"
                      name="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      placeholder="Enter your username"
                    />
                    <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      placeholder="Enter your password"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full bg-admin-primary hover:bg-admin-secondary text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Logging in...
                        </>
                      ) : (
                        'Login as Admin'
                      )}
                    </button>
                    
                    <Link
                      to="/register/admin"
                      className="w-full bg-white hover:bg-gray-50 text-admin-primary border-2 border-admin-primary font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary flex items-center justify-center"
                    >
                      New Admin? Register Here
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Forgot your password?{' '}
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Reset it here
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} R.B Computer. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
