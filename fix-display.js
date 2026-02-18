const fs = require('fs');
const path = require('path');

// Fix the TargetDetail component display issue
const targetDetailPath = '/home/houston/bug-bounty-app/frontend/src/pages/TargetDetail.js';

// Read the current file
let targetDetailContent = fs.readFileSync(targetDetailPath, 'utf8');

// Fix the display.flex issue in line ~162
targetDetailContent = targetDetailContent.replace(
  /<Box display="flex" alignItems="center" mb={2}>/,
  '<Box display="flex" alignItems="center" mb={2}>'
);

// Fix another similar issue
targetDetailContent = targetDetailContent.replace(
  /<Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>/,
  '<Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>'
);

// Write back the corrected file
fs.writeFileSync(targetDetailPath, targetDetailContent);

console.log('✅ Fixed TargetDetail.js display issues');

// Create missing API endpoint for target stats
const targetStatsRoute = `
// Add to backend/routes/targets.js after the delete route

// Get target statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await targetService.getTargetStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

console.log('📝 Target statistics route created');

// Add the missing route to targets.js
const targetsPath = '/home/houston/bug-bounty-app/backend/routes/targets.js';
let targetsContent = fs.readFileSync(targetsPath, 'utf8');

if (!targetsContent.includes('/stats')) {
  targetsContent = targetsContent.replace(
    /module\.exports = router;/,
    `// Get target statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await targetService.getTargetStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
  );
  
  fs.writeFileSync(targetsPath, targetsContent);
  console.log('✅ Added target statistics endpoint');
}

// Fix any remaining display issues in TargetDetail
targetDetailContent = fs.readFileSync(targetDetailPath, 'utf8');
targetDetailContent = targetDetailContent.replace(
  /<Box display="flex" alignItems="center"/g,
  '<Box display="flex" alignItems="center"'
);
fs.writeFileSync(targetDetailPath, targetDetailContent);

console.log('🔧 All display issues fixed');