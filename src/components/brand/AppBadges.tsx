export interface AppBadgesProps {
  className?: string;
}

function GooglePlayGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3.6 2.3a1.5 1.5 0 0 0-.5 1.1v17.2a1.5 1.5 0 0 0 .5 1.1l.1.1L13.5 12 3.7 2.2l-.1.1Z" fill="#00D0FF" />
      <path d="m17.3 15.8-3.8-3.8 3.8-3.8 4.5 2.6c1.3.7 1.3 2.5 0 3.2l-4.5 2.6Z" fill="#FFCE00" />
      <path d="M17.3 15.8 13.5 12 3.6 21.9c.5.5 1.2.5 1.9.1l11.8-6.2Z" fill="#FF3D47" />
      <path d="M3.6 2.1 13.5 12l3.8-3.8L5.5 2C4.8 1.6 4.1 1.6 3.6 2.1Z" fill="#00F076" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      aria-hidden="true"
      fill="currentColor"
      className="shrink-0 text-white"
    >
      <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.3-2c.7-1.1 1-2.2 1-2.3-.1 0-2.1-.8-2.1-3.1ZM14.5 6.8c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.5-.9 1.4-.8 2.3.9 0 1.8-.5 2.2-1.1Z" />
    </svg>
  );
}

export function AppBadges({ className = '' }: AppBadgesProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <a
        href="#"
        aria-label="Descargar en Google Play"
        className="flex items-center gap-2 rounded-md bg-black px-3 py-1.5 text-white transition hover:opacity-90"
      >
        <GooglePlayGlyph />
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[8px] uppercase tracking-wide">Disponible en</span>
          <span className="text-sm font-semibold font-display">Google Play</span>
        </span>
      </a>
      <a
        href="#"
        aria-label="Descargar en App Store"
        className="flex items-center gap-2 rounded-md bg-black px-3 py-1.5 text-white transition hover:opacity-90"
      >
        <AppleGlyph />
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[8px]">Descárgalo en el</span>
          <span className="text-sm font-semibold font-display">App Store</span>
        </span>
      </a>
    </div>
  );
}
