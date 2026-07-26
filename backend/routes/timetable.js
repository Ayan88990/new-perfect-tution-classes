const router = require('express').Router();
const Timetable = require('../models/Timetable');

// GET /api/timetable
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const filter = section ? { section } : {};
    const slots = await Timetable.find(filter).sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timetable
router.post('/', async (req, res) => {
  try {
    const slot = new Timetable(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
