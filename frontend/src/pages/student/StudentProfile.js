import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Save, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Mock data - in a real app, this would come from API
const mockStudentData = {
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  student_id: "STU001",
  phone: "+91 9876543210",
  address: "123 Main Street, Mumbai, Maharashtra 400001",
  date_of_birth: "2000-05-15",
  parent_name: "Rajesh Sharma",
  parent_email: "rajesh.sharma@example.com",
  parent_phone: "+91 9876543211",
};

const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
  address: Yup.string(),
  parent_name: Yup.string(),
  parent_email: Yup.string().email('Invalid email'),
  parent_phone: Yup.string(),
});

const StudentProfile = () => {
  const { currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchStudentData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getProfile();
        // setStudentData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setStudentData(mockStudentData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setLoading(false);
        toast.error('Failed to load profile data');
      }
    };

    fetchStudentData();
  }, []);

  const handleSubmit = async (values) => {
    setSaveLoading(true);
    
    try {
      // In a real app, you would update data via API
      // await studentAPI.updateProfile(values);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudentData(values);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-student-primary text-white rounded-md hover:bg-student-secondary transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isEditing ? (
          <div className="p-6">
            <Formik
              initialValues={studentData}
              validationSchema={profileSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Field
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Field
                        type="text"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <Field
                        type="text"
                        name="student_id"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Student ID cannot be changed</p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <Field
                        as="textarea"
                        name="address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Parent/Guardian Information</h3>
                    </div>

                    <div>
                      <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name
                      </label>
                      <Field
                        type="text"
                        name="parent_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="parent_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Email
                      </label>
                      <Field
                        type="email"
                        name="parent_email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="parent_email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Phone
                      </label>
                      <Field
                        type="text"
                        name="parent_phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary transition-colors"
                      />
                      <ErrorMessage name="parent_phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={saveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading || isSubmitting}
                      className="flex items-center px-4 py-2 bg-student-primary text-white rounded-md hover:bg-student-secondary transition-colors disabled:opacity-70"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-student-primary text-white flex items-center justify-center text-4xl font-bold">
                  {studentData.name.charAt(0)}
                </div>
              </div>
              
              <div className="md:w-2/3 mt-6 md:mt-0">
                <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                <p className="text-student-primary font-medium">Student ID: {studentData.student_id}</p>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-gray-900">{studentData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{studentData.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-900">{studentData.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">
                        {studentData.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{studentData.parent_name || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900">{studentData.parent_email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{studentData.parent_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;
