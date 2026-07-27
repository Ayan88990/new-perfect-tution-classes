const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const TeacherPayment = require('../models/TeacherPayment');

// Helper to compute minutes between HH:MM
function getDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 60;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = (sh || 0) * 60 + (sm || 0);
  const endMins = (eh || 0) * 60 + (em || 0);
  const diff = endMins - startMins;
  return diff > 0 ? diff : 60;
}

// Helper to calculate rate for a slot based on teacher's duration tiers
function getSlotEarnings(slot, teacher) {
  const duration = getDurationMinutes(slot.startTime, slot.endTime);
  const rate1h = teacher.rate1h || 300;
  const rate1_5h = teacher.rate1_5h || 400;
  const rate2h = teacher.rate2h || 500;

  let amount = rate1h;
  let durationLabel = '1 Hour';

  if (duration <= 70) {
    amount = rate1h;
    durationLabel = '1 Hour';
  } else if (duration <= 105) {
    amount = rate1_5h;
    durationLabel = '1.5 Hours';
  } else {
    amount = rate2h;
    durationLabel = `${(duration / 60).toFixed(1)} Hours`;
  }

  return { durationMinutes: duration, durationLabel, amount };
}

// GET /api/teachers — Includes live calculated timetable earnings & pending balance
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).sort({ name: 1 });
    const allSlots = await Timetable.find();
    const allPayments = await TeacherPayment.find();

    const result = teachers.map((teacher) => {
      // Find all timetable slots matching teacher name
      const slots = allSlots.filter(s => s.teacher && s.teacher.toLowerCase().trim() === teacher.name.toLowerCase().trim());
      
      let totalEarned = 0;
      const lectureHistory = slots.map((slot) => {
        const calc = getSlotEarnings(slot, teacher);
        totalEarned += calc.amount;
        return {
          id: slot._id.toString(),
          day: slot.day,
          subject: slot.subject,
          section: slot.section,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMinutes: calc.durationMinutes,
          durationLabel: calc.durationLabel,
          amount: calc.amount,
        };
      });

      // Calculate total cleared payments for this teacher
      const payments = allPayments.filter(p => p.teacherId && p.teacherId.toString() === teacher._id.toString());
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const pendingBalance = Math.max(0, totalEarned - totalPaid);

      return {
        ...teacher.toObject(),
        id: teacher._id.toString(),
        totalLecturesCount: slots.length,
        totalEarned,
        totalPaid,
        pendingBalance,
        lectureHistory,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teachers — Create new faculty member
router.post('/', async (req, res) => {
  try {
    const { name, phone, subject, section, rate1h, rate1_5h, rate2h, joinedDate } = req.body;
    if (!name || !phone || !subject) {
      return res.status(400).json({ error: 'Name, phone, and subject are required' });
    }
    const teacher = new Teacher({
      name, phone, subject,
      section: section || 'All Sections',
      rate1h: Number(rate1h) || 300,
      rate1_5h: Number(rate1_5h) || 400,
      rate2h: Number(rate2h) || 500,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
      isActive: true,
    });
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/teachers/:id — Update faculty rates or details
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/teachers/:id/clear-balance — One-click settlement
router.post('/:id/clear-balance', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    // Calculate current earnings
    const slots = await Timetable.find({ teacher: { $regex: new RegExp(`^${teacher.name}$`, 'i') } });
    const payments = await TeacherPayment.find({ teacherId: teacher._id });

    let totalEarned = 0;
    slots.forEach(slot => {
      const calc = getSlotEarnings(slot, teacher);
      totalEarned += calc.amount;
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingBalance = Math.max(0, totalEarned - totalPaid);

    if (pendingBalance <= 0) {
      return res.status(400).json({ error: 'No pending balance to clear' });
    }

    // Create settlement payment record
    const today = new Date().toISOString().split('T')[0];
    const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const newPayment = new TeacherPayment({
      teacherId: teacher._id,
      lecturesCount: slots.length,
      ratePerLecture: teacher.rate1h,
      amount: pendingBalance,
      paymentDate: today,
      monthFor: monthStr,
      paymentMode: req.body.paymentMode || 'upi',
      receiptNote: req.body.receiptNote || `Full Settlement (${slots.length} Lectures cleared)`,
    });
    await newPayment.save();

    teacher.lastSettledDate = today;
    await teacher.save();

    res.json({ message: 'Balance cleared successfully', payment: newPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
