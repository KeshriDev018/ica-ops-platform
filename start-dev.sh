#!/bin/bash

echo "🚀 Starting ICA Platform..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "   Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || echo "   Please start MongoDB manually"
    sleep 2
fi

# Start Backend
echo ""
echo "🔧 Starting Backend Server..."
cd Backend
if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   ⚠️  IMPORTANT: Edit Backend/.env with your MongoDB URI and secrets!"
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Frontend
cd ../Frontend
echo ""
echo "🎨 Starting Frontend Server..."

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started on http://localhost:5173 (PID: $FRONTEND_PID)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ICA Platform is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "📝 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🔧 Important: Make sure to:"
echo "   1. Edit Backend/.env with your MongoDB URI"
echo "   2. Add your Razorpay keys to Backend/.env"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep script running
wait
