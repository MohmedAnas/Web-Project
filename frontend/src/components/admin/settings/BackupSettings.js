import React, { useState, useEffect } from 'react';

const BackupSettings = ({ onSave }) => {
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    includeFiles: true,
    includeDatabase: true,
    compressionEnabled: true,
    encryptionEnabled: true,
    backupLocation: 'local',
    cloudProvider: 'aws',
    maxBackupSize: 1000, // MB
    emailNotifications: true,
    notificationEmail: 'admin@rbcomputer.com'
  });

  const [backupHistory, setBackupHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    // Mock backup history
    setBackupHistory([
      {
        id: 1,
        date: '2024-08-01T02:00:00Z',
        type: 'Automatic',
        status: 'Success',
        size: '245 MB',
        duration: '3m 45s'
      },
      {
        id: 2,
        date: '2024-07-31T02:00:00Z',
        type: 'Automatic',
        status: 'Success',
        size: '243 MB',
        duration: '3m 32s'
      },
      {
        id: 3,
        date: '2024-07-30T14:30:00Z',
        type: 'Manual',
        status: 'Success',
        size: '241 MB',
        duration: '3m 28s'
      },
      {
        id: 4,
        date: '2024-07-30T02:00:00Z',
        type: 'Automatic',
        status: 'Failed',
        size: '-',
        duration: '-',
        error: 'Insufficient storage space'
      },
      {
        id: 5,
        date: '2024-07-29T02:00:00Z',
        type: 'Automatic',
        status: 'Success',
        size: '238 MB',
        duration: '3m 15s'
      }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await onSave(settings);
      setMessage('Backup settings saved successfully!');
    } catch (error) {
      setMessage('Error saving backup settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setMessage('');

    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: backupHistory.length + 1,
        date: new Date().toISOString(),
        type: 'Manual',
        status: 'Success',
        size: '247 MB',
        duration: '3m 52s'
      };
      
      setBackupHistory(prev => [newBackup, ...prev]);
      setMessage('Manual backup created successfully!');
    } catch (error) {
      setMessage('Error creating backup. Please try again.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = (backupId) => {
    if (window.confirm('Are you sure you want to restore from this backup? This action cannot be undone.')) {
      setMessage('Backup restoration initiated. This may take several minutes...');
    }
  };

  const handleDeleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
      setMessage('Backup deleted successfully.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Backup Settings</h2>
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingBackup ? 'Creating Backup...' : 'Create Manual Backup'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Backup Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Backup Configuration</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            {/* Auto Backup */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoBackup"
                checked={settings.autoBackup}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable Automatic Backups
              </label>
            </div>

            {/* Backup Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleChange}
                disabled={!settings.autoBackup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Backup Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Time (24-hour format)
              </label>
              <input
                type="time"
                name="backupTime"
                value={settings.backupTime}
                onChange={handleChange}
                disabled={!settings.autoBackup || settings.backupFrequency === 'hourly'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Retention Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                name="retentionDays"
                value={settings.retentionDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Backups older than this will be automatically deleted
              </p>
            </div>

            {/* What to Backup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What to Backup
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeDatabase"
                    checked={settings.includeDatabase}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Database
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeFiles"
                    checked={settings.includeFiles}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Files and Media
                  </label>
                </div>
              </div>
            </div>

            {/* Backup Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Options
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="compressionEnabled"
                    checked={settings.compressionEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Enable Compression
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="encryptionEnabled"
                    checked={settings.encryptionEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Enable Encryption
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
              </div>
              {settings.emailNotifications && (
                <input
                  type="email"
                  name="notificationEmail"
                  value={settings.notificationEmail}
                  onChange={handleChange}
                  placeholder="admin@rbcomputer.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Backup Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Backup History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Backup History</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {backupHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No backups found</p>
            ) : (
              <div className="space-y-3">
                {backupHistory.map((backup) => (
                  <div key={backup.id} className="bg-white rounded-md p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
                          <span className="text-sm text-gray-500">{backup.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(backup.date)}
                        </p>
                      </div>
                      {backup.status === 'Success' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1 text-gray-700">{backup.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 text-gray-700">{backup.duration}</span>
                      </div>
                    </div>
                    
                    {backup.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {backup.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
