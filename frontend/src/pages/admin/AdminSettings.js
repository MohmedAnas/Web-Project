import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Mail, 
  Bell, 
  Shield, 
  Database,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import custom components - these will be created separately
import SystemSettings from '../../components/admin/settings/SystemSettings';
import UserManagement from '../../components/admin/settings/UserManagement';
import EmailTemplates from '../../components/admin/settings/EmailTemplates';
import NotificationSettings from '../../components/admin/settings/NotificationSettings';
import SecuritySettings from '../../components/admin/settings/SecuritySettings';
import BackupSettings from '../../components/admin/settings/BackupSettings';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async (settings, type) => {
    try {
      setLoading(true);
      // In a real app, this would call the API to save settings
      // await adminAPI.saveSettings(type, settings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully`);
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error);
      toast.error(`Failed to save ${type} settings`);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <SystemSettings onSave={(settings) => handleSaveSettings(settings, 'system')} />;
      case 'users':
        return <UserManagement onSave={(settings) => handleSaveSettings(settings, 'users')} />;
      case 'email':
        return <EmailTemplates onSave={(settings) => handleSaveSettings(settings, 'email')} />;
      case 'notifications':
        return <NotificationSettings onSave={(settings) => handleSaveSettings(settings, 'notifications')} />;
      case 'security':
        return <SecuritySettings onSave={(settings) => handleSaveSettings(settings, 'security')} />;
      case 'backup':
        return <BackupSettings onSave={(settings) => handleSaveSettings(settings, 'backup')} />;
      default:
        return <SystemSettings onSave={(settings) => handleSaveSettings(settings, 'system')} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Tabs */}
        <motion.div 
          className="w-full md:w-64 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          </div>
          <div className="p-2">
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'system' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="font-medium">System</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'users' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              <span className="font-medium">User Management</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'email' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="h-5 w-5 mr-3" />
              <span className="font-medium">Email Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'notifications' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="h-5 w-5 mr-3" />
              <span className="font-medium">Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'security' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield className="h-5 w-5 mr-3" />
              <span className="font-medium">Security</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                activeTab === 'backup' 
                  ? 'bg-admin-primary/10 text-admin-primary' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Database className="h-5 w-5 mr-3" />
              <span className="font-medium">Backup & Restore</span>
            </button>
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          className="flex-1 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>

      {/* Save Button (Fixed at bottom) */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => document.getElementById('settings-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-admin-primary text-white rounded-lg shadow-lg hover:bg-admin-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
