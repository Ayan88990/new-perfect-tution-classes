/**
 * api.ts — Resilient HTTP client for Perfect Tuition Classes with automatic local storage fallback.
 * Connects to the backend when available; falls back to localStore seamlessly if offline/unreachable.
 */

import type {
  Student, AttendanceRecord, FeePayment, TimetableSlot,
  Notice, Inquiry, StudentWithStats, BatchSection, Topper,
  Teacher, TeacherPayment,
} from '@/types';
import { localStore } from './localStore';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ptc_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ptc_token', token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ptc_token');
}

// ─── Fetch Wrapper with Render Cold-Start Timeout & Fallback ────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  fallbackFn?: () => T | Promise<T>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // 30s timeout to accommodate Render free-tier cold starts (can take 15-30s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (netErr: unknown) {
    clearTimeout(timeoutId);
    console.warn(`[API] Network connection to ${path} failed (${netErr instanceof Error ? netErr.message : 'Error'}), using localStore fallback.`);
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw netErr;
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errBody?.error || `HTTP ${res.status}`);
  }

  // Always return exact live data from MongoDB Atlas
  return await res.json() as T;
}

/** Ping backend to check if alive. Returns true if backend responds OK. */
export async function pingBackend(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/** Normalize _id → id for consistent frontend use */
function normalizeId<T extends { _id?: string; id?: string }>(obj: T): T & { id: string } {
  return { ...obj, id: obj.id || obj._id || '' };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  async loginAdmin(password: string): Promise<{ token: string; name: string; role: string }> {
    return apiFetch('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }, false, () => localStore.loginAdmin(password));
  },

  async loginStudent(rollNumber: string, phone: string): Promise<{
    token: string; role: string; studentId: string; name: string; rollNumber: string; section: string;
  }> {
    return apiFetch('/api/auth/student-login', {
      method: 'POST',
      body: JSON.stringify({ rollNumber, phone }),
    }, false, () => localStore.loginStudent(rollNumber, phone));
  },
};

// ─── Students ─────────────────────────────────────────────────────────────────

export const students = {
  async getAll(section?: BatchSection): Promise<Student[]> {
    const query = section ? `?section=${section}` : '';
    return apiFetch<(Student & { _id?: string })[]>(
      `/api/students${query}`,
      {},
      true,
      () => localStore.getStudents(section),
    ).then((data) => data.map(normalizeId));
  },

  async getById(id: string): Promise<Student> {
    return apiFetch<Student & { _id?: string }>(
      `/api/students/${id}`,
      {},
      true,
      () => localStore.getStudentById(id),
    ).then(normalizeId);
  },

  async getStats(id: string): Promise<StudentWithStats> {
    return apiFetch<StudentWithStats & { _id?: string }>(
      `/api/students/${id}/stats`,
      {},
      true,
      () => localStore.getStudentStats(id),
    ).then(normalizeId);
  },

  async getAllStats(): Promise<StudentWithStats[]> {
    return apiFetch<(StudentWithStats & { _id?: string })[]>(
      '/api/students/all/stats',
      {},
      true,
      () => localStore.getAllStudentStats(),
    ).then((data) => data.map(normalizeId));
  },

  async add(student: Omit<Student, 'id'>): Promise<Student> {
    return apiFetch<Student & { _id?: string }>(
      '/api/students',
      { method: 'POST', body: JSON.stringify(student) },
      true,
      () => localStore.addStudent(student),
    ).then(normalizeId);
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    return apiFetch<Student & { _id?: string }>(
      `/api/students/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      true,
      () => localStore.updateStudent(id, updates),
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(
      `/api/students/${id}`,
      { method: 'DELETE' },
      true,
      () => localStore.deleteStudent(id),
    );
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendance = {
  async getAbsentIds(date: string): Promise<string[]> {
    return apiFetch<string[]>(
      `/api/attendance/absent/${date}`,
      {},
      true,
      () => localStore.getAbsentIds(date),
    );
  },

  async toggleAttendance(studentId: string, date: string): Promise<void> {
    await apiFetch(
      '/api/attendance/toggle',
      { method: 'POST', body: JSON.stringify({ studentId, date }) },
      true,
      () => localStore.toggleAttendance(studentId, date),
    );
  },

  async getStudentDates(studentId: string): Promise<{ date: string; isPresent: boolean }[]> {
    return apiFetch<{ date: string; isPresent: boolean }[]>(
      `/api/attendance/student/${studentId}`,
      {},
      true,
      () => localStore.getStudentAttendanceDates(studentId),
    );
  },
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = {
  async getAll(): Promise<FeePayment[]> {
    return apiFetch<(FeePayment & { _id?: string })[]>(
      '/api/payments',
      {},
      true,
      () => localStore.getPayments(),
    ).then((data) => data.map(normalizeId));
  },

  async getByStudent(studentId: string): Promise<FeePayment[]> {
    return apiFetch<(FeePayment & { _id?: string })[]>(
      `/api/payments/student/${studentId}`,
      {},
      true,
      () => localStore.getPaymentsByStudent(studentId),
    ).then((data) => data.map(normalizeId));
  },

  async add(payment: { studentId: string; amount: number; date: string; mode: string; receiptNote?: string }): Promise<FeePayment> {
    return apiFetch<FeePayment & { _id?: string }>(
      '/api/payments',
      { method: 'POST', body: JSON.stringify(payment) },
      true,
      () => localStore.addPayment(payment),
    ).then(normalizeId);
  },
};

// ─── Timetable ────────────────────────────────────────────────────────────────

export const timetable = {
  async getAll(section?: BatchSection): Promise<TimetableSlot[]> {
    const query = section ? `?section=${section}` : '';
    return apiFetch<(TimetableSlot & { _id?: string })[]>(
      `/api/timetable${query}`,
      {},
      true,
      () => localStore.getTimetable(section),
    ).then((data) => data.map(normalizeId));
  },

  async add(slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> {
    return apiFetch<TimetableSlot & { _id?: string }>(
      '/api/timetable',
      { method: 'POST', body: JSON.stringify(slot) },
      true,
      () => localStore.addTimetableSlot(slot),
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(
      `/api/timetable/${id}`,
      { method: 'DELETE' },
      true,
      () => localStore.deleteTimetableSlot(id),
    );
  },
};

// ─── Notices ──────────────────────────────────────────────────────────────────

export const notices = {
  async getAll(section?: BatchSection | 'all'): Promise<Notice[]> {
    const query = section ? `?section=${section}` : '';
    return apiFetch<(Notice & { _id?: string })[]>(
      `/api/notices${query}`,
      {},
      true,
      () => localStore.getNotices(section),
    ).then((data) => data.map(normalizeId));
  },

  async add(notice: { title: string; content: string; section?: string }): Promise<Notice> {
    return apiFetch<Notice & { _id?: string }>(
      '/api/notices',
      { method: 'POST', body: JSON.stringify(notice) },
      true,
      () => localStore.addNotice(notice),
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(
      `/api/notices/${id}`,
      { method: 'DELETE' },
      true,
      () => localStore.deleteNotice(id),
    );
  },
};

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const inquiries = {
  async getAll(): Promise<Inquiry[]> {
    return apiFetch<(Inquiry & { _id?: string })[]>(
      '/api/inquiries',
      {},
      true,
      () => localStore.getInquiries(),
    ).then((data) => data.map(normalizeId));
  },

  async submit(inquiry: Omit<Inquiry, 'id' | 'submittedAt' | 'status'>): Promise<Inquiry> {
    return apiFetch<Inquiry & { _id?: string }>(
      '/api/inquiries',
      { method: 'POST', body: JSON.stringify(inquiry) },
      false,
      () => localStore.submitInquiry(inquiry),
    ).then(normalizeId);
  },

  async updateStatus(id: string, status: Inquiry['status']): Promise<Inquiry> {
    return apiFetch<Inquiry & { _id?: string }>(
      `/api/inquiries/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      true,
      () => localStore.updateInquiryStatus(id, status),
    ).then(normalizeId);
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  async getStats(): Promise<{
    totalStudents: number; presentToday: number; absentToday: number;
    attendancePercent: number; totalCollected: number; totalExpected: number;
    totalPending: number; totalInquiries: number;
  }> {
    return apiFetch(
      '/api/dashboard/stats',
      {},
      true,
      () => localStore.getDashboardStats(),
    );
  },
};

// ─── Toppers ──────────────────────────────────────────────────────────────────

export const toppers = {
  async getAll(): Promise<Topper[]> {
    return apiFetch<(Topper & { _id?: string })[]>(
      '/api/toppers',
      {},
      false,
      () => localStore.getToppers(),
    ).then((data) => data.map(normalizeId));
  },

  async create(topper: Omit<Topper, 'id'>): Promise<Topper> {
    return apiFetch<Topper & { _id?: string }>(
      '/api/toppers',
      {
        method: 'POST',
        body: JSON.stringify(topper),
      },
      true,
      () => localStore.addTopper(topper),
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    return apiFetch<void>(
      `/api/toppers/${id}`,
      { method: 'DELETE' },
      true,
      () => localStore.deleteTopper(id),
    );
  },
};

// ─── Teachers / Faculty ────────────────────────────────────────────────────────

export const teachers = {
  async getAll(): Promise<Teacher[]> {
    return apiFetch<(Teacher & { _id?: string })[]>(
      '/api/teachers',
      {},
      true,
      () => [],
    ).then((data) => data.map(normalizeId));
  },

  async add(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    return apiFetch<Teacher & { _id?: string }>(
      '/api/teachers',
      { method: 'POST', body: JSON.stringify(teacher) },
      true,
    ).then(normalizeId);
  },

  async update(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    return apiFetch<Teacher & { _id?: string }>(
      `/api/teachers/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      true,
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(
      `/api/teachers/${id}`,
      { method: 'DELETE' },
      true,
    );
  },
};

// ─── Teacher Payments ──────────────────────────────────────────────────────────

export const teacherPayments = {
  async getAll(): Promise<TeacherPayment[]> {
    return apiFetch<(TeacherPayment & { _id?: string })[]>(
      '/api/teacher-payments',
      {},
      true,
      () => [],
    ).then((data) => data.map(normalizeId));
  },

  async add(payment: { teacherId: string; lecturesCount?: number; ratePerLecture?: number; amount: number; paymentDate: string; monthFor?: string; paymentMode: string; receiptNote?: string }): Promise<TeacherPayment> {
    return apiFetch<TeacherPayment & { _id?: string }>(
      '/api/teacher-payments',
      { method: 'POST', body: JSON.stringify(payment) },
      true,
    ).then(normalizeId);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(
      `/api/teacher-payments/${id}`,
      { method: 'DELETE' },
      true,
    );
  },
};

// ─── WhatsApp Helpers ─────────────────────────────────────────────────────────

export const whatsapp = {
  absenceLink(student: Student): string {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const msg = `Dear ${student.parentName},\n\nThis is to inform you that *${student.name}* (Roll No: ${student.rollNumber}) was marked *ABSENT* today (${dateStr}) at *New Perfect Tution Classes*.\n\nPlease ensure regular attendance.\n\nRegards,\nNew Perfect Tution Classes`;
    return `https://wa.me/91${student.parentPhone}?text=${encodeURIComponent(msg)}`;
  },

  feeReminderLink(student: Student, remaining: number): string {
    const msg = `Dear ${student.parentName},\n\nThis is a gentle reminder regarding the pending fee for *${student.name}* (Roll No: ${student.rollNumber}).\n\n💰 *Total Course Fee:* ₹${student.totalFee.toLocaleString()}\n✅ *Amount Paid:* ₹${(student.totalFee - remaining).toLocaleString()}\n⚠️ *Remaining Fee:* ₹${remaining.toLocaleString()}\n\nKindly clear the dues at the earliest.\n\nRegards,\nNew Perfect Tution Classes`;
    return `https://wa.me/91${student.parentPhone}?text=${encodeURIComponent(msg)}`;
  },
};
