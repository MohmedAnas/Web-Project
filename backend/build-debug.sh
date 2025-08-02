#!/usr/bin/env bash
# Exit on error but continue to show which package fails
set -e

echo "🔍 DEBUG: Starting minimal build to identify problematic package..."

# Upgrade pip first
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install only the most essential packages one by one
echo "🧪 Testing Django..."
pip install Django==4.2.4 || { echo "❌ Django failed"; exit 1; }

echo "🧪 Testing DRF..."
pip install djangorestframework==3.14.0 || { echo "❌ DRF failed"; exit 1; }

echo "🧪 Testing psycopg2-binary..."
pip install psycopg2-binary==2.9.7 || { echo "❌ psycopg2-binary failed"; exit 1; }

echo "🧪 Testing gunicorn..."
pip install gunicorn==21.2.0 || { echo "❌ gunicorn failed"; exit 1; }

echo "🧪 Testing whitenoise..."
pip install whitenoise==6.5.0 || { echo "❌ whitenoise failed"; exit 1; }

echo "✅ All essential packages installed successfully!"

# Try Django commands
echo "🎨 Testing static files collection..."
python manage.py collectstatic --no-input

echo "🗄️ Testing migrations..."
python manage.py migrate

echo "🎉 DEBUG build completed successfully!"
