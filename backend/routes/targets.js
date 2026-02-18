const express = require('express');
const router = express.Router();
const targetService = require('../services/targetService');

// Get all targets
router.get('/', async (req, res) => {
  try {
    const targets = await targetService.getAllTargets();
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new target
router.post('/', async (req, res) => {
  try {
    const target = await targetService.createTarget(req.body);
    res.status(201).json(target);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get target by ID
router.get('/:id', async (req, res) => {
  try {
    const target = await targetService.getTargetById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    res.json(target);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update target
router.put('/:id', async (req, res) => {
  try {
    const target = await targetService.updateTarget(req.params.id, req.body);
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    res.json(target);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete target
router.delete('/:id', async (req, res) => {
  try {
    await targetService.deleteTarget(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get target statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await targetService.getTargetStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;