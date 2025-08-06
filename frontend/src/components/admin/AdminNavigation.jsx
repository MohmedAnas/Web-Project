import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBook, 
  FiDollarSign, 
  FiCalendar, 
  FiBell, 
  FiFileText, 
  FiSettings 
} from 'react-icons/fi';

const AdminNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiHome /> },
    { name: 'Students', path: '/admin/students', icon: <FiUsers /> },
    { name: 'Courses', path: '/admin/courses', icon: <FiBook /> },
    { name: 'Fees', path: '/admin/fees', icon: <FiDollarSign /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <FiCalendar /> },
    { name: 'Notices', path: '/admin/notices', icon: <FiBell /> },
    { name: 'Certificates', path: '/admin/certificates', icon: <FiFileText /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> }
  ];
  
  return (
    <nav className="bg-white shadow-md rounded-lg p-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="mr-3 h-5 w-5">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdminNavigation;
