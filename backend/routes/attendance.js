const router = require('express').Router();
const Attendance = require('../models/Attendance');

// GET /api/attendance/absent/:date
router.get('/absent/:date', async (req, res) => {
  try {
    const absentRecords = await Attendance.find({ date: req.params.date, isPresent: false });
    res.json(absentRecords.map((r) => r.studentId.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { studentId, date } = req.body;
    if (!studentId || !date) {
      return res.status(400).json({ error: 'studentId and date are required' });
    }

    const existing = await Attendance.findOne({ studentId, date });
    if (!existing) {
      // Default was present => mark absent
      await Attendance.create({ studentId, date, isPresent: false });
    } else {
      // Was absent => remove record (back to present)
      await Attendance.findByIdAndDelete(existing._id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    const result = records.map((r) => ({ date: r.date, isPresent: r.isPresent }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
