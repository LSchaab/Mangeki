import { notFound } from 'next/navigation';
import { TitleGrid } from '@/components/TitleGrid';
import { allGenres, getGenre, titlesByGenre } from '@/data/catalog';

// Static export: prerender a route for every genre slug.
export function generateStaticParams() {
  return allGenres().map((g) => ({ slug: g.slug }));
}

export default async function GeneroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = getGenre(slug);
  if (!genre) notFound();

  const titles = titlesByGenre(genre.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
          {genre.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {titles.length} {titles.length === 1 ? 'título' : 'títulos'}
        </p>
      </header>

      <TitleGrid titles={titles} variant="views" />
    </div>
  );
}
