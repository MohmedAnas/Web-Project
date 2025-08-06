import React, { useState } from 'react';
import { FiSave, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@rbcomputer.com',
    smtpPassword: '********',
    senderEmail: 'notifications@rbcomputer.com',
    senderName: 'R.B Computer',
    enableSSL: true,
    emailSignature: '<p>Best Regards,<br>R.B Computer Team<br>Phone: +91 9876543210</p>',
    parentWeeklyReport: true,
    studentWelcomeEmail: true,
    feeReceiptEmail: true
  });
  
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to backend
    alert('Email settings saved successfully!');
  };
  
  const handleTestEmail = (e) => {
    e.preventDefault();
    // Simulate sending test email
    setTestEmailStatus('sending');
    setTimeout(() => {
      setTestEmailStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setTestEmailStatus(null), 3000);
    }, 2000);
  };
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">SMTP Configuration</h3>
            <p className="text-sm text-gray-500">Configure your email server settings</p>
            
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700">
                  SMTP Server
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="smtpServer"
                    id="smtpServer"
                    value={settings.smtpServer}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                  SMTP Port
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="smtpPort"
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700">
                  SMTP Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="smtpUsername"
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                  SMTP Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="smtpPassword"
                    id="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">
                  Sender Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="senderEmail"
                    id="senderEmail"
                    value={settings.senderEmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
                  Sender Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="senderName"
                    id="senderName"
                    value={settings.senderName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableSSL"
                      name="enableSSL"
                      type="checkbox"
                      checked={settings.enableSSL}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableSSL" className="font-medium text-gray-700">
                      Enable SSL/TLS
                    </label>
                    <p className="text-gray-500">Use secure connection for sending emails</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Email Templates</h3>
            <p className="text-sm text-gray-500">Configure automated email templates</p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="parentWeeklyReport"
                    name="parentWeeklyReport"
                    type="checkbox"
                    checked={settings.parentWeeklyReport}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="parentWeeklyReport" className="font-medium text-gray-700">
                    Parent Weekly Report
                  </label>
                  <p className="text-gray-500">Send weekly progress reports to parents</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="studentWelcomeEmail"
                    name="studentWelcomeEmail"
                    type="checkbox"
                    checked={settings.studentWelcomeEmail}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="studentWelcomeEmail" className="font-medium text-gray-700">
                    Student Welcome Email
                  </label>
                  <p className="text-gray-500">Send welcome email to new students</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="feeReceiptEmail"
                    name="feeReceiptEmail"
                    type="checkbox"
                    checked={settings.feeReceiptEmail}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="feeReceiptEmail" className="font-medium text-gray-700">
                    Fee Receipt Email
                  </label>
                  <p className="text-gray-500">Send fee receipt via email after payment</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Email Signature</h3>
            <p className="text-sm text-gray-500">Set the signature that will appear at the bottom of all emails</p>
            
            <div className="mt-4">
              <textarea
                id="emailSignature"
                name="emailSignature"
                rows={4}
                value={settings.emailSignature}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <p className="mt-2 text-sm text-gray-500">
                HTML formatting is supported. Use &lt;br&gt; for line breaks.
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Test Email Configuration</h3>
            <p className="text-sm text-gray-500">Send a test email to verify your settings</p>
            
            <div className="mt-4 flex items-end space-x-4">
              <div className="flex-grow">
                <label htmlFor="testEmailAddress" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="testEmailAddress"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter email address"
                />
              </div>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={!testEmailAddress || testEmailStatus === 'sending'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${testEmailStatus === 'sending' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <FiSend className="mr-2 h-5 w-5" />
                {testEmailStatus === 'sending' ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            
            {testEmailStatus === 'success' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Test email sent successfully!
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-5">
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiSave className="mr-2 h-5 w-5" />
              Save Settings
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailSettings;
