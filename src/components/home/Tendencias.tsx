'use client';

import { useMemo, useState } from 'react';
import { allGenres, trendingTitles } from '@/data/catalog';
import { TitleCarousel } from '@/components/TitleCarousel';

const PERIODS = ['Semana', 'Mes', 'Año'] as const;

/**
 * Red chevron used as the dropdown accent. The native <select> arrow is hidden
 * via `appearance-none` and this icon is overlaid on the right.
 */
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

export function Tendencias() {
  const genres = allGenres();
  const [period, setPeriod] = useState<string>(PERIODS[0]);
  const [genre, setGenre] = useState<string>('');

  // `period` is cosmetic per spec; the source list is the trending ranking.
  const source = useMemo(() => trendingTitles(), []);
  const titles = useMemo(
    () => (genre === '' ? source : source.filter((t) => t.genres.includes(genre))),
    [source, genre],
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          Tendencias
        </h2>

        <div className="relative">
          <label htmlFor="tendencias-periodo" className="sr-only">
            Semana
          </label>
          <select
            id="tendencias-periodo"
            aria-label="Semana"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={selectClass}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Chevron />
        </div>

        <div className="relative">
          <label htmlFor="tendencias-filtro" className="sr-only">
            Filtro
          </label>
          <select
            id="tendencias-filtro"
            aria-label="Filtro"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>

      <TitleCarousel titles={titles} variant="views" />
    </section>
  );
}
