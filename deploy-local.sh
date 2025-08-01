#!/bin/bash

# 🚀 RBComputer Local Deployment Test Script
# Tests deployment configuration without PostgreSQL dependencies

set -e

echo "🚀 RBComputer Local Deployment Test"
echo "===================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check directory
if [ ! -f "README.md" ]; then
    echo "Please run from RBComputer root directory"
    exit 1
fi

print_status "Testing deployment configuration..."

# Test backend configuration
cd backend

print_status "Installing local dependencies..."
pip install -r requirements-local.txt

print_status "Testing Django configuration..."
python manage.py check --settings=rbcomputer.settings_production

print_status "Testing static files collection..."
python manage.py collectstatic --noinput --settings=rbcomputer.settings_production --dry-run

print_success "Backend configuration valid!"

# Test frontend configuration
cd ../frontend

if [ -d "node_modules" ]; then
    print_status "Testing frontend build..."
    npm run build
    print_success "Frontend build successful!"
else
    print_status "Skipping frontend test (no node_modules)"
fi

cd ..

print_success "All deployment configurations are valid!"
print_status "Ready for production deployment to Render + Netlify"

echo ""
echo "📋 Next Steps:"
echo "1. Push code to GitHub"
echo "2. Follow DEPLOYMENT_GUIDE.md"
echo "3. Deploy to Render (backend) + Netlify (frontend)"
