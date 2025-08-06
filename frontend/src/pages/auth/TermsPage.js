import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <Link 
                to="/login" 
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-primary-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Terms and Conditions</h1>
              </div>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using the R.B Computer Institute Student Management System, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use License</h2>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily access the materials on R.B Computer Institute's system for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the system</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Student Responsibilities</h2>
                <p className="text-gray-600 mb-4">
                  As a student of R.B Computer Institute, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Attend classes regularly and participate actively</li>
                  <li>Pay fees on time as per the institute's fee structure</li>
                  <li>Follow the institute's code of conduct</li>
                  <li>Respect other students and faculty members</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Privacy Policy</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. We collect and use your personal information to provide and improve our services. We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Course Policies</h2>
                <p className="text-gray-600 mb-4">
                  All courses offered by R.B Computer Institute are subject to the following policies:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Course content and schedule may be modified at the institute's discretion</li>
                  <li>Minimum attendance requirements must be met for course completion</li>
                  <li>Certificates will be issued only upon successful completion of courses</li>
                  <li>Refund policies apply as per the institute's refund policy</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  In no event shall R.B Computer Institute or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the system.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Modifications</h2>
                <p className="text-gray-600 mb-4">
                  R.B Computer Institute may revise these terms of service at any time without notice. By using this system, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    <strong>R.B Computer Institute</strong><br />
                    Email: info@rbcomputer.edu<br />
                    Phone: +91 XXXXX XXXXX<br />
                    Address: [Institute Address]
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By registering with R.B Computer Institute, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
