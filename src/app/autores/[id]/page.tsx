import { notFound } from 'next/navigation';
import { Avatar } from '@/components/brand/Avatar';
import { TitleGrid } from '@/components/TitleGrid';
import { allAuthors, getAuthor, titlesByAuthor } from '@/data/catalog';

// Static export: prerender a route for every author id.
export function generateStaticParams() {
  return allAuthors().map((a) => ({ id: a.id }));
}

export default async function AutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) notFound();

  const titles = titlesByAuthor(author.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="shrink-0 overflow-hidden rounded-full grayscale [&>img]:h-24 [&>img]:w-24">
          <Avatar
            src={author.photoUrl || undefined}
            alt={author.name}
            size={96}
          />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            {author.name}
          </h1>
          {author.bio && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
              {author.bio}
            </p>
          )}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="mb-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          Títulos
        </h2>
        <TitleGrid titles={titles} variant="views" />
      </section>
    </div>
  );
}
