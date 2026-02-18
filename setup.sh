#!/bin/bash

# Bug Bounty Web Application Setup Script
# This script sets up the complete bug bounty web application

echo "🚀 Setting up Bug Bounty Web Application..."

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Python3 installation (for backend scripts)
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"

echo "📁 Project root: $PROJECT_ROOT"

# Setup backend
echo "🔧 Setting up backend..."
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Create data directory
mkdir -p data
mkdir -p ../bug-bounty-system/data/outputs

# Setup frontend
echo "🎨 Setting up frontend..."
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Setup bug bounty system tools
echo "🔍 Setting up bug bounty system tools..."
cd "$PROJECT_ROOT/../bug-bounty-system/tools"

if [ ! -f "/usr/local/bin/subfinder" ]; then
    echo "📦 Installing bug bounty tools (this may take a while)..."
    chmod +x install-tools.sh
    ./install-tools.sh
fi

# Create environment files
echo "📝 Creating environment configuration..."

# Backend .env
cat > "$PROJECT_ROOT/backend/.env" << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
SOCKET_URL=http://localhost:5000
EOF

# Frontend .env
cat > "$PROJECT_ROOT/frontend/.env" << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
EOF

echo "✅ Environment files created"

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x "$PROJECT_ROOT/../bug-bounty-system/scripts/*.sh"
chmod +x "$PROJECT_ROOT/../bug-bounty-system/tools/*.sh"

# Create start scripts
echo "📝 Creating start scripts..."

# Development start script
cat > "$PROJECT_ROOT/start-dev.sh" << 'EOF'
#!/bin/bash

# Start Bug Bounty App in Development Mode
echo "🚀 Starting Bug Bounty App in Development Mode..."

# Start backend
echo "🔧 Starting backend server..."
cd backend && npm run dev &
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
EOF

chmod +x "$PROJECT_ROOT/start-dev.sh"

# Production build script
cat > "$PROJECT_ROOT/build.sh" << 'EOF'
#!/bin/bash

# Build Bug Bounty App for Production
echo "🏗️ Building Bug Bounty App for Production..."

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build

echo "✅ Frontend build completed"
echo "📁 Build files are in frontend/build/"
EOF

chmod +x "$PROJECT_ROOT/build.sh"

# Create systemd service file for production
cat > "$PROJECT_ROOT/bug-bounty-app.service" << EOF
[Unit]
Description=Bug Bounty Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_ROOT
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "🎯 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start development servers: ./start-dev.sh"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Add your first target and run reconnaissance"
echo ""
echo "📚 Documentation:"
echo "- View README.md for detailed usage"
echo "- Check /docs for additional guides"
echo ""
echo "🔧 Production Deployment:"
echo "- Run ./build.sh to create production build"
echo "- Use bug-bounty-app.service for systemd deployment"
echo ""
echo "🎉 Happy Bug Hunting!"