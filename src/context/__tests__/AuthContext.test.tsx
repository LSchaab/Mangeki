import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { readJSON } from '@/lib/storage';
import { STORAGE_KEYS, DEMO_ACCOUNT } from '@/lib/constants';
import type { User } from '@/data/types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds the demo account into users on first mount', () => {
    renderHook(() => useAuth(), { wrapper });
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    expect(users.some((u) => u.username === DEMO_ACCOUNT.username)).toBe(true);
  });

  it('logs in the demo account (otaku123 / demo1234)', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.login('otaku123', 'demo1234');
    });
    expect(res).toEqual({ ok: true });
    expect(result.current.user?.username).toBe('otaku123');
  });

  it('rejects wrong credentials and leaves user null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.login('otaku123', 'wrongpass');
    });
    expect(res).toEqual({ ok: false, error: 'Usuario o contraseña inválidos.' });
    expect(result.current.user).toBeNull();
  });

  it('signs up a new user, persists it, and sets the session', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.signup('nuevo', 'nuevo@mangeki.app', 'clave1234');
    });
    expect(res).toEqual({ ok: true });
    expect(result.current.user?.username).toBe('nuevo');
    expect(result.current.user?.id).toBe('u_nuevo');

    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    expect(users.some((u) => u.username === 'nuevo')).toBe(true);
    expect(readJSON<string | null>(STORAGE_KEYS.session, null)).toBe('u_nuevo');
  });

  it('requires all fields on signup', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.signup('', 'x@x.com', 'clave1234');
    });
    expect(res).toEqual({
      ok: false,
      error: 'Todos los campos son obligatorios.',
    });
    expect(result.current.user).toBeNull();
  });

  it('blocks duplicate usernames case-insensitively', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.signup('OTAKU123', 'other@mangeki.app', 'clave1234');
    });
    expect(res).toEqual({ ok: false, error: 'Ese usuario ya existe.' });
  });

  it('logout clears the session and user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login('otaku123', 'demo1234');
    });
    expect(result.current.user).not.toBeNull();
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(readJSON<string | null>(STORAGE_KEYS.session, null)).toBeNull();
  });

  it('restores an existing session on mount', () => {
    writeSeed();
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.username).toBe('otaku123');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});

function writeSeed() {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEMO_ACCOUNT]));
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(DEMO_ACCOUNT.id));
}
