const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/bugbounty.db');

// Create database directory if it doesn't exist
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  // Create targets table
  db.run(`
    CREATE TABLE IF NOT EXISTS targets (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE NOT NULL,
      name TEXT,
      description TEXT,
      scope TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create recon_jobs table
  db.run(`
    CREATE TABLE IF NOT EXISTS recon_jobs (
      id TEXT PRIMARY KEY,
      target_id TEXT,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      started_at DATETIME,
      completed_at DATETIME,
      results TEXT,
      FOREIGN KEY (target_id) REFERENCES targets (id)
    )
  `);

  // Create vulnerabilities table
  db.run(`
    CREATE TABLE IF NOT EXISTS vulnerabilities (
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
    )
  `);

  // Create reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      target_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      submitted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES targets (id)
    )
  `);

  // Create settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
};

module.exports = { db, initializeDatabase };