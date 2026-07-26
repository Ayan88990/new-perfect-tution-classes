const router = require('express').Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Inquiry = require('../models/Inquiry');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [students, payments, absentTodayRecords, pendingInquiries] = await Promise.all([
      Student.find({ isActive: true }),
      Payment.find(),
      Attendance.find({ date: today, isPresent: false }),
      Inquiry.countDocuments({ status: 'pending' }),
    ]);

    const totalStudents = students.length;
    const absentToday = absentTodayRecords.length;
    const presentToday = Math.max(0, totalStudents - absentToday);
    const attendancePercent = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 100;

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);

    res.json({
      totalStudents,
      presentToday,
      absentToday,
      attendancePercent,
      totalCollected,
      totalExpected,
      totalPending,
      totalInquiries: pendingInquiries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
