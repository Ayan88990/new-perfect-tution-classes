const router = require('express').Router();
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const filter = { isActive: true };
    if (section) filter.section = section;
    const students = await Student.find(filter).sort({ rollNumber: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/all/stats
router.get('/all/stats', async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).sort({ rollNumber: 1 });
    const studentIds = students.map((s) => s._id);

    const payments = await Payment.find({ studentId: { $in: studentIds } });
    const attendanceRecords = await Attendance.find({ studentId: { $in: studentIds } });

    const result = students.map((student) => {
      const pArr = payments.filter((p) => p.studentId.toString() === student._id.toString());
      const totalPaid = pArr.reduce((sum, p) => sum + p.amount, 0);

      const attArr = attendanceRecords.filter((a) => a.studentId.toString() === student._id.toString());
      const totalAbsent = attArr.filter((a) => !a.isPresent).length;
      const totalDays = attArr.length || 1;
      const totalPresent = totalDays - totalAbsent;

      return {
        ...student.toObject(),
        id: student._id.toString(),
        totalPaid,
        remainingFee: Math.max(0, student.totalFee - totalPaid),
        attendancePercent: Math.round((totalPresent / totalDays) * 100),
        totalPresent,
        totalAbsent,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const payments = await Payment.find({ studentId: student._id });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const attendanceRecords = await Attendance.find({ studentId: student._id });
    const totalAbsent = attendanceRecords.filter((a) => !a.isPresent).length;
    const totalDays = attendanceRecords.length || 1;
    const totalPresent = totalDays - totalAbsent;

    res.json({
      ...student.toObject(),
      id: student._id.toString(),
      totalPaid,
      remainingFee: Math.max(0, student.totalFee - totalPaid),
      attendancePercent: Math.round((totalPresent / totalDays) * 100),
      totalPresent,
      totalAbsent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
