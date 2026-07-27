/**
 * seedData.js — Centralized initial mock dataset for Perfect Tuition Classes.
 * Shared between autoSeedIfEmpty (server startup) and seed.js (manual seed script).
 */

const initialTeachers = [
  { name: 'Firoz Sir', phone: '9925432574', subject: 'Mathematics & Physics', section: '10th SSC & 9th', rate1h: 300, rate1_5h: 400, rate2h: 500, joinedDate: '2025-05-01', isActive: true },
  { name: 'Sameer Sir', phone: '9879012345', subject: 'English & Social Studies', section: '9th & 10th', rate1h: 300, rate1_5h: 400, rate2h: 500, joinedDate: '2025-06-01', isActive: true },
  { name: 'Ayesha Madam', phone: '9765432109', subject: 'All Subjects (Primary)', section: 'Primary Section', rate1h: 250, rate1_5h: 350, rate2h: 450, joinedDate: '2025-07-01', isActive: true },
];

const initialStudents = [
  { name: 'Rohan Mehta', parentName: 'Suresh Mehta', parentPhone: '9876543210', section: '9th', baseFee: 12000, discount: 0, discountReason: '', totalFee: 12000, rollNumber: '901', address: 'Juhapura, Ahmedabad', joinedDate: '2026-06-01' },
  { name: 'Priya Sharma', parentName: 'Anil Sharma', parentPhone: '9823456789', section: '9th', baseFee: 12000, discount: 1000, discountReason: 'Sibling Concession', totalFee: 11000, rollNumber: '902', address: 'Sharifabad, Ahmedabad', joinedDate: '2026-06-01' },
  { name: 'Amit Desai', parentName: 'Rajesh Desai', parentPhone: '9712345678', section: '9th', baseFee: 12000, discount: 0, discountReason: '', totalFee: 12000, rollNumber: '903', address: 'Sarkhej, Ahmedabad', joinedDate: '2026-06-05' },
  { name: 'Sneha Patil', parentName: 'Vijay Patil', parentPhone: '9611234567', section: '9th', baseFee: 12000, discount: 2000, discountReason: 'Merit Scholarship', totalFee: 10000, rollNumber: '904', address: 'Paldi, Ahmedabad', joinedDate: '2026-06-10' },
  { name: 'Karan Joshi', parentName: 'Deepak Joshi', parentPhone: '9500123456', section: '10th', baseFee: 15000, discount: 0, discountReason: '', totalFee: 15000, rollNumber: '1001', address: 'Vasna, Ahmedabad', joinedDate: '2026-06-01' },
  { name: 'Neha Gupta', parentName: 'Ramesh Gupta', parentPhone: '9389012345', section: '10th', baseFee: 15000, discount: 1500, discountReason: 'Early Bird Discount', totalFee: 13500, rollNumber: '1002', address: 'Juhapura, Ahmedabad', joinedDate: '2026-06-01' },
  { name: 'Sahil Khan', parentName: 'Irfan Khan', parentPhone: '9278901234', section: '10th', baseFee: 15000, discount: 0, discountReason: '', totalFee: 15000, rollNumber: '1003', address: 'Sharifabad, Ahmedabad', joinedDate: '2026-06-03' },
  { name: 'Divya Nair', parentName: 'Sunil Nair', parentPhone: '9167890123', section: '10th', baseFee: 15000, discount: 0, discountReason: '', totalFee: 15000, rollNumber: '1004', address: 'Vejalpur, Ahmedabad', joinedDate: '2026-06-08' },
  { name: 'Arjun Singh', parentName: 'Gurpreet Singh', parentPhone: '9056789012', section: 'others', baseFee: 8000, discount: 0, discountReason: '', totalFee: 8000, rollNumber: 'O01', address: 'Juhapura, Ahmedabad', joinedDate: '2026-06-02' },
  { name: 'Tanvi Rao', parentName: 'Kishore Rao', parentPhone: '8945678901', section: 'others', baseFee: 8000, discount: 500, discountReason: 'Staff Concession', totalFee: 7500, rollNumber: 'O02', address: 'Sarkhej, Ahmedabad', joinedDate: '2026-06-02' },
];

function getInitialAttendance(byRoll) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  return [
    { studentId: byRoll['903'], date: today, isPresent: false },
    { studentId: byRoll['1003'], date: today, isPresent: false },
    { studentId: byRoll['902'], date: yesterday, isPresent: false },
    { studentId: byRoll['1002'], date: yesterday, isPresent: false },
    { studentId: byRoll['O02'], date: yesterday, isPresent: false },
    { studentId: byRoll['904'], date: twoDaysAgo, isPresent: false },
    { studentId: byRoll['O01'], date: twoDaysAgo, isPresent: false },
  ];
}

function getInitialPayments(byRoll) {
  return [
    { studentId: byRoll['901'], amount: 6000, date: '2026-06-05', mode: 'cash', receiptNumber: 'R-001', receiptNote: 'First installment' },
    { studentId: byRoll['901'], amount: 4000, date: '2026-07-05', mode: 'upi', receiptNumber: 'R-002', receiptNote: 'Second installment' },
    { studentId: byRoll['902'], amount: 11000, date: '2026-06-02', mode: 'cash', receiptNumber: 'R-003', receiptNote: 'Full payment (discounted)' },
    { studentId: byRoll['903'], amount: 5000, date: '2026-06-10', mode: 'upi', receiptNumber: 'R-004', receiptNote: 'Partial payment' },
    { studentId: byRoll['1001'], amount: 8000, date: '2026-06-01', mode: 'cash', receiptNumber: 'R-005', receiptNote: 'First installment' },
    { studentId: byRoll['1001'], amount: 5000, date: '2026-07-01', mode: 'upi', receiptNumber: 'R-006', receiptNote: 'Second installment' },
    { studentId: byRoll['1002'], amount: 13500, date: '2026-06-03', mode: 'bank_transfer', receiptNumber: 'R-007', receiptNote: 'Full payment' },
    { studentId: byRoll['1003'], amount: 7000, date: '2026-06-05', mode: 'cash', receiptNumber: 'R-008', receiptNote: 'Partial payment' },
    { studentId: byRoll['O01'], amount: 4000, date: '2026-06-10', mode: 'cash', receiptNumber: 'R-009', receiptNote: 'First installment' },
    { studentId: byRoll['O02'], amount: 7500, date: '2026-06-03', mode: 'upi', receiptNumber: 'R-010', receiptNote: 'Full payment' },
  ];
}

function getInitialTeacherPayments(byTeacherName) {
  return [
    { teacherId: byTeacherName['Firoz Sir'], lecturesCount: 25, ratePerLecture: 600, amount: 15000, paymentDate: '2026-07-01', monthFor: 'June 2026', paymentMode: 'bank_transfer', receiptNote: '25 Lectures @ ₹600/lec' },
    { teacherId: byTeacherName['Sameer Sir'], lecturesCount: 20, ratePerLecture: 500, amount: 10000, paymentDate: '2026-07-01', monthFor: 'June 2026', paymentMode: 'upi', receiptNote: '20 Lectures @ ₹500/lec' },
    { teacherId: byTeacherName['Ayesha Madam'], lecturesCount: 18, ratePerLecture: 400, amount: 7200, paymentDate: '2026-07-02', monthFor: 'June 2026', paymentMode: 'cash', receiptNote: '18 Lectures @ ₹400/lec' },
  ];
}

const initialTimetable = [
  { section: '9th', day: 'Monday', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', teacher: 'Firoz Sir' },
  { section: '9th', day: 'Monday', subject: 'Science', startTime: '10:00', endTime: '11:00', teacher: 'Firoz Sir' },
  { section: '9th', day: 'Wednesday', subject: 'English', startTime: '09:00', endTime: '10:00', teacher: 'Sameer Sir' },
  { section: '9th', day: 'Wednesday', subject: 'History', startTime: '10:00', endTime: '11:00', teacher: 'Sameer Sir' },
  { section: '9th', day: 'Friday', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', teacher: 'Firoz Sir' },
  { section: '10th', day: 'Tuesday', subject: 'Mathematics', startTime: '09:00', endTime: '10:30', teacher: 'Firoz Sir' },
  { section: '10th', day: 'Tuesday', subject: 'Physics', startTime: '10:30', endTime: '12:00', teacher: 'Firoz Sir' },
  { section: '10th', day: 'Thursday', subject: 'Chemistry', startTime: '09:00', endTime: '10:30', teacher: 'Firoz Sir' },
  { section: '10th', day: 'Thursday', subject: 'Biology', startTime: '10:30', endTime: '12:00', teacher: 'Firoz Sir' },
  { section: '10th', day: 'Saturday', subject: 'Revision & Tests', startTime: '09:00', endTime: '12:00', teacher: 'Firoz Sir' },
  { section: 'others', day: 'Monday', subject: 'Maths & Science', startTime: '17:00', endTime: '18:30', teacher: 'Ayesha Madam' },
  { section: 'others', day: 'Wednesday', subject: 'English & GK', startTime: '17:00', endTime: '18:30', teacher: 'Ayesha Madam' },
  { section: 'others', day: 'Friday', subject: 'Maths Revision', startTime: '17:00', endTime: '18:30', teacher: 'Ayesha Madam' },
];

function getInitialNotices() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    { title: 'Unit Test Schedule', content: '9th & 10th Std unit tests will be held on 28th July 2026. Bring your ID cards.', date: today, section: 'all' },
    { title: 'Holiday Notice', content: 'Classes will remain closed on 15th August 2026 (Independence Day).', date: yesterday, section: 'all' },
  ];
}

module.exports = {
  initialTeachers,
  initialStudents,
  getInitialAttendance,
  getInitialPayments,
  getInitialTeacherPayments,
  initialTimetable,
  getInitialNotices,
};
