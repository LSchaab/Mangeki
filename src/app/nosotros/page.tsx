export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Nosotros
      </h1>

      <p className="mt-6 text-base leading-relaxed text-slate-600">
        <strong className="text-brand-navy">Mangeki</strong> es una experiencia
        de lectura de <strong>manga</strong>, <strong>manhwa</strong> y{' '}
        <strong>manhua</strong> creada por el estudio{' '}
        <strong className="text-brand-navy">Vaiven</strong>. Nace como un
        proyecto de portafolio: una interfaz cuidada, en español, para descubrir
        y organizar historias de todo el mundo.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          Nuestra misión
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Queremos que sumergirte en el fascinante mundo del manga sea sencillo
          y hermoso. Con una biblioteca que abarca diversos géneros —desde
          acción hasta romance— Mangeki busca acercarte nuevas historias y la
          riqueza cultural que hay detrás de cada obra, con un diseño que pone
          el foco en la lectura.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-brand-navy">
          La historia
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Mangeki empezó como un ejercicio de diseño e ingeniería dentro de
          Vaiven: construir un catálogo real, un sistema de marca coherente y
          una experiencia de usuario pulida de principio a fin. Hoy puedes
          explorar el catálogo, seguir a tus autores favoritos y armar tu propia
          biblioteca.
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
