import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar
} from 'lucide-react';

const AttendanceStatistics = ({ statistics }) => {
  const {
    totalStudents,
    presentToday,
    absentToday,
    averageAttendance,
    lastWeekAverage,
    thisMonthAverage
  } = statistics;

  // Calculate week-over-week change
  const weeklyChange = averageAttendance - lastWeekAverage;
  const weeklyChangePercent = lastWeekAverage > 0 
    ? Math.round((weeklyChange / lastWeekAverage) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Students */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Present Today */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <p className="text-2xl font-semibold text-gray-900">{presentToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((presentToday / totalStudents) * 100)}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Absent Today */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Absent Today</p>
              <p className="text-2xl font-semibold text-gray-900">{absentToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((absentToday / totalStudents) * 100)}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Average Attendance */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Average Attendance</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{averageAttendance}%</p>
                {weeklyChange > 0 ? (
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {weeklyChangePercent}%
                  </p>
                ) : (
                  <p className="ml-2 flex items-center text-sm text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {Math.abs(weeklyChangePercent)}%
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Compared to last week
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Week Average */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Last Week</p>
              <p className="text-2xl font-semibold text-gray-900">{lastWeekAverage}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* This Month Average */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{thisMonthAverage}%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceStatistics;
