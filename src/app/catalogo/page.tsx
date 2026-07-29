'use client';

import { useMemo, useState } from 'react';
import type { TitleType } from '@/data/types';
import { allGenres, allTitles } from '@/data/catalog';
import { TitleGrid } from '@/components/TitleGrid';

type TypeFilter = 'all' | TitleType;

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

/** Red chevron overlaid on the native <select> (its arrow is hidden). */
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-red"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const selectClass =
  'appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-brand-navy shadow-sm outline-none focus:border-brand-red';

export default function CatalogoPage() {
  const genres = allGenres();
  const [type, setType] = useState<TypeFilter>('all');
  const [genre, setGenre] = useState<string>('');

  const titles = useMemo(() => allTitles(), []);

  const filtered = useMemo(
    () =>
      titles.filter(
        (t) =>
          (type === 'all' || t.type === type) &&
          (genre === '' || t.genres.includes(genre)),
      ),
    [titles, type, genre],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
          Catálogo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Explora todos nuestros títulos. Filtra por tipo y género.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
          {TYPE_FILTERS.map(({ value, label }) => {
            const active = type === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setType(value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-brand-red bg-brand-red text-white'
                    : 'border-slate-200 bg-white text-brand-navy hover:border-brand-red'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <label htmlFor="catalogo-genero" className="sr-only">
            Género
          </label>
          <select
            id="catalogo-genero"
            aria-label="Género"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>

      <p className="mb-8 text-sm font-medium text-slate-500">
        {filtered.length} títulos
      </p>

      <TitleGrid titles={filtered} variant="views" />
    </div>
  );
}
