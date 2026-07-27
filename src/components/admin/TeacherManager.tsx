'use client';

import { useState, useEffect } from 'react';
import { teachers as teachersApi, teacherPayments as teacherPaymentsApi } from '@/lib/api';
import { Teacher, TeacherPayment, PaymentMode } from '@/types';

const EMPTY_TEACHER_FORM = {
  name: '',
  phone: '',
  subject: '',
  section: 'All Sections',
  monthlySalary: '',
};

const EMPTY_PAYMENT_FORM = {
  teacherId: '',
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

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await teacherPaymentsApi.add({
        teacherId: paymentForm.teacherId,
        amount: parseFloat(paymentForm.amount) || 0,
        paymentDate: paymentForm.paymentDate,
        monthFor: paymentForm.monthFor || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        paymentMode: paymentForm.paymentMode,
        receiptNote: paymentForm.receiptNote,
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
      monthlySalary: String(teacher.monthlySalary),
    });
    setEditingTeacherId(teacher.id);
    setShowTeacherForm(true);
  }

  const totalMonthlyPayroll = teacherList.reduce((sum, t) => sum + (t.monthlySalary || 0), 0);
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
              {showPaymentForm ? 'Close Form' : 'Record Salary Payout'}
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
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Monthly Payroll</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>₹{totalMonthlyPayroll.toLocaleString()}</div>
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
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Monthly Base Salary (₹)</label>
                <input className="input-field" type="number" value={teacherForm.monthlySalary} onChange={(e) => setTeacherForm({ ...teacherForm, monthlySalary: e.target.value })} placeholder="e.g. 30000" min="0" />
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
            Record Faculty Salary Payout
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
                  onChange={(e) => {
                    const tId = e.target.value;
                    const found = teacherList.find(t => t.id === tId);
                    setPaymentForm({
                      ...paymentForm,
                      teacherId: tId,
                      amount: found ? String(found.monthlySalary || '') : paymentForm.amount,
                    });
                  }}
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teacherList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Payout Amount (₹) *</label>
                <input className="input-field" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="e.g. 25000" required min="1" />
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
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Notes / Reference</label>
                <input className="input-field" value={paymentForm.receiptNote} onChange={(e) => setPaymentForm({ ...paymentForm, receiptNote: e.target.value })} placeholder="e.g. Full Monthly Salary" />
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
                    <th>Base Salary</th>
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
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>₹{(teacher.monthlySalary || 0).toLocaleString()} / mo</td>
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
                    <th>Amount Paid</th>
                    <th>Payout Date</th>
                    <th>Period</th>
                    <th>Payment Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentList.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No teacher payouts recorded yet.
                      </td>
                    </tr>
                  )}
                  {paymentList.map((p) => {
                    const teacherObj = typeof p.teacherId === 'object' ? p.teacherId : null;
                    const teacherName = teacherObj ? teacherObj.name : 'Faculty Member';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{teacherName}</div>
                          {p.receiptNote && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.receiptNote}</div>}
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
