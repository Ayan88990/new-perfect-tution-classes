'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    ...(session?.role === 'admin' ? [{ href: '/admin', label: 'Admin Dashboard' }] : []),
    ...(session?.role === 'student' ? [{ href: '/student', label: 'Student Portal' }] : []),
    ...(!session ? [
      { href: '/admin/login', label: 'Admin Login' },
      { href: '/student/login', label: 'Student Portal' },
    ] : []),
  ];

  const getSectionLabel = (section: string) =>
    section === 'others' ? 'Primary Section' : `Class ${section}`;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #334155',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          gap: '1rem',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}
        >
          <img
            src="/logo.png"
            alt="New Perfect Tuition Classes"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid #334155',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-poppins, Poppins), sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#f8fafc',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              New Perfect Tuition
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Classes Juhapura
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} className="hidden-mobile">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && !pathname.includes('/login'));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '6px',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Session Info + Logout */}
          {session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem', paddingLeft: '0.875rem', borderLeft: '1px solid #334155' }}>
              <div
                style={{
                  padding: '0.25rem 0.625rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: session.role === 'admin' ? '#38bdf8' : '#2dd4bf',
                }}
              >
                {session.role === 'admin'
                  ? 'Staff Account'
                  : `${session.name.split(' ')[0]} (${getSectionLabel((session as { section: string }).section)})`}
              </div>
              <button
                onClick={logout}
                className="btn-ghost"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#fca5a5', borderColor: '#991b1b40' }}
                id="logout-btn"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div
          style={{
            borderTop: '1px solid #334155',
            padding: '0.875rem 1.5rem',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          {session && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                marginBottom: '0.375rem',
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                {session.role === 'admin' ? 'Staff Account' : session.name}
              </div>
              <button
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}
                id="mobile-logout-btn"
              >
                Sign Out
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && !pathname.includes('/login'));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#0284c7' : '#1e293b',
                  textDecoration: 'none',
                  border: '1px solid #334155',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          #mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
