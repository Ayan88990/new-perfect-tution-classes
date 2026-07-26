const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: String, required: true },
  mode: { type: String, required: true, enum: ['cash', 'upi', 'cheque', 'bank_transfer'] },
  receiptNote: { type: String, default: '' },
  receiptNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
