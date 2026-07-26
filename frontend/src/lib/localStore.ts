/**
 * localStore.ts — Local Storage Fallback Data Store for Perfect Tuition Classes.
 * Guarantees 100% full functionality even when the remote/local backend API is offline or unreachable.
 */

import type {
  Student,
  AttendanceRecord,
  FeePayment,
  TimetableSlot,
  Notice,
  Inquiry,
  StudentWithStats,
  BatchSection,
  Topper,
} from '@/types';

const KEYS = {
  students: 'ptc_students_v2',
  attendance: 'ptc_attendance_v2',
  payments: 'ptc_payments_v2',
  timetable: 'ptc_timetable_v2',
  notices: 'ptc_notices_v2',
  inquiries: 'ptc_inquiries_v2',
  toppers: 'ptc_toppers_v2',
};

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

// ─── Initial Seed Data ────────────────────────────────────────────────────────

const SEED_STUDENTS: Student[] = [];
const SEED_ATTENDANCE: AttendanceRecord[] = [];
const SEED_PAYMENTS: FeePayment[] = [];

const SEED_TIMETABLE: TimetableSlot[] = [
  { id: 'tt_1', section: '9th', day: 'Monday', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', teacher: 'Firoz Sir' },
  { id: 'tt_2', section: '9th', day: 'Monday', subject: 'Science', startTime: '10:00', endTime: '11:00', teacher: 'Firoz Sir' },
  { id: 'tt_3', section: '9th', day: 'Wednesday', subject: 'English', startTime: '09:00', endTime: '10:00', teacher: 'Firoz Sir' },
  { id: 'tt_4', section: '9th', day: 'Wednesday', subject: 'History', startTime: '10:00', endTime: '11:00', teacher: 'Firoz Sir' },
  { id: 'tt_5', section: '9th', day: 'Friday', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', teacher: 'Firoz Sir' },
  { id: 'tt_6', section: '10th', day: 'Tuesday', subject: 'Mathematics', startTime: '09:00', endTime: '10:30', teacher: 'Firoz Sir' },
  { id: 'tt_7', section: '10th', day: 'Tuesday', subject: 'Physics', startTime: '10:30', endTime: '12:00', teacher: 'Firoz Sir' },
  { id: 'tt_8', section: '10th', day: 'Thursday', subject: 'Chemistry', startTime: '09:00', endTime: '10:30', teacher: 'Firoz Sir' },
  { id: 'tt_9', section: '10th', day: 'Thursday', subject: 'Biology', startTime: '10:30', endTime: '12:00', teacher: 'Firoz Sir' },
  { id: 'tt_10', section: '10th', day: 'Saturday', subject: 'Revision & Tests', startTime: '09:00', endTime: '12:00', teacher: 'Firoz Sir' },
  { id: 'tt_11', section: 'others', day: 'Monday', subject: 'Maths & Science', startTime: '17:00', endTime: '18:30', teacher: 'Firoz Sir' },
  { id: 'tt_12', section: 'others', day: 'Wednesday', subject: 'English & GK', startTime: '17:00', endTime: '18:30', teacher: 'Firoz Sir' },
  { id: 'tt_13', section: 'others', day: 'Friday', subject: 'Maths Revision', startTime: '17:00', endTime: '18:30', teacher: 'Firoz Sir' },
];

const SEED_NOTICES: Notice[] = [
  { id: 'nt_1', title: 'Unit Test Schedule', content: '9th & 10th Std unit tests will be held on 28th July 2026. Bring your ID cards.', date: today, section: 'all' },
  { id: 'nt_2', title: 'Holiday Notice', content: 'Classes will remain closed on 15th August 2026 (Independence Day).', date: yesterday, section: 'all' },
];

const SEED_INQUIRIES: Inquiry[] = [
  { id: 'inq_1', studentName: 'Vikas Sharma', parentName: 'Santosh Sharma', parentPhone: '9898989898', section: '10th', address: 'Andheri West', message: 'Inquiring about 10th SSC batch timings', submittedAt: yesterday, status: 'pending' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function load<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage [${key}]:`, err);
  }
}

function generateId(): string {
  return 'local_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function generateReceiptNumber(): string {
  const count = load<FeePayment[]>(KEYS.payments, SEED_PAYMENTS).length + 1;
  return `R-${String(count).padStart(3, '0')}`;
}

// ─── Local Store Implementation ───────────────────────────────────────────────

export const localStore = {
  // Auth
  loginAdmin(password: string): { token: string; name: string; role: string } {
    if (!password) throw new Error('Password is required');
    if (password !== 'admin123' && password !== 'admin') {
      throw new Error('Incorrect password. Please try again.');
    }
    return { token: 'local-admin-jwt-token', name: 'Admin', role: 'admin' };
  },

  loginStudent(rollNumber: string, phone: string): {
    token: string; role: string; studentId: string; name: string; rollNumber: string; section: string;
  } {
    const cleanRoll = rollNumber.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const students = this.getStudents();

    const student = students.find((s) => {
      if (!s.isActive) return false;
      const matchRoll = s.rollNumber.toLowerCase() === cleanRoll;
      const matchPhone = s.parentPhone.endsWith(cleanPhone) || cleanPhone.endsWith(s.parentPhone) || s.parentPhone === cleanPhone;
      return matchRoll && matchPhone;
    });

    if (!student) {
      throw new Error('Invalid Roll Number or Phone Number. Please check your credentials.');
    }

    return {
      token: `local-student-jwt-${student.id}`,
      role: 'student',
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      section: student.section,
    };
  },

  // Students
  getStudents(section?: BatchSection): Student[] {
    const list = load<Student[]>(KEYS.students, SEED_STUDENTS) || [];
    return section ? list.filter((s) => s.section === section && s.isActive) : list.filter((s) => s.isActive);
  },

  getStudentById(id: string): Student {
    const list = load<Student[]>(KEYS.students, SEED_STUDENTS);
    const student = list.find((s) => s.id === id || (s as unknown as { _id?: string })._id === id);
    if (!student) throw new Error('Student not found');
    return student;
  },

  addStudent(studentData: Omit<Student, 'id'>): Student {
    const list = load<Student[]>(KEYS.students, SEED_STUDENTS);
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
      isActive: true,
      joinedDate: studentData.joinedDate || new Date().toISOString().split('T')[0],
    };
    save(KEYS.students, [...list, newStudent]);
    return newStudent;
  },

  updateStudent(id: string, updates: Partial<Student>): Student {
    const list = load<Student[]>(KEYS.students, SEED_STUDENTS);
    let updatedStudent: Student | null = null;
    const newList = list.map((s) => {
      if (s.id === id || (s as unknown as { _id?: string })._id === id) {
        updatedStudent = { ...s, ...updates };
        return updatedStudent;
      }
      return s;
    });
    if (!updatedStudent) throw new Error('Student not found for update');
    save(KEYS.students, newList);
    return updatedStudent;
  },

  deleteStudent(id: string): void {
    const list = load<Student[]>(KEYS.students, SEED_STUDENTS);
    const newList = list.map((s) =>
      s.id === id || (s as unknown as { _id?: string })._id === id ? { ...s, isActive: false } : s,
    );
    save(KEYS.students, newList);
  },

  // Attendance
  getAbsentIds(date: string): string[] {
    const records = load<AttendanceRecord[]>(KEYS.attendance, SEED_ATTENDANCE);
    return records.filter((r) => r.date === date && !r.isPresent).map((r) => r.studentId);
  },

  toggleAttendance(studentId: string, date: string): void {
    const records = load<AttendanceRecord[]>(KEYS.attendance, SEED_ATTENDANCE);
    const existing = records.find(
      (r) => (r.studentId === studentId || (r as unknown as { _id?: string })._id === studentId) && r.date === date,
    );

    if (!existing) {
      // Default was present, mark absent
      const newRecord: AttendanceRecord = {
        id: generateId(),
        studentId,
        date,
        isPresent: false,
      };
      save(KEYS.attendance, [...records, newRecord]);
    } else {
      // Remove record => back to present
      save(
        KEYS.attendance,
        records.filter((r) => !(r.studentId === studentId && r.date === date)),
      );
    }
  },

  getStudentAttendanceDates(studentId: string): { date: string; isPresent: boolean }[] {
    const records = load<AttendanceRecord[]>(KEYS.attendance, SEED_ATTENDANCE);
    const allDates = [...new Set(records.map((r) => r.date))];
    if (!allDates.includes(today)) allDates.push(today);
    allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return allDates.map((date) => {
      const isAbsent = records.some((r) => r.studentId === studentId && r.date === date && !r.isPresent);
      return { date, isPresent: !isAbsent };
    });
  },

  // Payments
  getPayments(): FeePayment[] {
    return load<FeePayment[]>(KEYS.payments, SEED_PAYMENTS);
  },

  getPaymentsByStudent(studentId: string): FeePayment[] {
    const list = load<FeePayment[]>(KEYS.payments, SEED_PAYMENTS);
    return list
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addPayment(payment: { studentId: string; amount: number; date: string; mode: string; receiptNote?: string }): FeePayment {
    const list = load<FeePayment[]>(KEYS.payments, SEED_PAYMENTS);
    const newPayment: FeePayment = {
      id: generateId(),
      studentId: payment.studentId,
      amount: payment.amount,
      date: payment.date || new Date().toISOString().split('T')[0],
      mode: payment.mode as FeePayment['mode'],
      receiptNote: payment.receiptNote || '',
      receiptNumber: generateReceiptNumber(),
    };
    save(KEYS.payments, [...list, newPayment]);
    return newPayment;
  },

  // Stats / Dashboard
  getStudentStats(studentId: string): StudentWithStats {
    const student = this.getStudentById(studentId);
    const payments = this.getPaymentsByStudent(studentId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const attendanceDates = this.getStudentAttendanceDates(studentId);
    const totalDays = attendanceDates.length || 1;
    const totalPresent = attendanceDates.filter((d) => d.isPresent).length;
    const totalAbsent = totalDays - totalPresent;

    return {
      ...student,
      totalPaid,
      remainingFee: Math.max(0, student.totalFee - totalPaid),
      attendancePercent: Math.round((totalPresent / totalDays) * 100),
      attendanceRate: Math.round((totalPresent / totalDays) * 100),
      totalPresent,
      totalAbsent,
    };
  },

  getAllStudentStats(): StudentWithStats[] {
    return this.getStudents().map((s) => this.getStudentStats(s.id));
  },

  getDashboardStats() {
    const students = this.getStudents();
    const allPayments = this.getPayments();
    const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
    const absentTodayCount = this.getAbsentIds(today).length;
    const presentToday = Math.max(0, students.length - absentTodayCount);

    return {
      totalStudents: students.length,
      presentToday,
      absentToday: absentTodayCount,
      attendancePercent: students.length > 0 ? Math.round((presentToday / students.length) * 100) : 100,
      totalCollected,
      totalExpected,
      totalPending: Math.max(0, totalExpected - totalCollected),
      totalInquiries: this.getInquiries().filter((i) => i.status === 'pending').length,
    };
  },

  // Timetable
  getTimetable(section?: BatchSection): TimetableSlot[] {
    const list = load<TimetableSlot[]>(KEYS.timetable, SEED_TIMETABLE);
    return section ? list.filter((t) => t.section === section) : list;
  },

  addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const list = load<TimetableSlot[]>(KEYS.timetable, SEED_TIMETABLE);
    const newSlot: TimetableSlot = { ...slot, id: generateId() };
    save(KEYS.timetable, [...list, newSlot]);
    return newSlot;
  },

  deleteTimetableSlot(id: string): void {
    const list = load<TimetableSlot[]>(KEYS.timetable, SEED_TIMETABLE);
    save(KEYS.timetable, list.filter((t) => t.id !== id));
  },

  // Notices
  getNotices(section?: BatchSection | 'all'): Notice[] {
    const list = load<Notice[]>(KEYS.notices, SEED_NOTICES);
    return section && section !== 'all' ? list.filter((n) => n.section === 'all' || n.section === section) : list;
  },

  addNotice(notice: { title: string; content: string; section?: string }): Notice {
    const list = load<Notice[]>(KEYS.notices, SEED_NOTICES);
    const newNotice: Notice = {
      id: generateId(),
      title: notice.title,
      content: notice.content,
      date: new Date().toISOString().split('T')[0],
      section: (notice.section as Notice['section']) || 'all',
    };
    save(KEYS.notices, [...list, newNotice]);
    return newNotice;
  },

  deleteNotice(id: string): void {
    const list = load<Notice[]>(KEYS.notices, SEED_NOTICES);
    save(KEYS.notices, list.filter((n) => n.id !== id));
  },

  // Inquiries
  getInquiries(): Inquiry[] {
    return load<Inquiry[]>(KEYS.inquiries, SEED_INQUIRIES);
  },

  submitInquiry(inquiry: Omit<Inquiry, 'id' | 'submittedAt' | 'status'>): Inquiry {
    const list = load<Inquiry[]>(KEYS.inquiries, SEED_INQUIRIES);
    const newInquiry: Inquiry = {
      ...inquiry,
      id: generateId(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    save(KEYS.inquiries, [...list, newInquiry]);
    return newInquiry;
  },

  updateInquiryStatus(id: string, status: Inquiry['status']): Inquiry {
    const list = load<Inquiry[]>(KEYS.inquiries, SEED_INQUIRIES);
    let updated: Inquiry | null = null;
    const newList = list.map((i) => {
      if (i.id === id) {
        updated = { ...i, status };
        return updated;
      }
      return i;
    });
    if (!updated) throw new Error('Inquiry not found');
    save(KEYS.inquiries, newList);
    return updated;
  },

  // Toppers
  getToppers(): Topper[] {
    return load<Topper[]>(KEYS.toppers, []) || [];
  },

  addTopper(topper: Omit<Topper, 'id'>): Topper {
    const list = this.getToppers();
    const newTopper: Topper = {
      ...topper,
      id: generateId(),
    };
    save(KEYS.toppers, [newTopper, ...list]);
    return newTopper;
  },

  deleteTopper(id: string): void {
    const list = this.getToppers();
    save(KEYS.toppers, list.filter((t) => t.id !== id));
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
