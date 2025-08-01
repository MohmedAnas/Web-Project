import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Bell, 
  Filter,
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Import custom components
import NoticeModal from '../../components/admin/notices/NoticeModal';
import ViewNoticeModal from '../../components/admin/notices/ViewNoticeModal';
import DeleteNoticeModal from '../../components/admin/notices/DeleteNoticeModal';
import NoticeStatistics from '../../components/admin/notices/NoticeStatistics';

// Mock data - in a real app, this would come from API
const mockNoticesData = {
  notices: [
    {
      id: 1,
      title: "Holiday Notice",
      content: "Institute will remain closed on 25th October for Diwali celebrations. Regular classes will resume on 26th October. Wishing everyone a happy and safe Diwali!",
      target_audience: "all",
      publish_date: "2023-10-20",
      expiry_date: "2023-10-26",
      status: "active",
      created_by: "Admin",
      created_at: "2023-10-15T10:30:00"
    },
    {
      id: 2,
      title: "New Course Announcement",
      content: "We are excited to announce a new course on AI & Machine Learning starting from November 5th. Interested students can register at the front desk. Limited seats available!",
      target_audience: "all",
      publish_date: "2023-10-18",
      expiry_date: "2023-11-05",
      status: "active",
      created_by: "Admin",
      created_at: "2023-10-16T14:15:00"
    },
    {
      id: 3,
      title: "Fee Payment Reminder",
      content: "This is a reminder that the last date for fee payment is 30th October. Students who have not paid their fees are requested to clear their dues before the deadline to avoid late payment charges.",
      target_audience: "students",
      publish_date: "2023-10-15",
      expiry_date: "2023-10-30",
      status: "active",
      created_by: "Admin",
      created_at: "2023-10-14T09:45:00"
    },
    {
      id: 4,
      title: "Parent-Teacher Meeting",
      content: "A parent-teacher meeting is scheduled for 28th October from 10:00 AM to 2:00 PM. Parents are requested to attend the meeting to discuss their ward's progress.",
      target_audience: "parents",
      publish_date: "2023-10-21",
      expiry_date: "2023-10-28",
      status: "scheduled",
      created_by: "Admin",
      created_at: "2023-10-17T11:20:00"
    },
    {
      id: 5,
      title: "System Maintenance",
      content: "The student portal will be down for maintenance on Sunday, 22nd October from 2:00 AM to 6:00 AM. We apologize for any inconvenience caused.",
      target_audience: "all",
      publish_date: "2023-10-19",
      expiry_date: "2023-10-22",
      status: "expired",
      created_by: "Admin",
      created_at: "2023-10-18T16:30:00"
    }
  ],
  total: 5,
  page: 1,
  limit: 10
};

const NoticesManagement = () => {
  const [noticesData, setNoticesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    target_audience: 'all',
  });
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [viewNotice, setViewNotice] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchNotices = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getNotices({ page: currentPage, limit: 10, ...filters });
        // setNoticesData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setNoticesData(mockNoticesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching notices:', error);
        setLoading(false);
        toast.error('Failed to load notices');
      }
    };

    fetchNotices();
  }, [currentPage, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new API call with the search term
    toast.success(`Searching for: ${searchTerm}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddNotice = () => {
    setCurrentNotice(null); // Reset current notice for adding new
    setShowNoticeModal(true);
  };

  const handleEditNotice = (notice) => {
    setCurrentNotice(notice);
    setShowNoticeModal(true);
  };

  const handleDeleteClick = (notice) => {
    setNoticeToDelete(notice);
    setShowDeleteModal(true);
  };

  const handleViewNotice = (notice) => {
    setViewNotice(notice);
  };

  const confirmDelete = async () => {
    try {
      // In a real app, this would call the API to delete the notice
      // await adminAPI.deleteNotice(noticeToDelete.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state to remove the deleted notice
      setNoticesData(prev => ({
        ...prev,
        notices: prev.notices.filter(n => n.id !== noticeToDelete.id),
        total: prev.total - 1
      }));
      
      toast.success(`Notice "${noticeToDelete.title}" deleted successfully`);
      setShowDeleteModal(false);
      setNoticeToDelete(null);
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const saveNotice = async (noticeData) => {
    try {
      // In a real app, this would call the API to save the notice
      if (currentNotice) {
        // Update existing notice
        // await adminAPI.updateNotice(currentNotice.id, noticeData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local state
        setNoticesData(prev => ({
          ...prev,
          notices: prev.notices.map(n => 
            n.id === currentNotice.id ? { ...n, ...noticeData } : n
          )
        }));
        
        toast.success(`Notice "${noticeData.title}" updated successfully`);
      } else {
        // Create new notice
        // const response = await adminAPI.createNotice(noticeData);
        
        // Simulate API delay and response
        await new Promise(resolve => setTimeout(resolve, 800));
        const newNotice = {
          id: Math.max(...noticesData.notices.map(n => n.id)) + 1,
          ...noticeData,
          created_by: "Admin",
          created_at: new Date().toISOString()
        };
        
        // Update local state
        setNoticesData(prev => ({
          ...prev,
          notices: [newNotice, ...prev.notices],
          total: prev.total + 1
        }));
        
        toast.success(`Notice "${noticeData.title}" created successfully`);
      }
      
      setShowNoticeModal(false);
      setCurrentNotice(null);
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Failed to save notice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Calculate statistics
  const statistics = {
    totalNotices: noticesData.notices.length,
    activeNotices: noticesData.notices.filter(n => n.status === 'active').length,
    scheduledNotices: noticesData.notices.filter(n => n.status === 'scheduled').length,
    expiredNotices: noticesData.notices.filter(n => n.status === 'expired').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddNotice}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-admin-primary hover:bg-admin-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Notice
          </button>
        </div>
      </div>

      {/* Notice Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NoticeStatistics statistics={statistics} />
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notices by title or content..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
            <div className="flex items-center space-x-2 md:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  id="target_audience"
                  name="target_audience"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.target_audience}
                  onChange={handleFilterChange}
                >
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Notices List */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Audience
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publish Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {noticesData.notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Bell className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{notice.content}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notice.target_audience === 'all' ? 'Everyone' : 
                     notice.target_audience === 'students' ? 'Students' :
                     notice.target_audience === 'parents' ? 'Parents' : 'Staff'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(notice.publish_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(notice.expiry_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {notice.status === 'active' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : notice.status === 'scheduled' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewNotice(notice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditNotice(notice)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(notice)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={noticesData.notices.length < noticesData.limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{noticesData.notices.length}</span> of{' '}
                <span className="font-medium">{noticesData.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={noticesData.notices.length < noticesData.limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notice Modal */}
      {showNoticeModal && (
        <NoticeModal 
          notice={currentNotice} 
          onClose={() => setShowNoticeModal(false)} 
          onSave={saveNotice} 
        />
      )}

      {/* View Notice Modal */}
      {viewNotice && (
        <ViewNoticeModal 
          notice={viewNotice} 
          onClose={() => setViewNotice(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && noticeToDelete && (
        <DeleteNoticeModal 
          notice={noticeToDelete} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={confirmDelete} 
        />
      )}
    </div>
  );
};

export default NoticesManagement;
