import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '@/components/brand/Avatar';
import { topAuthors } from '@/data/catalog';

/**
 * Home "Top Autores 2023" section: a brand-red-light band with a 2x3 grid of
 * the most prolific authors. Each card shows a grayscale circular avatar with a
 * decorative seigaiha motif tucked behind its top-left corner, the author name,
 * a small red dot accent, and a navy "Leer más" link to the author page.
 */
export function TopAutores() {
  const authors = topAuthors(6);

  return (
    <section className="bg-brand-red-light">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-10 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
          Top Autores 2023
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

              <Link
                href={`/autores/${author.id}`}
                className="mt-3 block w-full max-w-[12rem] rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-blue"
              >
                Leer más
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
