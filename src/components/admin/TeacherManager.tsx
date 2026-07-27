'use client';

import { useState, useEffect } from 'react';
import { teachers as teachersApi, teacherPayments as teacherPaymentsApi } from '@/lib/api';
import { Teacher, TeacherPayment, TeacherLectureSlot, PaymentMode } from '@/types';

const EMPTY_TEACHER_FORM = {
  name: '',
  phone: '',
  subject: '',
  section: 'All Sections',
  rate1h: '300',
  rate1_5h: '400',
  rate2h: '500',
};

export default function TeacherManager() {
  const [activeTab, setActiveTab] = useState<'directory' | 'payments'>('directory');
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [paymentList, setPaymentList] = useState<TeacherPayment[]>([]);

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState(EMPTY_TEACHER_FORM);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Settlement Modal State
  const [settlingTeacher, setSettlingTeacher] = useState<Teacher | null>(null);
  const [settleMode, setSettleMode] = useState<PaymentMode>('upi');
  const [settleNote, setSettleNote] = useState('');

  // History Modal State
  const [historyTeacher, setHistoryTeacher] = useState<Teacher | null>(null);

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
      rate1h: parseFloat(teacherForm.rate1h) || 300,
      rate1_5h: parseFloat(teacherForm.rate1_5h) || 400,
      rate2h: parseFloat(teacherForm.rate2h) || 500,
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

  async function handleClearBalanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settlingTeacher) return;
    setIsSaving(true);
    setError('');

    try {
      await teachersApi.clearBalance(
        settlingTeacher.id,
        settleMode,
        settleNote || `Settled Timetable Earnings for ${settlingTeacher.name}`
      );
      setSettlingTeacher(null);
      setSettleNote('');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clear balance');
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
      rate1h: String(teacher.rate1h || 300),
      rate1_5h: String(teacher.rate1_5h || 400),
      rate2h: String(teacher.rate2h || 500),
    });
    setEditingTeacherId(teacher.id);
    setShowTeacherForm(true);
  }

  const grandTotalEarned = teacherList.reduce((sum, t) => sum + (t.totalEarned || 0), 0);
  const grandTotalPending = teacherList.reduce((sum, t) => sum + (t.pendingBalance || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header & Sub-Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-bar">
          <button
            onClick={() => setActiveTab('directory')}
            className={`tab-item ${activeTab === 'directory' ? 'active' : ''}`}
          >
            Faculty Directory & Live Earnings ({teacherList.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`tab-item ${activeTab === 'payments' ? 'active' : ''}`}
          >
            Settlement History ({paymentList.length})
          </button>
        </div>

        <div>
          {activeTab === 'directory' && (
            <button
              onClick={() => { setTeacherForm(EMPTY_TEACHER_FORM); setEditingTeacherId(null); setShowTeacherForm(!showTeacherForm); }}
              className="btn-primary"
            >
              {showTeacherForm ? 'Close Form' : 'Add Faculty Member'}
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div className="stat-card blue" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Faculty Staff</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>{teacherList.length}</div>
        </div>
        <div className="stat-card purple" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Earned (Timetable)</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38bdf8' }}>₹{grandTotalEarned.toLocaleString()}</div>
        </div>
        <div className="stat-card amber" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending Unpaid Balance</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f59e0b' }}>₹{grandTotalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Add / Edit Faculty Form */}
      {showTeacherForm && activeTab === 'directory' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>
            {editingTeacherId ? 'Edit Faculty & Duration Rates' : 'Add New Faculty Member & Rates'}
          </h3>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#450a0a20', border: '1px solid #991b1b40', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleTeacherSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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

              {/* Duration Rate Tiers */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>1 Hour Rate (₹) *</label>
                <input className="input-field" type="number" value={teacherForm.rate1h} onChange={(e) => setTeacherForm({ ...teacherForm, rate1h: e.target.value })} placeholder="300" required min="1" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>1.5 Hours Rate (₹) *</label>
                <input className="input-field" type="number" value={teacherForm.rate1_5h} onChange={(e) => setTeacherForm({ ...teacherForm, rate1_5h: e.target.value })} placeholder="400" required min="1" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>2 Hours Rate (₹) *</label>
                <input className="input-field" type="number" value={teacherForm.rate2h} onChange={(e) => setTeacherForm({ ...teacherForm, rate2h: e.target.value })} placeholder="500" required min="1" />
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

      {/* Settlement Modal / Drawer */}
      {settlingTeacher && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
              Clear & Settle Balance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Clearing balance for <strong style={{ color: '#f8fafc' }}>{settlingTeacher.name}</strong>. After settlement, pending balance resets to <strong>₹0</strong>.
            </p>

            <div style={{ padding: '1rem', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8' }}>
                <span>Scheduled Timetable Slots:</span>
                <strong style={{ color: '#f8fafc' }}>{settlingTeacher.totalLecturesCount || 0} Lectures</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8' }}>
                <span>Total Accumulated Earnings:</span>
                <strong style={{ color: '#38bdf8' }}>₹{(settlingTeacher.totalEarned || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#f59e0b', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
                <span>Amount to Clear Now:</span>
                <span>₹{(settlingTeacher.pendingBalance || 0).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleClearBalanceSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Payment Mode</label>
                  <select className="input-field" value={settleMode} onChange={(e) => setSettleMode(e.target.value as PaymentMode)}>
                    <option value="upi">UPI / Online Transfer</option>
                    <option value="cash">Cash Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Remarks / Receipt Note</label>
                  <input className="input-field" value={settleNote} onChange={(e) => setSettleNote(e.target.value)} placeholder="e.g. Full Timetable Payout till today" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setSettlingTeacher(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Clearing...' : 'Confirm & Reset to ₹0'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timetable & Earnings History Breakdown Modal */}
      {historyTeacher && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#f8fafc' }}>
                  {historyTeacher.name} — Lecture Earnings Breakdown
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  1h: ₹{historyTeacher.rate1h || 300} | 1.5h: ₹{historyTeacher.rate1_5h || 400} | 2h: ₹{historyTeacher.rate2h || 500}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setHistoryTeacher(null)}>Close</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!historyTeacher.lectureHistory || historyTeacher.lectureHistory.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No timetable slots assigned to this teacher yet.
                </div>
              ) : (
                historyTeacher.lectureHistory.map((slot: TeacherLectureSlot) => (
                  <div key={slot.id} style={{ padding: '0.875rem 1rem', backgroundColor: '#111827', border: '1px solid #1e293b', borderLeft: '3px solid #38bdf8', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>{slot.day}</span>
                        <span className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>Class {slot.section}</span>
                        <strong style={{ fontSize: '0.875rem', color: '#f8fafc' }}>{slot.subject}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        ⏰ {slot.startTime} – {slot.endTime} ({slot.durationLabel})
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#38bdf8' }}>
                      +₹{slot.amount}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Total Slots: <strong style={{ color: '#f8fafc' }}>{historyTeacher.totalLecturesCount || 0}</strong>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#38bdf8' }}>
                Accumulated: ₹{(historyTeacher.totalEarned || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directory Cards View */}
      {activeTab === 'directory' && (
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading faculty directory & calculating timetable earnings...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {teacherList.map((teacher) => {
              const pending = teacher.pendingBalance || 0;
              return (
                <div key={teacher.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  
                  {/* Teacher Info Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#f8fafc' }}>{teacher.name}</h4>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📞 {teacher.phone} | {teacher.section}</div>
                      </div>
                      <span className="badge badge-purple">{teacher.subject}</span>
                    </div>

                    {/* Rate Badges */}
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                      <span style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', color: '#94a3b8' }}>
                        1h: <strong style={{ color: '#38bdf8' }}>₹{teacher.rate1h || 300}</strong>
                      </span>
                      <span style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', color: '#94a3b8' }}>
                        1.5h: <strong style={{ color: '#38bdf8' }}>₹{teacher.rate1_5h || 400}</strong>
                      </span>
                      <span style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', color: '#94a3b8' }}>
                        2h: <strong style={{ color: '#38bdf8' }}>₹{teacher.rate2h || 500}</strong>
                      </span>
                    </div>

                    {/* Live Timetable Earnings Box */}
                    <div style={{ padding: '0.875rem', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span>Weekly Timetable Slots:</span>
                        <span style={{ color: '#f8fafc', fontWeight: 600 }}>{teacher.totalLecturesCount || 0} slots</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span>Total Earned:</span>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>₹{(teacher.totalEarned || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: 800, paddingTop: '0.375rem', borderTop: '1px solid #1e293b', color: pending > 0 ? '#f59e0b' : '#34d399' }}>
                        <span>Unpaid Balance:</span>
                        <span>₹{pending.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => startEditTeacher(teacher)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Edit Rates
                      </button>
                      <button onClick={() => setHistoryTeacher(teacher)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        View History
                      </button>
                      <button onClick={() => deleteTeacher(teacher.id)} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    </div>

                    <button
                      onClick={() => setSettlingTeacher(teacher)}
                      disabled={pending <= 0}
                      className="btn-primary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', opacity: pending <= 0 ? 0.5 : 1 }}
                    >
                      Clear & Pay (₹{pending})
                    </button>
                  </div>

                </div>
              );
            })}
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
                    <th>Cleared Amount</th>
                    <th>Date Cleared</th>
                    <th>Period</th>
                    <th>Payment Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentList.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No teacher balance settlements recorded yet.
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
                          <span className="badge badge-blue">{p.monthFor || 'Settlement'}</span>
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
