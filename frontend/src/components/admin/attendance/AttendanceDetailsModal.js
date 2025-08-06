import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockAttendanceData = {
  students: [
    { 
      id: 1, 
      student_id: "STU001", 
      name: "Rahul Sharma", 
      attendance: [
        { date: "2023-10-20", status: "present" },
        { date: "2023-10-19", status: "present" },
        { date: "2023-10-18", status: "present" },
        { date: "2023-10-17", status: "present" },
        { date: "2023-10-16", status: "present" },
        { date: "2023-10-15", status: "absent" },
        { date: "2023-10-14", status: "present" }
      ],
      percentage: 86
    },
    { 
      id: 2, 
      student_id: "STU002", 
      name: "Priya Patel", 
      attendance: [
        { date: "2023-10-20", status: "present" },
        { date: "2023-10-19", status: "present" },
        { date: "2023-10-18", status: "present" },
        { date: "2023-10-17", status: "absent" },
        { date: "2023-10-16", status: "present" },
        { date: "2023-10-15", status: "present" },
        { date: "2023-10-14", status: "present" }
      ],
      percentage: 86
    },
    { 
      id: 3, 
      student_id: "STU003", 
      name: "Amit Kumar", 
      attendance: [
        { date: "2023-10-20", status: "absent" },
        { date: "2023-10-19", status: "absent" },
        { date: "2023-10-18", status: "present" },
        { date: "2023-10-17", status: "present" },
        { date: "2023-10-16", status: "present" },
        { date: "2023-10-15", status: "present" },
        { date: "2023-10-14", status: "present" }
      ],
      percentage: 71
    },
    { 
      id: 4, 
      student_id: "STU004", 
      name: "Neha Singh", 
      attendance: [
        { date: "2023-10-20", status: "present" },
        { date: "2023-10-19", status: "present" },
        { date: "2023-10-18", status: "present" },
        { date: "2023-10-17", status: "present" },
        { date: "2023-10-16", status: "present" },
        { date: "2023-10-15", status: "present" },
        { date: "2023-10-14", status: "present" }
      ],
      percentage: 100
    },
    { 
      id: 5, 
      student_id: "STU005", 
      name: "Rajesh Verma", 
      attendance: [
        { date: "2023-10-20", status: "present" },
        { date: "2023-10-19", status: "present" },
        { date: "2023-10-18", status: "present" },
        { date: "2023-10-17", status: "absent" },
        { date: "2023-10-16", status: "absent" },
        { date: "2023-10-15", status: "present" },
        { date: "2023-10-14", status: "present" }
      ],
      percentage: 71
    }
  ],
  dates: ["2023-10-20", "2023-10-19", "2023-10-18", "2023-10-17", "2023-10-16", "2023-10-15", "2023-10-14"]
};

const AttendanceDetailsModal = ({ batch, onClose, onExport }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call to fetch attendance details
    const fetchAttendanceDetails = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getBatchAttendanceDetails(batch.id);
        // setAttendanceData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setAttendanceData(mockAttendanceData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching attendance details:', error);
        setLoading(false);
      }
    };

    fetchAttendanceDetails();
  }, [batch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter students based on search term
  const filteredStudents = attendanceData?.students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attendance Details</h2>
            <p className="text-sm text-gray-500">
              {batch.name} - {batch.time}
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
            {/* Search and Export */}
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
                  onClick={() => onExport(batch)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Student
                    </th>
                    {attendanceData.dates.map(date => (
                      <th key={date} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {format(new Date(date), 'dd MMM')}
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.student_id}</div>
                        </div>
                      </td>
                      {student.attendance.map((day) => (
                        <td key={day.date} className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                            day.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {day.status === 'present' ? 'P' : 'A'}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.percentage >= 90 ? 'bg-green-100 text-green-800' : 
                          student.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AttendanceDetailsModal;
