'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CustomTitle } from '@/data/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, writeJSON } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';

export interface AddCustomResult {
  ok: boolean;
  error?: string;
}

interface LibraryContextValue {
  savedIds: string[];
  customTitles: CustomTitle[];
  isSaved: (id: string) => boolean;
  save: (id: string) => void;
  remove: (id: string) => void;
  addCustom: (input: Omit<CustomTitle, 'id' | 'createdAt'>) => AddCustomResult;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

/** Turn a title into a URL-safe slug for a deterministic custom id. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (combining marks)
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<CustomTitle[]>([]);

  // Reload from localStorage whenever the current user changes.
  // Logged-out -> both empty. Reads run client-side only via helpers.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      setCustomTitles([]);
      return;
    }
    setSavedIds(readJSON<string[]>(STORAGE_KEYS.library(user.id), []));
    setCustomTitles(
      readJSON<CustomTitle[]>(STORAGE_KEYS.customTitles(user.id), []),
    );
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isSaved = (id: string): boolean => savedIds.includes(id);

  const save = (id: string): void => {
    if (!user) return;
    if (savedIds.includes(id)) return;
    const next = [...savedIds, id];
    setSavedIds(next);
    writeJSON(STORAGE_KEYS.library(user.id), next);
  };

  const remove = (id: string): void => {
    if (!user) return;
    const next = savedIds.filter((saved) => saved !== id);
    setSavedIds(next);
    writeJSON(STORAGE_KEYS.library(user.id), next);
  };

  const addCustom = (
    input: Omit<CustomTitle, 'id' | 'createdAt'>,
  ): AddCustomResult => {
    if (!user) {
      return { ok: false, error: 'Inicia sesión.' };
    }
    if (!input.title || !input.author) {
      return { ok: false, error: 'Título y autor son obligatorios.' };
    }

    const custom: CustomTitle = {
      ...input,
      id: `custom_${user.id}_${slugify(input.title)}`,
      // Safe: addCustom only runs in a browser event handler, never in render.
      createdAt: new Date().toISOString(),
    };
    const next = [...customTitles, custom];
    setCustomTitles(next);
    writeJSON(STORAGE_KEYS.customTitles(user.id), next);
    return { ok: true };
  };

  return (
    <LibraryContext.Provider
      value={{ savedIds, customTitles, isSaved, save, remove, addCustom }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (ctx === null) {
    throw new Error('useLibrary debe usarse dentro de un LibraryProvider.');
  }
  return ctx;
}
