'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AttendanceManager from '@/components/admin/AttendanceManager';
import FeeManager from '@/components/admin/FeeManager';
import StudentManager from '@/components/admin/StudentManager';
import TeacherManager from '@/components/admin/TeacherManager';
import TimetableManager from '@/components/admin/TimetableManager';
import TopperManager from '@/components/admin/TopperManager';
import BackendWakeUpBanner from '@/components/BackendWakeUpBanner';
import { dashboard } from '@/lib/api';
import { BatchSection } from '@/types';
import { useRequireAdmin } from '@/context/AuthContext';

type AdminTab = 'dashboard' | 'attendance' | 'fees' | 'students' | 'teachers' | 'timetable' | 'toppers';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Fee Manager' },
  { key: 'students', label: 'Student Roster' },
  { key: 'teachers', label: 'Faculty & Payouts' },
  { key: 'timetable', label: 'Schedules' },
  { key: 'toppers', label: 'Board Toppers' },
];

export default function AdminPage() {
  const { isAllowed, isLoading } = useRequireAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0, presentToday: 0, absentToday: 0,
    attendancePercent: 0, totalCollected: 0, totalExpected: 0, totalPending: 0, totalInquiries: 0,
  });
  const [activeAttendanceSection, setActiveAttendanceSection] = useState<BatchSection>('9th');

  const refreshStats = useCallback(async () => {
    try {
      const data = await dashboard.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats, activeTab]);

  const handleBackendAlive = useCallback(() => {
    refreshStats();
  }, [refreshStats]);

  if (isLoading || !isAllowed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Verifying Staff Access</div>
          <div style={{ fontSize: '0.875rem' }}>Loading administration dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackendWakeUpBanner onBackendAlive={handleBackendAlive} />
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Administration Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Overview of active students, attendance tracking, fee collection, faculty payouts, and timetables</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              id={`admin-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Students', value: stats.totalStudents, color: 'blue', sub: 'Active enrollments' },
                { label: 'Present Today', value: stats.presentToday, color: 'green', sub: `${stats.attendancePercent}% attendance rate` },
                { label: 'Absent Today', value: stats.absentToday, color: 'red', sub: 'Requires absence check' },
                { label: 'Fees Collected', value: `₹${(stats.totalCollected / 1000).toFixed(0)}k`, color: 'purple', sub: `of ₹${(stats.totalExpected / 1000).toFixed(0)}k expected` },
                { label: 'Pending Balance', value: `₹${(stats.totalPending / 1000).toFixed(0)}k`, color: 'amber', sub: 'Outstanding fees' },
              ].map((stat) => (
                <div key={stat.label} className={`stat-card ${stat.color}`}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Attendance Overview Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>Daily Attendance Tracking</h3>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Overall attendance rate for today</div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['9th', '10th', 'others'] as BatchSection[]).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => { setActiveAttendanceSection(sec); setActiveTab('attendance'); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      id={`goto-attendance-${sec}`}
                    >
                      {sec === 'others' ? 'Primary Section' : `Class ${sec}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: '10px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${stats.attendancePercent}%`,
                    backgroundColor: '#059669',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', minWidth: '3.5rem', textAlign: 'right' }}>
                  {stats.attendancePercent}%
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <span>Present: <strong style={{ color: '#34d399' }}>{stats.presentToday}</strong></span>
                <span>Absent: <strong style={{ color: '#fca5a5' }}>{stats.absentToday}</strong></span>
                <span>Total Roster: <strong style={{ color: '#f8fafc' }}>{stats.totalStudents}</strong></span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>Management Shortcuts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                {[
                  { label: 'Mark Attendance', tab: 'attendance' as AdminTab, desc: 'Record daily attendance' },
                  { label: 'Record Student Payment', tab: 'fees' as AdminTab, desc: 'Log fee receipt' },
                  { label: 'Faculty & Payouts', tab: 'teachers' as AdminTab, desc: 'Manage teachers & salary' },
                  { label: 'Register Student', tab: 'students' as AdminTab, desc: 'Add new student & discount' },
                  { label: 'Class Schedule', tab: 'timetable' as AdminTab, desc: 'Update timetable slots' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.tab)}
                    className="card"
                    style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    id={`quick-action-${action.tab}`}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#f8fafc' }}>{action.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{action.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab Components */}
        {activeTab === 'attendance' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc', marginBottom: '1.25rem' }}>Attendance Register</h2>
            <AttendanceManager activeSection={activeAttendanceSection} />
          </div>
        )}

        {activeTab === 'fees' && (
          <div>
            <FeeManager />
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <StudentManager />
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            <TeacherManager />
          </div>
        )}

        {activeTab === 'timetable' && (
          <div>
            <TimetableManager />
          </div>
        )}

        {activeTab === 'toppers' && (
          <div>
            <TopperManager />
          </div>
        )}
      </div>
    </>
  );
}
