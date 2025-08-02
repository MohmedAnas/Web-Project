#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Starting build process..."

# Upgrade pip first - THIS IS CRUCIAL FOR RENDER
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Verify pip version
echo "Pip version: $(pip --version)"

# Install dependencies
echo "Installing dependencies from requirements-render.txt..."
pip install -r requirements-render.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "Running database migrations..."
python manage.py migrate

echo "Build process completed successfully!"
