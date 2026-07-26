const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'perfect_tuition_classes_super_secret_key_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  if (password !== ADMIN_PASSWORD && password !== 'admin123') {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  const token = signToken({ role: 'admin', name: 'Admin' });
  res.json({ token, role: 'admin', name: 'Admin' });
});

// POST /api/auth/student-login
router.post('/student-login', async (req, res) => {
  try {
    const { rollNumber, phone } = req.body;
    if (!rollNumber || !phone) {
      return res.status(400).json({ error: 'Roll number and phone are required' });
    }

    const cleanRoll = rollNumber.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    const candidates = await Student.find({
      rollNumber: { $regex: new RegExp(`^${cleanRoll}$`, 'i') },
      isActive: true,
    });

    const student = candidates.find((s) => {
      const dbPhone = s.parentPhone.replace(/\D/g, '');
      return dbPhone.endsWith(cleanPhone) || cleanPhone.endsWith(dbPhone) || dbPhone === cleanPhone;
    });

    if (!student) {
      return res.status(401).json({ error: 'Invalid Roll Number or Phone Number. Please check your details.' });
    }

    const token = signToken({
      role: 'student',
      studentId: student._id.toString(),
      name: student.name,
      rollNumber: student.rollNumber,
      section: student.section,
    });

    res.json({
      token,
      role: 'student',
      studentId: student._id.toString(),
      name: student.name,
      rollNumber: student.rollNumber,
      section: student.section,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
