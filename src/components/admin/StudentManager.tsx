'use client';

import { useState, useEffect } from 'react';
import { students as studentsApi } from '@/lib/api';
import { Student, BatchSection } from '@/types';

const SECTIONS: { key: BatchSection; label: string; defaultFee: number }[] = [
  { key: '9th', label: 'Class 9', defaultFee: 12000 },
  { key: '10th', label: '10th SSC Board', defaultFee: 15000 },
  { key: 'others', label: 'Primary Section', defaultFee: 8000 },
];

const EMPTY_FORM = {
  name: '', parentName: '', parentPhone: '', section: '9th' as BatchSection,
  baseFee: '12000', discount: '0', discountReason: '', totalFee: '12000',
  rollNumber: '', address: '',
};

export default function StudentManager() {
  const [sectionFilter, setSectionFilter] = useState<BatchSection | 'all'>('all');
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadStudents() {
    setIsLoading(true);
    try {
      const all = await studentsApi.getAll();
      setStudentList(all);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  // Recalculate totalFee whenever baseFee or discount changes
  function updateFeeFields(base: number, disc: number) {
    const net = Math.max(0, base - disc);
    return String(net);
  }

  function handleSectionChange(newSec: BatchSection) {
    const secObj = SECTIONS.find(s => s.key === newSec);
    const newBase = secObj ? secObj.defaultFee : 12000;
    const currentDisc = parseFloat(form.discount) || 0;
    const net = Math.max(0, newBase - currentDisc);

    setForm({
      ...form,
      section: newSec,
      baseFee: String(newBase),
      totalFee: String(net),
    });
  }

  function handleBaseFeeChange(val: string) {
    const base = parseFloat(val) || 0;
    const disc = parseFloat(form.discount) || 0;
    setForm({
      ...form,
      baseFee: val,
      totalFee: updateFeeFields(base, disc),
    });
  }

  function handleDiscountChange(val: string) {
    const base = parseFloat(form.baseFee) || 0;
    const disc = parseFloat(val) || 0;
    setForm({
      ...form,
      discount: val,
      totalFee: updateFeeFields(base, disc),
    });
  }

  const filtered = studentList.filter((s) => {
    const matchSection = sectionFilter === 'all' || s.section === sectionFilter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.parentPhone.includes(search);
    return matchSection && matchSearch;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    const baseVal = parseFloat(form.baseFee) || 0;
    const discVal = parseFloat(form.discount) || 0;
    const totalVal = Math.max(0, baseVal - discVal);

    const data = {
      name: form.name,
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      section: form.section,
      baseFee: baseVal,
      discount: discVal,
      discountReason: form.discountReason,
      totalFee: totalVal,
      rollNumber: form.rollNumber,
      address: form.address,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    try {
      if (editingId) {
        await studentsApi.update(editingId, data);
      } else {
        await studentsApi.add(data);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      await loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save student record');
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(student: Student) {
    const bFee = student.baseFee || student.totalFee;
    const disc = student.discount || 0;
    setForm({
      name: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      section: student.section,
      baseFee: String(bFee),
      discount: String(disc),
      discountReason: student.discountReason || '',
      totalFee: String(student.totalFee),
      rollNumber: student.rollNumber,
      address: student.address,
    });
    setEditingId(student.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteStudent(id: string) {
    if (confirm('Are you sure you want to remove this student record?')) {
      await studentsApi.delete(id);
      await loadStudents();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Controls Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-bar">
          {[{ key: 'all', label: 'All Classes' }, ...SECTIONS].map((s) => (
            <button
              key={s.key}
              onClick={() => setSectionFilter(s.key as BatchSection | 'all')}
              className={`tab-item ${sectionFilter === s.key ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
          <input
            className="input-field"
            placeholder="Search student name, roll number, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
            id="student-search-input"
          />
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(!showForm); }}
            className="btn-primary"
            id="add-student-btn"
          >
            {showForm ? 'Close Form' : 'Register Student'}
          </button>
        </div>
      </div>

      {/* Form Drawer / Panel */}
      {showForm && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>
            {editingId ? 'Edit Student Record' : 'Register New Student'}
          </h3>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#450a0a20', border: '1px solid #991b1b40', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="student-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Student Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required id="student-name-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Roll Number *</label>
                <input className="input-field" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="Roll No. (e.g. 901)" required id="student-roll-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Parent Name *</label>
                <input className="input-field" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Parent Name" required id="student-parent-name-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Parent Phone *</label>
                <input className="input-field" type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="10-digit mobile" required id="student-phone-input" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Section / Standard *</label>
                <select className="input-field" value={form.section} onChange={(e) => handleSectionChange(e.target.value as BatchSection)} id="student-section-select">
                  {SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label} (Base: ₹{s.defaultFee.toLocaleString()})</option>)}
                </select>
              </div>

              {/* Fee Auto-Load & Discount Fields */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Base Standard Fee (₹) *</label>
                <input className="input-field" type="number" value={form.baseFee} onChange={(e) => handleBaseFeeChange(e.target.value)} placeholder="Auto-loaded" required min="0" id="student-base-fee-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Discount Concession (₹)</label>
                <input className="input-field" type="number" value={form.discount} onChange={(e) => handleDiscountChange(e.target.value)} placeholder="e.g. 1000" min="0" id="student-discount-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Discount Reason / Remark</label>
                <input className="input-field" value={form.discountReason} onChange={(e) => setForm({ ...form, discountReason: e.target.value })} placeholder="e.g. Sibling Concession / Merit" id="student-discount-reason-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.375rem', fontWeight: 700 }}>Net Payable Annual Fee (₹)</label>
                <input className="input-field" type="number" value={form.totalFee} readOnly style={{ backgroundColor: '#0f172a', borderColor: '#0284c7', color: '#38bdf8', fontWeight: 700 }} id="student-net-fee-input" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Address / Area</label>
                <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full Address in Juhapura" id="student-address-input" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
              <button type="submit" className="btn-primary" disabled={isSaving} id="save-student-btn">
                {isSaving ? 'Saving Record...' : editingId ? 'Save Changes' : 'Register Student'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Count Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Active', count: studentList.length, color: 'blue' },
          { label: 'Class 9', count: studentList.filter(s => s.section === '9th').length, color: 'blue' },
          { label: '10th Board', count: studentList.filter(s => s.section === '10th').length, color: 'purple' },
          { label: 'Primary', count: studentList.filter(s => s.section === 'others').length, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`} style={{ padding: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stat.label}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading student roster...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Section</th>
                  <th>Parent / Phone</th>
                  <th>Fee Structure</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No students found matching search.
                    </td>
                  </tr>
                )}
                {filtered.map((student) => {
                  const hasDiscount = (student.discount || 0) > 0;
                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Roll: {student.rollNumber}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {student.section === 'others' ? 'Primary' : `Class ${student.section}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', color: '#f8fafc' }}>{student.parentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.parentPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#38bdf8' }}>₹{student.totalFee.toLocaleString()}</div>
                        {hasDiscount && (
                          <div style={{ fontSize: '0.7188rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                            <span>🏷️ Discount: -₹{(student.discount || 0).toLocaleString()}</span>
                            {student.discountReason && <span style={{ color: '#94a3b8' }}>({student.discountReason})</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={() => startEdit(student)} className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} id={`edit-student-${student.id}`}>
                            Edit
                          </button>
                          <button onClick={() => deleteStudent(student.id)} className="btn-danger" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} id={`delete-student-${student.id}`}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
