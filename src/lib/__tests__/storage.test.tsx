import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { readJSON, writeJSON, useLocalStorage } from '@/lib/storage';

describe('readJSON / writeJSON', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips an object', () => {
    const value = { a: 1, b: 'two', c: [3] };
    writeJSON('k', value);
    expect(readJSON('k', null)).toEqual(value);
  });

  it('returns fallback for a missing key', () => {
    expect(readJSON('missing', { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback for invalid JSON', () => {
    localStorage.setItem('bad', 'not-json{');
    expect(readJSON('bad', 42)).toBe(42);
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts at initial and hydrates from localStorage after mount', () => {
    writeJSON('h', 'stored');
    const { result } = renderHook(() => useLocalStorage('h', 'initial'));
    // After mount effect runs, it should reflect the stored value.
    expect(result.current[0]).toBe('stored');
  });

  it('uses initial when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('empty', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('persists updates through the setter', () => {
    const { result } = renderHook(() => useLocalStorage('p', 0));
    act(() => {
      result.current[1](5);
    });
    expect(result.current[0]).toBe(5);
    expect(readJSON('p', null)).toBe(5);
  });
});
