import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { SocialIcons } from '@/components/brand/SocialIcons';
import { AppBadges } from '@/components/brand/AppBadges';

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Nuevo & Popular', href: '/nuevo-y-popular' },
  { label: 'Autores', href: '/autores' },
  { label: 'Mi Perfil', href: '/mi-perfil' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Géneros', href: '/generos' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-red text-white">
      {/* Seigaiha motif overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/circles_svg.svg')] bg-repeat opacity-30"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3 md:items-start">
        {/* Link column */}
        <nav aria-label="Enlaces del pie" className="flex flex-col gap-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-sm font-medium text-white transition hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center: wordmark + social */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Wordmark variant="white" className="h-10 w-auto" />
          <p className="font-display text-sm font-medium">Síguenos en redes</p>
          <SocialIcons />
        </div>

        {/* Right: app badges */}
        <div className="flex flex-col items-center gap-3 md:items-end">
          <p className="font-display text-sm font-medium">
            Descarga nuestra app
          </p>
          <AppBadges />
        </div>
      </div>

      <div className="relative border-t border-white/20">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <p className="text-xs text-white/90">
            Copyright © 2012–2026 Mangeki®. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
