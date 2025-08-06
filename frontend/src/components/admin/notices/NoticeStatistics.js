import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Clock, Users } from 'lucide-react';

const NoticeStatistics = ({ statistics }) => {
  const {
    totalNotices,
    activeNotices,
    scheduledNotices,
    expiredNotices
  } = statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Notices */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Notices</p>
              <p className="text-2xl font-semibold text-gray-900">{totalNotices}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Notices */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Notices</p>
              <p className="text-2xl font-semibold text-gray-900">{activeNotices}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scheduled Notices */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">{scheduledNotices}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expired Notices */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Expired</p>
              <p className="text-2xl font-semibold text-gray-900">{expiredNotices}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeStatistics;
