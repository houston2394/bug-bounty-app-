#!/bin/bash

# Production deployment script for Bug Bounty App
# This script deploys the application to production

set -e

echo "🚀 Deploying Bug Bounty App to Production..."

# Configuration
APP_DIR="/opt/bug-bounty-app"
SERVICE_NAME="bug-bounty-app"
BACKUP_DIR="/opt/backups/bug-bounty-app"
NGINX_CONFIG="/etc/nginx/sites-available/bug-bounty-app"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR

# Stop existing service
echo "🛑 Stopping existing service..."
if systemctl is-active --quiet $SERVICE_NAME; then
    systemctl stop $SERVICE_NAME
fi

# Backup existing installation
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    echo "💾 Backing up existing installation..."
    cp -r $APP_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
fi

# Copy application files
echo "📋 Copying application files..."
cp -r * $APP_DIR/

# Change to application directory
cd $APP_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Setup database
echo "🗄️ Setting up database..."
mkdir -p data
if [ ! -f "data/bugbounty.db" ]; then
    echo "Creating new database..."
    # Database will be auto-created on first run
fi

# Install bug bounty tools
echo "🔧 Installing bug bounty tools..."
cd bug-bounty-system/tools
if [ ! -f "/usr/local/bin/subfinder" ]; then
    chmod +x install-tools.sh
    ./install-tools.sh
fi
cd ../../../

# Create production environment file
echo "📝 Creating production environment..."
cat > .env << EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost
SOCKET_URL=http://localhost:5000
EOF

# Build frontend
echo "🏗️ Building frontend for production..."
cd frontend
npm ci --only=production
npm run build
cd ..

# Setup systemd service
echo "⚙️ Setting up systemd service..."
cp bug-bounty-app.service /etc/systemd/system/

# Setup nginx configuration
echo "🌐 Setting up nginx configuration..."
if [ ! -f "$NGINX_CONFIG" ]; then
    cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /opt/bug-bounty-app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # Enable site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
nginx -t

# Set permissions
echo "🔐 Setting permissions..."
chown -R $SUDO_USER:$SUDO_USER $APP_DIR
chmod +x $APP_DIR/*.sh
chmod +x $APP_DIR/bug-bounty-system/scripts/*.sh

# Enable and start services
echo "🚀 Starting services..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Restart nginx
systemctl restart nginx

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Service started successfully"
else
    echo "❌ Service failed to start"
    journalctl -u $SERVICE_NAME --no-pager -l
    exit 1
fi

# Health check
echo "🔍 Performing health check..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Display status
echo ""
echo "🎉 Deployment Complete!"
echo "=========================="
echo "🌐 Application URL: http://localhost"
echo "🔧 API Endpoint: http://localhost/api"
echo "📊 Health Check: http://localhost/api/health"
echo ""
echo "📋 Service Status:"
echo "- Backend: $(systemctl is-active $SERVICE_NAME)"
echo "- Nginx: $(systemctl is-active nginx)"
echo ""
echo "📝 Logs:"
echo "- Backend: journalctl -u $SERVICE_NAME -f"
echo "- Nginx: tail -f /var/log/nginx/access.log"
echo ""
echo "🔧 Management:"
echo "- Restart: sudo systemctl restart $SERVICE_NAME"
echo "- Stop: sudo systemctl stop $SERVICE_NAME"
echo "- Status: sudo systemctl status $SERVICE_NAME"
echo ""
echo "🎯 Ready for bug hunting!"