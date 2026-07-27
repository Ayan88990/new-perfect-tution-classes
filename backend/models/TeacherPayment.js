const mongoose = require('mongoose');

const teacherPaymentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  lecturesCount: { type: Number, default: 0 },
  ratePerLecture: { type: Number, default: 0 },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: String, required: true },
  monthFor: { type: String, default: '' },
  paymentMode: { type: String, default: 'upi', enum: ['cash', 'upi', 'bank_transfer'] },
  receiptNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TeacherPayment', teacherPaymentSchema);
