#!/bin/bash

# RB Computer Backend - Production Deployment Script
# This script deploys the backend to production environment

set -e  # Exit on any error

echo "🚀 Starting RB Computer Backend Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production with your production settings"
    exit 1
fi

print_status "Environment file found"

# Install production dependencies
print_info "Installing production dependencies..."
npm ci --only=production
print_status "Dependencies installed"

# Run security audit
print_info "Running security audit..."
npm audit --audit-level moderate
print_status "Security audit completed"

# Build Docker image
print_info "Building Docker image..."
docker build -t rbcomputer-backend:latest .
print_status "Docker image built successfully"

# Tag for production
docker tag rbcomputer-backend:latest rbcomputer-backend:prod-$(date +%Y%m%d-%H%M%S)
print_status "Docker image tagged for production"

# Create production docker-compose
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  backend:
    image: rbcomputer-backend:latest
    container_name: rbcomputer-backend-prod
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - rbcomputer-prod-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  rbcomputer-prod-network:
    driver: bridge
EOF

print_status "Production docker-compose.yml created"

# Start production containers
print_info "Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d
print_status "Production containers started"

# Wait for application to be ready
print_info "Waiting for application to be ready..."
sleep 10

# Health check
print_info "Performing health check..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Health check passed - Application is running!"
else
    print_error "Health check failed - Please check logs"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Display deployment information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Information:"
echo "  • Application URL: http://localhost:8000"
echo "  • Health Check: http://localhost:8000/health"
echo "  • API Base URL: http://localhost:8000/api"
echo "  • Environment: Production"
echo ""
echo "📋 Useful Commands:"
echo "  • View logs: docker-compose -f docker-compose.prod.yml logs -f backend"
echo "  • Stop application: docker-compose -f docker-compose.prod.yml down"
echo "  • Restart application: docker-compose -f docker-compose.prod.yml restart backend"
echo ""
print_status "RB Computer Backend is now running in production mode!"
