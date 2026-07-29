import Link from 'next/link';
import { allGenres, titlesByGenre } from '@/data/catalog';

export default function GenerosPage() {
  const genres = [...allGenres()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
          Géneros
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Explora el catálogo por género.
        </p>
      </header>

      <ul className="flex flex-wrap gap-3">
        {genres.map((genre) => {
          const count = titlesByGenre(genre.slug).length;
          return (
            <li key={genre.slug}>
              <Link
                href={`/generos/${genre.slug}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition hover:border-brand-red"
              >
                <span className="font-medium text-brand-navy">{genre.name}</span>
                <span className="text-slate-500">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
