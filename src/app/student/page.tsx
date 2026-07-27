'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import BackendWakeUpBanner from '@/components/BackendWakeUpBanner';
import { students as studentsApi, payments as paymentsApi, timetable as timetableApi, attendance as attendanceApi } from '@/lib/api';
import { StudentWithStats, FeePayment, TimetableSlot, BatchSection } from '@/types';
import { useRequireStudent } from '@/context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getSectionLabel = (section: BatchSection) =>
  section === 'others' ? 'Primary Section' : `Class ${section}`;

export default function StudentPage() {
  const { isAllowed, isLoading, studentSession, logout } = useRequireStudent();

  const [student, setStudent] = useState<StudentWithStats | null>(null);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [attendanceDates, setAttendanceDates] = useState<{ date: string; isPresent: boolean }[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'fees' | 'timetable'>('attendance');

  const loadData = useCallback(() => {
    if (!studentSession) return;
    const sid = studentSession.studentId;
    Promise.all([
      studentsApi.getStats(sid),
      paymentsApi.getByStudent(sid),
      attendanceApi.getStudentDates(sid),
    ]).then(([s, pmts, attDates]) => {
      if (!s || !s.isActive) {
        logout();
        return;
      }
      setStudent(s);
      setPayments(pmts);
      setAttendanceDates(attDates);
      return timetableApi.getAll(s.section);
    }).then((tt) => {
      if (tt) setTimetable(tt);
    }).catch(() => {
      logout();
    });
  }, [studentSession, logout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBackendAlive = useCallback(() => {
    loadData();
  }, [loadData]);

  const recentAttendance = [...attendanceDates]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  if (isLoading || !isAllowed || !studentSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.375rem' }}>Loading Student Portal</div>
          <div style={{ fontSize: '0.875rem' }}>Verifying student credentials...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackendWakeUpBanner onBackendAlive={handleBackendAlive} />
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Student Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Welcome back, <strong style={{ color: '#f8fafc' }}>{studentSession.name}</strong>
          </p>
        </div>

        {student ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Student Overview Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>{student.name}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem 1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#94a3b8' }}>
                    <span>Roll No: <strong>{student.rollNumber}</strong></span>
                    <span>·</span>
                    <span>Section: <strong>{getSectionLabel(student.section as BatchSection)}</strong></span>
                    <span>·</span>
                    <span>Parent: {student.parentName} ({student.parentPhone})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance</div>
                    <div style={{
                      fontSize: '1.375rem', fontWeight: 800,
                      color: (student.attendancePercent ?? student.attendanceRate ?? 100) >= 75 ? '#34d399' : '#fca5a5',
                    }}>
                      {student.attendancePercent ?? student.attendanceRate ?? 100}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Balance Due</div>
                    <div style={{
                      fontSize: '1.375rem', fontWeight: 800,
                      color: student.remainingFee === 0 ? '#34d399' : '#fca5a5',
                    }}>
                      {student.remainingFee === 0 ? 'Cleared' : `₹${student.remainingFee.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              <button onClick={() => setActiveTab('attendance')} className={`tab-item ${activeTab === 'attendance' ? 'active' : ''}`} id="portal-tab-attendance">
                Attendance Records
              </button>
              <button onClick={() => setActiveTab('fees')} className={`tab-item ${activeTab === 'fees' ? 'active' : ''}`} id="portal-tab-fees">
                Fee Statement
              </button>
              <button onClick={() => setActiveTab('timetable')} className={`tab-item ${activeTab === 'timetable' ? 'active' : ''}`} id="portal-tab-timetable">
                Class Schedule
              </button>
            </div>

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  <div className="stat-card green" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{student.totalPresent}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Days Present</div>
                  </div>
                  <div className="stat-card red" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fca5a5' }}>{student.totalAbsent}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Days Absent</div>
                  </div>
                  <div className={`stat-card ${student.attendancePercent >= 75 ? 'green' : 'red'}`} style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: student.attendancePercent >= 75 ? '#34d399' : '#fca5a5' }}>
                      {student.attendancePercent}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attendance Rate</div>
                  </div>
                </div>

                {student.attendancePercent < 75 && (
                  <div style={{
                    padding: '0.75rem 1rem', marginBottom: '1.5rem',
                    backgroundColor: '#450a0a20', border: '1px solid #991b1b40',
                    borderRadius: '6px', fontSize: '0.8125rem', color: '#fca5a5',
                  }}>
                    Attendance Notice: Your current attendance rate is below 75%. Regular attendance is mandatory for board exam eligibility.
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recent Attendance Logs (Last 30 sessions)
                </div>

                {recentAttendance.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No attendance sessions recorded yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {recentAttendance.map((record) => (
                      <div
                        key={record.date}
                        style={{
                          padding: '0.375rem 0.625rem',
                          borderRadius: '4px',
                          backgroundColor: record.isPresent ? '#04785720' : '#991b1b20',
                          border: `1px solid ${record.isPresent ? '#04785740' : '#991b1b40'}`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: record.isPresent ? '#34d399' : '#fca5a5',
                        }}
                      >
                        {record.isPresent ? 'Present' : 'Absent'} · {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fee History Tab */}
            {activeTab === 'fees' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  <div className="stat-card blue" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>₹{student.totalFee.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Annual Fee</div>
                  </div>
                  <div className="stat-card green" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>₹{student.totalPaid.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Paid</div>
                  </div>
                  <div className={`stat-card ${student.remainingFee === 0 ? 'green' : 'red'}`} style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: student.remainingFee === 0 ? '#34d399' : '#fca5a5' }}>
                      {student.remainingFee === 0 ? 'Cleared' : `₹${student.remainingFee.toLocaleString()}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Remaining Due</div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.375rem' }}>
                    <span>Fee Payment Progress</span>
                    <span>{Math.round((student.totalPaid / student.totalFee) * 100)}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (student.totalPaid / student.totalFee) * 100)}%`,
                      backgroundColor: student.remainingFee === 0 ? '#059669' : '#0284c7',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Payment Receipt History
                </div>

                {payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>No payment receipts logged.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.875rem 1rem', backgroundColor: '#111827',
                          border: '1px solid #1e293b', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>+₹{p.amount.toLocaleString()}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.receiptNote || p.mode.toUpperCase()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8125rem', color: '#f8fafc' }}>
                            {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Receipt: {p.receiptNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                {timetable.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No class schedule published for your section.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {DAYS.map((day) => {
                      const daySlots = timetable
                        .filter((s) => s.day === day)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
                      if (daySlots.length === 0) return null;
                      return (
                        <div key={day}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {day} Schedule
                          </div>
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              style={{
                                display: 'flex', gap: '1rem', alignItems: 'center',
                                padding: '0.75rem 1rem', backgroundColor: '#111827',
                                border: '1px solid #1e293b',
                                borderLeft: '3px solid #0284c7',
                                borderRadius: '6px', marginBottom: '0.375rem',
                              }}
                            >
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', minWidth: '95px' }}>
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{slot.subject}</div>
                                {slot.teacher && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Instructor: {slot.teacher}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading student records...</div>
        )}
      </div>
    </>
  );
}
