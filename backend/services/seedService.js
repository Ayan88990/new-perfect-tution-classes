/**
 * seedService.js — Seeding service for Perfect Tuition Classes.
 * Supplies both autoSeedIfEmpty (on app start) and seedDatabase (for script/manual triggers).
 */

const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const {
  initialStudents,
  getInitialAttendance,
  getInitialPayments,
  initialTimetable,
  getInitialNotices,
} = require('../data/seedData');

/**
 * Populate seed data if database has zero students.
 */
async function autoSeedIfEmpty() {
  try {
    const count = await Student.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Running auto-seed...');
      await seedDatabase(false);
      console.log('🎉 Auto-seed complete!');
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

/**
 * Perform database seeding. If clearExisting is true, wipes old data first.
 */
async function seedDatabase(clearExisting = false) {
  if (clearExisting) {
    await Promise.all([
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      Payment.deleteMany({}),
      Timetable.deleteMany({}),
      Notice.deleteMany({}),
    ]);
    console.log('🗑️ Cleared existing data');
  }

  const students = await Student.insertMany(initialStudents);
  console.log(`✅ Inserted ${students.length} students`);

  const byRoll = {};
  students.forEach((s) => { byRoll[s.rollNumber] = s._id; });

  await Attendance.insertMany(getInitialAttendance(byRoll));
  console.log('✅ Inserted attendance records');

  await Payment.insertMany(getInitialPayments(byRoll));
  console.log('✅ Inserted payments');

  await Timetable.insertMany(initialTimetable);
  console.log('✅ Inserted timetable');

  await Notice.insertMany(getInitialNotices());
  console.log('✅ Inserted notices');
}

module.exports = {
  autoSeedIfEmpty,
  seedDatabase,
};
