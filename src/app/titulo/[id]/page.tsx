import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { TitleStatus, TitleType } from '@/data/types';
import { allTitles, getTitle, getAuthor, getGenre } from '@/data/catalog';
import { scoreOutOf10 } from '@/lib/format';
import LeerButton from './LeerButton';
import GuardarButton from './GuardarButton';

const TYPE_LABELS: Record<TitleType, string> = {
  manga: 'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
};

const STATUS_LABELS: Record<TitleStatus, string> = {
  ongoing: 'En emisión',
  completed: 'Finalizado',
  hiatus: 'En pausa',
};

// Static export: prerender a route for every title id.
export function generateStaticParams() {
  return allTitles().map((t) => ({ id: t.id }));
}

export default async function TituloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const title = getTitle(id);
  if (!title) notFound();

  const authors = title.authorIds
    .map((authorId) => getAuthor(authorId))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);
  const genres = title.genres
    .map((slug) => getGenre(slug))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="mx-auto w-48 shrink-0 sm:mx-0">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100 shadow-sm">
            <Image
              src={title.coverUrl}
              alt={title.title}
              fill
              unoptimized
              sizes="192px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            {title.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>{TYPE_LABELS[title.type]}</span>
            <span aria-hidden="true">·</span>
            <span>{STATUS_LABELS[title.status]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-brand-navy">
              ★ {scoreOutOf10(title.score)}
            </span>
          </div>

          {authors.length > 0 && (
            <p className="mt-3 text-sm text-slate-600">
              {authors.map((author, i) => (
                <span key={author.id}>
                  {i > 0 && ', '}
                  <Link
                    href={`/autores/${author.id}`}
                    className="font-medium text-brand-red hover:underline"
                  >
                    {author.name}
                  </Link>
                </span>
              ))}
            </p>
          )}

          {genres.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <li key={genre.slug}>
                  <Link
                    href={`/generos/${genre.slug}`}
                    className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-brand-navy transition hover:bg-brand-red-light hover:text-brand-red"
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-sm leading-relaxed text-slate-700">
            {title.synopsis}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <LeerButton />
            <GuardarButton titleId={title.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
