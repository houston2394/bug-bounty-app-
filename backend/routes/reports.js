const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { status, targetId } = req.query;
    const reports = await reportService.getAllReports({ status, targetId });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate report from template
router.post('/generate/:targetId', async (req, res) => {
  try {
    const { template } = req.body;
    const report = await reportService.generateReport(req.params.targetId, template);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update report
router.put('/:id', async (req, res) => {
  try {
    const report = await reportService.updateReport(req.params.id, req.body);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    await reportService.deleteReport(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export report
router.get('/:id/export', async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    const exportedReport = await reportService.exportReport(req.params.id, format);
    
    res.setHeader('Content-Type', exportedReport.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportedReport.filename}"`);
    res.send(exportedReport.content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;