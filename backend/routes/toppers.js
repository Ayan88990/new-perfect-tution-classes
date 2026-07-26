const router = require('express').Router();
const Topper = require('../models/Topper');

// GET /api/toppers — Get all toppers
router.get('/', async (req, res) => {
  try {
    const toppers = await Topper.find().sort({ createdAt: -1 });
    res.json(toppers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/toppers — Add new topper (Admin)
router.post('/', async (req, res) => {
  try {
    const topper = new Topper(req.body);
    await topper.save();
    res.status(201).json(topper);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/toppers/:id — Delete topper (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Topper.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Topper not found' });
    res.json({ message: 'Topper deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
