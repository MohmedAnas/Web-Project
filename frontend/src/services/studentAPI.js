import api from './api';

// Field mapping utility for student data
const mapStudentFields = (frontendData) => {
  const fieldMapping = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'email': 'Email',
    'phone': 'Phone',
    'date_of_birth': 'Date of Birth',
    'address': 'Address',
    'course_interested': 'Course',
    'course': 'Course',
    'gender': 'Gender',
    'guardian_name': 'Guardian Name',
    'guardian_phone': 'Guardian Phone',
    'enrollment_date': 'Enrollment Date',
    'status': 'Status',
    // Support both camelCase and snake_case
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'dateOfBirth': 'Date of Birth',
    'guardianName': 'Guardian Name',
    'guardianPhone': 'Guardian Phone'
  };

  const backendData = {};
  
  // Map frontend fields to backend fields
  Object.keys(frontendData).forEach(key => {
    const backendKey = fieldMapping[key] || key;
    if (frontendData[key] !== undefined && frontendData[key] !== null && frontendData[key] !== '') {
      backendData[backendKey] = frontendData[key];
    }
  });

  return backendData;
};

// Student registration with correct field mapping
export const registerStudent = async (studentData) => {
  try {
    const mappedData = mapStudentFields(studentData);
    const response = await api.post('/students', mappedData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export default {
  registerStudent,
};
