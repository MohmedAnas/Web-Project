import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockAttendanceData = {
  student_id: "STU001",
  name: "Rahul Sharma",
  course: "Web Development",
  batch: "Morning",
  overall_percentage: 85,
  monthly_percentage: 92,
  attendance_records: [
    { date: "2023-10-02", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-04", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-06", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-09", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-11", status: "absent", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-13", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-16", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-18", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-20", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-23", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-25", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-27", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-10-30", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-11-01", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-11-03", status: "absent", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-11-06", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-11-08", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" },
    { date: "2023-11-10", status: "present", course: "Web Development", time: "10:00 AM - 12:00 PM" }
  ]
};

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateRecord, setSelectedDateRecord] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchAttendanceData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getAttendance();
        // setAttendanceData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setAttendanceData(mockAttendanceData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setLoading(false);
        toast.error('Failed to load attendance data');
      }
    };

    fetchAttendanceData();
  }, []);

  useEffect(() => {
    if (selectedDate && attendanceData) {
      const record = attendanceData.attendance_records.find(
        record => isSameDay(new Date(record.date), selectedDate)
      );
      setSelectedDateRecord(record);
    } else {
      setSelectedDateRecord(null);
    }
  }, [selectedDate, attendanceData]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const getAttendanceStatus = (day) => {
    if (!attendanceData) return null;
    
    return attendanceData.attendance_records.find(
      record => isSameDay(new Date(record.date), day)
    )?.status || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate statistics for the current month
  const currentMonthRecords = attendanceData.attendance_records.filter(
    record => isSameMonth(new Date(record.date), currentMonth)
  );
  
  const presentDays = currentMonthRecords.filter(record => record.status === 'present').length;
  const totalDays = currentMonthRecords.length;
  const monthlyPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Stats */}
        <motion.div 
          className="lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
                  <span className="text-sm font-medium text-gray-700">{attendanceData.overall_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      attendanceData.overall_percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${attendanceData.overall_percentage}%` }}
                  ></div>
                </div>
                {attendanceData.overall_percentage < 75 && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Attendance below required 75%
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">This Month</span>
                  <span className="text-sm font-medium text-gray-700">{monthlyPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      monthlyPercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${monthlyPercentage}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Present: {presentDays} / Total: {totalDays} days
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-gray-300 rounded-full mr-2"></div>
                    <span>No Class</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Attendance Calendar</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-gray-900 font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="h-10 rounded-md"></div>
              ))}
              
              {daysInMonth.map((day) => {
                const status = getAttendanceStatus(day);
                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    className={`h-10 rounded-md flex items-center justify-center relative ${
                      isSameDay(day, selectedDate)
                        ? 'ring-2 ring-student-primary'
                        : ''
                    } ${
                      status === 'present'
                        ? 'bg-green-100 hover:bg-green-200'
                        : status === 'absent'
                        ? 'bg-red-100 hover:bg-red-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-sm ${
                      status === 'present'
                        ? 'text-green-800'
                        : status === 'absent'
                        ? 'text-red-800'
                        : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {status && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gray-400"></span>
                    )}
                  </button>
                );
              })}
              
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="h-10 rounded-md"></div>
              ))}
            </div>
            
            {selectedDateRecord && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedDateRecord.course}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedDateRecord.time}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium mr-2">Status:</span>
                    {selectedDateRecord.status === 'present' ? (
                      <span className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Present
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <X className="h-4 w-4 mr-1" />
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Attendance Records */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Recent Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.attendance_records.slice(0, 10).map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.status === 'present' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Present
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentAttendance;
