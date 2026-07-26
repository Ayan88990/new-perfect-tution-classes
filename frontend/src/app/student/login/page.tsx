'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BackendWakeUpBanner from '@/components/BackendWakeUpBanner';
import { useBackendStatus } from '@/lib/useBackendStatus';

export default function StudentLoginPage() {
  const { loginStudent } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ rollNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isWaking } = useBackendStatus();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isWaking) {
      setError('Server is cold-starting. Please wait a few seconds and try again.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = await loginStudent(form.rollNumber, form.phone);
    if (result.success) {
      router.push('/student');
    } else {
      setError(result.error || 'Login failed. Please verify roll number and registered mobile number.');
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: '#0f172a',
        position: 'relative',
      }}
    >
      <BackendWakeUpBanner />

      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <Link href="/" className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
          Back to Home
        </Link>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.25rem 2rem',
          backgroundColor: '#111827',
          borderColor: '#334155',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.375rem' }}>
            Student Portal Login
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            New Perfect Tuition Classes
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="student-login-form">
          <div>
            <label
              htmlFor="student-roll"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Roll Number
            </label>
            <input
              id="student-roll"
              type="text"
              className="input-field"
              value={form.rollNumber}
              onChange={(e) => { setForm({ ...form, rollNumber: e.target.value }); setError(''); }}
              placeholder="e.g. 901"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="student-phone"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Parent Registered Phone Number
            </label>
            <input
              id="student-phone"
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => { setForm({ ...form, phone: e.target.value }); setError(''); }}
              placeholder="10-digit mobile number"
              required
              autoComplete="tel"
              maxLength={10}
            />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem' }}>
              Enter the mobile number registered with the tuition institute.
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                backgroundColor: '#450a0a20',
                border: '1px solid #991b1b40',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || isWaking}
            id="student-login-submit"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              fontSize: '0.9375rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying...' : isWaking ? 'Server waking up...' : 'Access Student Portal'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>
          Tuition staff?{' '}
          <Link href="/admin/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Admin Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
