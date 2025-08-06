import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
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
  Settings,
  User,
  Shield,
  UserCheck,
} from 'lucide-react';

const AdminLayout = () => {
  const { currentUser, logout, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Attendance', href: '/admin/attendance', icon: Calendar },
    { name: 'Fees', href: '/admin/fees', icon: CreditCard },
    { name: 'Notices', href: '/admin/notices', icon: Bell },
    { name: 'Certificates', href: '/admin/certificates', icon: Award },
  ];

  // Only show settings and approvals to super admin
  if (isSuperAdmin) {
    navigation.push({ name: 'Approvals', href: '/admin/approvals', icon: UserCheck });
    navigation.push({ name: 'Settings', href: '/admin/settings', icon: Settings });
  }

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
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
              className="fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full bg-admin-primary shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 bg-admin-secondary">
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
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-admin-secondary text-white'
                            : 'text-white hover:bg-admin-secondary/70'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="border-t border-admin-secondary p-4">
                <button
                  onClick={logout}
                  className="group flex items-center px-4 py-2 text-base font-medium rounded-md text-white hover:bg-admin-secondary w-full"
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
          <div className="flex flex-col h-0 flex-1 bg-admin-primary">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-admin-secondary">
              <span className="text-xl font-bold text-white">R.B Computer</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-admin-secondary text-white'
                          : 'text-white hover:bg-admin-secondary/70'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="border-t border-admin-secondary p-4">
              <button
                onClick={logout}
                className="group flex items-center px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-admin-secondary w-full"
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
            className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-admin-primary"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-admin-primary text-white flex items-center justify-center">
                      {currentUser?.name?.charAt(0) || currentUser?.username?.charAt(0) || 'A'}
                    </div>
                    <span className="ml-2 text-gray-700 hidden md:block">
                      {currentUser?.name || currentUser?.username}
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
                          navigate('/admin/profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Your Profile
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin/settings');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Settings
                        </button>
                      )}
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

export default AdminLayout;
