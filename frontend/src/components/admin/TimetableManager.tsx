'use client';

import { useState, useEffect } from 'react';
import { timetable as timetableApi } from '@/lib/api';
import { TimetableSlot, BatchSection } from '@/types';

const SECTIONS: { key: BatchSection; label: string }[] = [
  { key: '9th', label: 'Class 9' },
  { key: '10th', label: '10th SSC Board' },
  { key: 'others', label: 'Primary Section' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const EMPTY_FORM = {
  day: 'Monday' as TimetableSlot['day'],
  subject: '',
  startTime: '09:00',
  endTime: '10:00',
  teacher: '',
};

export default function TimetableManager() {
  const [section, setSection] = useState<BatchSection>('9th');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadSlots() {
    setIsLoading(true);
    try {
      const data = await timetableApi.getAll(section);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadSlots(); }, [section]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await timetableApi.add({ ...form, section });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadSlots();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSlot(id: string) {
    await timetableApi.delete(id);
    await loadSlots();
  }

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day);
    return acc;
  }, {} as Record<string, TimetableSlot[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-bar">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`tab-item ${section === s.key ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary" id="add-slot-btn">
          {showForm ? 'Close Form' : 'Add Time Slot'}
        </button>
      </div>

      {/* Add Slot Form */}
      {showForm && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>Add Schedule Slot</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }} id="timetable-form">
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Day of Week *</label>
              <select className="input-field" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as TimetableSlot['day'] })} id="slot-day-select">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Subject Name *</label>
              <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" required id="slot-subject-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Start Time *</label>
              <input className="input-field" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required id="slot-start-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>End Time *</label>
              <input className="input-field" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required id="slot-end-input" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Teacher Name</label>
              <input className="input-field" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="e.g. Firoz Sir" id="slot-teacher-input" />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={isSaving} id="save-slot-btn">
                {isSaving ? 'Saving...' : 'Save Slot'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Slots List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading timetable...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {DAYS.map((day) => {
            const daySlots = byDay[day];
            if (daySlots.length === 0) return null;
            return (
              <div key={day} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#38bdf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {day}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {daySlots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.75rem 1rem', backgroundColor: '#111827',
                          border: '1px solid #1e293b', borderLeft: '3px solid #0284c7',
                          borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', minWidth: '95px' }}>
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>{slot.subject}</div>
                            {slot.teacher && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Teacher: {slot.teacher}</div>}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          id={`delete-slot-${slot.id}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}

          {slots.length === 0 && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No timetable slots added yet for this section.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
