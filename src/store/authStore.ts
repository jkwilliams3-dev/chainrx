import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

const CREDENTIALS: Record<string, { password: string; user: User }> = {
  'admin@chainrx.io': {
    password: 'Secure#2025!',
    user: { id: 'u1', email: 'admin@chainrx.io', name: 'Alex Morgan', role: 'ADMIN', lastActive: new Date().toISOString(), active: true },
  },
  'reviewer@chainrx.io': {
    password: 'Review#2025!',
    user: { id: 'u2', email: 'reviewer@chainrx.io', name: 'Jamie Chen', role: 'REVIEWER', lastActive: new Date().toISOString(), active: true },
  },
  'auditor@chainrx.io': {
    password: 'Audit#2025!',
    user: { id: 'u3', email: 'auditor@chainrx.io', name: 'Sam Patel', role: 'AUDITOR', lastActive: new Date().toISOString(), active: true },
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (action: 'process' | 'admin' | 'read') => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        const cred = CREDENTIALS[email.toLowerCase()];
        if (!cred || cred.password !== password) {
          return { success: false, error: 'Invalid credentials' };
        }
        set({ user: cred.user, isAuthenticated: true });
        return { success: true };
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      hasPermission: (action) => {
        const role = get().user?.role;
        if (!role) return false;
        if (action === 'read') return true;
        if (action === 'process') return role === 'ADMIN' || role === 'REVIEWER';
        if (action === 'admin') return role === 'ADMIN';
        return false;
      },
    }),
    { name: 'chainrx-auth' }
  )
);
