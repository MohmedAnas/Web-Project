import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockNoticesData = [
  {
    id: 1,
    title: "Holiday Notice",
    content: "Institute will remain closed on 25th October for Diwali. Regular classes will resume on 26th October. Wishing everyone a happy and safe Diwali!",
    date: "2023-10-20",
    category: "Holiday",
    important: true
  },
  {
    id: 2,
    title: "New Course Announcement",
    content: "We are excited to announce a new course on AI & Machine Learning starting from November. Interested students can contact the administration for more details and enrollment.",
    date: "2023-10-18",
    category: "Announcement",
    important: true
  },
  {
    id: 3,
    title: "Fee Payment Reminder",
    content: "This is a reminder that the last date for fee payment is 30th October. Please ensure timely payment to avoid late fees.",
    date: "2023-10-15",
    category: "Fee",
    important: true
  },
  {
    id: 4,
    title: "Computer Lab Maintenance",
    content: "The computer lab will be under maintenance on Saturday, 28th October from 10 AM to 2 PM. Please plan your lab work accordingly.",
    date: "2023-10-22",
    category: "Maintenance",
    important: false
  },
  {
    id: 5,
    title: "Guest Lecture on Web Development Trends",
    content: "We are pleased to announce a guest lecture on 'Latest Trends in Web Development' by Mr. Rajesh Kumar, Senior Developer at TechCorp, on 27th October at 11 AM in the main hall.",
    date: "2023-10-21",
    category: "Event",
    important: false
  },
  {
    id: 6,
    title: "Updated Class Schedule",
    content: "Please note that the class schedule for Web Development has been updated. The new schedule is available on the notice board and has been emailed to all enrolled students.",
    date: "2023-10-14",
    category: "Schedule",
    important: false
  },
  {
    id: 7,
    title: "Placement Drive Announcement",
    content: "A placement drive for our graduating students will be held on 5th November. Companies like TechSolutions, WebWorks, and DataMinds will be participating. Eligible students should register by 30th October.",
    date: "2023-10-12",
    category: "Placement",
    important: true
  }
];

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    // Simulate API call
    const fetchNotices = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getNotices();
        // setNotices(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setNotices(mockNoticesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching notices:', error);
        setLoading(false);
        toast.error('Failed to load notices');
      }
    };

    fetchNotices();
  }, []);

  const toggleNoticeExpand = (noticeId) => {
    if (expandedNotice === noticeId) {
      setExpandedNotice(null);
    } else {
      setExpandedNotice(noticeId);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...new Set(notices.map(notice => notice.category))];

  // Filter notices based on search term and category
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notices..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-student-primary focus:border-student-primary"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Notices Found</h2>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                notice.important ? 'border-red-200' : 'border-gray-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      notice.important ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <Bell className={`h-5 w-5 ${
                        notice.important ? 'text-red-500' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">{notice.title}</h2>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(notice.date), 'MMMM d, yyyy')}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notice.category === 'Holiday' ? 'bg-blue-100 text-blue-800' :
                          notice.category === 'Announcement' ? 'bg-purple-100 text-purple-800' :
                          notice.category === 'Fee' ? 'bg-yellow-100 text-yellow-800' :
                          notice.category === 'Placement' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notice.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNoticeExpand(notice.id)}
                    className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-100"
                  >
                    {expandedNotice === notice.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                
                {expandedNotice === notice.id ? (
                  <motion.div 
                    className="mt-4 text-gray-600"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="whitespace-pre-line">{notice.content}</p>
                  </motion.div>
                ) : (
                  <p className="mt-4 text-gray-600 line-clamp-2">{notice.content}</p>
                )}
                
                {expandedNotice !== notice.id && (
                  <button
                    onClick={() => toggleNoticeExpand(notice.id)}
                    className="mt-2 text-sm text-student-primary hover:text-student-secondary"
                  >
                    Read more
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotices;
