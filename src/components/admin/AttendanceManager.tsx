'use client';

import { useState, useEffect } from 'react';
import { students as studentsApi, attendance as attendanceApi, whatsapp } from '@/lib/api';
import { Student, BatchSection } from '@/types';

interface Props {
  activeSection: BatchSection;
}

const SECTIONS: { key: BatchSection; label: string }[] = [
  { key: '9th', label: 'Class 9' },
  { key: '10th', label: '10th SSC Board' },
  { key: 'others', label: 'Primary Section' },
];

const today = new Date().toISOString().split('T')[0];

export default function AttendanceManager({ activeSection }: Props) {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState(today);
  const [section, setSection] = useState<BatchSection>(activeSection);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSection(activeSection);
  }, [activeSection]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      studentsApi.getAll(section),
      attendanceApi.getAbsentIds(selectedDate),
    ])
      .then(([s, absentIdArr]) => {
        setStudentList(s);
        setAbsentIds(new Set(absentIdArr));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [section, selectedDate]);

  async function toggleAttendance(studentId: string) {
    await attendanceApi.toggleAttendance(studentId, selectedDate);
    const absent = await attendanceApi.getAbsentIds(selectedDate);
    setAbsentIds(new Set(absent));
  }

  const presentCount = studentList.length - absentIds.size;
  const absentCount = absentIds.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Controls Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-field"
          style={{ width: 'auto', minWidth: '160px' }}
          id="attendance-date-picker"
        />
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem' }}>
        <div className="stat-card blue" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Enrolled</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{studentList.length}</div>
        </div>
        <div className="stat-card green" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Present Today</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{presentCount}</div>
        </div>
        <div className="stat-card red" style={{ padding: '0.875rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Absent Today</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fca5a5' }}>{absentCount}</div>
        </div>
      </div>

      {/* Guidance Notice */}
      <div
        style={{
          padding: '0.625rem 0.875rem',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '6px',
          fontSize: '0.8125rem',
          color: '#94a3b8',
        }}
      >
        All students are marked <strong style={{ color: '#34d399' }}>PRESENT</strong> by default. Click toggle button to mark <strong style={{ color: '#fca5a5' }}>ABSENT</strong>.
      </div>

      {/* Attendance Roster List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Loading roster...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {studentList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              No students found in this section.
            </div>
          )}

          {studentList.map((student) => {
            const isAbsent = absentIds.has(student.id);
            return (
              <div key={student.id} className={`attendance-row ${isAbsent ? 'absent' : ''}`}>
                <button
                  onClick={() => toggleAttendance(student.id)}
                  className={`attendance-toggle ${isAbsent ? 'absent' : ''}`}
                  title={isAbsent ? 'Click to mark Present' : 'Click to mark Absent'}
                  id={`attendance-toggle-${student.id}`}
                >
                  {isAbsent ? '✗' : '✓'}
                </button>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Roll: {student.rollNumber} · Parent: {student.parentName}
                  </div>
                </div>

                <span className={`badge ${isAbsent ? 'badge-red' : 'badge-green'}`}>
                  {isAbsent ? 'Absent' : 'Present'}
                </span>

                {isAbsent && (
                  <a
                    href={whatsapp.absenceLink(student)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                    title={`Send absence alert to ${student.parentName}`}
                    id={`whatsapp-absent-${student.id}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    Send Alert
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
