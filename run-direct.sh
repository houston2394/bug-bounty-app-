#!/bin/bash

# Direct Node.js startup - no npm wrappers
echo "🚀 Starting Bug Bounty App - Direct Mode"

# Start backend directly
cd /home/houston/bug-bounty-app/backend
export NODE_ENV=development
export PORT=5000
export FRONTEND_URL=http://localhost:3000
export SOCKET_URL=http://localhost:5000

node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait and test
sleep 3
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend failed to start"
    tail -10 /tmp/backend.log
    exit 1
fi

# Start frontend directly
cd /home/houston/bug-bounty-app/frontend
export REACT_APP_API_URL=http://localhost:5000/api
export REACT_APP_SOCKET_URL=http://localhost:5000
export BROWSER=none  # Prevent auto-open

npx react-scripts start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api/health"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "⏳ Waiting for frontend to compile..."

# Wait for frontend to be ready
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "🎉 Bug Bounty App is running!"
echo "📱 Open your browser to: http://localhost:3000"