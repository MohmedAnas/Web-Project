#!/usr/bin/env node

/**
 * Production Build Script for RBComputer Frontend
 * Optimizes the build process for Netlify deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting RBComputer Frontend Production Build...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.GENERATE_SOURCEMAP = 'true';
process.env.INLINE_RUNTIME_CHUNK = 'false';

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('build')) {
    execSync('rm -rf build', { stdio: 'inherit' });
  }

  // Install dependencies (if needed)
  console.log('📦 Checking dependencies...');
  if (!fs.existsSync('node_modules')) {
    console.log('Installing dependencies...');
    execSync('npm ci', { stdio: 'inherit' });
  }

  // Run tests (optional - can be disabled for faster builds)
  if (process.env.SKIP_TESTS !== 'true') {
    console.log('🧪 Running tests...');
    execSync('npm run test:ci', { stdio: 'inherit' });
  }

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build output
  console.log('✅ Verifying build output...');
  const buildDir = path.join(__dirname, '..', 'build');
  
  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found!');
  }

  const indexHtml = path.join(buildDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    throw new Error('index.html not found in build directory!');
  }

  // Check build size
  const buildStats = execSync('du -sh build', { encoding: 'utf8' });
  console.log(`📊 Build size: ${buildStats.trim()}`);

  // Create build info file
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: 'production',
    node_version: process.version,
    build_size: buildStats.trim(),
  };

  fs.writeFileSync(
    path.join(buildDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  console.log('✅ Production build completed successfully!');
  console.log('📁 Build output is ready in the "build" directory');
  console.log('🌐 Ready for Netlify deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
