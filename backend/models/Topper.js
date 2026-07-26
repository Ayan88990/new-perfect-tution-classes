const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: String, required: true, enum: ['9th', '10th', 'others'] },
  percentage: { type: String, required: true, trim: true },
  year: { type: String, required: true, default: '2025' },
  rankBadge: { type: String, default: '🏆 Topper' },
  subjectScore: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Topper', topperSchema);
