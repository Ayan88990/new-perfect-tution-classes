'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { pingBackend } from './api';

type BackendStatus = 'checking' | 'alive' | 'waking';

interface UseBackendStatusReturn {
  status: BackendStatus;
  isAlive: boolean;
  isChecking: boolean;
  isWaking: boolean;
  recheckNow: () => void;
}

/**
 * useBackendStatus — Polls the backend health endpoint.
 * - On mount: immediately checks if backend is alive.
 * - If backend is sleeping: retries every 4 seconds automatically.
 * - Once alive: stops polling and fires onAlive callback.
 * - Exposes recheckNow() to trigger an immediate re-check.
 */
export function useBackendStatus(onAlive?: () => void): UseBackendStatusReturn {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const onAliveRef = useRef(onAlive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasBeenAliveRef = useRef(false);

  onAliveRef.current = onAlive;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const check = useCallback(async () => {
    const alive = await pingBackend();
    if (alive) {
      setStatus('alive');
      stopPolling();
      if (!hasBeenAliveRef.current) {
        hasBeenAliveRef.current = true;
        onAliveRef.current?.();
      }
    } else {
      setStatus('waking');
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    check(); // immediate first check
    intervalRef.current = setInterval(check, 4000);
  }, [check, stopPolling]);

  useEffect(() => {
    startPolling();
    return stopPolling;
  }, [startPolling, stopPolling]);

  const recheckNow = useCallback(() => {
    setStatus('checking');
    hasBeenAliveRef.current = false;
    startPolling();
  }, [startPolling]);

  return {
    status,
    isAlive: status === 'alive',
    isChecking: status === 'checking',
    isWaking: status === 'waking',
    recheckNow,
  };
}
