export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-6 text-base leading-relaxed text-slate-600">
        ¿Tienes preguntas, comentarios o quieres saber más sobre el proyecto?
        Mangeki es obra del estudio Vaiven. Puedes conocer más sobre nuestro
        trabajo y encontrar las vías de contacto en el portafolio de Vaiven.
      </p>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        Visítanos en{' '}
        <a
          href="https://lourdesschaab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-red underline decoration-brand-red/40 underline-offset-4 transition hover:decoration-brand-red"
        >
          lourdesschaab.com
        </a>
        .
      </p>
    </div>
  );
}
