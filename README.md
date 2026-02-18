# Bug Bounty Web Application

A modern, web-based bug bounty hunting platform that transforms traditional command-line workflows into an intuitive, user-friendly interface.

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** and npm
- **Python 3** (for backend scripts)
- **Git**

### One-Click Setup
```bash
cd bug-bounty-app
./setup.sh
```

### Start Development Servers
```bash
./start-dev.sh
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Features

### 🌐 Web Interface
- **Dashboard** - Overview of targets, findings, and progress
- **Target Management** - Add, organize, and track targets
- **Automated Reconnaissance** - One-click passive/active scans
- **Vulnerability Tracking** - Professional vulnerability documentation
- **Real-time Progress** - Live scan updates with WebSocket
- **Report Generation** - Professional bug bounty reports
- **Learning Hub** - Integrated tutorials and best practices

### 🛠️ Integrated Tools
- **Subdomain Enumeration** - Subfinder, Amass, Assetfinder
- **Port Scanning** - Nmap integration
- **Web Reconnaissance** - Feroxbuster, Gobuster
- **Vulnerability Scanning** - Nuclei templates
- **Technology Detection** - WhatWeb, Wappalyzer
- **Report Generation** - Professional templates

### 🔧 System Features
- **Real-time Updates** - WebSocket integration for live scan progress
- **Database Storage** - SQLite for persistence (PostgreSQL ready)
- **API Integration** - RESTful API with all functionality
- **Error Handling** - Comprehensive error management
- **Responsive Design** - Works on desktop and mobile

## 📁 Project Structure

```
bug-bounty-app/
├── backend/                 # Node.js API server
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   └── data/               # Database and outputs
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   └── services/      # API calls
├── ../bug-bounty-system/   # Original CLI system
│   ├── scripts/           # Bash automation scripts
│   ├── templates/         # Report templates
│   └── tools/             # Installation scripts
└── setup.sh              # One-click setup script
```

## 🎮 Usage Guide

### 1. Add Your First Target
1. Navigate to **Targets** page
2. Click **"Add Target"**
3. Enter domain (e.g., example.com)
4. Add optional description and scope

### 2. Run Reconnaissance
1. Go to **Recon** page
2. Select your target
3. Choose scan type:
   - **Passive Recon** - Safe subdomain enumeration
   - **Active Recon** - Direct interaction and port scanning
   - **Quick Scan** - Fast vulnerability assessment

### 3. Monitor Progress
- Real-time scan output in the interface
- WebSocket updates show live progress
- Automatic result parsing and organization

### 4. Document Findings
1. Go to **Vulnerabilities** page
2. Click **"Add Vulnerability"**
3. Fill in professional report details
4. Include proof of concept

### 5. Generate Reports
1. Navigate to **Reports** page
2. Click **"Generate Report"**
3. Select target and template
4. Export in multiple formats (Markdown, PDF, JSON)

## 🔧 API Endpoints

### Targets
- `GET /api/targets` - List all targets
- `POST /api/targets` - Create new target
- `GET /api/targets/:id` - Get target details
- `GET /api/targets/:id/stats` - Target statistics

### Reconnaissance
- `POST /api/recon/passive/:targetId` - Run passive recon
- `POST /api/recon/active/:targetId` - Run active recon
- `POST /api/recon/quick-scan/:targetId` - Quick vulnerability scan
- `GET /api/recon/results/:targetId` - Get recon results

### Vulnerabilities
- `GET /api/vulnerabilities` - List all vulnerabilities
- `POST /api/vulnerabilities` - Create new vulnerability
- `PUT /api/vulnerabilities/:id` - Update vulnerability
- `DELETE /api/vulnerabilities/:id` - Delete vulnerability

### Reports
- `GET /api/reports` - List all reports
- `POST /api/reports/generate/:targetId` - Generate report
- `GET /api/reports/:id/export` - Export report

## 🎨 Frontend Components

### Pages
- **Dashboard** - Statistics and quick actions
- **Targets** - Target management interface
- **Target Detail** - Individual target view with scan controls
- **Recon** - Centralized scan control center
- **Vulnerabilities** - Vulnerability management
- **Reports** - Report generation and management
- **Learning** - Educational content hub

### Key Features
- **Real-time Updates** - WebSocket integration for live data
- **Responsive Design** - Material-UI based interface
- **Dark Theme** - Hacker-themed color scheme
- **Interactive Charts** - Data visualization with Recharts
- **File Management** - Upload/download scan results

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
SOCKET_URL=http://localhost:5000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Database Configuration

#### Development (SQLite)
- Default: `./data/bugbounty.db`
- Auto-created on first run
- No additional setup required

#### Production (PostgreSQL)
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL=postgresql://user:password@localhost/bugbounty
```

## 🚀 Production Deployment

### Option 1: Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Option 2: Systemd Service
```bash
# Copy service file
sudo cp bug-bounty-app.service /etc/systemd/system/

# Enable and start service
sudo systemctl enable bug-bounty-app
sudo systemctl start bug-bounty-app
```

### Option 3: PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/server.js --name "bug-bounty-app"

# Start frontend in production mode
cd frontend && npm run build
pm2 serve build 3000 --name "bug-bounty-frontend"
```

## 🔧 Development

### Adding New Scan Types
1. Create bash script in `../bug-bounty-system/scripts/`
2. Add API endpoint in `backend/routes/recon.js`
3. Add service method in `backend/services/reconService.js`
4. Add UI controls in frontend pages

### Custom Report Templates
1. Create Markdown template in `../bug-bounty-system/templates/`
2. Add template option in `backend/services/reportService.js`
3. Update frontend template selector

### Database Schema
```sql
-- Targets
CREATE TABLE targets (
    id TEXT PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    scope TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reconnaissance Jobs
CREATE TABLE recon_jobs (
    id TEXT PRIMARY KEY,
    target_id TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at DATETIME,
    completed_at DATETIME,
    results TEXT,
    FOREIGN KEY (target_id) REFERENCES targets (id)
);

-- Vulnerabilities
CREATE TABLE vulnerabilities (
    id TEXT PRIMARY KEY,
    target_id TEXT,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    cwe_id TEXT,
    description TEXT,
    poc TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES targets (id)
);

-- Reports
CREATE TABLE reports (
    id TEXT PRIMARY KEY,
    target_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    submitted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES targets (id)
);
```

## 🐛 Troubleshooting

### Common Issues

#### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

#### Backend Scripts Fail
```bash
# Check permissions on scripts
chmod +x ../bug-bounty-system/scripts/*.sh

# Check Python installation
python3 --version
```

#### Database Issues
```bash
# Recreate database
rm -f backend/data/bugbounty.db
npm start  # Will auto-create new database
```

#### WebSocket Connection Issues
```bash
# Check firewall settings
# Ensure port 5000 is accessible
telnet localhost 5000
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material-UI for excellent React components
- Socket.IO for real-time communication
- ProjectDiscovery for awesome security tools
- The bug bounty community for inspiration

---

## 🎯 Ready to Hunt?

1. Run `./setup.sh` to install everything
2. Start with `./start-dev.sh`
3. Open http://localhost:3000
4. Add your first target
5. Run your first scan
6. **Happy Bug Hunting!** 🚀