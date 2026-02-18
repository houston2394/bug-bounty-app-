#!/bin/bash

echo "🚀 ULTIMATE BUG BOUNTY SYSTEM START"

# KILL EVERYTHING ON ALL PORTS
echo "🔥 NUKING ALL PROCESSES..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "python3.*http.server" 2>/dev/null || true  
pkill -f "grafana" 2>/dev/null || true
pkill -f "server-simple.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "serve" 2>/dev/null || true

# FORCE KILL PORTS 3000 AND 5000
echo "🔫 FREEING PORTS 3000 AND 5000..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

sleep 3

# VERIFY PORTS ARE FREE
echo "🔍 VERIFYING PORTS..."
if ! lsof -i:3000 > /dev/null 2>&1; then
    echo "   ✅ Port 3000 is free"
else
    echo "   ❌ Port 3000 still occupied"
    exit 1
fi

if ! lsof -i:5000 > /dev/null 2>&1; then
    echo "   ✅ Port 5000 is free"
else
    echo "   ❌ Port 5000 still occupied"
    exit 1
fi

# START BACKEND ON PORT 5000
echo "🔧 STARTING BACKEND..."
cd /home/houston/bug-bounty-app/backend
export NODE_ENV=production
export PORT=5000
export FRONTEND_URL=http://localhost:3000
export SOCKET_URL=http://localhost:5000

nohup node server.js > /tmp/backend-ultimate.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 5

# VERIFY BACKEND
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "   ✅ Backend healthy on port 5000"
else
    echo "   ❌ Backend failed"
    tail -5 /tmp/backend-ultimate.log
    exit 1
fi

# START FRONTEND ON PORT 3000 (USING DIFFERENT PORT IF NEEDED)
echo "🎨 STARTING FRONTEND..."

# Try port 3000 first
cd /home/houston/bug-bounty-app/frontend
nohup python3 -m http.server 3000 > /tmp/frontend-ultimate.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# Check if frontend is working
if curl -s http://localhost:3000 | grep -q "Bug Bounty System"; then
    echo "   ✅ Frontend working on port 3000"
else
    echo "   ⚠️ Port 3000 conflict, trying port 8000..."
    
    # Kill the failed attempt
    kill $FRONTEND_PID 2>/dev/null || true
    sleep 2
    
    # Try port 8000
    nohup python3 -m http.server 8000 > /tmp/frontend-alt.log 2>&1 &
    FRONTEND_PID=$!
    FRONTEND_PORT=8000
    sleep 3
    
    if curl -s http://localhost:8000 | grep -q "Bug Bounty System"; then
        echo "   ✅ Frontend working on port 8000"
    else
        echo "   ❌ Frontend failed on both ports"
        exit 1
    fi
fi

# FINAL VERIFICATION
echo ""
echo "🔍 FINAL SYSTEM CHECK:"
echo "======================"

echo "Backend: $(curl -s http://localhost:5000/api/health | grep -o '"status":"[^"]*"' || echo 'ERROR')"

if [ -n "$FRONTEND_PORT" ]; then
    echo "Frontend: http://localhost:$FRONTEND_PORT"
else
    echo "Frontend: http://localhost:3000"
fi

echo ""
echo "🎯 YOUR BUG BOUNTY SYSTEM IS LIVE!"
echo "=================================="

if [ -n "$FRONTEND_PORT" ]; then
    echo "🌐 OPEN: http://localhost:$FRONTEND_PORT"
else
    echo "🌐 OPEN: http://localhost:3000"
fi

echo "📊 Backend API: http://localhost:5000/api/health"
echo ""
echo "🛠️  PROCESS IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 STOP COMMANDS:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 HAPPY BUG HUNTING! 🚀"