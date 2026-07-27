'use client';

import { useState, useEffect } from 'react';
import { teachers as teachersApi, teacherPayments as teacherPaymentsApi } from '@/lib/api';
import { Teacher, TeacherPayment, PaymentMode } from '@/types';

const EMPTY_TEACHER_FORM = {
  name: '',
  phone: '',
  subject: '',
  section: 'All Sections',
  ratePerLecture: '500',
  monthlySalary: '',
};

const EMPTY_PAYMENT_FORM = {
  teacherId: '',
  lecturesCount: '',
  ratePerLecture: '500',
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  monthFor: '',
  paymentMode: 'upi' as PaymentMode,
  receiptNote: '',
};

export default function TeacherManager() {
  const [activeTab, setActiveTab] = useState<'directory' | 'payments'>('directory');
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [paymentList, setPaymentList] = useState<TeacherPayment[]>([]);

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState(EMPTY_TEACHER_FORM);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true);
    try {
      const [tData, pData] = await Promise.all([
        teachersApi.getAll(),
        teacherPaymentsApi.getAll(),
      ]);
      setTeacherList(tData);
      setPaymentList(pData);
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleTeacherSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const payload = {
      name: teacherForm.name,
      phone: teacherForm.phone,
      subject: teacherForm.subject,
      section: teacherForm.section || 'All Sections',
      ratePerLecture: parseFloat(teacherForm.ratePerLecture) || 500,
      monthlySalary: parseFloat(teacherForm.monthlySalary) || 0,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    try {
      if (editingTeacherId) {
        await teachersApi.update(editingTeacherId, payload);
      } else {
        await teachersApi.add(payload);
      }
      setTeacherForm(EMPTY_TEACHER_FORM);
      setEditingTeacherId(null);
      setShowTeacherForm(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save faculty record');
    } finally {
      setIsSaving(false);
    }
  }

  function handleTeacherSelect(tId: string) {
    const found = teacherList.find(t => t.id === tId);
    const rate = found ? (found.ratePerLecture || 500) : 500;
    const count = parseFloat(paymentForm.lecturesCount) || 0;
    const calcAmount = count > 0 ? count * rate : (found ? found.monthlySalary || '' : '');

    setPaymentForm({
      ...paymentForm,
      teacherId: tId,
      ratePerLecture: String(rate),
      amount: String(calcAmount),
    });
  }

  function handleLecturesCountChange(countStr: string) {
    const count = parseFloat(countStr) || 0;
    const rate = parseFloat(paymentForm.ratePerLecture) || 0;
    const calcAmount = count * rate;

    setPaymentForm({
      ...paymentForm,
      lecturesCount: countStr,
      amount: count > 0 ? String(calcAmount) : paymentForm.amount,
    });
  }

  function handleRateChange(rateStr: string) {
    const rate = parseFloat(rateStr) || 0;
    const count = parseFloat(paymentForm.lecturesCount) || 0;
    const calcAmount = count * rate;

    setPaymentForm({
      ...paymentForm,
      ratePerLecture: rateStr,
      amount: count > 0 ? String(calcAmount) : paymentForm.amount,
    });
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const lCount = parseFloat(paymentForm.lecturesCount) || 0;
    const lRate = parseFloat(paymentForm.ratePerLecture) || 0;
    const amt = parseFloat(paymentForm.amount) || (lCount * lRate);

    try {
      await teacherPaymentsApi.add({
        teacherId: paymentForm.teacherId,
        lecturesCount: lCount,
        ratePerLecture: lRate,
        amount: amt,
        paymentDate: paymentForm.paymentDate,
        monthFor: paymentForm.monthFor || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        paymentMode: paymentForm.paymentMode,
        receiptNote: paymentForm.receiptNote || (lCount > 0 ? `${lCount} Lectures @ ₹${lRate}/lec` : 'Lecture Payout'),
      });

      setPaymentForm(EMPTY_PAYMENT_FORM);
      setShowPaymentForm(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record teacher payout');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTeacher(id: string) {
    if (confirm('Are you sure you want to remove this faculty record?')) {
      await teachersApi.delete(id);
      await loadData();
    }
  }

  async function deletePayment(id: string) {
    if (confirm('Are you sure you want to delete this payout record?')) {
      await teacherPaymentsApi.delete(id);
      await loadData();
    }
  }

  function startEditTeacher(teacher: Teacher) {
    setTeacherForm({
      name: teacher.name,
      phone: teacher.phone,
      subject: teacher.subject,
      section: teacher.section,
      ratePerLecture: String(teacher.ratePerLecture || 500),
      monthlySalary: String(teacher.monthlySalary || ''),
    });
    setEditingTeacherId(teacher.id);
    setShowTeacherForm(true);
  }

  const totalPaidThisMonth = paymentList.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header & Sub-Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-bar">
          <button
            onClick={() => setActiveTab('directory')}
            className={`tab-item ${activeTab === 'directory' ? 'active' : ''}`}
          >
            Faculty Directory ({teacherList.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`tab-item ${activeTab === 'payments' ? 'active' : ''}`}
          >
            Faculty Payout History ({paymentList.length})
          </button>
        </div>

        <div>
          {activeTab === 'directory' ? (
            <button
              onClick={() => { setTeacherForm(EMPTY_TEACHER_FORM); setEditingTeacherId(null); setShowTeacherForm(!showTeacherForm); }}
              className="btn-primary"
            >
              {showTeacherForm ? 'Close Form' : 'Add Faculty Member'}
            </button>
          ) : (
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="btn-primary"
            >
              {showPaymentForm ? 'Close Form' : 'Record Lecture Payout'}
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div className="stat-card blue" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Faculty Staff</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>{teacherList.length}</div>
        </div>
        <div className="stat-card purple" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Payment System</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38bdf8' }}>Per Lecture</div>
        </div>
        <div className="stat-card amber" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Payouts Logged</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>₹{totalPaidThisMonth.toLocaleString()}</div>
        </div>
      </div>

      {/* Faculty Add / Edit Form */}
      {showTeacherForm && activeTab === 'directory' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>
            {editingTeacherId ? 'Edit Faculty Details' : 'Add New Faculty Member'}
          </h3>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#450a0a20', border: '1px solid #991b1b40', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleTeacherSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Faculty Name *</label>
                <input className="input-field" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} placeholder="e.g. Firoz Sir" required />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Mobile Number *</label>
                <input className="input-field" type="tel" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} placeholder="10-digit phone" required />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Subject Taught *</label>
                <input className="input-field" value={teacherForm.subject} onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })} placeholder="e.g. Mathematics & Physics" required />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Section / Class Handled</label>
                <input className="input-field" value={teacherForm.section} onChange={(e) => setTeacherForm({ ...teacherForm, section: e.target.value })} placeholder="e.g. 10th SSC & 9th" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>Rate Per Lecture (₹/lecture) *</label>
                <input className="input-field" type="number" value={teacherForm.ratePerLecture} onChange={(e) => setTeacherForm({ ...teacherForm, ratePerLecture: e.target.value })} placeholder="e.g. 500" required min="1" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingTeacherId ? 'Save Changes' : 'Register Faculty'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => { setShowTeacherForm(false); setEditingTeacherId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Payout Form */}
      {showPaymentForm && activeTab === 'payments' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>
            Record Teacher Per-Lecture Payout
          </h3>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#450a0a20', border: '1px solid #991b1b40', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Select Faculty Member *</label>
                <select
                  className="input-field"
                  value={paymentForm.teacherId}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teacherList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject} - ₹{t.ratePerLecture || 500}/lec)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Lectures Taken *</label>
                <input className="input-field" type="number" value={paymentForm.lecturesCount} onChange={(e) => handleLecturesCountChange(e.target.value)} placeholder="e.g. 20 lectures" required min="1" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Rate Per Lecture (₹/lec) *</label>
                <input className="input-field" type="number" value={paymentForm.ratePerLecture} onChange={(e) => handleRateChange(e.target.value)} placeholder="e.g. 500" required min="1" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>Total Calculated Amount (₹) *</label>
                <input className="input-field" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Auto-calculated" required min="1" style={{ fontWeight: 700, color: '#38bdf8' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Payment Date *</label>
                <input className="input-field" type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Salary Period / Month</label>
                <input className="input-field" value={paymentForm.monthFor} onChange={(e) => setPaymentForm({ ...paymentForm, monthFor: e.target.value })} placeholder="e.g. July 2026" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Payment Mode</label>
                <select className="input-field" value={paymentForm.paymentMode} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as PaymentMode })}>
                  <option value="upi">UPI / Online</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Notes / Remarks</label>
                <input className="input-field" value={paymentForm.receiptNote} onChange={(e) => setPaymentForm({ ...paymentForm, receiptNote: e.target.value })} placeholder="e.g. 20 Lectures for July" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Payout Record'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      {activeTab === 'directory' && (
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading faculty directory...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Subject Taught</th>
                    <th>Class Handled</th>
                    <th>Per Lecture Rate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherList.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No faculty members registered yet.
                      </td>
                    </tr>
                  )}
                  {teacherList.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{teacher.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {teacher.phone}</div>
                      </td>
                      <td>
                        <span className="badge badge-purple">{teacher.subject}</span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{teacher.section}</td>
                      <td style={{ fontWeight: 700, color: '#38bdf8' }}>₹{(teacher.ratePerLecture || 500).toLocaleString()} / lecture</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={() => startEditTeacher(teacher)} className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                            Edit
                          </button>
                          <button onClick={() => deleteTeacher(teacher.id)} className="btn-danger" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Payout History Table */}
      {activeTab === 'payments' && (
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading payout records...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Lectures & Rate</th>
                    <th>Total Payout</th>
                    <th>Payout Date</th>
                    <th>Period</th>
                    <th>Payment Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No teacher payouts recorded yet.
                      </td>
                    </tr>
                  )}
                  {paymentList.map((p) => {
                    const teacherObj = typeof p.teacherId === 'object' ? p.teacherId : null;
                    const teacherName = teacherObj ? teacherObj.name : 'Faculty Member';
                    const hasLectures = (p.lecturesCount || 0) > 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{teacherName}</div>
                          {p.receiptNote && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.receiptNote}</div>}
                        </td>
                        <td>
                          {hasLectures ? (
                            <div style={{ fontSize: '0.8125rem', color: '#f8fafc' }}>
                              <strong>{p.lecturesCount}</strong> lectures @ ₹{p.ratePerLecture}/lec
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct Payout</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: '#38bdf8' }}>₹{p.amount.toLocaleString()}</td>
                        <td style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{p.paymentDate}</td>
                        <td>
                          <span className="badge badge-blue">{p.monthFor || 'Monthly Payout'}</span>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{p.paymentMode}</span>
                        </td>
                        <td>
                          <button onClick={() => deletePayment(p.id)} className="btn-danger" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
