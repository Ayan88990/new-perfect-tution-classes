const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parentName: { type: String, required: true, trim: true },
  parentPhone: { type: String, required: true, trim: true },
  section: { type: String, required: true, enum: ['9th', '10th', 'others'] },
  totalFee: { type: Number, required: true, min: 0 },
  rollNumber: { type: String, required: true, trim: true, unique: true },
  address: { type: String, default: '' },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
