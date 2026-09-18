'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Title, CustomTitle } from '@/data/types';
import { getTitle } from '@/data/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { AddTitleForm } from '@/components/AddTitleForm';
import { Avatar } from '@/components/brand/Avatar';
import { Modal } from '@/components/Modal';

type TabKey = 'info' | 'saved' | 'custom';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Información' },
  { key: 'saved', label: 'Leídos' },
  { key: 'custom', label: 'Títulos añadidos' },
];

export default function MiPerfilPage() {
  const { user, logout } = useAuth();
  const { savedIds, customTitles, remove, toggleCustomRead } = useLibrary();
  const [tab, setTab] = useState<TabKey>('info');
  const [addOpen, setAddOpen] = useState(false);

  const saved: Title[] = savedIds
    .map((id) => getTitle(id))
    .filter((t): t is Title => t !== undefined);

  // "Leídos" combines catalog titles you added plus your own titles you've
  // marked as read.
  const readCustom = customTitles.filter((t) => t.read);
  const leidosCount = saved.length + readCustom.length;

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
          Mi Perfil
        </h1>
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Mi Perfil
      </h1>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Secciones de tu perfil"
        className="mt-8 flex gap-1 border-b border-slate-200"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={active}
              aria-controls={`panel-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 font-display text-sm font-semibold transition sm:text-base ${
                active
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-brand-navy'
              }`}
            >
              {t.label}
              {t.key === 'saved' && leidosCount > 0 && (
                <span className="ml-2 text-xs text-slate-400">{leidosCount}</span>
              )}
              {t.key === 'custom' && customTitles.length > 0 && (
                <span className="ml-2 text-xs text-slate-400">
                  {customTitles.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Información */}
      {tab === 'info' && (
        <section
          id="panel-info"
          role="tabpanel"
          aria-labelledby="tab-info"
          className="mt-8"
        >
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="rounded-full ring-4 ring-brand-red-light">
                <Avatar alt={user.username} size={96} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-brand-navy">
                  {user.username}
                </h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-brand-red-light px-3 py-1 text-xs font-semibold text-brand-red">
                  Cuenta demo
                </span>
              </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Usuario" value={user.username} />
              <InfoRow label="Correo" value={user.email} />
              <InfoRow label="Leídos" value={String(leidosCount)} />
              <InfoRow
                label="Títulos añadidos"
                value={String(customTitles.length)}
              />
            </dl>

            <button
              type="button"
              onClick={logout}
              className="mt-8 rounded-full border border-brand-red px-6 py-2.5 font-display text-sm font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </section>
      )}

      {/* Guardados */}
      {tab === 'saved' && (
        <section
          id="panel-saved"
          role="tabpanel"
          aria-labelledby="tab-saved"
          className="mt-8"
        >
          {leidosCount === 0 ? (
            <p className="text-sm text-slate-500">
              No tienes títulos marcados como leídos todavía.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {saved.map((title) => (
                <div key={title.id} className="flex flex-col gap-2">
                  <Link
                    href={`/titulo/${title.id}`}
                    className="group flex flex-col gap-2"
                  >
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
              {readCustom.map((title) => (
                <CustomCard
                  key={title.id}
                  title={title}
                  onToggleRead={() => toggleCustomRead(title.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Títulos añadidos */}
      {tab === 'custom' && (
        <section
          id="panel-custom"
          role="tabpanel"
          aria-labelledby="tab-custom"
          className="mt-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-brand-navy sm:text-2xl">
              Tus títulos añadidos
            </h2>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-full bg-brand-red px-6 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110"
            >
              + Añadir título
            </button>
          </div>

          {customTitles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No has añadido títulos todavía.
              </p>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="mt-4 rounded-full bg-brand-red px-6 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110"
              >
                + Añadir tu primer título
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {customTitles.map((title) => (
                <CustomCard
                  key={title.id}
                  title={title}
                  onToggleRead={() => toggleCustomRead(title.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Añade tu propio título"
      >
        <AddTitleForm onSuccess={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}

/**
 * Card for a user-created title. Shows the cover (or a placeholder), a "Leído"
 * badge when read, and a round checkmark toggle. Used in both the "Títulos
 * añadidos" tab and the "Leídos" tab.
 */
function CustomCard({
  title,
  onToggleRead,
}: {
  title: CustomTitle;
  onToggleRead: () => void;
}) {
  const read = Boolean(title.read);
  const label = read ? 'Marcar como no leído' : 'Marcar como leído';

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
        {title.coverUrl ? (
          <Image
            src={title.coverUrl}
            alt={title.title}
            fill
            unoptimized
            sizes="(min-width: 768px) 16vw, 40vw"
            className={`object-cover ${read ? 'opacity-60' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-slate-400">
            Sin portada
          </div>
        )}
        {read && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-xs font-semibold text-white">
            ✓ Leído
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold leading-snug text-brand-navy line-clamp-2">
          {title.title}
        </h3>
        <button
          type="button"
          aria-pressed={read}
          aria-label={label}
          title={label}
          onClick={onToggleRead}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
            read
              ? 'border-brand-red bg-brand-red text-white'
              : 'border-slate-300 text-slate-400 hover:border-brand-red hover:text-brand-red'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-display font-semibold text-brand-navy">
        {value}
      </dd>
    </div>
  );
}
