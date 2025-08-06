import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Phone, Save, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Mock data - in a real app, this would come from API
const mockAdminData = {
  id: 1,
  name: "Amit Kumar",
  email: "amit.kumar@rbcomputer.com",
  username: "amitkumar",
  phone: "+91 9876543210",
  role: "admin",
  last_login: "2023-10-22T08:30:00Z"
};

const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
});

const AdminProfile = () => {
  const { currentUser } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchAdminData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getProfile();
        // setAdminData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setAdminData(mockAdminData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
        toast.error('Failed to load profile data');
      }
    };

    fetchAdminData();
  }, []);

  const handleSubmit = async (values) => {
    setSaveLoading(true);
    
    try {
      // In a real app, you would update data via API
      // await adminAPI.updateProfile(values);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAdminData(values);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
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
            className="flex items-center px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors"
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
              initialValues={adminData}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <Field
                        type="text"
                        name="username"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
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
                      className="flex items-center px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors disabled:opacity-70"
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
                <div className="h-32 w-32 rounded-full bg-admin-primary text-white flex items-center justify-center text-4xl font-bold">
                  {adminData.name.charAt(0)}
                </div>
              </div>
              
              <div className="md:w-2/3 mt-6 md:mt-0">
                <h2 className="text-2xl font-bold text-gray-900">{adminData.name}</h2>
                <p className="text-admin-primary font-medium capitalize">{adminData.role}</p>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-gray-900">{adminData.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-gray-900">{adminData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{adminData.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-gray-900">
                      {new Date(adminData.last_login).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-gray-900 capitalize">{adminData.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={() => toast.success('Password change functionality would be implemented here')}
                className="text-admin-primary hover:text-admin-secondary"
              >
                Change Password
              </button>
            </div>
            
            <div>
              <button
                onClick={() => toast.success('Two-factor authentication would be implemented here')}
                className="text-admin-primary hover:text-admin-secondary"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminProfile;
