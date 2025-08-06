import React from 'react';
import { motion } from 'framer-motion';
import { Award, Mail, Clock } from 'lucide-react';

const CertificateStatistics = ({ statistics }) => {
  const {
    totalCertificates,
    issuedCertificates,
    pendingCertificates,
    emailsSent
  } = statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Certificates */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Certificates</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCertificates}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Issued Certificates */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Issued Certificates</p>
              <p className="text-2xl font-semibold text-gray-900">{issuedCertificates}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalCertificates > 0 ? Math.round((issuedCertificates / totalCertificates) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Certificates */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending Certificates</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCertificates}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalCertificates > 0 ? Math.round((pendingCertificates / totalCertificates) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emails Sent */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Emails Sent</p>
              <p className="text-2xl font-semibold text-gray-900">{emailsSent}</p>
              <p className="text-xs text-gray-500 mt-1">
                {issuedCertificates > 0 ? Math.round((emailsSent / issuedCertificates) * 100) : 0}% of issued
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateStatistics;
