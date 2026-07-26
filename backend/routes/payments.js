const router = require('express').Router();
const Payment = require('../models/Payment');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('studentId', 'name rollNumber').sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/student/:studentId
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const count = await Payment.countDocuments();
    const receiptNumber = `R-${String(count + 1).padStart(3, '0')}`;

    const payment = new Payment({
      ...req.body,
      receiptNumber,
      date: req.body.date || new Date().toISOString().split('T')[0],
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
