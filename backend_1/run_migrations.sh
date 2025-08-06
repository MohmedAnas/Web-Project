#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated."
else
    echo "Virtual environment not found. Creating one..."
    python -m venv venv
    source venv/bin/activate
    echo "Virtual environment created and activated."
fi

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Make migrations for each app
echo "Making migrations..."
python manage.py makemigrations core
python manage.py makemigrations students
python manage.py makemigrations fees
python manage.py makemigrations attendance
python manage.py makemigrations notices

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

echo "Migrations completed successfully!"

# Create superuser if needed
read -p "Do you want to create a superuser? (y/n): " create_superuser
if [ "$create_superuser" = "y" ]; then
    python manage.py createsuperuser
fi

# Run the server if requested
read -p "Do you want to run the development server? (y/n): " run_server
if [ "$run_server" = "y" ]; then
    python manage.py runserver
fi
