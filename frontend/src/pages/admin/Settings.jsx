import React, { useState } from 'react';
import { FiSave, FiSettings, FiMail, FiUser, FiLock, FiDatabase, FiBell } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Import settings components
import NotificationSettings from '../../components/settings/NotificationSettings';
import EmailSettings from '../../components/settings/EmailSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <nav className="space-y-1">
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'general' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <FiSettings className="mr-3 h-5 w-5" />
              General
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'notifications' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell className="mr-3 h-5 w-5" />
              Notifications
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'email' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('email')}
            >
              <FiMail className="mr-3 h-5 w-5" />
              Email
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'users' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <FiUser className="mr-3 h-5 w-5" />
              User Management
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'security' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <FiLock className="mr-3 h-5 w-5" />
              Security
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'database' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('database')}
            >
              <FiDatabase className="mr-3 h-5 w-5" />
              Database
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'email' && <EmailSettings />}
          {activeTab === 'users' && <UserManagementSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'database' && <DatabaseSettings />}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    instituteName: 'R.B Computer',
    address: '123 Main Street, City, State, 400001',
    phone: '+91 9876543210',
    website: 'www.rbcomputer.com',
    logo: null,
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to backend
    alert('Settings saved successfully!');
  };
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="instituteName" className="block text-sm font-medium text-gray-700">
              Institute Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="instituteName"
                id="instituteName"
                value={settings.instituteName}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phone"
                id="phone"
                value={settings.phone}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                value={settings.address}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="website"
                id="website"
                value={settings.website}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <div className="mt-1">
              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (GMT +5:30)</option>
                <option value="America/New_York">America/New_York (GMT -5:00)</option>
                <option value="Europe/London">Europe/London (GMT +0:00)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT +9:00)</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <div className="mt-1">
              <select
                id="dateFormat"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
              Time Format
            </label>
            <div className="mt-1">
              <select
                id="timeFormat"
                name="timeFormat"
                value={settings.timeFormat}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Institute Logo</label>
            <div className="mt-1 flex items-center">
              <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                {settings.logo ? (
                  <img src={settings.logo} alt="Institute logo" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </span>
              <button
                type="button"
                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change
              </button>
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

export default Settings;
