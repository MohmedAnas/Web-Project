import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Calendar, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const IssueCertificateModal = ({ certificate, onClose, onIssue }) => {
  const [formData, setFormData] = useState({
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    sendEmail: true,
    remarks: ''
  });

  if (!certificate) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onIssue(formData);
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
            <Award className="h-6 w-6 text-admin-primary mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Issue Certificate</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student and Course Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Issue Date */}
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                required
              />
            </div>

            {/* Send Email Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                name="sendEmail"
                checked={formData.sendEmail}
                onChange={handleChange}
                className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-gray-300 rounded"
              />
              <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700">
                Send certificate to student via email
              </label>
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows="3"
                value={formData.remarks}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                placeholder="Add any additional notes about this certificate"
              ></textarea>
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Certificate Preview</h3>
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-admin-primary" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Certificate of Completion</h4>
              <p className="text-sm text-gray-600">This is to certify that</p>
              <p className="text-base font-semibold text-gray-900">{certificate.student_name}</p>
              <p className="text-sm text-gray-600">has successfully completed the course</p>
              <p className="text-base font-semibold text-gray-900">{certificate.course}</p>
              <p className="text-sm text-gray-600">on</p>
              <p className="text-base font-medium text-gray-900">
                {format(new Date(certificate.completion_date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary"
            >
              Issue Certificate
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default IssueCertificateModal;
