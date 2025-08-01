import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Award,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react';

const StudentLayout = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Attendance', href: '/student/attendance', icon: Calendar },
    { name: 'Fee Status', href: '/student/fees', icon: CreditCard },
    { name: 'Notices', href: '/student/notices', icon: Bell },
    { name: 'Certificates', href: '/student/certificates', icon: Award },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full bg-student-primary shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 bg-student-secondary">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white">R.B Computer</span>
                </div>
                <button
                  onClick={closeSidebar}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-white p-1">
                    <div className="h-full w-full rounded-full bg-student-secondary text-white flex items-center justify-center text-2xl font-bold">
                      {currentUser?.name?.charAt(0) || currentUser?.student_id?.charAt(0) || 'S'}
                    </div>
                  </div>
                  <h2 className="mt-4 text-xl font-medium text-white">{currentUser?.name}</h2>
                  <p className="text-student-accent">ID: {currentUser?.student_id}</p>
                </div>
                <nav className="mt-8 px-2 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-student-secondary text-white'
                            : 'text-white hover:bg-student-secondary/70'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="border-t border-student-secondary p-4">
                <button
                  onClick={logout}
                  className="group flex items-center px-4 py-2 text-base font-medium rounded-md text-white hover:bg-student-secondary w-full"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-student-primary">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-student-secondary">
              <span className="text-xl font-bold text-white">R.B Computer</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex flex-col items-center pt-6 pb-4">
                <div className="h-24 w-24 rounded-full bg-white p-1">
                  <div className="h-full w-full rounded-full bg-student-secondary text-white flex items-center justify-center text-3xl font-bold">
                    {currentUser?.name?.charAt(0) || currentUser?.student_id?.charAt(0) || 'S'}
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-medium text-white">{currentUser?.name}</h2>
                <p className="text-student-accent">ID: {currentUser?.student_id}</p>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-student-secondary text-white'
                          : 'text-white hover:bg-student-secondary/70'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="border-t border-student-secondary p-4">
              <button
                onClick={logout}
                className="group flex items-center px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-student-secondary w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-student-primary"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Student Portal</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-student-primary text-white flex items-center justify-center">
                      {currentUser?.name?.charAt(0) || currentUser?.student_id?.charAt(0) || 'S'}
                    </div>
                    <span className="ml-2 text-gray-700 hidden md:block">
                      {currentUser?.name || currentUser?.student_id}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <button
                        onClick={() => {
                          navigate('/student/profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Your Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
