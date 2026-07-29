import type { Title } from '@/data/types';
import { TitleCard, type TitleCardVariant } from '@/components/TitleCard';

interface TitleCarouselProps {
  titles: Title[];
  variant?: TitleCardVariant;
}

export function TitleCarousel({ titles, variant = 'views' }: TitleCarouselProps) {
  if (titles.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No hay nada aquí todavía.
      </p>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {titles.map((title) => (
        <div key={title.id} className="w-36 shrink-0 snap-start sm:w-40">
          <TitleCard title={title} variant={variant} />
        </div>
      ))}
    </div>
  );
}
