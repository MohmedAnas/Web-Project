#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting R.B Computer deployment with stable requirements..."

# Upgrade pip and install build tools first
echo "📦 Upgrading pip and installing build tools..."
python -m pip install --upgrade pip
pip install wheel setuptools

# Set environment variables for better package installation
export PIP_PREFER_BINARY=1
export PIP_NO_CACHE_DIR=1

# Install all dependencies from stable requirements-dev.txt
echo "📚 Installing all dependencies from requirements-dev.txt..."
pip install --prefer-binary --no-cache-dir -r requirements-dev.txt

# Verify critical packages are installed
echo "✅ Verifying critical packages..."
python -c "import django; print(f'Django: {django.get_version()}')"
python -c "import rest_framework; print('DRF: OK')"
python -c "import psycopg2; print('PostgreSQL: OK')"
python -c "import gunicorn; print('Gunicorn: OK')"

# Collect static files for production
echo "🎨 Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create cache table if needed
echo "💾 Setting up cache..."
python manage.py createcachetable || echo "Cache table already exists or not needed"

echo "✅ Build process completed successfully!"
echo "🎉 R.B Computer backend is ready with all features!"
