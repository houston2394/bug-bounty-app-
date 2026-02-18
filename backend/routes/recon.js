const express = require('express');
const router = express.Router();
const reconService = require('../services/reconService');

// Run passive reconnaissance
router.post('/passive/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runPassiveRecon(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run active reconnaissance
router.post('/active/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runActiveRecon(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run quick vulnerability scan
router.post('/quick-scan/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runQuickVulnScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run Shodan Scan
router.post('/shodan/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runShodanScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run Deep DNS Scan
router.post('/dns/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runDnsScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/virustotal/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runVirusTotalScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/alienvault/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runAlienVaultScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/censys/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runCensysScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vulnintel/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runVulnIntelScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hackertarget/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runHackerTargetScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hunter/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runHunterScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/whois/:targetId', async (req, res) => {
  try {
    const jobId = await reconService.runWhoisScan(req.params.targetId, req.app.get('io'));
    res.json({ jobId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recon status
router.get('/status/:jobId', async (req, res) => {
  try {
    const status = await reconService.getJobStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recon results
router.get('/results/:targetId', async (req, res) => {
  try {
    const results = await reconService.getReconResults(req.params.targetId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all recon jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await reconService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;