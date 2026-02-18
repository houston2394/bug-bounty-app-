const express = require('express');
const router = express.Router();
const { db } = require('../services/database');

// Get all settings (masked)
router.get('/', (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Mask sensitive values
    const settings = {};
    rows.forEach(row => {
      if (row.key.includes('api_key') || row.key.includes('secret')) {
        settings[row.key] = row.value ? `****${row.value.slice(-4)}` : '';
      } else {
        settings[row.key] = row.value;
      }
    });
    
    res.json(settings);
  });
});

// Update settings
router.post('/', (req, res) => {
  const settings = req.body;
  const keys = Object.keys(settings);
  
  if (keys.length === 0) {
    return res.status(400).json({ error: 'No settings provided' });
  }

  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    keys.forEach(key => {
      // Don't save masked values if they haven't changed
      if (!settings[key].startsWith('****')) {
         stmt.run(key, settings[key], new Date().toISOString());
      }
    });
    
    db.run('COMMIT', (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Settings updated successfully' });
    });
  });
  
  stmt.finalize();
});

module.exports = router;
