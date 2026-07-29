import Link from 'next/link';
import { allAuthors } from '@/data/catalog';

export default function AutoresPage() {
  const authors = [...allAuthors()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
          Autores
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Explora a los autores de nuestro catálogo.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <li key={author.id}>
            <Link
              href={`/autores/${author.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-brand-red"
            >
              <span className="font-medium text-brand-navy">{author.name}</span>
              <span className="text-sm text-slate-500">
                {author.titleIds.length}{' '}
                {author.titleIds.length === 1 ? 'título' : 'títulos'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
