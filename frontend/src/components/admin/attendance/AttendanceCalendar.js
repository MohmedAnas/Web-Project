import React from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';

const AttendanceCalendar = ({ attendanceData, selectedDate, onDateSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Weekly Attendance</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(attendanceData).map(([date, data], index) => {
            const currentDate = new Date(date);
            const percentage = Math.round((data.present / data.total) * 100);
            
            return (
              <motion.div 
                key={date} 
                className={`p-4 rounded-lg border cursor-pointer ${
                  isSameDay(currentDate, selectedDate)
                    ? 'border-admin-primary bg-admin-primary/5'
                    : 'border-gray-200 hover:border-admin-primary/50 hover:bg-admin-primary/5'
                }`}
                onClick={() => onDateSelect(currentDate)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500">{format(currentDate, 'EEE')}</p>
                  <p className="text-sm font-semibold text-gray-900">{format(currentDate, 'd')}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        percentage >= 90 ? 'bg-green-500' : 
                        percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-700">{percentage}%</p>
                  <div className="mt-1 flex justify-center space-x-1 text-xs">
                    <span className="text-green-600">{data.present}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{data.total}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
