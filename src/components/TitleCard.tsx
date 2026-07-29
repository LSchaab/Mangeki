import Link from 'next/link';
import Image from 'next/image';
import type { Title } from '@/data/types';
import { viewsLabel, scoreOutOf10 } from '@/lib/format';

export type TitleCardVariant = 'views' | 'updates';

interface TitleCardProps {
  title: Title;
  variant?: TitleCardVariant;
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-brand-red"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function TitleCard({ title, variant = 'views' }: TitleCardProps) {
  return (
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
        <span className="absolute right-1.5 top-1.5 rounded-md bg-brand-navy/85 px-1.5 py-0.5 text-xs font-semibold text-white">
          {scoreOutOf10(title.score)}
        </span>
      </div>

      <h3 className="font-display text-sm font-semibold leading-snug text-brand-navy line-clamp-2 group-hover:text-brand-red">
        {title.title}
      </h3>

      {variant === 'views' ? (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>{viewsLabel(title.views)} Vistas</span>
          <EyeIcon />
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Cap.{title.latestChapter} · {title.updatedAgo}
        </p>
      )}
    </Link>
  );
}
