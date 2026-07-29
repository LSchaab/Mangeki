'use client';

import { useId, useState, type FormEvent } from 'react';

const CATEGORIES = ['Cómic', 'Manga', 'Manhwa', 'Manhua'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pillInputClass =
  'w-full rounded-full bg-white px-5 py-3 text-brand-navy shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-red';

export function Newsletter() {
  const uid = useId();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);

    if (nombre.trim() === '') {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Ingresa un correo válido.');
      return;
    }

    // Static site: nothing is stored or sent anywhere (spec §3.5).
    setError('');
    setSuccess(true);
    setNombre('');
    setApellido('');
    setEmail('');
    setCategories([]);
  }

  return (
    <section className="bg-brand-blue text-white">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          ¡Subscríbete a nuestro Newsletter!
        </h2>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-nombre`} className="font-semibold">
              Nombre:
            </label>
            <input
              id={`${uid}-nombre`}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={pillInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-apellido`} className="font-semibold">
              Apellido:
            </label>
            <input
              id={`${uid}-apellido`}
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className={pillInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-email`} className="font-semibold">
              E-Mail:
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={pillInputClass}
            />
          </div>

          <fieldset className="mt-2">
            <legend className="mb-3 text-center font-semibold">
              ¿Sobre qué tipo de lectura quieres recibir información?
            </legend>
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex cursor-pointer items-center gap-2 rounded-md bg-brand-navy/40 px-4 py-2"
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="h-4 w-4 accent-brand-red"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-center font-semibold text-brand-red-light">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-center font-semibold text-white">
              ¡Gracias por suscribirte!
            </p>
          )}

          <div className="mt-2 flex justify-center">
            <button
              type="submit"
              className="w-full max-w-xs rounded-full bg-brand-red px-8 py-3 font-display font-semibold text-white transition hover:brightness-110"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
