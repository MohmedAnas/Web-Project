#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting R.B Computer deployment build process..."

# Upgrade pip and install essential build tools
echo "📦 Installing build tools..."
python -m pip install --upgrade pip
pip install wheel setuptools build

# Verify versions
echo "✅ Pip version: $(pip --version)"

# Set environment variables for better package installation
export PIP_PREFER_BINARY=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

# Install packages one by one to identify problematic ones
echo "📚 Installing core Django packages..."
pip install --prefer-binary --no-cache-dir Django==4.2.4
pip install --prefer-binary --no-cache-dir djangorestframework==3.14.0
pip install --prefer-binary --no-cache-dir djangorestframework-simplejwt==5.2.2

echo "📚 Installing database and utilities..."
pip install --prefer-binary --no-cache-dir psycopg2-binary==2.9.7
pip install --prefer-binary --no-cache-dir dj-database-url==2.1.0
pip install --prefer-binary --no-cache-dir python-dotenv==1.0.0

echo "📚 Installing additional packages..."
pip install --prefer-binary --no-cache-dir django-cors-headers==4.2.0
pip install --prefer-binary --no-cache-dir django-filter==23.2
pip install --prefer-binary --no-cache-dir PyJWT==2.8.0
pip install --prefer-binary --no-cache-dir Pillow==9.0.1

echo "📚 Installing production packages..."
pip install --prefer-binary --no-cache-dir gunicorn==21.2.0
pip install --prefer-binary --no-cache-dir whitenoise==6.5.0

echo "📚 Installing API documentation..."
pip install --prefer-binary --no-cache-dir drf-yasg==1.21.7 || echo "⚠️ drf-yasg failed, continuing without it"

echo "📚 Installing utilities..."
pip install --prefer-binary --no-cache-dir python-dateutil==2.9.0.post0

# Collect static files for production
echo "🎨 Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

echo "✅ Build process completed successfully!"
echo "🎉 R.B Computer backend is ready for deployment!"
