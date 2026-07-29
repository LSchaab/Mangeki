'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppBadges } from '@/components/brand/AppBadges';

interface Slide {
  eyebrow: string;
  promo: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Adéntrate en el',
    promo: '¡Descarga nuestra app para mucho más!',
  },
  {
    eyebrow: 'Descubre el',
    promo: '¡Miles de mangas y manhwas te esperan!',
  },
  {
    eyebrow: 'Sumérgete en el',
    promo: '¡Lee sin conexión en cualquier momento!',
  },
  {
    eyebrow: 'Vive el',
    promo: '¡Únete a la comunidad Mangeki hoy!',
  },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];

  return (
    <section className="relative bg-brand-blue text-white overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-10 md:flex-row md:gap-12 md:py-14">
        {/* Left: hero collage */}
        <div className="relative w-full max-w-md md:w-1/2">
          <Image
            src="/brand/hero_image.png"
            alt="Universo Mangeki"
            width={640}
            height={720}
            unoptimized
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Right: tagline stack */}
        <div className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left">
          <p className="text-xl font-semibold font-display md:text-2xl">
            {slide.eyebrow}
          </p>
          <h1 className="font-display text-6xl font-extrabold leading-none tracking-tight md:text-7xl lg:text-8xl">
            <span className="block">Universo</span>{' '}
            <span className="block">Mangeki</span>
          </h1>

          <p className="mt-6 text-sm font-semibold md:text-base">
            {slide.promo}
          </p>

          <AppBadges className="mt-4 !flex-row" />
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex justify-center gap-2 pb-6" role="tablist" aria-label="Diapositivas del hero">
        {SLIDES.map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={isActive}
              className={`h-2.5 w-2.5 rounded-full transition ${
                isActive ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
