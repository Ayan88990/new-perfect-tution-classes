'use client';

import { useState, useEffect } from 'react';
import { students as studentsApi, payments as paymentsApi, whatsapp } from '@/lib/api';
import { StudentWithStats, FeePayment, PaymentMode, BatchSection } from '@/types';

const SECTIONS: { key: BatchSection | 'all'; label: string }[] = [
  { key: 'all', label: 'All Students' },
  { key: '9th', label: 'Class 9' },
  { key: '10th', label: '10th SSC Board' },
  { key: 'others', label: 'Primary Section' },
];

const PAYMENT_MODES: { key: PaymentMode; label: string }[] = [
  { key: 'cash', label: 'Cash Payment' },
  { key: 'upi', label: 'UPI / Online' },
  { key: 'cheque', label: 'Cheque' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
];

export default function FeeManager() {
  const [section, setSection] = useState<BatchSection | 'all'>('all');
  const [studentList, setStudentList] = useState<StudentWithStats[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [paymentList, setPaymentList] = useState<FeePayment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({ amount: '', mode: 'cash' as PaymentMode, receiptNote: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadStudents() {
    setIsLoading(true);
    try {
      const all = await studentsApi.getAllStats();
      const filtered = section === 'all' ? all : all.filter((s) => s.section === section);
      setStudentList(filtered);
      if (selectedStudent) {
        const updated = filtered.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, [section]);

  async function selectStudent(student: StudentWithStats) {
    setSelectedStudent(student);
    const pmts = await paymentsApi.getByStudent(student.id);
    setPaymentList(pmts);
    setShowPaymentForm(false);
  }

  async function refreshPayments(studentId: string) {
    const [all, pmts] = await Promise.all([
      studentsApi.getAllStats(),
      paymentsApi.getByStudent(studentId),
    ]);
    const updated = all.find((s) => s.id === studentId);
    if (updated) setSelectedStudent(updated);
    setPaymentList(pmts);
    const filtered = section === 'all' ? all : all.filter((s) => s.section === section);
    setStudentList(filtered);
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return;
    setIsSaving(true);
    try {
      await paymentsApi.add({
        studentId: selectedStudent.id,
        amount,
        date: new Date().toISOString().split('T')[0],
        mode: formData.mode,
        receiptNote: formData.receiptNote,
      });
      setFormData({ amount: '', mode: 'cash', receiptNote: '' });
      setShowPaymentForm(false);
      await refreshPayments(selectedStudent.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fee-manager-grid">
      
      {/* Left Roster Panel */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div className="tab-bar">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`tab-item ${section === s.key ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.375rem 0.625rem' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>Loading roster...</div>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '450px' }}>
            {studentList.map((student) => (
              <button
                key={student.id}
                onClick={() => selectStudent(student)}
                id={`fee-student-${student.id}`}
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${selectedStudent?.id === student.id ? '#0284c7' : '#334155'}`,
                  backgroundColor: selectedStudent?.id === student.id ? '#1e293b' : '#111827',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Roll No: {student.rollNumber}</div>
                  </div>
                  <span className={`badge ${student.remainingFee === 0 ? 'badge-green' : 'badge-red'}`}>
                    {student.remainingFee === 0 ? 'Paid' : `₹${student.remainingFee.toLocaleString()}`}
                  </span>
                </div>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (student.totalPaid / student.totalFee) * 100)}%`,
                      backgroundColor: student.remainingFee === 0 ? '#059669' : '#0284c7',
                      borderRadius: '2px',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Paid ₹{student.totalPaid.toLocaleString()} of ₹{student.totalFee.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Detail Panel */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {!selectedStudent ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '250px', color: '#64748b' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>Select a Student</div>
            <div style={{ fontSize: '0.875rem' }}>Choose a student from the left roster to manage fee records</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <button
              onClick={() => setSelectedStudent(null)}
              className="btn-ghost"
              style={{ alignSelf: 'flex-start', fontSize: '0.8125rem', padding: '0.25rem 0.625rem' }}
              id="back-to-fee-list"
            >
              Back to List
            </button>

            {/* Student Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{selectedStudent.name}</h2>
                <div style={{ color: '#94a3b8', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Roll No: {selectedStudent.rollNumber} · Parent: {selectedStudent.parentName} ({selectedStudent.parentPhone})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <a
                  href={whatsapp.feeReminderLink(selectedStudent, selectedStudent.remainingFee)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  id={`fee-reminder-${selectedStudent.id}`}
                >
                  Send Fee Reminder
                </a>
                <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="btn-primary" id="add-payment-btn">
                  Record Payment
                </button>
              </div>
            </div>

            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem' }}>
              <div className="stat-card blue" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Annual Fee</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>₹{selectedStudent.totalFee.toLocaleString()}</div>
              </div>
              <div className="stat-card green" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Paid</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>₹{selectedStudent.totalPaid.toLocaleString()}</div>
              </div>
              <div className={`stat-card ${selectedStudent.remainingFee === 0 ? 'green' : 'red'}`} style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Outstanding Due</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedStudent.remainingFee === 0 ? '#34d399' : '#fca5a5' }}>
                  {selectedStudent.remainingFee === 0 ? 'Cleared' : `₹${selectedStudent.remainingFee.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Add Payment Form */}
            {showPaymentForm && (
              <form
                onSubmit={handleAddPayment}
                style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>Record Payment Entry</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Amount (₹) *</label>
                    <input type="number" className="input-field" placeholder="Enter amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="1" id="payment-amount-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Payment Method</label>
                    <select className="input-field" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value as PaymentMode })} id="payment-mode-select">
                      {PAYMENT_MODES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Receipt Note / Remarks</label>
                  <input type="text" className="input-field" placeholder="e.g. 1st Installment, Cash Receipt..." value={formData.receiptNote} onChange={(e) => setFormData({ ...formData, receiptNote: e.target.value })} id="payment-note-input" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-primary" disabled={isSaving} id="save-payment-btn">
                    {isSaving ? 'Saving...' : 'Save Payment'}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setShowPaymentForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Payment Receipts History */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Logged Payment History
              </div>
              {paymentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                  No payment receipts recorded for this student yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {paymentList.map((payment) => (
                    <div
                      key={payment.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>+₹{payment.amount.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {payment.receiptNote || PAYMENT_MODES.find((m) => m.key === payment.mode)?.label}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8125rem', color: '#f8fafc' }}>
                          {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Receipt: {payment.receiptNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
