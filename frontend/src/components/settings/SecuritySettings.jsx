import React, { useState } from 'react';
import { FiSave, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90
    },
    loginSecurity: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      enableTwoFactor: false
    },
    dataProtection: {
      enableDataEncryption: true,
      automaticBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30
    }
  });
  
  const handlePasswordPolicyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
      }
    });
  };
  
  const handleLoginSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      loginSecurity: {
        ...settings.loginSecurity,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
      }
    });
  };
  
  const handleDataProtectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      dataProtection: {
        ...settings.dataProtection,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to backend
    alert('Security settings saved successfully!');
  };
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Password Policy</h3>
            <p className="text-sm text-gray-500">Configure password requirements for all users</p>
            
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">
                  Minimum Password Length
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="minLength"
                    id="minLength"
                    min="6"
                    max="20"
                    value={settings.passwordPolicy.minLength}
                    onChange={handlePasswordPolicyChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700">
                  Password Expiry (days)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="passwordExpiry"
                    id="passwordExpiry"
                    min="0"
                    max="365"
                    value={settings.passwordPolicy.passwordExpiry}
                    onChange={handlePasswordPolicyChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for no expiry</p>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="requireUppercase"
                        name="requireUppercase"
                        type="checkbox"
                        checked={settings.passwordPolicy.requireUppercase}
                        onChange={handlePasswordPolicyChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireUppercase" className="font-medium text-gray-700">
                        Require Uppercase Letters
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="requireLowercase"
                        name="requireLowercase"
                        type="checkbox"
                        checked={settings.passwordPolicy.requireLowercase}
                        onChange={handlePasswordPolicyChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireLowercase" className="font-medium text-gray-700">
                        Require Lowercase Letters
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="requireNumbers"
                        name="requireNumbers"
                        type="checkbox"
                        checked={settings.passwordPolicy.requireNumbers}
                        onChange={handlePasswordPolicyChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireNumbers" className="font-medium text-gray-700">
                        Require Numbers
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="requireSpecialChars"
                        name="requireSpecialChars"
                        type="checkbox"
                        checked={settings.passwordPolicy.requireSpecialChars}
                        onChange={handlePasswordPolicyChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireSpecialChars" className="font-medium text-gray-700">
                        Require Special Characters
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Login Security</h3>
            <p className="text-sm text-gray-500">Configure login security settings</p>
            
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                  Max Login Attempts
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    id="maxLoginAttempts"
                    min="1"
                    max="10"
                    value={settings.loginSecurity.maxLoginAttempts}
                    onChange={handleLoginSecurityChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700">
                  Lockout Duration (minutes)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="lockoutDuration"
                    id="lockoutDuration"
                    min="5"
                    max="1440"
                    value={settings.loginSecurity.lockoutDuration}
                    onChange={handleLoginSecurityChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="sessionTimeout"
                    id="sessionTimeout"
                    min="5"
                    max="1440"
                    value={settings.loginSecurity.sessionTimeout}
                    onChange={handleLoginSecurityChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableTwoFactor"
                      name="enableTwoFactor"
                      type="checkbox"
                      checked={settings.loginSecurity.enableTwoFactor}
                      onChange={handleLoginSecurityChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableTwoFactor" className="font-medium text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                    <p className="text-gray-500">Require two-factor authentication for all admin users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Data Protection</h3>
            <p className="text-sm text-gray-500">Configure data protection and backup settings</p>
            
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableDataEncryption"
                      name="enableDataEncryption"
                      type="checkbox"
                      checked={settings.dataProtection.enableDataEncryption}
                      onChange={handleDataProtectionChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableDataEncryption" className="font-medium text-gray-700">
                      Enable Data Encryption
                    </label>
                    <p className="text-gray-500">Encrypt sensitive data in the database</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="automaticBackup"
                      name="automaticBackup"
                      type="checkbox"
                      checked={settings.dataProtection.automaticBackup}
                      onChange={handleDataProtectionChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="automaticBackup" className="font-medium text-gray-700">
                      Enable Automatic Backups
                    </label>
                    <p className="text-gray-500">Automatically backup database and files</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">
                  Backup Frequency
                </label>
                <div className="mt-1">
                  <select
                    id="backupFrequency"
                    name="backupFrequency"
                    value={settings.dataProtection.backupFrequency}
                    onChange={handleDataProtectionChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={!settings.dataProtection.automaticBackup}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700">
                  Retention Period (days)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="retentionPeriod"
                    id="retentionPeriod"
                    min="1"
                    max="365"
                    value={settings.dataProtection.retentionPeriod}
                    onChange={handleDataProtectionChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={!settings.dataProtection.automaticBackup}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiShield className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Security Notice:</strong> Changing these settings may affect all users of the system. 
                    Make sure you understand the implications before saving.
                  </p>
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

export default SecuritySettings;
