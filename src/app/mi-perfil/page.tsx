'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Title } from '@/data/types';
import { getTitle } from '@/data/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { AddTitleForm } from '@/components/AddTitleForm';

export default function MiPerfilPage() {
  const { user } = useAuth();
  const { savedIds, customTitles, remove } = useLibrary();

  const saved: Title[] = savedIds
    .map((id) => getTitle(id))
    .filter((t): t is Title => t !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Mi Perfil
      </h1>

      {!user ? (
        <div className="mt-8 rounded-md bg-brand-red-light px-5 py-4 text-brand-navy">
          <p>
            Inicia sesión para ver tu biblioteca.{' '}
            <Link
              href="/login"
              className="font-semibold text-brand-red hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="mb-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
              Guardados
            </h2>
            {saved.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tienes títulos guardados todavía.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {saved.map((title) => (
                  <div key={title.id} className="flex flex-col gap-2">
                    <Link href={`/titulo/${title.id}`} className="group flex flex-col gap-2">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={title.coverUrl}
                          alt={title.title}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 16vw, 40vw"
                          className="object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-display text-sm font-semibold leading-snug text-brand-navy line-clamp-2 group-hover:text-brand-red">
                        {title.title}
                      </h3>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(title.id)}
                      className="self-start rounded-lg border border-brand-red px-3 py-1 text-xs font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-14">
            <h2 className="mb-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
              Tus títulos añadidos
            </h2>
            {customTitles.length === 0 ? (
              <p className="text-sm text-slate-500">
                No has añadido títulos todavía.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {customTitles.map((title) => (
                  <div key={title.id} className="flex flex-col gap-2">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
                      {title.coverUrl ? (
                        <Image
                          src={title.coverUrl}
                          alt={title.title}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 16vw, 40vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-slate-400">
                          Sin portada
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-sm font-semibold leading-snug text-brand-navy line-clamp-2">
                      {title.title}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-14 max-w-xl">
            <h2 className="mb-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
              Añade tu propio título
            </h2>
            <AddTitleForm />
          </section>
        </>
      )}
    </div>
  );
}
