'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/data/types';
import { STORAGE_KEYS, DEMO_ACCOUNT } from '@/lib/constants';
import { readJSON, writeJSON } from '@/lib/storage';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  signup: (username: string, email: string, password: string) => AuthResult;
  login: (username: string, password: string) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): User[] {
  return readJSON<User[]>(STORAGE_KEYS.users, []);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Seed the demo account (if absent) and restore any existing session.
  // Runs client-side only via the storage helpers to stay SSR-safe.
  useEffect(() => {
    const users = readUsers();
    if (
      !users.some(
        (u) =>
          u.username.toLowerCase() === DEMO_ACCOUNT.username.toLowerCase(),
      )
    ) {
      writeJSON(STORAGE_KEYS.users, [...users, DEMO_ACCOUNT]);
    }

    const sessionId = readJSON<string | null>(STORAGE_KEYS.session, null);
    if (sessionId) {
      const current = readUsers().find((u) => u.id === sessionId) ?? null;
      // Deferred hydration from localStorage after mount keeps server and
      // first client render in sync (session state is unavailable on the server).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(current);
    }
  }, []);

  const signup = (
    username: string,
    email: string,
    password: string,
  ): AuthResult => {
    if (!username || !email || !password) {
      return { ok: false, error: 'Todos los campos son obligatorios.' };
    }

    const users = readUsers();
    if (
      users.some((u) => u.username.toLowerCase() === username.toLowerCase())
    ) {
      return { ok: false, error: 'Ese usuario ya existe.' };
    }

    const newUser: User = {
      id: `u_${username.toLowerCase()}`,
      username,
      email,
      password,
    };
    writeJSON(STORAGE_KEYS.users, [...users, newUser]);
    writeJSON(STORAGE_KEYS.session, newUser.id);
    setUser(newUser);
    return { ok: true };
  };

  const login = (username: string, password: string): AuthResult => {
    const match = readUsers().find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password,
    );
    if (!match) {
      return { ok: false, error: 'Usuario o contraseña inválidos.' };
    }
    writeJSON(STORAGE_KEYS.session, match.id);
    setUser(match);
    return { ok: true };
  };

  const logout = () => {
    writeJSON(STORAGE_KEYS.session, null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return ctx;
}
