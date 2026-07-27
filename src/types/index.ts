export type BatchSection = '9th' | '10th' | 'others';

export type PaymentMode = 'cash' | 'upi' | 'cheque' | 'bank_transfer';

export interface Student {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  section: BatchSection;
  baseFee?: number;
  discount?: number;
  discountReason?: string;
  totalFee: number;
  rollNumber: string;
  address: string;
  joinedDate: string; // ISO date string
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  subject: string;
  section: string;
  ratePerLecture: number;
  monthlySalary: number;
  joinedDate: string;
  isActive: boolean;
}

export interface TeacherPayment {
  id: string;
  teacherId: Teacher | string;
  lecturesCount?: number;
  ratePerLecture?: number;
  amount: number;
  paymentDate: string;
  monthFor?: string;
  paymentMode: PaymentMode;
  receiptNote?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string YYYY-MM-DD
  isPresent: boolean;
  note?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  amount: number;
  date: string; // ISO date string
  mode: PaymentMode;
  receiptNote?: string;
  receiptNumber: string;
}

export interface TimetableSlot {
  id: string;
  section: BatchSection;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  subject: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  teacher?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  section: BatchSection | 'all';
}

export interface Inquiry {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  section: BatchSection;
  address: string;
  message?: string;
  submittedAt: string;
  status: 'pending' | 'contacted' | 'enrolled';
}

export interface Topper {
  id: string;
  name: string;
  section: BatchSection;
  percentage: string;
  year: string;
  rankBadge?: string;
  subjectScore?: string;
}

// Derived / Computed types
export interface StudentWithStats extends Student {
  totalPaid: number;
  remainingFee: number;
  attendanceRate: number;    // percentage 0 - 100
  attendancePercent: number; // percentage 0 - 100
  totalPresent: number;
  totalAbsent: number;
  recentAttendance?: AttendanceRecord[];
}
