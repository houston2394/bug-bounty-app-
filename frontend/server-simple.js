const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '.')));

// HTML5 routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bug Bounty Frontend running on http://localhost:${PORT}`);
  console.log(`🌐 Browser URL: http://localhost:${PORT}`);
  console.log(`🎯 Ready for bug hunting!`);
});