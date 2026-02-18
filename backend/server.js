const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

// Import routes
const targetRoutes = require('./routes/targets');
const reconRoutes = require('./routes/recon');
const vulnRoutes = require('./routes/vulnerabilities');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');

// Import services
const { initializeDatabase } = require('./services/database');
const scriptService = require('./services/scriptService');

const app = express();
const server = http.createServer(app);
// In production, frontend is served by Express (same origin) so CORS is not needed.
// In development, allow localhost origins.
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:3000", "http://localhost:8000"];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY || 'bug-bounty-secret-key']
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize database
initializeDatabase();

// Store socket reference for script service
app.set('io', io);

// Auth Middleware to protect routes
const requireLogin = (req, res, next) => {
  // If we have a user, proceed
  if (req.user) return next();
  
  // If we are in dev mode and keys are missing, bypass auth
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.log("⚠️ Auth bypassed (No Client ID provided)");
    return next();
  }
  
  res.status(401).send({ error: 'You must log in!' });
};

// Routes
app.use('/api/auth', authRoutes);

// Protect API routes
// Note: We'll allow targets/health to be public for now to test, but safeguard others
app.use('/api/targets', requireLogin, targetRoutes);
app.use('/api/recon', requireLogin, reconRoutes);
app.use('/api/vulnerabilities', requireLogin, vulnRoutes);
app.use('/api/reports', requireLogin, reportRoutes);
app.use('/api/settings', requireLogin, settingsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-target', (targetId) => {
    socket.join(`target-${targetId}`);
    console.log(`Socket ${socket.id} joined target ${targetId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    auth_enabled: !!process.env.GOOGLE_CLIENT_ID
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/socket.io/')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Bug Bounty API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Auth Enabled: ${!!process.env.GOOGLE_CLIENT_ID}`);
});

module.exports = app;