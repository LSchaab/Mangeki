'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe read of a JSON value from localStorage.
 * Returns `fallback` when running on the server, when the key is absent,
 * or when the stored value cannot be parsed.
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe write of a JSON value to localStorage.
 * No-op on the server; quota/serialization errors are swallowed.
 */
export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or serialization errors.
  }
}

/**
 * SSR-safe stateful localStorage hook.
 * Starts at `initial` (so server and first client render match), then
 * hydrates from localStorage after mount. The setter writes through.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // Deferred hydration: server render and first client render both use
  // `initial`, then we sync from localStorage after mount to avoid a
  // hydration mismatch. Only re-hydrate when the key changes.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    setValue(readJSON<T>(key, initial));
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const set = (next: T) => {
    setValue(next);
    writeJSON(key, next);
  };

  return [value, set];
}
