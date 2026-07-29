'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-brand-navy outline-none placeholder:text-slate-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red';

export default function LoginPage() {
  const uid = useId();
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = login(username, password);
    if (result.ok) {
      router.push('/mi-perfil');
      return;
    }
    setError(result.error ?? 'Usuario o contraseña inválidos.');
  }

  return (
    <section className="mx-auto max-w-md px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
        Iniciar sesión
      </h1>

      <div className="mt-6 rounded-md bg-brand-red-light px-5 py-4 text-sm text-brand-navy">
        🔓 Esto es una demo. Inicia sesión con — usuario:{' '}
        <code className="font-semibold">otaku123</code> · contraseña:{' '}
        <code className="font-semibold">demo1234</code>
      </div>

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
          <label htmlFor={`${uid}-password`} className="font-semibold text-brand-navy">
            Contraseña
          </label>
          <input
            id={`${uid}-password`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
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
          Iniciar sesión
        </button>
      </form>

      <p className="mt-6 text-brand-navy">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-brand-red hover:underline">
          Regístrate
        </Link>
      </p>
    </section>
  );
}
