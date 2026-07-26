const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  section: { type: String, required: true, enum: ['9th', '10th', 'others'] },
  address: { type: String, default: '' },
  message: { type: String, default: '' },
  submittedAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, default: 'pending', enum: ['pending', 'contacted', 'enrolled'] },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
