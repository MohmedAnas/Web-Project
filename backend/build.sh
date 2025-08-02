#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting MINIMAL R.B Computer deployment..."

# Upgrade pip only
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install absolute minimum packages
echo "📚 Installing minimal packages..."
pip install -r requirements-absolute-minimal.txt

# Django setup
echo "🎨 Collecting static files..."
python manage.py collectstatic --no-input

echo "🗄️ Running migrations..."
python manage.py migrate

echo "✅ MINIMAL build completed successfully!"
echo "🎉 Basic Django app is ready!"
