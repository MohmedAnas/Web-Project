#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # Exit on error

echo "🚀 Starting RBComputer Backend Build Process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --settings=rbcomputer.settings_production

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --settings=rbcomputer.settings_production

# Create superuser if it doesn't exist (optional)
echo "👤 Creating superuser if needed..."
python manage.py shell --settings=rbcomputer.settings_production << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@rbcomputer.com').exists():
    User.objects.create_superuser(
        email='admin@rbcomputer.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='super_admin'
    )
    print("✅ Superuser created successfully")
else:
    print("ℹ️ Superuser already exists")
EOF

echo "✅ Build completed successfully!"
