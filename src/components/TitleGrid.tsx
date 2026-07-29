import type { Title } from '@/data/types';
import { TitleCard, type TitleCardVariant } from '@/components/TitleCard';

interface TitleGridProps {
  titles: Title[];
  variant?: TitleCardVariant;
}

export function TitleGrid({ titles, variant = 'views' }: TitleGridProps) {
  if (titles.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No hay nada aquí todavía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {titles.map((title) => (
        <TitleCard key={title.id} title={title} variant={variant} />
      ))}
    </div>
  );
}
