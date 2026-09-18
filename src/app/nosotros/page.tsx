export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Nosotros
      </h1>

      <p className="mt-6 text-base leading-relaxed text-slate-600">
        <strong className="text-brand-navy">Mangeki</strong> es un proyecto
        impulsado por{' '}
        <strong className="text-brand-navy">Victoria Bettaglio</strong> y{' '}
        <strong className="text-brand-navy">Lourdes Schaab</strong>. Nació de una
        frustración que compartimos con muchos lectores: casi todas las
        plataformas de manga tienen la misma limitación —{' '}
        <em>no encuentro mi manga, manhwa o manhua</em>.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          Por qué Mangeki
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Creamos Mangeki para que nadie se quede con las ganas de leer una
          historia solo porque no está en el catálogo. La idea es que{' '}
          <strong className="text-brand-navy">todos puedan aportar</strong> esas
          obras que no encontraron en otras apps, y que la comunidad haga crecer
          la biblioteca con <strong>mangas</strong>, <strong>manhwas</strong> y{' '}
          <strong>manhuas</strong> de todo el mundo.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          Un manager de lecturas
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Más que un lector, Mangeki es un{' '}
          <strong className="text-brand-navy">gestor de tus lecturas</strong>:
          un lugar para llevar el registro de{' '}
          <strong>cuántos y cuáles</strong> manhwas, mangas y manhuas ya leíste,
          armar tu propia biblioteca y no volver a perder el hilo de lo que estás
          siguiendo.
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          La lectura de capítulos dentro de la app está{' '}
          <strong className="text-brand-navy">próximamente</strong>. Mientras
          tanto, seguimos puliendo cada detalle para que la espera valga la pena.
        </p>
      </section>
    </div>
  );
}
