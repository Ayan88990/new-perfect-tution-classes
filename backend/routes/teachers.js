const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).sort({ name: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teachers
router.post('/', async (req, res) => {
  try {
    const { name, phone, subject, section, ratePerLecture, monthlySalary, joinedDate } = req.body;
    if (!name || !phone || !subject) {
      return res.status(400).json({ error: 'Name, phone, and subject are required' });
    }
    const teacher = new Teacher({
      name, phone, subject,
      section: section || 'All Sections',
      ratePerLecture: Number(ratePerLecture) || 500,
      monthlySalary: Number(monthlySalary) || 0,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
      isActive: true,
    });
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/teachers/:id
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/teachers/:id
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Teacher removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
