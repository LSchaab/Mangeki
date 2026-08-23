import Image from 'next/image';
import { Avatar } from '@/components/brand/Avatar';
import { featuredAuthors } from '@/data/catalog';

/**
 * Home "Top Autores 2025" section: a brand-red-light band with a 2x3 grid of
 * famous mangaka. Each card shows a grayscale circular avatar with a decorative
 * seigaiha motif tucked behind its top-left corner, the author name, a small
 * red dot accent, and the author's notable work as a muted line. The cards are
 * a static showcase and are no longer clickable (no author pages).
 */
export function TopAutores() {
  const authors = featuredAuthors();

  return (
    <section className="bg-brand-red-light">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-10 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          Top Autores 2025
        </h2>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {authors.map((author) => (
            <li key={author.id} className="flex flex-col items-center">
              {/* Avatar with seigaiha motif clipped behind its top-left. */}
              <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                <Image
                  src="/brand/circles_svg.svg"
                  alt=""
                  aria-hidden
                  width={96}
                  height={96}
                  unoptimized
                  className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 select-none"
                />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full grayscale [&>img]:h-full [&>img]:w-full">
                  <Avatar
                    src={author.photoUrl || undefined}
                    alt={author.name}
                    size={160}
                  />
                </div>
              </div>

              <p className="mt-4 text-center font-display font-bold text-brand-navy">
                {author.name}
              </p>

              <span
                aria-hidden
                className="mt-2 block h-2.5 w-2.5 rounded-full bg-brand-red"
              />

              <p className="mt-3 text-center text-sm text-slate-500">
                {author.notableWork}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
