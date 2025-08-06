import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPage = () => {
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
                <Shield className="w-8 h-8 text-primary-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
              </div>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-4">
                  We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support.
                </p>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information:</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and address</li>
                  <li>Educational background and course preferences</li>
                  <li>Payment information for course fees</li>
                  <li>Academic records and attendance data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Provide, maintain, and improve our educational services</li>
                  <li>Process course enrollments and manage your account</li>
                  <li>Send you course-related communications and updates</li>
                  <li>Track attendance and academic progress</li>
                  <li>Process payments and manage billing</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Generate certificates and academic records</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety, or that of our users</li>
                  <li>With service providers who assist us in operating our platform (under strict confidentiality agreements)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Staff training on data protection practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
                  <li>Remember your login preferences</li>
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
                <p className="text-gray-600 mb-4">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Academic records may be retained for longer periods as required by educational regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    <strong>R.B Computer Institute</strong><br />
                    Privacy Officer<br />
                    Email: privacy@rbcomputer.edu<br />
                    Phone: +91 XXXXX XXXXX<br />
                    Address: [Institute Address]
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using our services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
