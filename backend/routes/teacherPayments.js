const express = require('express');
const router = express.Router();
const TeacherPayment = require('../models/TeacherPayment');
const Teacher = require('../models/Teacher');

// GET /api/teacher-payments
router.get('/', async (req, res) => {
  try {
    const payments = await TeacherPayment.find().populate('teacherId', 'name subject phone').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teacher-payments/teacher/:teacherId
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const payments = await TeacherPayment.find({ teacherId: req.params.teacherId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teacher-payments
router.post('/', async (req, res) => {
  try {
    const { teacherId, lecturesCount, ratePerLecture, amount, paymentDate, monthFor, paymentMode, receiptNote } = req.body;
    if (!teacherId || !amount) {
      return res.status(400).json({ error: 'Teacher ID and amount are required' });
    }
    const payment = new TeacherPayment({
      teacherId,
      lecturesCount: Number(lecturesCount) || 0,
      ratePerLecture: Number(ratePerLecture) || 0,
      amount: Number(amount),
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      monthFor: monthFor || '',
      paymentMode: paymentMode || 'upi',
      receiptNote: receiptNote || '',
    });
    await payment.save();
    const populated = await TeacherPayment.findById(payment._id).populate('teacherId', 'name subject phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/teacher-payments/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TeacherPayment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Payment record not found' });
    res.json({ message: 'Teacher payment record removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
