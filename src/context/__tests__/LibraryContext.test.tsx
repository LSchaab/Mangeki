import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LibraryProvider, useLibrary } from '@/context/LibraryContext';
import { readJSON } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import type { CustomTitle } from '@/data/types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <LibraryProvider>{children}</LibraryProvider>
  </AuthProvider>
);

// Combined hook so tests can drive auth (login) and read library in one place.
function useHarness() {
  return { auth: useAuth(), library: useLibrary() };
}

const demoInput: Omit<CustomTitle, 'id' | 'createdAt'> = {
  title: 'Mi Manga Original',
  author: 'Autora Demo',
  type: 'manga',
  coverUrl: 'https://example.com/cover.jpg',
  synopsis: 'Una historia.',
  genres: ['accion'],
};

describe('LibraryContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when useLibrary is used outside LibraryProvider', () => {
    expect(() => renderHook(() => useLibrary())).toThrow();
  });

  it('starts empty for a logged-in user', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    expect(result.current.library.savedIds).toEqual([]);
    expect(result.current.library.customTitles).toEqual([]);
  });

  it('save adds an id, isSaved reflects it, and it persists', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    act(() => {
      result.current.library.save('t1');
    });
    expect(result.current.library.savedIds).toEqual(['t1']);
    expect(result.current.library.isSaved('t1')).toBe(true);
    expect(result.current.library.isSaved('t2')).toBe(false);
    expect(readJSON<string[]>(STORAGE_KEYS.library('otaku123'), [])).toEqual([
      't1',
    ]);
  });

  it('save dedupes an already-saved id', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    act(() => {
      result.current.library.save('t1');
    });
    act(() => {
      result.current.library.save('t1');
    });
    expect(result.current.library.savedIds).toEqual(['t1']);
  });

  it('remove deletes an id and persists', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    act(() => {
      result.current.library.save('t1');
      result.current.library.save('t2');
    });
    act(() => {
      result.current.library.remove('t1');
    });
    expect(result.current.library.savedIds).toEqual(['t2']);
    expect(result.current.library.isSaved('t1')).toBe(false);
    expect(readJSON<string[]>(STORAGE_KEYS.library('otaku123'), [])).toEqual([
      't2',
    ]);
  });

  it('addCustom succeeds, builds a deterministic id, and persists', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.library.addCustom(demoInput);
    });
    expect(res).toEqual({ ok: true });
    expect(result.current.library.customTitles).toHaveLength(1);
    const created = result.current.library.customTitles[0];
    expect(created.id).toBe('custom_otaku123_mi-manga-original');
    expect(created.title).toBe('Mi Manga Original');
    expect(typeof created.createdAt).toBe('string');

    const persisted = readJSON<CustomTitle[]>(
      STORAGE_KEYS.customTitles('otaku123'),
      [],
    );
    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe('custom_otaku123_mi-manga-original');
  });

  it('addCustom requires title and author', () => {
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    let res: { ok: boolean; error?: string } | undefined;
    act(() => {
      res = result.current.library.addCustom({ ...demoInput, title: '' });
    });
    expect(res).toEqual({
      ok: false,
      error: 'Título y autor son obligatorios.',
    });
    expect(result.current.library.customTitles).toHaveLength(0);
  });

  it('loads persisted savedIds and customTitles on login', () => {
    const custom: CustomTitle = {
      ...demoInput,
      id: 'custom_otaku123_mi-manga-original',
      createdAt: '2026-07-27T00:00:00.000Z',
    };
    localStorage.setItem(
      STORAGE_KEYS.library('otaku123'),
      JSON.stringify(['t9']),
    );
    localStorage.setItem(
      STORAGE_KEYS.customTitles('otaku123'),
      JSON.stringify([custom]),
    );
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.auth.login('otaku123', 'demo1234');
    });
    expect(result.current.library.savedIds).toEqual(['t9']);
    expect(result.current.library.customTitles).toEqual([custom]);
  });

  describe('logged-out', () => {
    it('is empty and save/remove are no-ops', () => {
      const { result } = renderHook(() => useHarness(), { wrapper });
      expect(result.current.library.savedIds).toEqual([]);
      expect(result.current.library.customTitles).toEqual([]);
      act(() => {
        result.current.library.save('t1');
        result.current.library.remove('t1');
      });
      expect(result.current.library.savedIds).toEqual([]);
    });

    it('addCustom returns an error and persists nothing', () => {
      const { result } = renderHook(() => useHarness(), { wrapper });
      let res: { ok: boolean; error?: string } | undefined;
      act(() => {
        res = result.current.library.addCustom(demoInput);
      });
      expect(res).toEqual({ ok: false, error: 'Inicia sesión.' });
      expect(result.current.library.customTitles).toEqual([]);
    });
  });
});
