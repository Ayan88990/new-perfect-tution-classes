const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  section: { type: String, default: 'All Sections' },
  rate1h: { type: Number, default: 300 },
  rate1_5h: { type: Number, default: 400 },
  rate2h: { type: Number, default: 500 },
  lastSettledDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
