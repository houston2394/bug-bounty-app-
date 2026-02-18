const express = require('express');
const router = express.Router();
const vulnService = require('../services/vulnService');

// Get all vulnerabilities
router.get('/', async (req, res) => {
  try {
    const { severity, status, targetId } = req.query;
    const vulnerabilities = await vulnService.getAllVulnerabilities({ severity, status, targetId });
    res.json(vulnerabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vulnerabilities by target
router.get('/target/:targetId', async (req, res) => {
  try {
    const vulnerabilities = await vulnService.getVulnerabilitiesByTarget(req.params.targetId);
    res.json(vulnerabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new vulnerability
router.post('/', async (req, res) => {
  try {
    const vulnerability = await vulnService.createVulnerability(req.body);
    res.status(201).json(vulnerability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get vulnerability by ID
router.get('/:id', async (req, res) => {
  try {
    const vulnerability = await vulnService.getVulnerabilityById(req.params.id);
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    res.json(vulnerability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vulnerability
router.put('/:id', async (req, res) => {
  try {
    const vulnerability = await vulnService.updateVulnerability(req.params.id, req.body);
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    res.json(vulnerability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete vulnerability
router.delete('/:id', async (req, res) => {
  try {
    await vulnService.deleteVulnerability(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;