import type { Title, Author, Genre, TitleType } from '@/data/types';
import titlesJson from '@/data/titles.json';
import authorsJson from '@/data/authors.json';
import genresJson from '@/data/genres.json';

const titles = titlesJson as Title[];
const authors = authorsJson as Author[];
const genres = genresJson as Genre[];

// --- Titles ---

export function allTitles(): Title[] {
  return titles;
}

export function getTitle(id: string): Title | undefined {
  return titles.find((t) => t.id === id);
}

export function titlesByType(type: TitleType): Title[] {
  return titles.filter((t) => t.type === type);
}

// --- Genres ---

export function allGenres(): Genre[] {
  return genres;
}

export function getGenre(slug: string): Genre | undefined {
  return genres.find((g) => g.slug === slug);
}

export function titlesByGenre(slug: string): Title[] {
  return titles.filter((t) => t.genres.includes(slug));
}

// --- Authors ---

export function allAuthors(): Author[] {
  return authors;
}

export function getAuthor(id: string): Author | undefined {
  return authors.find((a) => a.id === id);
}

export function titlesByAuthor(id: string): Title[] {
  return titles.filter((t) => t.authorIds.includes(id));
}

// --- Curated / ranked lists ---

export function popularTitles(n = 12): Title[] {
  return [...titles].sort((a, b) => b.views - a.views).slice(0, n);
}

export function newestTitles(n = 12): Title[] {
  // Data is emitted in freshness order (most recently updated first); the
  // per-title `latestChapter` gives a stable secondary key.
  return [...titles]
    .sort((a, b) => (b.latestChapter ?? 0) - (a.latestChapter ?? 0))
    .slice(0, n);
}

export function trendingTitles(n = 12): Title[] {
  return [...titles]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, n);
}

export function topAuthors(n = 6): Author[] {
  return [...authors]
    .sort((a, b) => b.titleIds.length - a.titleIds.length)
    .slice(0, n);
}
