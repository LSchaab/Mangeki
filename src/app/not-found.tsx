import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p
        aria-hidden
        className="font-display text-7xl font-bold leading-none text-brand-red sm:text-8xl"
      >
        404
      </p>
      <h1 className="mt-6 font-display text-2xl font-bold text-brand-navy sm:text-3xl">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
        Lo sentimos, la página que buscas no existe o fue movida. Puede que el
        enlace esté roto o que la historia aún esté por publicarse.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red/90"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
