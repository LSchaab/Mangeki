'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

interface GuardarButtonProps {
  titleId: string;
}

/**
 * Save/remove a title from the current user's library. Logged-out visitors get
 * a link to the login page instead of a toggle they could never use.
 */
export default function GuardarButton({ titleId }: GuardarButtonProps) {
  const { user } = useAuth();
  const { isSaved, save, remove } = useLibrary();

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-lg border border-brand-red px-5 py-2.5 text-sm font-semibold text-brand-red transition hover:bg-brand-red-light"
      >
        Inicia sesión para guardar
      </Link>
    );
  }

  const saved = isSaved(titleId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => (saved ? remove(titleId) : save(titleId))}
      className={
        saved
          ? 'inline-flex items-center justify-center rounded-lg bg-brand-red-light px-5 py-2.5 text-sm font-semibold text-brand-red transition hover:bg-brand-red hover:text-white'
          : 'inline-flex items-center justify-center rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy'
      }
    >
      {saved ? '✓ En tu biblioteca' : 'Guardar'}
    </button>
  );
}
