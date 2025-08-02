#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting R.B Computer deployment build process..."

# Upgrade pip and install wheel first - CRUCIAL FOR RENDER
echo "📦 Upgrading pip and installing wheel..."
python -m pip install --upgrade pip
pip install wheel setuptools

# Verify versions
echo "✅ Pip version: $(pip --version)"
echo "✅ Wheel version: $(pip show wheel | grep Version || echo 'Wheel installed')"

# Set environment variables to prefer binary packages
export PIP_PREFER_BINARY=1
export PIP_NO_CACHE_DIR=1

# Install dependencies with binary preference
echo "📚 Installing dependencies (preferring binary packages)..."
pip install --prefer-binary --no-cache-dir -r requirements-render.txt

# Collect static files for production
echo "🎨 Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create cache table if needed (optional)
echo "💾 Setting up cache..."
python manage.py createcachetable || echo "Cache table already exists or not needed"

echo "✅ Build process completed successfully!"
echo "🎉 R.B Computer backend is ready for deployment!"
