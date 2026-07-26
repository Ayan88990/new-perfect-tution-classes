const router = require('express').Router();
const Notice = require('../models/Notice');

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const filter = section && section !== 'all' ? { section: { $in: ['all', section] } } : {};
    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notices
router.post('/', async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/notices/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
