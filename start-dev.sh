#!/bin/bash

# Start Bug Bounty App in Development Mode
echo "🚀 Starting Bug Bounty App in Development Mode..."

# Start backend
echo "🔧 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend && npm start &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
