'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wordmark } from '@/components/brand/Wordmark';
import { Avatar } from '@/components/brand/Avatar';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Nosotros', href: '/nosotros' },
];

// Demo notifications — this is a portfolio showcase with no backend, so the
// bell just surfaces a few canned items so the interaction is visible.
const NOTIFICATIONS: { id: string; title: string; body: string; time: string }[] =
  [
    {
      id: 'n2',
      title: '¡Bienvenido a Mangeki!',
      body: 'Explora el catálogo y arma tu lista de leídos.',
      time: 'Ayer',
    },
    {
      id: 'n3',
      title: 'Tu autor favorito publicó algo',
      body: 'Kentaro Miura aparece en las tendencias de la semana.',
      time: 'Hace 3 días',
    },
  ];

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close the notifications dropdown when clicking outside of it.
  useEffect(() => {
    if (!notifOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [notifOpen]);

  return (
    <header className="w-full">
      {/* Tier 1: white nav bar */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <Link href="/" aria-label="Mangeki inicio" className="shrink-0">
            <Wordmark className="h-8 w-auto" priority />
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden flex-1 items-center justify-center gap-8 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-sm font-medium text-brand-navy transition hover:text-brand-red"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: account area */}
          <div className="shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    aria-label="Notificaciones"
                    aria-expanded={notifOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setNotifOpen((open) => !open);
                      setNotifSeen(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-slate-50"
                  >
                    <Image
                      src="/brand/notifications_icon.svg"
                      alt=""
                      width={28}
                      height={28}
                      unoptimized
                    />
                  </button>
                  {!notifSeen && (
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-brand-red" />
                  )}

                  {notifOpen && (
                    <div
                      role="menu"
                      aria-label="Notificaciones"
                      className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-md border border-slate-100 bg-white shadow-lg"
                    >
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="font-display text-sm font-semibold text-brand-navy">
                          Notificaciones
                        </p>
                      </div>
                      <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                        {NOTIFICATIONS.map((n) => (
                          <li
                            key={n.id}
                            className="px-4 py-3 transition hover:bg-brand-red-light/40"
                          >
                            <p className="text-sm font-semibold text-brand-navy">
                              {n.title}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-600">
                              {n.body}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {n.time}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="flex flex-col items-center gap-1 rounded-md p-1 transition hover:bg-slate-50"
                  >
                    <Avatar alt={user.username} size={40} />
                    <span className="font-display text-xs font-medium text-brand-navy">
                      {user.username}
                    </span>
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-md border border-slate-100 bg-white shadow-lg"
                    >
                      <Link
                        href="/mi-perfil"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-navy transition hover:bg-brand-red-light"
                      >
                        Mi Perfil
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-brand-red transition hover:bg-brand-red-light"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 rounded-md p-1 transition hover:bg-slate-50"
              >
                <Avatar alt="Iniciar sesión" size={40} />
                <span className="font-display text-xs font-medium text-brand-navy">
                  Ingresar
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
