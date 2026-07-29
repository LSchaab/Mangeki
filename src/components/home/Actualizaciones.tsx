import { newestTitles } from '@/data/catalog';
import { TitleCarousel } from '@/components/TitleCarousel';

export function Actualizaciones() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
        Actualizaciones
      </h2>
      <TitleCarousel titles={newestTitles()} variant="updates" />
    </section>
  );
}
