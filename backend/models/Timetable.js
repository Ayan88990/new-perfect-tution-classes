const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  section: { type: String, required: true, enum: ['9th', '10th', 'others'] },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  teacher: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
