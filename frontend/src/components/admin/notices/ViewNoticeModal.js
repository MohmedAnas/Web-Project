import React from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ViewNoticeModal = ({ notice, onClose }) => {
  if (!notice) return null;

  const getTargetAudienceText = (audience) => {
    switch (audience) {
      case 'all': return 'Everyone';
      case 'students': return 'Students';
      case 'parents': return 'Parents';
      case 'staff': return 'Staff';
      default: return audience;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-admin-primary mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Notice Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(notice.status)}`}>
                {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Target Audience</p>
                <p className="text-sm text-gray-900">{getTargetAudienceText(notice.target_audience)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Publish Date</p>
                <p className="text-sm text-gray-900">{format(new Date(notice.publish_date), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className="text-sm text-gray-900">{format(new Date(notice.expiry_date), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(notice.created_at), 'MMMM d, yyyy h:mm a')} by {notice.created_by}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewNoticeModal;
