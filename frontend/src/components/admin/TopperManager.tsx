'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Topper, BatchSection } from '@/types';
import { toppers as toppersApi } from '@/lib/api';

export default function TopperManager() {
  const [topperList, setTopperList] = useState<Topper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    section: BatchSection;
    percentage: string;
    year: string;
    subjectScore: string;
  }>({
    name: '',
    section: '10th',
    percentage: '',
    year: '2025',
    subjectScore: '',
  });

  const loadToppers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await toppersApi.getAll();
      setTopperList(data);
    } catch (err) {
      console.error('Failed to load toppers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToppers();
  }, [loadToppers]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.percentage) return;
    try {
      await toppersApi.create(form);
      setForm({
        name: '',
        section: '10th',
        percentage: '',
        year: '2025',
        subjectScore: '',
      });
      setShowAddModal(false);
      loadToppers();
    } catch (err) {
      alert('Failed to add topper record');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this topper record?')) return;
    try {
      await toppersApi.delete(id);
      loadToppers();
    } catch (err) {
      alert('Failed to delete topper record');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Board Toppers Manager</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Manage student rankers displayed on the homepage showcase.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" id="add-topper-btn">
          Add New Topper
        </button>
      </div>

      {/* Topper Grid */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading toppers records...</div>
      ) : topperList.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>No Topper Records Published</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
            Add student board scores to highlight achievements on the website homepage.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add First Topper
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {topperList.map((t) => (
            <div key={t.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-blue">{t.section === 'others' ? 'Primary' : `Class ${t.section}`}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', backgroundColor: '#111827', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {t.year} Batch
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{t.percentage}</span>
                {t.subjectScore && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({t.subjectScore})</span>}
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                className="btn-danger"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}
              >
                Delete Record
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>Add Board Topper</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Student Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student Full Name" required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Section / Standard *</label>
                  <select className="input-field" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value as BatchSection })}>
                    <option value="10th">10th SSC Board</option>
                    <option value="9th">Class 9</option>
                    <option value="others">Primary Section</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Percentage / Score *</label>
                  <input className="input-field" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} placeholder="e.g. 96.4%" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Batch Year</label>
                  <input className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2025" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Subject Score (optional)</label>
                  <input className="input-field" value={form.subjectScore} onChange={(e) => setForm({ ...form, subjectScore: e.target.value })} placeholder="e.g. Maths & Science" />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                Save Topper Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
