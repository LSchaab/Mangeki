'use client';

import { useId, useState, type FormEvent } from 'react';
import type { TitleType } from '@/data/types';
import { useLibrary } from '@/context/LibraryContext';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-brand-navy outline-none placeholder:text-slate-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red';

const TYPE_OPTIONS: { value: TitleType; label: string }[] = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

/**
 * Form that lets a logged-in reader add their own title to their library.
 * Géneros is a free-text, comma-separated field split into trimmed slugs.
 */
export function AddTitleForm() {
  const uid = useId();
  const { addCustom } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<TitleType>('manga');
  const [coverUrl, setCoverUrl] = useState('');
  const [genres, setGenres] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function reset() {
    setTitle('');
    setAuthor('');
    setType('manga');
    setCoverUrl('');
    setGenres('');
    setSynopsis('');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const genreList = genres
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const result = addCustom({
      title: title.trim(),
      author: author.trim(),
      type,
      coverUrl: coverUrl.trim(),
      synopsis: synopsis.trim(),
      genres: genreList,
    });

    if (result.ok) {
      reset();
      setSuccess('Añadido a tu biblioteca.');
      return;
    }
    setError(result.error ?? 'No se pudo añadir el título.');
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-titulo`} className="font-semibold text-brand-navy">
          Título
        </label>
        <input
          id={`${uid}-titulo`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-autor`} className="font-semibold text-brand-navy">
          Autor
        </label>
        <input
          id={`${uid}-autor`}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-tipo`} className="font-semibold text-brand-navy">
          Tipo
        </label>
        <select
          id={`${uid}-tipo`}
          value={type}
          onChange={(e) => setType(e.target.value as TitleType)}
          className={inputClass}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-portada`} className="font-semibold text-brand-navy">
          URL de portada
        </label>
        <input
          id={`${uid}-portada`}
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          className={inputClass}
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-generos`} className="font-semibold text-brand-navy">
          Géneros
        </label>
        <input
          id={`${uid}-generos`}
          type="text"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          className={inputClass}
          placeholder="accion, romance, aventura"
        />
        <p className="text-xs text-slate-500">Separa los géneros con comas.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-sinopsis`} className="font-semibold text-brand-navy">
          Sinopsis
        </label>
        <textarea
          id={`${uid}-sinopsis`}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="font-semibold text-brand-red">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="font-semibold text-brand-navy">
          {success}
        </p>
      )}

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-brand-red px-8 py-3 font-display font-semibold text-white transition hover:brightness-110"
      >
        Añadir título
      </button>
    </form>
  );
}
