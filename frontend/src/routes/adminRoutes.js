import React from 'react';

// Import admin pages
import Dashboard from '../pages/admin/Dashboard';
import CourseManagement from '../pages/admin/CourseManagement';
import CourseDetails from '../pages/admin/CourseDetails';
import Settings from '../pages/admin/Settings';

// Define admin routes
const adminRoutes = [
  {
    path: '/admin/dashboard',
    element: <Dashboard />,
    exact: true,
  },
  {
    path: '/admin/courses',
    element: <CourseManagement />,
    exact: true,
  },
  {
    path: '/admin/courses/:courseId',
    element: <CourseDetails />,
    exact: true,
  },
  {
    path: '/admin/settings',
    element: <Settings />,
    exact: true,
  },
];

export default adminRoutes;
