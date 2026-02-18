const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bug Bounty App running on http://localhost:${PORT}`);
  console.log(`📊 Backend API: http://localhost:5000/api/health`);
  console.log(`🎯 Ready for bug hunting!`);
});