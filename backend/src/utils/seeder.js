const mongoose = require('mongoose');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');
const logger = require('./logger');

const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@rbcomputer.com' 
    });

    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@rbcomputer.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: USER_ROLES.SUPER_ADMIN,
      status: 'active',
      emailVerified: true,
      phone: '9999999999',
      metadata: {
        createdBy: null
      }
    });

    await adminUser.save();
    
    logger.success('Admin user created successfully', {
      email: adminUser.email,
      role: adminUser.role
    });

    // Create sample viewer user
    const viewerUser = new User({
      firstName: 'Viewer',
      lastName: 'User',
      email: 'viewer@rbcomputer.com',
      password: 'viewer123',
      role: USER_ROLES.VIEWER,
      status: 'active',
      emailVerified: true,
      phone: '9999999998',
      metadata: {
        createdBy: adminUser._id
      }
    });

    await viewerUser.save();
    
    logger.success('Viewer user created successfully', {
      email: viewerUser.email,
      role: viewerUser.role
    });

  } catch (error) {
    logger.error('Database seeding failed:', error);
  }
};

module.exports = { seedDatabase };
