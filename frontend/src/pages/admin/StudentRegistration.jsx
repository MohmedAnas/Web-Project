import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUser, FiPhone, FiMail, FiCalendar, FiHome, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    photo: null,
    
    // Educational Details
    education: '',
    institution: '',
    yearOfCompletion: '',
    
    // Course Details
    courseId: '',
    batchType: 'morning', // morning, afternoon, evening
    startDate: '',
    
    // Parent/Guardian Details
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianEmail: '',
    
    // Fee Details
    feeAmount: '',
    discountAmount: '0',
    paymentMode: 'cash',
    initialPayment: '',
    
    // Additional Information
    howDidYouHear: '',
    comments: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Mock courses data - replace with API call
  const courses = [
    { id: 1, name: 'Advanced Web Development', fee: 15000 },
    { id: 2, name: 'Python Programming', fee: 12000 },
    { id: 3, name: 'Data Science Fundamentals', fee: 20000 },
    { id: 4, name: 'Office Automation', fee: 8000 },
    { id: 5, name: 'Graphic Design', fee: 18000 }
  ];
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Auto-fill fee amount when course is selected
    if (name === 'courseId') {
      const selectedCourse = courses.find(course => course.id === parseInt(value));
      if (selectedCourse) {
        setFormData({
          ...formData,
          courseId: value,
          feeAmount: selectedCourse.fee.toString()
        });
      }
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate personal details
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';
      if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
        newErrors.pincode = 'PIN code must be 6 digits';
      }
    } else if (step === 2) {
      // Validate course details
      if (!formData.courseId) newErrors.courseId = 'Course selection is required';
      if (!formData.batchType) newErrors.batchType = 'Batch type is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
    } else if (step === 3) {
      // Validate guardian details
      if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
      if (!formData.guardianRelation.trim()) newErrors.guardianRelation = 'Relation is required';
      if (!formData.guardianPhone.trim()) newErrors.guardianPhone = 'Guardian phone is required';
      if (formData.guardianPhone.trim() && !/^\d{10}$/.test(formData.guardianPhone.trim())) {
        newErrors.guardianPhone = 'Phone number must be 10 digits';
      }
      if (formData.guardianEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail.trim())) {
        newErrors.guardianEmail = 'Invalid email format';
      }
    } else if (step === 4) {
      // Validate fee details
      if (!formData.feeAmount.trim()) newErrors.feeAmount = 'Fee amount is required';
      if (!formData.initialPayment.trim()) newErrors.initialPayment = 'Initial payment is required';
      if (parseFloat(formData.initialPayment) > parseFloat(formData.feeAmount) - parseFloat(formData.discountAmount || 0)) {
        newErrors.initialPayment = 'Initial payment cannot exceed total fee amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      // Submit form data to backend
      console.log('Form submitted:', formData);
      
      // Show success message and redirect
      alert('Student registered successfully!');
      navigate('/admin/students');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/students')}
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Student Registration</h1>
        </div>
        
        <div className="text-sm font-medium text-gray-500">
          Step {currentStep} of 4
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <FiUser className="mr-2 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-900">Personal Details</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.firstName ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.lastName ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.gender ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.dateOfBirth ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.phone ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700">
                    Alternate Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="alternatePhone"
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.address ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.city ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.state ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="pincode"
                      id="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.pincode ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Student Photo
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      {formData.photo ? (
                        <img 
                          src={URL.createObjectURL(formData.photo)} 
                          alt="Student" 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </span>
                    <label
                      htmlFor="photo"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Upload
                      <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="pt-5">
            <div className="flex justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div>
                {currentStep < 4 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleNext}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiSave className="mr-2 h-5 w-5" />
                    Register Student
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
