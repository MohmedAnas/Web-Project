import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would call the API
      // await authAPI.forgotPassword(values.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to process your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center mb-6">
            <Link 
              to="/login" 
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Login</span>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <Link 
                to="/login" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Formik
                initialValues={{ email: '' }}
                validationSchema={forgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting: formIsSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your email address"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || formIsSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Sending...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </>
          )}
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

export default ForgotPasswordPage;
