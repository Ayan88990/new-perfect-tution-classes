'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth as authApi, setToken, clearToken, getToken } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthRole = 'admin' | 'student';

export interface AdminSession {
  role: 'admin';
  name: string;
}

export interface StudentSession {
  role: 'student';
  studentId: string;
  name: string;
  rollNumber: string;
  section: string;
}

export type AuthSession = AdminSession | StudentSession | null;

interface AuthContextValue {
  session: AuthSession;
  isLoading: boolean;
  loginAdmin(password: string): Promise<{ success: boolean; error?: string }>;
  loginStudent(rollNumber: string, phone: string): Promise<{ success: boolean; error?: string }>;
  logout(): void;
}

// ─── Storage key for session metadata (NOT the token itself) ──────────────────

const SESSION_KEY = 'ptc_session';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const token  = getToken();
      if (stored && token) {
        setSession(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Route guard
  useEffect(() => {
    if (isLoading) return;

    const isAdminRoute   = pathname.startsWith('/admin')   && !pathname.startsWith('/admin/login');
    const isStudentRoute = pathname.startsWith('/student') && !pathname.startsWith('/student/login');

    if (isAdminRoute   && session?.role !== 'admin')   router.replace('/admin/login');
    else if (isStudentRoute && session?.role !== 'student') router.replace('/student/login');
  }, [pathname, session, isLoading, router]);

  function saveSession(s: AuthSession, token?: string) {
    setSession(s);
    if (s && token) {
      setToken(token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      clearToken();
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await authApi.loginAdmin(password);
      saveSession({ role: 'admin', name: data.name }, data.token);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  async function loginStudent(
    rollNumber: string,
    phone: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await authApi.loginStudent(rollNumber, phone);
      saveSession(
        {
          role: 'student',
          studentId: data.studentId,
          name: data.name,
          rollNumber: data.rollNumber,
          section: data.section,
        },
        data.token,
      );
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  function logout() {
    const role = session?.role;
    saveSession(null);
    if (role === 'admin') router.push('/admin/login');
    else router.push('/student/login');
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, loginAdmin, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAdmin() {
  const { session, isLoading } = useAuth();
  return { isAllowed: !isLoading && session?.role === 'admin', isLoading };
}

export function useRequireStudent() {
  const { session, isLoading, logout } = useAuth();
  const studentSession = session?.role === 'student' ? (session as StudentSession) : null;
  return { isAllowed: !isLoading && !!studentSession, isLoading, studentSession, logout };
}
