#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting R.B Computer deployment build process..."

# Upgrade pip first - THIS IS CRUCIAL FOR RENDER
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Verify pip version
echo "✅ Pip version: $(pip --version)"

# Install dependencies from render-specific requirements
echo "📚 Installing dependencies from requirements-render.txt..."
pip install -r requirements-render.txt

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
