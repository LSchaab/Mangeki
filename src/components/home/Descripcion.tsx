import { Wordmark } from '@/components/brand/Wordmark';

export function Descripcion() {
  return (
    <section className="relative overflow-hidden bg-brand-red text-white">
      {/* Seigaiha motif overlay (decorative) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/brand/circles_svg.svg')] bg-[length:220px] bg-repeat opacity-20"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center md:py-20">
        <Wordmark variant="white" className="h-auto w-56 md:w-72" />

        <p className="mt-10 text-base leading-relaxed md:text-lg">
          <strong>Mangeki,</strong> la aplicación de lectura de{' '}
          <strong>manga definitiva</strong>, ofrece a los usuarios una
          experiencia <strong>inmersiva</strong> en el fascinante mundo del
          manga. Con una amplia biblioteca que abarca diversos géneros, desde
          acción hasta romance, Mangeki garantiza{' '}
          <strong>actualizaciones regulares</strong> y la posibilidad de
          descargar tus mangas favoritos para leer{' '}
          <strong>en cualquier momento</strong>. Únete a una comunidad
          apasionada, descubre nuevas historias y sumérgete en la riqueza
          cultural del manga con Mangeki.
        </p>
      </div>
    </section>
  );
}
