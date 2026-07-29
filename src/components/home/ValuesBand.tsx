interface Value {
  label: string;
  kanji: string;
}

const VALUES: Value[] = [
  { label: 'ENTRETENIMIENTO', kanji: '娯楽' },
  { label: 'EMOCIÓN', kanji: '感情' },
  { label: 'DINAMISMO', kanji: '活力' },
];

export function ValuesBand() {
  return (
    <section className="overflow-hidden bg-brand-red-light">
      <ul className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 px-6 py-8 text-brand-navy sm:flex-row sm:gap-4">
        {VALUES.map((value) => (
          <li
            key={value.label}
            className="relative flex items-center justify-center"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-bold text-brand-red opacity-25 md:text-5xl"
            >
              {value.kanji}
            </span>
            <span className="relative font-display text-sm font-bold tracking-[0.2em] md:text-base">
              {value.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
