import React from 'react';
import { motion } from 'framer-motion';
import { X, Award, Calendar, User, BookOpen, Download, Send } from 'lucide-react';
import { format } from 'date-fns';

const ViewCertificateModal = ({ certificate, onClose, onDownload, onSendEmail }) => {
  if (!certificate) return null;

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
            <Award className="h-6 w-6 text-admin-primary mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Certificate Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Award className="h-16 w-16 text-admin-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Certificate of Completion</h3>
            <p className="text-gray-600">This is to certify that</p>
            <p className="text-xl font-semibold text-gray-900">{certificate.student_name}</p>
            <p className="text-gray-600">has successfully completed the course</p>
            <p className="text-xl font-semibold text-gray-900">{certificate.course}</p>
            <p className="text-gray-600">on</p>
            <p className="text-lg font-medium text-gray-900">
              {format(new Date(certificate.completion_date), 'MMMM d, yyyy')}
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500">Certificate Number: {certificate.certificate_number}</p>
              <p className="text-sm text-gray-500">Issue Date: {format(new Date(certificate.issue_date), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Student</p>
              <p className="text-sm text-gray-900">{certificate.student_name}</p>
              <p className="text-xs text-gray-500">{certificate.student_id}</p>
            </div>
          </div>
          <div className="flex items-start">
            <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Course</p>
              <p className="text-sm text-gray-900">{certificate.course}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Completion Date</p>
              <p className="text-sm text-gray-900">{format(new Date(certificate.completion_date), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Issue Date</p>
              <p className="text-sm text-gray-900">{format(new Date(certificate.issue_date), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Award className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Certificate Number</p>
              <p className="text-sm text-gray-900">{certificate.certificate_number}</p>
            </div>
          </div>
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created By</p>
              <p className="text-sm text-gray-900">{certificate.created_by}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(certificate.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onDownload(certificate)}
            className="px-4 py-2 flex items-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          {!certificate.email_sent && (
            <button
              onClick={() => onSendEmail(certificate)}
              className="px-4 py-2 flex items-center bg-admin-primary text-white rounded-md hover:bg-admin-secondary"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ViewCertificateModal;
