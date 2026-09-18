'use client';

import { useId, useState, type FormEvent } from 'react';
import type { TitleType } from '@/data/types';
import { allGenres } from '@/data/catalog';
import { useLibrary } from '@/context/LibraryContext';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-brand-navy outline-none placeholder:text-slate-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red';

const TYPE_OPTIONS: { value: TitleType; label: string }[] = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

interface AddTitleFormProps {
  /** Called after a title is added successfully (e.g. to close a modal). */
  onSuccess?: () => void;
}

/**
 * Form that lets a logged-in reader add their own title to their library.
 * Géneros is a free-text, comma-separated field split into trimmed slugs.
 */
export function AddTitleForm({ onSuccess }: AddTitleFormProps = {}) {
  const uid = useId();
  const { addCustom } = useLibrary();

  const genreOptions = allGenres();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<TitleType>('manga');
  const [coverUrl, setCoverUrl] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [synopsis, setSynopsis] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function reset() {
    setTitle('');
    setAuthor('');
    setType('manga');
    setCoverUrl('');
    setGenres([]);
    setSynopsis('');
  }

  function toggleGenre(slug: string) {
    setGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = addCustom({
      title: title.trim(),
      author: author.trim(),
      type,
      coverUrl: coverUrl.trim(),
      synopsis: synopsis.trim(),
      genres,
    });

    if (result.ok) {
      reset();
      setSuccess('Añadido a tu biblioteca.');
      onSuccess?.();
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

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold text-brand-navy">Géneros</legend>
        <p className="text-xs text-slate-500">
          Toca para elegir los que quieras.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {genreOptions.map((genre) => {
            const selected = genres.includes(genre.slug);
            return (
              <button
                key={genre.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleGenre(genre.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? 'border-brand-red bg-brand-red text-white'
                    : 'border-slate-300 bg-white text-brand-navy hover:border-brand-red hover:text-brand-red'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </fieldset>

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
