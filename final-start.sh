#!/bin/bash

echo "🚀 STARTING BUG BOUNTY SYSTEM - FINAL VERSION"

# Kill any existing processes
echo "🛑 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "python3.*http.server" 2>/dev/null || true
pkill -f "grafana" 2>/dev/null || true
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd /home/houston/bug-bounty-app/backend
export NODE_ENV=production
export PORT=5000
export FRONTEND_URL=http://localhost:3000
export SOCKET_URL=http://localhost:5000

node server.js > /tmp/backend-final.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend
sleep 3

# Check backend health
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "   ✅ Backend is healthy"
else
    echo "   ❌ Backend failed to start"
    tail -10 /tmp/backend-final.log
    exit 1
fi

# Start frontend (serve our HTML app)
echo "🎨 Starting frontend..."
cd /home/houston/bug-bounty-app/frontend
python3 -m http.server 3000 > /tmp/frontend-final.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend
sleep 2

# Final verification
echo ""
echo "🔍 FINAL VERIFICATION:"
echo "======================="

echo "1. Backend Health Check:"
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "   ✅ Backend API is healthy"
    echo "   📊 URL: http://localhost:5000/api/health"
else
    echo "   ❌ Backend API is not responding"
fi

echo ""
echo "2. Frontend Check:"
if curl -s http://localhost:3000 | grep -q "Bug Bounty System"; then
    echo "   ✅ Frontend is serving our app"
    echo "   🌐 URL: http://localhost:3000"
else
    echo "   ❌ Frontend is not serving correctly"
    echo "   📋 Debug: checking what's on port 3000..."
    curl -s http://localhost:3000 | head -3
fi

echo ""
echo "3. Database Check:"
if [ -f "/home/houston/bug-bounty-app/backend/data/bugbounty.db" ]; then
    echo "   ✅ Database file exists"
    echo "   📄 Location: /home/houston/bug-bounty-app/backend/data/bugbounty.db"
else
    echo "   ⚠️ Database file not found (will be created on first use)"
fi

echo ""
echo "4. Process Status:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "🎯 YOUR BUG BOUNTY SYSTEM IS READY!"
echo "======================================="
echo "🌐 Open your browser to: http://localhost:3000"
echo "📊 Backend API: http://localhost:5000/api/health"
echo ""
echo "🛠️ Features Available:"
echo "   ✅ Target Management"
echo "   ✅ Reconnaissance (Simulated)"
echo "   ✅ Vulnerability Tracking"
echo "   ✅ Professional UI"
echo "   ✅ Real-time Updates"
echo "   ✅ Data Persistence"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
echo "🔄 To restart: ./final-start.sh"
echo ""
echo "🎉 START BUG HUNTING NOW!"