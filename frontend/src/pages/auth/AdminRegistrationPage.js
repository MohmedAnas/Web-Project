import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, User, Mail, Phone, Shield, Building, IdCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

// Validation schema for admin registration
const adminRegistrationSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  employee_id: Yup.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .required('Employee ID is required'),
  department: Yup.string()
    .required('Department is required'),
  designation: Yup.string()
    .required('Designation is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  admin_code: Yup.string()
    .required('Admin registration code is required'),
  terms_accepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const departmentOptions = [
  'Administration',
  'Academic Affairs',
  'Student Services',
  'IT Department',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
];

const designationOptions = [
  'Director',
  'Assistant Director',
  'Academic Coordinator',
  'Course Instructor',
  'Student Counselor',
  'IT Administrator',
  'Finance Manager',
  'HR Manager',
  'Marketing Executive',
  'Operations Manager',
];

const AdminRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Remove confirm_password and terms_accepted from the data sent to API
      const { confirm_password, terms_accepted, ...registrationData } = values;
      
      const response = await authAPI.registerAdmin(registrationData);
      
      toast.success('Admin registration successful! Please wait for approval from super admin.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link 
                to="/login" 
                className="inline-flex items-center text-admin-primary hover:text-admin-secondary mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Admin Registration</h1>
              <p className="text-gray-600 mt-2">Join R.B Computer Institute as Administrator</p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin registration requires approval from super admin
                </p>
              </div>
            </div>

            <Formik
              initialValues={{
                first_name: '',
                last_name: '',
                username: '',
                email: '',
                phone: '',
                employee_id: '',
                department: '',
                designation: '',
                password: '',
                confirm_password: '',
                admin_code: '',
                terms_accepted: false,
              }}
              validationSchema={adminRegistrationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="w-4 h-4 inline mr-1" />
                        First Name
                      </label>
                      <Field
                        type="text"
                        name="first_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Enter your first name"
                      />
                      <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="w-4 h-4 inline mr-1" />
                        Last Name
                      </label>
                      <Field
                        type="text"
                        name="last_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Enter your last name"
                      />
                      <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Username
                    </label>
                    <Field
                      type="text"
                      name="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      placeholder="Choose a unique username"
                    />
                    <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <Field
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Enter your phone number"
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Employee Information */}
                  <div>
                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                      <IdCard className="w-4 h-4 inline mr-1" />
                      Employee ID
                    </label>
                    <Field
                      type="text"
                      name="employee_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      placeholder="Enter your employee ID"
                    />
                    <ErrorMessage name="employee_id" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Department and Designation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        <Building className="w-4 h-4 inline mr-1" />
                        Department
                      </label>
                      <Field
                        as="select"
                        name="department"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Designation
                      </label>
                      <Field
                        as="select"
                        name="designation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      >
                        <option value="">Select designation</option>
                        {designationOptions.map((designation) => (
                          <option key={designation} value={designation}>
                            {designation}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="designation" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Admin Registration Code */}
                  <div>
                    <label htmlFor="admin_code" className="block text-sm font-medium text-gray-700 mb-1">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Admin Registration Code
                    </label>
                    <Field
                      type="password"
                      name="admin_code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      placeholder="Enter admin registration code"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact super admin to get the registration code
                    </p>
                    <ErrorMessage name="admin_code" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Create a strong password"
                      />
                      <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <Field
                        type="password"
                        name="confirm_password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                        placeholder="Confirm your password"
                      />
                      <ErrorMessage name="confirm_password" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <Field
                      type="checkbox"
                      name="terms_accepted"
                      className="mt-1 h-4 w-4 text-admin-primary focus:ring-admin-primary border-gray-300 rounded"
                    />
                    <label htmlFor="terms_accepted" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-admin-primary hover:text-admin-secondary font-medium">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-admin-primary hover:text-admin-secondary font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  <ErrorMessage name="terms_accepted" component="div" className="text-sm text-red-600" />

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full bg-admin-primary hover:bg-admin-secondary text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Admin Account'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-admin-primary hover:text-admin-secondary font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
