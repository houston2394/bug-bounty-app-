#!/bin/bash

# Start backend in background
cd /home/houston/bug-bounty-app/backend
nohup npm start > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend
sleep 5

# Start frontend in background
cd /home/houston/bug-bounty-app/frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Check processes
echo "Backend log (last 10 lines):"
tail -10 ../backend.log
echo ""
echo "Frontend log (last 10 lines):"
tail -10 ../frontend.log

echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000/api/health"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"