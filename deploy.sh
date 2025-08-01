#!/bin/bash

# 🚀 RBComputer Quick Deployment Setup Script
# This script prepares your project for deployment to Netlify + Render

set -e  # Exit on any error

echo "🚀 RBComputer Deployment Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the RBComputer root directory"
    exit 1
fi

print_status "Starting deployment preparation..."

# 1. Backend preparation
print_status "Preparing backend for deployment..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
print_status "Installing backend dependencies..."
pip install -r requirements.txt

# Run migrations to ensure database is ready
print_status "Running database migrations..."
python manage.py migrate --settings=rbcomputer.settings_production

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput --settings=rbcomputer.settings_production

# Run tests to ensure everything works
print_status "Running backend tests..."
python -m pytest tests/ -v --tb=short

print_success "Backend preparation completed!"

# 2. Frontend preparation
cd ../frontend

print_status "Preparing frontend for deployment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Run tests
print_status "Running frontend tests..."
npm run test:ci

# Build production version to test
print_status "Testing production build..."
npm run build

print_success "Frontend preparation completed!"

# 3. Git preparation
cd ..

print_status "Preparing Git repository..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit with production configuration"
else
    print_status "Adding deployment files to Git..."
    git add .
    git commit -m "Add production deployment configuration" || print_warning "No changes to commit"
fi

# 4. Generate deployment summary
print_status "Generating deployment summary..."

cat > DEPLOYMENT_SUMMARY.md << EOF
# 🚀 RBComputer Deployment Summary

## ✅ Deployment Preparation Complete!

Your RBComputer project is now ready for deployment to Netlify + Render.

### 📁 Files Created:
- \`backend/rbcomputer/settings_production.py\` - Production Django settings
- \`backend/build.sh\` - Render build script
- \`backend/core/health.py\` - Health check endpoints
- \`frontend/netlify.toml\` - Netlify configuration
- \`frontend/.env.production\` - Production environment variables
- \`frontend/src/config/api.js\` - API configuration
- \`render.yaml\` - Render service configuration
- \`DEPLOYMENT_GUIDE.md\` - Complete deployment instructions

### 🔧 Configuration Summary:

**Backend (Render):**
- Django with production settings
- PostgreSQL database ready
- Gunicorn WSGI server
- WhiteNoise for static files
- Health check endpoints
- Email configuration for SendGrid

**Frontend (Netlify):**
- React production build
- Environment-based API configuration
- Netlify redirects for SPA
- Security headers configured
- Build optimization

### 📋 Next Steps:

1. **Push to GitHub:**
   \`\`\`bash
   git remote add origin https://github.com/yourusername/RBComputer.git
   git push -u origin main
   \`\`\`

2. **Deploy Backend (Render):**
   - Create account at render.com
   - Connect GitHub repository
   - Create Web Service with settings from DEPLOYMENT_GUIDE.md
   - Create PostgreSQL database
   - Set environment variables

3. **Deploy Frontend (Netlify):**
   - Create account at netlify.com
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

4. **Configure Email (SendGrid):**
   - Create SendGrid account
   - Get API key
   - Add to Render environment variables

### 🌐 Expected URLs:
- **Frontend**: https://rbcomputer.netlify.app
- **Backend API**: https://rbcomputer-api.onrender.com
- **Admin Panel**: https://rbcomputer-api.onrender.com/admin/
- **API Docs**: https://rbcomputer-api.onrender.com/swagger/

### 💰 Cost: \$0/month (Free Tiers)

### 📖 Full Instructions:
See \`DEPLOYMENT_GUIDE.md\` for complete step-by-step instructions.

---
Generated on: $(date)
EOF

print_success "Deployment summary created: DEPLOYMENT_SUMMARY.md"

# 5. Final checks
print_status "Running final checks..."

# Check if all required files exist
required_files=(
    "backend/rbcomputer/settings_production.py"
    "backend/build.sh"
    "frontend/netlify.toml"
    "frontend/.env.production"
    "render.yaml"
    "DEPLOYMENT_GUIDE.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All deployment files are present!"
else
    print_error "Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Final success message
echo ""
echo "🎉 =================================="
echo "🎉  DEPLOYMENT SETUP COMPLETE!"
echo "🎉 =================================="
echo ""
print_success "Your RBComputer project is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push code to GitHub"
echo "2. Follow DEPLOYMENT_GUIDE.md for Render + Netlify setup"
echo "3. Configure SendGrid for email notifications"
echo ""
echo "📖 Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo "📊 Check DEPLOYMENT_SUMMARY.md for quick overview"
echo ""
print_success "Happy deploying! 🚀"
