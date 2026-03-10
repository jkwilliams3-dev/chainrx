import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../store/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should start unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should login with valid admin credentials', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('admin@chainrx.io', 'Secure#2025!');
      expect(res.success).toBe(true);
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('ADMIN');
  });

  it('should login with valid reviewer credentials', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('reviewer@chainrx.io', 'Review#2025!');
      expect(res.success).toBe(true);
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('REVIEWER');
    expect(result.current.user?.name).toBe('Jamie Chen');
  });

  it('should login with valid auditor credentials', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('auditor@chainrx.io', 'Audit#2025!');
      expect(res.success).toBe(true);
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('AUDITOR');
  });

  it('should reject invalid credentials', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('admin@chainrx.io', 'wrongpassword');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should reject unknown email', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('unknown@chainrx.io', 'Secure#2025!');
      expect(res.success).toBe(false);
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should be case-insensitive for email', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      const res = result.current.login('ADMIN@CHAINRX.IO', 'Secure#2025!');
      expect(res.success).toBe(true);
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.login('admin@chainrx.io', 'Secure#2025!'); });
    act(() => { result.current.logout(); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('ADMIN has admin permission', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.login('admin@chainrx.io', 'Secure#2025!'); });
    expect(result.current.hasPermission('admin')).toBe(true);
    expect(result.current.hasPermission('process')).toBe(true);
    expect(result.current.hasPermission('read')).toBe(true);
  });

  it('REVIEWER has process and read permissions but not admin', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.login('reviewer@chainrx.io', 'Review#2025!'); });
    expect(result.current.hasPermission('admin')).toBe(false);
    expect(result.current.hasPermission('process')).toBe(true);
    expect(result.current.hasPermission('read')).toBe(true);
  });

  it('AUDITOR only has read permission', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.login('auditor@chainrx.io', 'Audit#2025!'); });
    expect(result.current.hasPermission('admin')).toBe(false);
    expect(result.current.hasPermission('process')).toBe(false);
    expect(result.current.hasPermission('read')).toBe(true);
  });

  it('unauthenticated user has no permissions', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.hasPermission('read')).toBe(false);
    expect(result.current.hasPermission('process')).toBe(false);
    expect(result.current.hasPermission('admin')).toBe(false);
  });
});
