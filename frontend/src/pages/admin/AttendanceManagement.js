import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, subDays, addDays, isToday } from 'date-fns';

// Import custom components
import AttendanceStatistics from '../../components/admin/attendance/AttendanceStatistics';
import AttendanceCalendar from '../../components/admin/attendance/AttendanceCalendar';
import BatchAttendanceTable from '../../components/admin/attendance/BatchAttendanceTable';
import CourseAttendanceTable from '../../components/admin/attendance/CourseAttendanceTable';
import RecentAbsenteesTable from '../../components/admin/attendance/RecentAbsenteesTable';
import MarkAttendanceModal from '../../components/admin/attendance/MarkAttendanceModal';
import AttendanceDetailsModal from '../../components/admin/attendance/AttendanceDetailsModal';

// Mock data - in a real app, this would come from API
const mockAttendanceData = {
  summary: {
    totalStudents: 248,
    presentToday: 220,
    absentToday: 28,
    averageAttendance: 92,
    lastWeekAverage: 89,
    thisMonthAverage: 90
  },
  batches: [
    { id: 1, name: "Morning Batch", time: "9:00 AM - 12:00 PM", students: 85, present: 78, absent: 7 },
    { id: 2, name: "Afternoon Batch", time: "1:00 PM - 4:00 PM", students: 72, present: 65, absent: 7 },
    { id: 3, name: "Evening Batch", time: "5:00 PM - 8:00 PM", students: 91, present: 77, absent: 14 }
  ],
  courses: [
    { id: 1, name: "Web Development", students: 65, present: 60, absent: 5 },
    { id: 2, name: "Digital Marketing", students: 48, present: 42, absent: 6 },
    { id: 3, name: "Python Programming", students: 55, present: 50, absent: 5 },
    { id: 4, name: "Graphic Design", students: 42, present: 38, absent: 4 },
    { id: 5, name: "Data Science", students: 38, present: 30, absent: 8 }
  ],
  recentAbsentees: [
    { id: 1, student_id: "STU001", name: "Rahul Sharma", course: "Web Development", batch: "Morning", consecutive_absences: 2 },
    { id: 2, student_id: "STU015", name: "Ananya Patel", course: "Digital Marketing", batch: "Afternoon", consecutive_absences: 3 },
    { id: 3, student_id: "STU042", name: "Vikram Singh", course: "Python Programming", batch: "Evening", consecutive_absences: 1 },
    { id: 4, student_id: "STU078", name: "Neha Gupta", course: "Graphic Design", batch: "Morning", consecutive_absences: 2 },
    { id: 5, student_id: "STU103", name: "Rajesh Kumar", course: "Data Science", batch: "Evening", consecutive_absences: 4 }
  ],
  attendanceByDate: {
    "2023-10-20": { total: 248, present: 220, absent: 28 },
    "2023-10-19": { total: 248, present: 225, absent: 23 },
    "2023-10-18": { total: 248, present: 230, absent: 18 },
    "2023-10-17": { total: 248, present: 218, absent: 30 },
    "2023-10-16": { total: 248, present: 222, absent: 26 },
    "2023-10-15": { total: 248, present: 215, absent: 33 },
    "2023-10-14": { total: 248, present: 228, absent: 20 }
  }
};

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    batch: 'all',
    course: 'all',
  });
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showAttendanceDetailsModal, setShowAttendanceDetailsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchAttendanceData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getAttendanceData({ date: format(selectedDate, 'yyyy-MM-dd'), ...filters });
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
  }, [selectedDate, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new API call with the search term
    toast.success(`Searching for: ${searchTerm}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleMarkAttendance = (batch) => {
    setSelectedBatch(batch);
    setShowMarkAttendanceModal(true);
  };

  const handleViewAttendanceDetails = (batch) => {
    setSelectedBatch(batch);
    setShowAttendanceDetailsModal(true);
  };

  const handleExportAttendance = () => {
    // In a real app, this would trigger a CSV/Excel export
    toast.success('Exporting attendance data');
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleSaveAttendance = (studentsAttendance) => {
    // In a real app, this would call the API to save attendance
    // await adminAPI.saveAttendance(selectedBatch.id, selectedDate, studentsAttendance);
    
    toast.success(`Attendance saved for ${selectedBatch.name}`);
    setShowMarkAttendanceModal(false);
  };

  const handleExportBatchAttendance = (batch) => {
    // In a real app, this would trigger a CSV/Excel export for the specific batch
    toast.success(`Exporting attendance data for ${batch.name}`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={handleToday}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              isToday(selectedDate) 
                ? 'bg-admin-primary text-white border-admin-primary' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={handlePreviousDay}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextDay}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Date Display */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-sm text-gray-500">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'PPP')}
          </p>
        </div>
      </div>

      {/* Attendance Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AttendanceStatistics statistics={attendanceData.summary} />
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
            <div className="flex items-center space-x-2 md:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleExportAttendance}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.batch}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Batches</option>
                  {attendanceData.batches.map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.course}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Courses</option>
                  {attendanceData.courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Weekly Attendance Calendar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AttendanceCalendar 
          attendanceData={attendanceData.attendanceByDate} 
          selectedDate={selectedDate}
          onDateSelect={handleDateChange}
        />
      </motion.div>

      {/* Batch Attendance Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <BatchAttendanceTable 
          batches={attendanceData.batches}
          onMarkAttendance={handleMarkAttendance}
          onViewDetails={handleViewAttendanceDetails}
        />
      </motion.div>

      {/* Course Attendance Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CourseAttendanceTable courses={attendanceData.courses} />
      </motion.div>

      {/* Recent Absentees Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <RecentAbsenteesTable absentees={attendanceData.recentAbsentees} />
      </motion.div>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && selectedBatch && (
        <MarkAttendanceModal 
          batch={selectedBatch}
          date={selectedDate}
          onClose={() => setShowMarkAttendanceModal(false)}
          onSave={handleSaveAttendance}
        />
      )}

      {/* Attendance Details Modal */}
      {showAttendanceDetailsModal && selectedBatch && (
        <AttendanceDetailsModal 
          batch={selectedBatch}
          onClose={() => setShowAttendanceDetailsModal(false)}
          onExport={handleExportBatchAttendance}
        />
      )}
    </div>
  );
};

export default AttendanceManagement;
