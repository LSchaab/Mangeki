'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-brand-navy outline-none placeholder:text-slate-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red';

export default function RegistroPage() {
  const uid = useId();
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = signup(username, email, password);
    if (result.ok) {
      router.push('/mi-perfil');
      return;
    }
    setError(result.error ?? 'No se pudo crear la cuenta.');
  }

  return (
    <section className="mx-auto max-w-md px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Registro
      </h1>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-usuario`} className="font-semibold text-brand-navy">
            Usuario
          </label>
          <input
            id={`${uid}-usuario`}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            autoComplete="username"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-email`} className="font-semibold text-brand-navy">
            Email
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-password`} className="font-semibold text-brand-navy">
            Contraseña
          </label>
          <input
            id={`${uid}-password`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p role="alert" className="font-semibold text-brand-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 rounded-full bg-brand-red px-8 py-3 font-display font-semibold text-white transition hover:brightness-110"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-brand-navy">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand-red hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
