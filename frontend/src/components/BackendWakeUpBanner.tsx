'use client';

import { useBackendStatus } from '@/lib/useBackendStatus';
import { useRef } from 'react';

interface BackendWakeUpBannerProps {
  onBackendAlive?: () => void;
}

export default function BackendWakeUpBanner({ onBackendAlive }: BackendWakeUpBannerProps) {
  const didCallRef = useRef(false);

  const handleAlive = () => {
    if (!didCallRef.current) {
      didCallRef.current = true;
      onBackendAlive?.();
    }
  };

  const { isWaking, isChecking } = useBackendStatus(handleAlive);
  const visible = isWaking || isChecking;

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #0284c7',
        padding: '0.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          border: '2px solid #38bdf840',
          borderTop: '2px solid #38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8125rem', color: '#f8fafc', fontWeight: 600 }}>
          {isChecking ? 'Connecting to server...' : 'Server cold-starting...'}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {isChecking ? 'Checking connection status' : 'Please wait 15–30 seconds. Data will refresh automatically.'}
        </span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
