import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockStudentsData = [
  { id: 1, student_id: "STU001", name: "Rahul Sharma", present: true },
  { id: 2, student_id: "STU002", name: "Priya Patel", present: true },
  { id: 3, student_id: "STU003", name: "Amit Kumar", present: false },
  { id: 4, student_id: "STU004", name: "Neha Singh", present: true },
  { id: 5, student_id: "STU005", name: "Rajesh Verma", present: true },
  { id: 6, student_id: "STU006", name: "Ananya Gupta", present: false },
  { id: 7, student_id: "STU007", name: "Vikram Malhotra", present: true },
  { id: 8, student_id: "STU008", name: "Pooja Sharma", present: true },
  { id: 9, student_id: "STU009", name: "Karan Singh", present: true },
  { id: 10, student_id: "STU010", name: "Divya Patel", present: false }
];

const MarkAttendanceModal = ({ batch, date, onClose, onSave }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [markAll, setMarkAll] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch students in the batch
    const fetchStudents = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getBatchStudents(batch.id, format(date, 'yyyy-MM-dd'));
        // setStudents(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setStudents(mockStudentsData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [batch, date]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleAttendance = (studentId) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present } 
          : student
      )
    );
  };

  const handleMarkAll = (status) => {
    setMarkAll(status);
    setStudents(prev => 
      prev.map(student => ({ ...student, present: status }))
    );
  };

  const handleSave = () => {
    onSave(students);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate attendance statistics
  const totalStudents = students.length;
  const presentStudents = students.filter(student => student.present).length;
  const absentStudents = totalStudents - presentStudents;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-sm text-gray-500">
              {batch.name} - {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
          </div>
        ) : (
          <>
            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Total Students</p>
                    <p className="text-lg font-semibold text-gray-900">{totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Present</p>
                    <p className="text-lg font-semibold text-gray-900">{presentStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-50 p-2 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Absent</p>
                    <p className="text-lg font-semibold text-gray-900">{absentStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Mark All */}
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex items-center space-x-2 md:ml-4">
                <button
                  onClick={() => handleMarkAll(true)}
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    markAll === true 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll(false)}
                  className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    markAll === false 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleToggleAttendance(student.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.present 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(student.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              !student.present 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Attendance: {attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    attendancePercentage >= 90 ? 'bg-green-500' : 
                    attendancePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary"
              >
                Save Attendance
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MarkAttendanceModal;
