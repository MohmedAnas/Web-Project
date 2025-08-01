#!/bin/bash

echo "🚀 RB Computer - Quick Manual Testing Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the RBComputer root directory"
    exit 1
fi

echo "📋 Setting up backend..."
cd backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Please create it first."
    exit 1
fi

# Check if database exists and has data
if [ -f "db.sqlite3" ]; then
    echo "✅ Database found"
else
    echo "📊 Creating database and running migrations..."
    python manage.py migrate
    echo "👤 Creating superuser..."
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@rbcomputer.com', 'admin123') if not User.objects.filter(email='admin@rbcomputer.com').exists() else None" | python manage.py shell
fi

# Start backend server
echo "🔧 Starting backend server..."
python manage.py runserver 8000 &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 3

# Test backend API
echo "🧪 Testing backend API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/auth/login/)
if [ "$RESPONSE" = "405" ] || [ "$RESPONSE" = "200" ]; then
    echo "✅ Backend API responding"
else
    echo "⚠️  Backend API response: $RESPONSE"
fi

# Setup frontend
echo "📋 Setting up frontend..."
cd ../frontend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Node modules found"
else
    echo "📦 Installing node modules..."
    npm install
fi

# Start frontend server
echo "🔧 Starting frontend server..."
npm start &
FRONTEND_PID=$!
echo "✅ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo "📊 Backend:  http://localhost:8000"
echo "🖥️  Frontend: http://localhost:3000"
echo "👤 Admin:    admin@rbcomputer.com / admin123"
echo ""
echo "📋 Manual Testing Checklist:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Login with admin credentials"
echo "3. Test main features:"
echo "   - Student management"
echo "   - Course management" 
echo "   - Fee management"
echo "   - Attendance system"
echo "   - Notice board"
echo ""
echo "⏹️  To stop servers:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📝 API Documentation: http://localhost:8000/swagger/"
echo "🔧 Admin Panel: http://localhost:8000/admin/"

# Save PIDs for easy cleanup
echo "$BACKEND_PID" > .backend_pid
echo "$FRONTEND_PID" > .frontend_pid

echo ""
echo "✅ Ready for manual testing! Estimated time: 15-20 minutes for basic check"
