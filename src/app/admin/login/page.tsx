'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BackendWakeUpBanner from '@/components/BackendWakeUpBanner';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAdmin(password);
    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.error || 'Incorrect password. Please try again.');
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

      {/* Navigation link back home */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <Link href="/" className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
          Back to Home
        </Link>
      </div>

      {/* Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.25rem 2rem',
          backgroundColor: '#111827',
          borderColor: '#334155',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1
            className="font-display"
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.375rem' }}
          >
            Staff Admin Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            New Perfect Tuition Classes
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="admin-login-form">
          <div>
            <label
              htmlFor="admin-password"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{ paddingRight: '4rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '0.75rem', padding: '0.25rem', fontWeight: 600,
                }}
                id="toggle-password-visibility"
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
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
            disabled={loading}
            id="admin-login-submit"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              fontSize: '0.9375rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>
          Student looking for portal?{' '}
          <Link href="/student/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
