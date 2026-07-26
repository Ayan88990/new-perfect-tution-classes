const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  section: { type: String, default: 'all', enum: ['all', '9th', '10th', 'others'] },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
