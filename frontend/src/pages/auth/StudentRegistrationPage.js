import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, User, Mail, Phone, MapPin, Calendar, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import studentService from '../../services/api/studentService';

// Validation schema for student registration
const studentRegistrationSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  date_of_birth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .required('Address is required'),
  course_interested: Yup.string()
    .required('Please select a course you are interested in'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  terms_accepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const courseOptions = [
  'Web Development',
  'Digital Marketing',
  'Python Programming',
  'Java Programming',
  'Data Science',
  'Graphic Design',
  'Mobile App Development',
  'Cybersecurity',
  'Cloud Computing',
  'AI & Machine Learning',
];

const StudentRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Remove confirm_password and terms_accepted from the data sent to API
      const { confirm_password, terms_accepted, ...registrationData } = values;
      
      const response = await studentService.createStudent(registrationData);
      
      if (response.success) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
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
                className="inline-flex items-center text-student-primary hover:text-student-secondary mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Student Registration</h1>
              <p className="text-gray-600 mt-2">Join R.B Computer Institute</p>
            </div>

            <Formik
              initialValues={{
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                date_of_birth: '',
                address: '',
                course_interested: '',
                password: '',
                confirm_password: '',
                terms_accepted: false,
              }}
              validationSchema={studentRegistrationSchema}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                        placeholder="Enter your last name"
                      />
                      <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                        placeholder="Enter your phone number"
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date of Birth
                    </label>
                    <Field
                      type="date"
                      name="date_of_birth"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                    />
                    <ErrorMessage name="date_of_birth" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </label>
                    <Field
                      as="textarea"
                      name="address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      placeholder="Enter your complete address"
                    />
                    <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Course Interest */}
                  <div>
                    <label htmlFor="course_interested" className="block text-sm font-medium text-gray-700 mb-1">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Course of Interest
                    </label>
                    <Field
                      as="select"
                      name="course_interested"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                    >
                      <option value="">Select a course</option>
                      {courseOptions.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="course_interested" component="div" className="mt-1 text-sm text-red-600" />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                        placeholder="Create a password"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
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
                      className="mt-1 h-4 w-4 text-student-primary focus:ring-student-primary border-gray-300 rounded"
                    />
                    <label htmlFor="terms_accepted" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-student-primary hover:text-student-secondary font-medium">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-student-primary hover:text-student-secondary font-medium">
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
                      className="w-full bg-student-primary hover:bg-student-secondary text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Student Account'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-student-primary hover:text-student-secondary font-medium">
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

export default StudentRegistrationPage;
