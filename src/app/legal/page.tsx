export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Legal
      </h1>
      <p className="mt-6 text-base leading-relaxed text-slate-600">
        Mangeki es un proyecto de portafolio del estudio Vaiven, con fines
        demostrativos y sin ánimo de lucro.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          Términos de uso
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          El sitio se ofrece &laquo;tal cual&raquo;, sin garantías de
          disponibilidad ni de exactitud del contenido. Los títulos, portadas y
          metadatos del catálogo se muestran con fines ilustrativos y pertenecen
          a sus respectivos autores, editoriales y titulares de derechos. Si eres
          titular de algún derecho y deseas que un contenido no aparezca, ponte
          en contacto con nosotros.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          Privacidad
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Mangeki <strong className="text-brand-navy">no tiene servidor</strong>{' '}
          propio ni base de datos. Toda la información de tu cuenta y de tu
          biblioteca se guarda{' '}
          <strong className="text-brand-navy">
            únicamente en tu navegador
          </strong>{' '}
          mediante <code className="font-semibold">localStorage</code>, y{' '}
          <strong>nunca</strong> se transmite ni se comparte con ningún
          servicio. Si borras los datos de tu navegador, esa información se
          elimina por completo.
        </p>
      </section>
    </div>
  );
}
