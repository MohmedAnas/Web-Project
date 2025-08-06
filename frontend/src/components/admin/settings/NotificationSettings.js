import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    studentRegistration: true,
    feePayment: true,
    attendanceAlert: true,
    courseCompletion: true,
    systemUpdates: false,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });
  
  const handleToggle = (name) => {
    setSettings({
      ...settings,
      [name]: !settings[name]
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to backend
    alert('Notification settings saved successfully!');
  };
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Notification Channels</h3>
            <p className="text-sm text-gray-500">Choose how you want to receive notifications</p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="smsNotifications"
                    name="smsNotifications"
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={() => handleToggle('smsNotifications')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="smsNotifications" className="font-medium text-gray-700">
                    SMS Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications via SMS (additional charges may apply)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Event Notifications</h3>
            <p className="text-sm text-gray-500">Select which events trigger notifications</p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="studentRegistration"
                    name="studentRegistration"
                    type="checkbox"
                    checked={settings.studentRegistration}
                    onChange={() => handleToggle('studentRegistration')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="studentRegistration" className="font-medium text-gray-700">
                    Student Registration
                  </label>
                  <p className="text-gray-500">When a new student registers</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="feePayment"
                    name="feePayment"
                    type="checkbox"
                    checked={settings.feePayment}
                    onChange={() => handleToggle('feePayment')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="feePayment" className="font-medium text-gray-700">
                    Fee Payment
                  </label>
                  <p className="text-gray-500">When a student makes a fee payment</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="attendanceAlert"
                    name="attendanceAlert"
                    type="checkbox"
                    checked={settings.attendanceAlert}
                    onChange={() => handleToggle('attendanceAlert')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="attendanceAlert" className="font-medium text-gray-700">
                    Attendance Alerts
                  </label>
                  <p className="text-gray-500">When a student has low attendance</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="courseCompletion"
                    name="courseCompletion"
                    type="checkbox"
                    checked={settings.courseCompletion}
                    onChange={() => handleToggle('courseCompletion')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="courseCompletion" className="font-medium text-gray-700">
                    Course Completion
                  </label>
                  <p className="text-gray-500">When a student completes a course</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="systemUpdates"
                    name="systemUpdates"
                    type="checkbox"
                    checked={settings.systemUpdates}
                    onChange={() => handleToggle('systemUpdates')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="systemUpdates" className="font-medium text-gray-700">
                    System Updates
                  </label>
                  <p className="text-gray-500">When there are system updates or maintenance</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Report Notifications</h3>
            <p className="text-sm text-gray-500">Configure automated report notifications</p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="dailyReports"
                    name="dailyReports"
                    type="checkbox"
                    checked={settings.dailyReports}
                    onChange={() => handleToggle('dailyReports')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="dailyReports" className="font-medium text-gray-700">
                    Daily Reports
                  </label>
                  <p className="text-gray-500">Receive daily summary reports</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="weeklyReports"
                    name="weeklyReports"
                    type="checkbox"
                    checked={settings.weeklyReports}
                    onChange={() => handleToggle('weeklyReports')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="weeklyReports" className="font-medium text-gray-700">
                    Weekly Reports
                  </label>
                  <p className="text-gray-500">Receive weekly summary reports</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="monthlyReports"
                    name="monthlyReports"
                    type="checkbox"
                    checked={settings.monthlyReports}
                    onChange={() => handleToggle('monthlyReports')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="monthlyReports" className="font-medium text-gray-700">
                    Monthly Reports
                  </label>
                  <p className="text-gray-500">Receive monthly summary reports</p>
                </div>
              </div>
            </div>
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

export default NotificationSettings;
