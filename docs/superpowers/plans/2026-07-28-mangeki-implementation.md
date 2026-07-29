# Mangeki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Mangeki — a manga/manhwa-reader showcase for the Vaiven portfolio — as a fully static Next.js site with a polished browsing UI, a disabled reader, and working `localStorage`-based auth, library, and user-added titles, deployed to GitHub Pages.

**Architecture:** Next.js App Router (static export) + TypeScript + Tailwind. All catalog data is pre-generated from the Jikan API into local JSON at build time. All user state (auth, saved library, custom titles) lives in the browser via `localStorage`, wrapped by a `useLocalStorage` hook and two React contexts (`AuthContext`, `LibraryContext`). No backend.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Vitest + React Testing Library · Node seed script (Jikan API) · GitHub Actions → GitHub Pages.

## Global Constraints

- **Framework:** Next.js App Router with `output: 'export'` (static export only — no server, no API routes, no runtime data fetching).
- **Language:** TypeScript throughout.
- **Styling:** Tailwind CSS.
- **No backend / no external services.** Auth, library, and custom titles use `localStorage` only. Never add Supabase/Vercel/hosted DB or auth.
- **Reader is disabled by design:** the Read control is a non-interactive `🔒 Read — Coming soon` button. Never build a functional reader.
- **Auth is demo-grade:** passwords stored plaintext in `localStorage`; a pre-seeded account `demo` / `demo1234` exists; the login page shows those credentials.
- **Catalog is seeded, not live:** `npm run seed` fetches from Jikan → writes `src/data/*.json`. Never fetch the catalog at runtime.
- **`localStorage` keys** are namespaced `mangeki.*`: `mangeki.users`, `mangeki.session`, `mangeki.library.<userId>`, `mangeki.customTitles.<userId>`.
- **SSR/static-export safety:** never touch `window`/`localStorage` during render on the server; always guard.
- **Catalog size:** 50+ titles, mixed manga and manhwa.
- **Hosting:** GitHub Pages at `mangeki.lourdesschaab.com`; served from subdomain root (no `basePath`).
- **Commits:** frequent, one per task step group as indicated.

---

## File Structure

```
mangeki/
├── CLAUDE.md                          # exists
├── next.config.mjs                    # static export config
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── package.json
├── public/
│   └── CNAME                          # mangeki.lourdesschaab.com
├── scripts/
│   └── seed.mjs                       # Jikan → src/data/*.json
├── .github/workflows/
│   └── deploy.yml                     # seed → build → deploy Pages
└── src/
    ├── app/
    │   ├── layout.tsx                 # root layout + providers + header/footer
    │   ├── globals.css                # Tailwind directives
    │   ├── page.tsx                   # Home
    │   ├── not-found.tsx              # 404
    │   ├── catalog/page.tsx
    │   ├── title/[id]/page.tsx
    │   ├── authors/page.tsx
    │   ├── authors/[id]/page.tsx
    │   ├── genres/page.tsx
    │   ├── genres/[slug]/page.tsx
    │   ├── library/page.tsx
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   ├── about/page.tsx
    │   ├── legal/page.tsx
    │   └── contact/page.tsx
    ├── data/
    │   ├── types.ts                   # shared domain types
    │   ├── titles.json                # generated
    │   ├── authors.json               # generated
    │   ├── genres.json                # generated
    │   └── catalog.ts                 # typed accessors over the JSON
    ├── lib/
    │   ├── storage.ts                 # useLocalStorage hook + safe helpers
    │   └── constants.ts               # storage keys, demo account
    ├── context/
    │   ├── AuthContext.tsx
    │   └── LibraryContext.tsx
    └── components/
        ├── Header.tsx
        ├── Footer.tsx
        ├── TitleCard.tsx
        ├── TitleGrid.tsx
        └── AddTitleForm.tsx
```

---

## Task 1: Project scaffold, Tailwind, and test harness

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Test: `src/app/__tests__/smoke.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a runnable Next.js static-export project; `npm run dev`, `npm run build`, `npm test` all work.

- [ ] **Step 1: Scaffold the app non-interactively**

Run:
```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
If the directory is non-empty (it contains `CLAUDE.md` and `docs/`), accept the prompt to proceed. If create-next-app refuses, scaffold in a temp dir and copy files in.

- [ ] **Step 2: Configure static export in `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
```

- [ ] **Step 3: Add Vitest + RTL dev deps and config**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add scripts to `package.json`**

Ensure the `scripts` block includes:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "node scripts/seed.mjs",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Write the smoke test**

`src/app/__tests__/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Hello() {
  return <h1>Mangeki</h1>;
}

describe('test harness', () => {
  it('renders a component', () => {
    render(<Hello />);
    expect(screen.getByRole('heading', { name: 'Mangeki' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests and build to verify**

Run: `npm test`
Expected: 1 passing test.

Run: `npm run build`
Expected: static export succeeds, `out/` directory produced.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static-export app with Tailwind and Vitest"
```

---

## Task 2: Domain types and the Jikan seed script

**Files:**
- Create: `src/data/types.ts`, `scripts/seed.mjs`
- Create (generated): `src/data/titles.json`, `src/data/authors.json`, `src/data/genres.json`
- Test: `scripts/__tests__/mapEntry.test.mjs`, and export the mapper from `scripts/seed.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `src/data/types.ts` exporting: `TitleType = 'manga' | 'manhwa'`; `TitleStatus = 'ongoing' | 'completed' | 'hiatus'`; and interfaces `Author { id: string; name: string; bio: string; titleIds: string[] }`, `Genre { slug: string; name: string }`, `Title { id: string; slug: string; title: string; type: TitleType; status: TitleStatus; synopsis: string; coverUrl: string; score: number | null; chapters: number | null; authorIds: string[]; genres: string[] }`, `CustomTitle { id: string; title: string; author: string; type: TitleType; coverUrl: string; synopsis: string; genres: string[]; createdAt: string }`, `User { id: string; username: string; email: string; password: string }`.
  - `scripts/seed.mjs` exporting `mapEntry(jikanEntry)` returning a `Title`-shaped plain object, plus a helper `slugify(str)`.
  - Generated JSON files: `titles.json` (array of `Title`, 50+ items), `authors.json` (array of `Author`), `genres.json` (array of `Genre`).

- [ ] **Step 1: Write `src/data/types.ts`**

```ts
export type TitleType = 'manga' | 'manhwa';
export type TitleStatus = 'ongoing' | 'completed' | 'hiatus';

export interface Author {
  id: string;
  name: string;
  bio: string;
  titleIds: string[];
}

export interface Genre {
  slug: string;
  name: string;
}

export interface Title {
  id: string;
  slug: string;
  title: string;
  type: TitleType;
  status: TitleStatus;
  synopsis: string;
  coverUrl: string;
  score: number | null;
  chapters: number | null;
  authorIds: string[];
  genres: string[]; // genre slugs
}

export interface CustomTitle {
  id: string;
  title: string;
  author: string;
  type: TitleType;
  coverUrl: string;
  synopsis: string;
  genres: string[]; // genre slugs
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // demo-grade: plaintext, intentionally insecure
}
```

- [ ] **Step 2: Write the failing mapper test**

`scripts/__tests__/mapEntry.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { mapEntry, slugify } from '../seed.mjs';

const jikan = {
  mal_id: 2,
  title: 'Berserk',
  synopsis: 'Guts, a former mercenary...',
  images: { jpg: { large_image_url: 'https://img/berserk.jpg' } },
  score: 9.47,
  status: 'Publishing',
  chapters: null,
  type: 'Manga',
  authors: [{ name: 'Miura, Kentarou' }],
  genres: [{ name: 'Action' }, { name: 'Adventure' }],
};

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Slice of Life')).toBe('slice-of-life');
  });
});

describe('mapEntry', () => {
  it('maps a Jikan manga entry to a Title', () => {
    const t = mapEntry(jikan);
    expect(t.id).toBe('2');
    expect(t.title).toBe('Berserk');
    expect(t.type).toBe('manga');
    expect(t.status).toBe('ongoing');
    expect(t.coverUrl).toBe('https://img/berserk.jpg');
    expect(t.score).toBe(9.47);
    expect(t.genres).toEqual(['action', 'adventure']);
  });

  it('maps Manhwa type to manhwa', () => {
    expect(mapEntry({ ...jikan, type: 'Manhwa' }).type).toBe('manhwa');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run scripts/__tests__/mapEntry.test.mjs`
Expected: FAIL — `seed.mjs` has no such exports yet.

- [ ] **Step 4: Implement `scripts/seed.mjs`**

```js
// scripts/seed.mjs — fetches manga/manhwa from Jikan and writes src/data/*.json
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapStatus(jikanStatus) {
  const s = String(jikanStatus || '').toLowerCase();
  if (s.includes('publishing')) return 'ongoing';
  if (s.includes('hiatus')) return 'hiatus';
  return 'completed';
}

function mapType(jikanType) {
  return String(jikanType || '').toLowerCase() === 'manhwa' ? 'manhwa' : 'manga';
}

export function mapEntry(entry) {
  return {
    id: String(entry.mal_id),
    slug: slugify(entry.title),
    title: entry.title,
    type: mapType(entry.type),
    status: mapStatus(entry.status),
    synopsis: (entry.synopsis || '').trim(),
    coverUrl: entry.images?.jpg?.large_image_url || '',
    score: typeof entry.score === 'number' ? entry.score : null,
    chapters: typeof entry.chapters === 'number' ? entry.chapters : null,
    authorIds: (entry.authors || []).map((a) => slugify(a.name)),
    genres: (entry.genres || []).map((g) => slugify(g.name)),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Jikan ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  const titlesById = new Map();
  const authorsById = new Map();
  const genresBySlug = new Map();

  // Fetch top manga (3 pages = 75) + top manhwa (2 pages) then filter/dedupe.
  const sources = [
    'https://api.jikan.moe/v4/top/manga?page=1',
    'https://api.jikan.moe/v4/top/manga?page=2',
    'https://api.jikan.moe/v4/top/manga?page=3',
    'https://api.jikan.moe/v4/manga?type=manhwa&order_by=popularity&page=1',
    'https://api.jikan.moe/v4/manga?type=manhwa&order_by=popularity&page=2',
  ];

  for (const url of sources) {
    try {
      const body = await fetchPage(url);
      for (const entry of body.data || []) {
        if (!['Manga', 'Manhwa'].includes(entry.type)) continue;
        const t = mapEntry(entry);
        if (!t.coverUrl || !t.synopsis) continue;
        titlesById.set(t.id, t);

        for (const a of entry.authors || []) {
          const id = slugify(a.name);
          if (!id) continue;
          const existing = authorsById.get(id) || { id, name: a.name.replace(/,\s*/, ' ').trim(), bio: '', titleIds: [] };
          if (!existing.titleIds.includes(t.id)) existing.titleIds.push(t.id);
          authorsById.set(id, existing);
        }
        for (const g of entry.genres || []) {
          const slug = slugify(g.name);
          if (slug) genresBySlug.set(slug, { slug, name: g.name });
        }
      }
      await sleep(600); // respect Jikan rate limit (~3 req/s)
    } catch (err) {
      console.warn(`Skipping ${url}: ${err.message}`);
    }
  }

  const titles = [...titlesById.values()];
  if (titles.length < 50) {
    throw new Error(`Only ${titles.length} titles fetched; need 50+. Re-run when Jikan is reachable.`);
  }

  // Keep only authors/genres that are referenced.
  const usedAuthorIds = new Set(titles.flatMap((t) => t.authorIds));
  const usedGenreSlugs = new Set(titles.flatMap((t) => t.genres));
  const authors = [...authorsById.values()].filter((a) => usedAuthorIds.has(a.id));
  const genres = [...genresBySlug.values()].filter((g) => usedGenreSlugs.has(g.slug));

  writeFileSync(join(DATA_DIR, 'titles.json'), JSON.stringify(titles, null, 2));
  writeFileSync(join(DATA_DIR, 'authors.json'), JSON.stringify(authors, null, 2));
  writeFileSync(join(DATA_DIR, 'genres.json'), JSON.stringify(genres, null, 2));
  console.log(`Wrote ${titles.length} titles, ${authors.length} authors, ${genres.length} genres.`);
}

// Only run main() when executed directly, not when imported by tests.
if (process.argv[1] && process.argv[1].endsWith('seed.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run scripts/__tests__/mapEntry.test.mjs`
Expected: PASS.

- [ ] **Step 6: Generate the catalog data**

Run: `npm run seed`
Expected: `Wrote N titles ...` with N ≥ 50; three JSON files populated in `src/data/`.
If Jikan is unreachable, retry; the committed JSON is the fallback for CI.

- [ ] **Step 7: Commit**

```bash
git add src/data/types.ts scripts/ src/data/titles.json src/data/authors.json src/data/genres.json
git commit -m "feat: add domain types and Jikan seed script with generated catalog"
```

---

## Task 3: Typed catalog accessors

**Files:**
- Create: `src/data/catalog.ts`
- Test: `src/data/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `types.ts`, generated JSON.
- Produces `src/data/catalog.ts` exporting:
  - `allTitles(): Title[]`
  - `getTitle(id: string): Title | undefined`
  - `allAuthors(): Author[]`
  - `getAuthor(id: string): Author | undefined`
  - `titlesByAuthor(id: string): Title[]`
  - `allGenres(): Genre[]`
  - `getGenre(slug: string): Genre | undefined`
  - `titlesByGenre(slug: string): Title[]`
  - `featuredTitles(n?: number): Title[]` (highest score first)
  - `selectionByGenre(slug: string, n?: number): { genre: Genre | undefined; titles: Title[] }`

- [ ] **Step 1: Write the failing test**

`src/data/__tests__/catalog.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  allTitles, getTitle, allAuthors, titlesByAuthor,
  allGenres, titlesByGenre, featuredTitles,
} from '../catalog';

describe('catalog accessors', () => {
  it('loads 50+ titles', () => {
    expect(allTitles().length).toBeGreaterThanOrEqual(50);
  });
  it('getTitle returns a title by id or undefined', () => {
    const first = allTitles()[0];
    expect(getTitle(first.id)?.id).toBe(first.id);
    expect(getTitle('___nope___')).toBeUndefined();
  });
  it('titlesByAuthor returns that author\'s titles', () => {
    const author = allAuthors().find((a) => a.titleIds.length > 0)!;
    const titles = titlesByAuthor(author.id);
    expect(titles.every((t) => t.authorIds.includes(author.id))).toBe(true);
  });
  it('titlesByGenre filters by genre slug', () => {
    const genre = allGenres()[0];
    expect(titlesByGenre(genre.slug).every((t) => t.genres.includes(genre.slug))).toBe(true);
  });
  it('featuredTitles is sorted by score descending', () => {
    const f = featuredTitles(5);
    const scores = f.map((t) => t.score ?? 0);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/__tests__/catalog.test.ts`
Expected: FAIL — `catalog.ts` missing.

- [ ] **Step 3: Implement `src/data/catalog.ts`**

```ts
import type { Title, Author, Genre } from './types';
import titlesJson from './titles.json';
import authorsJson from './authors.json';
import genresJson from './genres.json';

const titles = titlesJson as Title[];
const authors = authorsJson as Author[];
const genres = genresJson as Genre[];

export const allTitles = (): Title[] => titles;
export const getTitle = (id: string): Title | undefined => titles.find((t) => t.id === id);

export const allAuthors = (): Author[] => authors;
export const getAuthor = (id: string): Author | undefined => authors.find((a) => a.id === id);
export const titlesByAuthor = (id: string): Title[] => titles.filter((t) => t.authorIds.includes(id));

export const allGenres = (): Genre[] => genres;
export const getGenre = (slug: string): Genre | undefined => genres.find((g) => g.slug === slug);
export const titlesByGenre = (slug: string): Title[] => titles.filter((t) => t.genres.includes(slug));

export const featuredTitles = (n = 8): Title[] =>
  [...titles].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, n);

export const selectionByGenre = (slug: string, n = 6): { genre: Genre | undefined; titles: Title[] } => ({
  genre: getGenre(slug),
  titles: titlesByGenre(slug).slice(0, n),
});
```

Also enable JSON imports in `tsconfig.json` (`"resolveJsonModule": true` — usually already set by create-next-app).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/__tests__/catalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalog.ts src/data/__tests__/catalog.test.ts tsconfig.json
git commit -m "feat: add typed catalog accessors over seed data"
```

---

## Task 4: SSR-safe `useLocalStorage` hook and constants

**Files:**
- Create: `src/lib/constants.ts`, `src/lib/storage.ts`
- Test: `src/lib/__tests__/storage.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `src/lib/constants.ts` exporting `STORAGE_KEYS = { users: 'mangeki.users', session: 'mangeki.session', library: (userId: string) => \`mangeki.library.${userId}\`, customTitles: (userId: string) => \`mangeki.customTitles.${userId}\` }` and `DEMO_ACCOUNT = { id: 'demo', username: 'demo', email: 'demo@mangeki.app', password: 'demo1234' }`.
  - `src/lib/storage.ts` exporting `readJSON<T>(key: string, fallback: T): T`, `writeJSON<T>(key: string, value: T): void`, and a hook `useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]`. All are SSR-safe (guard `typeof window`).

- [ ] **Step 1: Write `src/lib/constants.ts`**

```ts
import type { User } from '@/data/types';

export const STORAGE_KEYS = {
  users: 'mangeki.users',
  session: 'mangeki.session',
  library: (userId: string) => `mangeki.library.${userId}`,
  customTitles: (userId: string) => `mangeki.customTitles.${userId}`,
};

export const DEMO_ACCOUNT: User = {
  id: 'demo',
  username: 'demo',
  email: 'demo@mangeki.app',
  password: 'demo1234',
};
```

- [ ] **Step 2: Write the failing test**

`src/lib/__tests__/storage.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { readJSON, writeJSON, useLocalStorage } from '../storage';

beforeEach(() => localStorage.clear());

describe('readJSON/writeJSON', () => {
  it('round-trips a value', () => {
    writeJSON('k', { a: 1 });
    expect(readJSON('k', null)).toEqual({ a: 1 });
  });
  it('returns fallback for missing or invalid data', () => {
    expect(readJSON('missing', 'fb')).toBe('fb');
    localStorage.setItem('bad', '{not json');
    expect(readJSON('bad', 'fb')).toBe('fb');
  });
});

describe('useLocalStorage', () => {
  it('reads initial and persists updates', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('nums', []));
    expect(result.current[0]).toEqual([]);
    act(() => result.current[1]([1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
    expect(readJSON('nums', [])).toEqual([1, 2]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/storage.test.tsx`
Expected: FAIL — `storage.ts` missing.

- [ ] **Step 4: Implement `src/lib/storage.ts`**

```ts
'use client';
import { useCallback, useEffect, useState } from 'react';

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota/serialization errors in demo */
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setValue(readJSON<T>(key, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (v: T) => {
      setValue(v);
      writeJSON(key, v);
    },
    [key],
  );

  return [value, set];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/storage.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat: add SSR-safe localStorage hook and storage constants"
```

---

## Task 5: AuthContext (signup / login / logout + seeded demo account)

**Files:**
- Create: `src/context/AuthContext.tsx`
- Test: `src/context/__tests__/AuthContext.test.tsx`

**Interfaces:**
- Consumes: `constants.ts`, `storage.ts`, `types.ts`.
- Produces `src/context/AuthContext.tsx` exporting:
  - `AuthProvider({ children })` — seeds `DEMO_ACCOUNT` into `mangeki.users` on first mount if absent.
  - `useAuth()` returning `{ user: User | null, signup(username, email, password): { ok: boolean; error?: string }, login(username, password): { ok: boolean; error?: string }, logout(): void }`.

- [ ] **Step 1: Write the failing test**

`src/context/__tests__/AuthContext.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
beforeEach(() => localStorage.clear());

describe('AuthContext', () => {
  it('logs in the seeded demo account', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res!: { ok: boolean };
    act(() => { res = result.current.login('demo', 'demo1234'); });
    expect(res.ok).toBe(true);
    expect(result.current.user?.username).toBe('demo');
  });

  it('rejects wrong credentials', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res!: { ok: boolean; error?: string };
    act(() => { res = result.current.login('demo', 'wrong'); });
    expect(res.ok).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('signs up a new user and prevents duplicate usernames', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { result.current.signup('alice', 'a@x.com', 'pw'); });
    expect(result.current.user?.username).toBe('alice');
    let dup!: { ok: boolean };
    act(() => { dup = result.current.signup('alice', 'b@x.com', 'pw2'); });
    expect(dup.ok).toBe(false);
  });

  it('logs out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { result.current.login('demo', 'demo1234'); });
    act(() => { result.current.logout(); });
    expect(result.current.user).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/__tests__/AuthContext.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `src/context/AuthContext.tsx`**

```tsx
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@/data/types';
import { STORAGE_KEYS, DEMO_ACCOUNT } from '@/lib/constants';
import { readJSON, writeJSON } from '@/lib/storage';

type Result = { ok: boolean; error?: string };
interface AuthValue {
  user: User | null;
  signup: (username: string, email: string, password: string) => Result;
  login: (username: string, password: string) => Result;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Seed demo account once.
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    if (!users.some((u) => u.username === DEMO_ACCOUNT.username)) {
      writeJSON(STORAGE_KEYS.users, [...users, DEMO_ACCOUNT]);
    }
    // Restore session.
    const sessionId = readJSON<string | null>(STORAGE_KEYS.session, null);
    if (sessionId) {
      const all = readJSON<User[]>(STORAGE_KEYS.users, []);
      setUser(all.find((u) => u.id === sessionId) ?? null);
    }
  }, []);

  const signup = useCallback((username: string, email: string, password: string): Result => {
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    if (!username || !email || !password) return { ok: false, error: 'All fields are required.' };
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'That username is taken.' };
    }
    const newUser: User = { id: `u_${username.toLowerCase()}`, username, email, password };
    writeJSON(STORAGE_KEYS.users, [...users, newUser]);
    writeJSON(STORAGE_KEYS.session, newUser.id);
    setUser(newUser);
    return { ok: true };
  }, []);

  const login = useCallback((username: string, password: string): Result => {
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    const found = users.find((u) => u.username === username && u.password === password);
    if (!found) return { ok: false, error: 'Invalid username or password.' };
    writeJSON(STORAGE_KEYS.session, found.id);
    setUser(found);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    writeJSON(STORAGE_KEYS.session, null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, signup, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/__tests__/AuthContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/context/__tests__/AuthContext.test.tsx
git commit -m "feat: add AuthContext with demo account, signup, login, logout"
```

---

## Task 6: LibraryContext (save / remove / add-custom, per user)

**Files:**
- Create: `src/context/LibraryContext.tsx`
- Test: `src/context/__tests__/LibraryContext.test.tsx`

**Interfaces:**
- Consumes: `AuthContext` (`useAuth`), `constants.ts`, `storage.ts`, `types.ts`.
- Produces `src/context/LibraryContext.tsx` exporting:
  - `LibraryProvider({ children })` (must render inside `AuthProvider`).
  - `useLibrary()` returning `{ savedIds: string[]; customTitles: CustomTitle[]; isSaved(id: string): boolean; save(id: string): void; remove(id: string): void; addCustom(input: Omit<CustomTitle,'id'|'createdAt'>): { ok: boolean; error?: string } }`. When no user is logged in, `savedIds`/`customTitles` are empty and `save`/`remove`/`addCustom` are no-ops returning `{ ok: false, error: 'Please log in.' }` for `addCustom`.

- [ ] **Step 1: Write the failing test**

`src/context/__tests__/LibraryContext.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { LibraryProvider, useLibrary } from '../LibraryContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider><LibraryProvider>{children}</LibraryProvider></AuthProvider>
);
beforeEach(() => localStorage.clear());

function useBoth() {
  return { auth: useAuth(), lib: useLibrary() };
}

describe('LibraryContext', () => {
  it('saves and removes titles without duplicates for a logged-in user', () => {
    const { result } = renderHook(() => useBoth(), { wrapper });
    act(() => { result.current.auth.login('demo', 'demo1234'); });
    act(() => { result.current.lib.save('2'); });
    act(() => { result.current.lib.save('2'); }); // duplicate ignored
    expect(result.current.lib.savedIds).toEqual(['2']);
    expect(result.current.lib.isSaved('2')).toBe(true);
    act(() => { result.current.lib.remove('2'); });
    expect(result.current.lib.savedIds).toEqual([]);
  });

  it('adds a custom title', () => {
    const { result } = renderHook(() => useBoth(), { wrapper });
    act(() => { result.current.auth.login('demo', 'demo1234'); });
    act(() => {
      result.current.lib.addCustom({
        title: 'My Webtoon', author: 'Me', type: 'manhwa',
        coverUrl: 'https://x/c.jpg', synopsis: 'Cool.', genres: ['action'],
      });
    });
    expect(result.current.lib.customTitles).toHaveLength(1);
    expect(result.current.lib.customTitles[0].title).toBe('My Webtoon');
  });

  it('is a no-op when logged out', () => {
    const { result } = renderHook(() => useBoth(), { wrapper });
    act(() => { result.current.lib.save('2'); });
    expect(result.current.lib.savedIds).toEqual([]);
    let res!: { ok: boolean };
    act(() => {
      res = result.current.lib.addCustom({
        title: 'X', author: 'Y', type: 'manga', coverUrl: 'u', synopsis: 's', genres: [],
      });
    });
    expect(res.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/__tests__/LibraryContext.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `src/context/LibraryContext.tsx`**

```tsx
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CustomTitle } from '@/data/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, writeJSON } from '@/lib/storage';
import { useAuth } from './AuthContext';

type Result = { ok: boolean; error?: string };
interface LibraryValue {
  savedIds: string[];
  customTitles: CustomTitle[];
  isSaved: (id: string) => boolean;
  save: (id: string) => void;
  remove: (id: string) => void;
  addCustom: (input: Omit<CustomTitle, 'id' | 'createdAt'>) => Result;
}

const LibraryContext = createContext<LibraryValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<CustomTitle[]>([]);

  // Load this user's data whenever the user changes.
  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      setCustomTitles([]);
      return;
    }
    setSavedIds(readJSON<string[]>(STORAGE_KEYS.library(user.id), []));
    setCustomTitles(readJSON<CustomTitle[]>(STORAGE_KEYS.customTitles(user.id), []));
  }, [user]);

  const save = useCallback((id: string) => {
    if (!user) return;
    setSavedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeJSON(STORAGE_KEYS.library(user.id), next);
      return next;
    });
  }, [user]);

  const remove = useCallback((id: string) => {
    if (!user) return;
    setSavedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeJSON(STORAGE_KEYS.library(user.id), next);
      return next;
    });
  }, [user]);

  const addCustom = useCallback((input: Omit<CustomTitle, 'id' | 'createdAt'>): Result => {
    if (!user) return { ok: false, error: 'Please log in.' };
    if (!input.title || !input.author) return { ok: false, error: 'Title and author are required.' };
    const item: CustomTitle = {
      ...input,
      id: `custom_${user.id}_${input.title.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
    };
    setCustomTitles((prev) => {
      const next = [...prev, item];
      writeJSON(STORAGE_KEYS.customTitles(user.id), next);
      return next;
    });
    return { ok: true };
  }, [user]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return (
    <LibraryContext.Provider value={{ savedIds, customTitles, isSaved, save, remove, addCustom }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
```

> Note: `new Date().toISOString()` runs only in a browser event handler (client), never during static export render — safe.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/__tests__/LibraryContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/LibraryContext.tsx src/context/__tests__/LibraryContext.test.tsx
git commit -m "feat: add LibraryContext for save/remove/add-custom per user"
```

---

## Task 7: Root layout, providers, Header, Footer

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Test: `src/components/__tests__/Header.test.tsx`

**Interfaces:**
- Consumes: `AuthProvider`, `LibraryProvider`, `useAuth`.
- Produces: `Header` (nav links to all top-level pages; shows "Log in" when logged out, username + "Log out" when logged in) and `Footer` ("Made by Vaiven" + Legal/Contact links). `layout.tsx` wraps all pages in `AuthProvider` → `LibraryProvider` and renders Header/Footer.

- [ ] **Step 1: Write the failing test**

`src/components/__tests__/Header.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import Header from '../Header';

beforeEach(() => localStorage.clear());

describe('Header', () => {
  it('shows the brand and a login link when logged out', () => {
    render(<AuthProvider><Header /></AuthProvider>);
    expect(screen.getByText('Mangeki')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catalog/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/Header.test.tsx`
Expected: FAIL — `Header` missing.

- [ ] **Step 3: Implement `Header.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/catalog', label: 'Catalog' },
  { href: '/genres', label: 'Genres' },
  { href: '/authors', label: 'Authors' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-red-500">Mangeki</Link>
        <ul className="hidden gap-4 text-sm text-neutral-300 sm:flex">
          {NAV.map((n) => (
            <li key={n.href}><Link href={n.href} className="hover:text-white">{n.label}</Link></li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/library" className="hover:text-white">My Library</Link>
              <span className="text-neutral-400">@{user.username}</span>
              <button onClick={logout} className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700">Log out</button>
            </>
          ) : (
            <Link href="/login" className="rounded bg-red-600 px-3 py-1 font-medium hover:bg-red-500">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Implement `Footer.tsx`**

```tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800 py-8 text-sm text-neutral-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between">
        <p>Made by <span className="font-semibold text-neutral-200">Vaiven</span> · Mangeki is a portfolio demo.</p>
        <div className="flex gap-4">
          <Link href="/legal" className="hover:text-white">Legal</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Wire providers in `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mangeki — Manga & Manhwa Reader',
  description: 'A manga/manhwa reader showcase by Vaiven studio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <AuthProvider>
          <LibraryProvider>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

Ensure `globals.css` keeps the Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/Header.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.tsx src/components/Footer.tsx src/app/layout.tsx src/app/globals.css src/components/__tests__/Header.test.tsx
git commit -m "feat: add root layout with providers, header, and footer"
```

---

## Task 8: TitleCard and TitleGrid components

**Files:**
- Create: `src/components/TitleCard.tsx`, `src/components/TitleGrid.tsx`
- Test: `src/components/__tests__/TitleCard.test.tsx`

**Interfaces:**
- Consumes: `Title` type, `next/link`, `next/image` (with `unoptimized`).
- Produces:
  - `TitleCard({ title }: { title: Title })` — links to `/title/[id]`, shows cover, title, type badge.
  - `TitleGrid({ titles }: { titles: Title[] })` — responsive grid of `TitleCard`; shows an empty-state message when `titles` is empty.

- [ ] **Step 1: Write the failing test**

`src/components/__tests__/TitleCard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TitleCard from '../TitleCard';
import TitleGrid from '../TitleGrid';
import type { Title } from '@/data/types';

const t: Title = {
  id: '2', slug: 'berserk', title: 'Berserk', type: 'manga', status: 'ongoing',
  synopsis: 'Guts.', coverUrl: 'https://img/b.jpg', score: 9.4, chapters: null,
  authorIds: ['miura-kentarou'], genres: ['action'],
};

describe('TitleCard', () => {
  it('links to the detail page and shows the title', () => {
    render(<TitleCard title={t} />);
    const link = screen.getByRole('link', { name: /berserk/i });
    expect(link).toHaveAttribute('href', '/title/2');
    expect(screen.getByText(/manga/i)).toBeInTheDocument();
  });
});

describe('TitleGrid', () => {
  it('shows an empty state when there are no titles', () => {
    render(<TitleGrid titles={[]} />);
    expect(screen.getByText(/nothing here/i)).toBeInTheDocument();
  });
  it('renders a card per title', () => {
    render(<TitleGrid titles={[t]} />);
    expect(screen.getByRole('link', { name: /berserk/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/TitleCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `TitleCard.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Title } from '@/data/types';

export default function TitleCard({ title }: { title: Title }) {
  return (
    <Link href={`/title/${title.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-neutral-800">
        {title.coverUrl && (
          <Image
            src={title.coverUrl}
            alt={title.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 45vw, 200px"
            className="object-cover transition group-hover:scale-105"
          />
        )}
        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-200">
          {title.type}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-neutral-100 group-hover:text-white">{title.title}</p>
    </Link>
  );
}
```

- [ ] **Step 4: Implement `TitleGrid.tsx`**

```tsx
import type { Title } from '@/data/types';
import TitleCard from './TitleCard';

export default function TitleGrid({ titles }: { titles: Title[] }) {
  if (titles.length === 0) {
    return <p className="py-12 text-center text-neutral-400">Nothing here yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {titles.map((t) => <TitleCard key={t.id} title={t} />)}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/TitleCard.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/TitleCard.tsx src/components/TitleGrid.tsx src/components/__tests__/TitleCard.test.tsx
git commit -m "feat: add TitleCard and TitleGrid components"
```

---

## Task 9: Home page (hero, featured, "Our Selection")

**Files:**
- Create: `src/app/page.tsx`
- Test: `src/app/__tests__/home.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`featuredTitles`, `selectionByGenre`, `allGenres`), `TitleGrid`.
- Produces: the Home route `/`.

- [ ] **Step 1: Write the failing test**

`src/app/__tests__/home.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders the hero and the Our Selection section', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/our selection/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/__tests__/home.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/page.tsx`**

```tsx
import Link from 'next/link';
import TitleGrid from '@/components/TitleGrid';
import { featuredTitles, selectionByGenre, allGenres } from '@/data/catalog';

export default function Home() {
  const featured = featuredTitles(10);
  // Pick the first genre as the curated selection category.
  const selectionSlug = allGenres()[0]?.slug ?? '';
  const selection = selectionByGenre(selectionSlug, 6);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-red-700/30 to-neutral-900 p-8 sm:p-12">
        <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
          Read manga & manhwa, beautifully.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-300">
          Mangeki is a reading experience by Vaiven studio. Browse the catalog, build your library,
          and add your own titles.
        </p>
        <Link href="/catalog" className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 font-medium hover:bg-red-500">
          Browse the catalog
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Featured</h2>
        <TitleGrid titles={featured} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">
          Our Selection{selection.genre ? ` from ${selection.genre.name}` : ''}
        </h2>
        <TitleGrid titles={selection.titles} />
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/__tests__/home.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/__tests__/home.test.tsx
git commit -m "feat: add home page with hero, featured, and our selection"
```

---

## Task 10: Catalog page with filters

**Files:**
- Create: `src/app/catalog/page.tsx`
- Test: `src/app/catalog/__tests__/catalog.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`allTitles`, `allGenres`), `TitleGrid`.
- Produces: `/catalog` — a client component with genre + type filters over `allTitles()`.

- [ ] **Step 1: Write the failing test**

`src/app/catalog/__tests__/catalog.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalog from '../page';

describe('Catalog', () => {
  it('renders titles and filters by type', async () => {
    render(<Catalog />);
    expect(screen.getByRole('heading', { name: /catalog/i })).toBeInTheDocument();
    // type filter present
    const manhwaBtn = screen.getByRole('button', { name: /manhwa/i });
    await userEvent.click(manhwaBtn);
    expect(manhwaBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/catalog/__tests__/catalog.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/catalog/page.tsx`**

```tsx
'use client';
import { useMemo, useState } from 'react';
import TitleGrid from '@/components/TitleGrid';
import { allTitles, allGenres } from '@/data/catalog';
import type { TitleType } from '@/data/types';

type TypeFilter = 'all' | TitleType;

export default function Catalog() {
  const titles = allTitles();
  const genres = allGenres();
  const [type, setType] = useState<TypeFilter>('all');
  const [genre, setGenre] = useState<string>('all');

  const filtered = useMemo(
    () => titles.filter((t) =>
      (type === 'all' || t.type === type) &&
      (genre === 'all' || t.genres.includes(genre))),
    [titles, type, genre],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catalog</h1>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'manga', 'manhwa'] as TypeFilter[]).map((t) => (
          <button
            key={t}
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${type === t ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
          >
            {t}
          </button>
        ))}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="ml-2 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
        >
          <option value="all">All genres</option>
          {genres.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
      </div>

      <p className="text-sm text-neutral-400">{filtered.length} titles</p>
      <TitleGrid titles={filtered} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/catalog/__tests__/catalog.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/catalog/
git commit -m "feat: add catalog page with type and genre filters"
```

---

## Task 11: Title Detail page (disabled reader + save button)

**Files:**
- Create: `src/app/title/[id]/page.tsx`, `src/app/title/[id]/SaveButton.tsx`, `src/app/title/[id]/ReadButton.tsx`
- Test: `src/app/title/__tests__/detail.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`allTitles`, `getTitle`, `getAuthor`), `useLibrary`, `useAuth`.
- Produces: `/title/[id]` static route. `generateStaticParams` returns every title id. Server component renders the title; interactive `SaveButton` and `ReadButton` are client components.
  - `ReadButton()` — renders a disabled `🔒 Read — Coming soon` button (no props).
  - `SaveButton({ titleId }: { titleId: string })` — Save/Saved toggle; when logged out, links to `/login`.

- [ ] **Step 1: Write the failing test**

`src/app/title/__tests__/detail.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadButton from '../[id]/ReadButton';
import SaveButton from '../[id]/SaveButton';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';

const wrap = (ui: React.ReactNode) => <AuthProvider><LibraryProvider>{ui}</LibraryProvider></AuthProvider>;
beforeEach(() => localStorage.clear());

describe('Title Detail buttons', () => {
  it('renders a disabled Read button', () => {
    render(<ReadButton />);
    const btn = screen.getByRole('button', { name: /read — coming soon/i });
    expect(btn).toBeDisabled();
  });

  it('shows a Log in to save link when logged out', () => {
    render(wrap(<SaveButton titleId="2" />));
    expect(screen.getByRole('link', { name: /log in to save/i })).toHaveAttribute('href', '/login');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/title/__tests__/detail.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `ReadButton.tsx`**

```tsx
'use client';
export default function ReadButton() {
  return (
    <button
      disabled
      aria-disabled="true"
      className="cursor-not-allowed rounded-lg bg-neutral-800 px-5 py-2.5 font-medium text-neutral-500"
      title="Reading is coming soon"
    >
      🔒 Read — Coming soon
    </button>
  );
}
```

- [ ] **Step 4: Implement `SaveButton.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

export default function SaveButton({ titleId }: { titleId: string }) {
  const { user } = useAuth();
  const { isSaved, save, remove } = useLibrary();

  if (!user) {
    return (
      <Link href="/login" className="rounded-lg bg-neutral-800 px-5 py-2.5 font-medium hover:bg-neutral-700">
        Log in to save
      </Link>
    );
  }
  const saved = isSaved(titleId);
  return (
    <button
      onClick={() => (saved ? remove(titleId) : save(titleId))}
      className={`rounded-lg px-5 py-2.5 font-medium ${saved ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-600 hover:bg-red-500'}`}
    >
      {saved ? '✓ In your library' : '+ Save to library'}
    </button>
  );
}
```

- [ ] **Step 5: Implement `src/app/title/[id]/page.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allTitles, getTitle, getAuthor, getGenre } from '@/data/catalog';
import ReadButton from './ReadButton';
import SaveButton from './SaveButton';

export function generateStaticParams() {
  return allTitles().map((t) => ({ id: t.id }));
}

export default async function TitleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = getTitle(id);
  if (!title) notFound();

  const authors = title.authorIds.map(getAuthor).filter(Boolean);
  return (
    <article className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-lg bg-neutral-800 md:w-full">
        {title.coverUrl && <Image src={title.coverUrl} alt={title.title} fill unoptimized className="object-cover" />}
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{title.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
          <span className="capitalize">{title.type}</span>
          <span>·</span>
          <span className="capitalize">{title.status}</span>
          {title.score != null && (<><span>·</span><span>★ {title.score}</span></>)}
        </div>
        <p className="text-neutral-300">{title.synopsis}</p>

        {authors.length > 0 && (
          <p className="text-sm text-neutral-400">
            By{' '}
            {authors.map((a, i) => (
              <span key={a!.id}>
                {i > 0 && ', '}
                <Link href={`/authors/${a!.id}`} className="text-red-400 hover:underline">{a!.name}</Link>
              </span>
            ))}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {title.genres.map((slug) => (
            <Link key={slug} href={`/genres/${slug}`} className="rounded-full bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700">
              {getGenre(slug)?.name ?? slug}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <ReadButton />
          <SaveButton titleId={title.id} />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/app/title/__tests__/detail.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/title/
git commit -m "feat: add title detail page with disabled reader and save button"
```

---

## Task 12: Authors directory and profile pages

**Files:**
- Create: `src/app/authors/page.tsx`, `src/app/authors/[id]/page.tsx`
- Test: `src/app/authors/__tests__/authors.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`allAuthors`, `getAuthor`, `titlesByAuthor`), `TitleGrid`.
- Produces: `/authors` (directory) and `/authors/[id]` (profile with `generateStaticParams`).

- [ ] **Step 1: Write the failing test**

`src/app/authors/__tests__/authors.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthorsIndex from '../page';

describe('Authors index', () => {
  it('lists authors', () => {
    render(<AuthorsIndex />);
    expect(screen.getByRole('heading', { name: /authors/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/authors/__tests__/authors.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/authors/page.tsx`**

```tsx
import Link from 'next/link';
import { allAuthors } from '@/data/catalog';

export default function AuthorsIndex() {
  const authors = [...allAuthors()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Authors</h1>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {authors.map((a) => (
          <li key={a.id}>
            <Link href={`/authors/${a.id}`} className="flex items-center justify-between rounded-lg bg-neutral-900 px-4 py-3 hover:bg-neutral-800">
              <span>{a.name}</span>
              <span className="text-sm text-neutral-400">{a.titleIds.length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/app/authors/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import TitleGrid from '@/components/TitleGrid';
import { allAuthors, getAuthor, titlesByAuthor } from '@/data/catalog';

export function generateStaticParams() {
  return allAuthors().map((a) => ({ id: a.id }));
}

export default async function AuthorProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{author.name}</h1>
      {author.bio && <p className="max-w-2xl text-neutral-300">{author.bio}</p>}
      <h2 className="text-xl font-semibold">Titles</h2>
      <TitleGrid titles={titlesByAuthor(author.id)} />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/app/authors/__tests__/authors.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/authors/
git commit -m "feat: add authors directory and profile pages"
```

---

## Task 13: Genres directory and per-genre pages

**Files:**
- Create: `src/app/genres/page.tsx`, `src/app/genres/[slug]/page.tsx`
- Test: `src/app/genres/__tests__/genres.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`allGenres`, `getGenre`, `titlesByGenre`), `TitleGrid`.
- Produces: `/genres` and `/genres/[slug]` (with `generateStaticParams`).

- [ ] **Step 1: Write the failing test**

`src/app/genres/__tests__/genres.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GenresIndex from '../page';

describe('Genres index', () => {
  it('lists genres', () => {
    render(<GenresIndex />);
    expect(screen.getByRole('heading', { name: /genres/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/genres/__tests__/genres.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/genres/page.tsx`**

```tsx
import Link from 'next/link';
import { allGenres, titlesByGenre } from '@/data/catalog';

export default function GenresIndex() {
  const genres = [...allGenres()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Genres</h1>
      <div className="flex flex-wrap gap-3">
        {genres.map((g) => (
          <Link key={g.slug} href={`/genres/${g.slug}`} className="rounded-full bg-neutral-900 px-4 py-2 hover:bg-neutral-800">
            {g.name} <span className="text-sm text-neutral-500">{titlesByGenre(g.slug).length}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/app/genres/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import TitleGrid from '@/components/TitleGrid';
import { allGenres, getGenre, titlesByGenre } from '@/data/catalog';

export function generateStaticParams() {
  return allGenres().map((g) => ({ slug: g.slug }));
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = getGenre(slug);
  if (!genre) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{genre.name}</h1>
      <TitleGrid titles={titlesByGenre(genre.slug)} />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/app/genres/__tests__/genres.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/genres/
git commit -m "feat: add genres directory and per-genre pages"
```

---

## Task 14: Login and Sign-up pages (with demo disclaimer)

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Test: `src/app/login/__tests__/login.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `next/navigation` `useRouter`.
- Produces: `/login` (shows demo credentials disclaimer, logs in, redirects to `/library` on success, shows error on failure) and `/signup` (registers + redirects to `/library`).

- [ ] **Step 1: Write the failing test**

`src/app/login/__tests__/login.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../page';
import { AuthProvider } from '@/context/AuthContext';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(() => localStorage.clear());

describe('Login', () => {
  it('shows the demo credentials disclaimer', () => {
    render(<AuthProvider><Login /></AuthProvider>);
    expect(screen.getByText(/demo/i)).toBeInTheDocument();
    expect(screen.getByText(/demo1234/)).toBeInTheDocument();
  });

  it('shows an error on invalid login', async () => {
    render(<AuthProvider><Login /></AuthProvider>);
    await userEvent.type(screen.getByLabelText(/username/i), 'nobody');
    await userEvent.type(screen.getByLabelText(/password/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/login/__tests__/login.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/login/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(username, password);
    if (res.ok) router.push('/library');
    else setError(res.error ?? 'Login failed.');
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">
        🔓 This is a demo. Log in with — username: <code className="font-mono">demo</code> · password:{' '}
        <code className="font-mono">demo1234</code>
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm text-neutral-300">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-neutral-300">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-medium hover:bg-red-500">Log in</button>
      </form>
      <p className="text-sm text-neutral-400">
        No account? <Link href="/signup" className="text-red-400 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/app/signup/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = signup(username, email, password);
    if (res.ok) router.push('/library');
    else setError(res.error ?? 'Sign-up failed.');
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <p className="text-sm text-neutral-400">Demo accounts are stored only in your browser.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm text-neutral-300">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-neutral-300">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-neutral-300">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-red-600 py-2 font-medium hover:bg-red-500">Create account</button>
      </form>
      <p className="text-sm text-neutral-400">
        Have an account? <Link href="/login" className="text-red-400 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/app/login/__tests__/login.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/ src/app/signup/
git commit -m "feat: add login and signup pages with demo credentials disclaimer"
```

---

## Task 15: My Library page (auth-gated) + AddTitleForm

**Files:**
- Create: `src/components/AddTitleForm.tsx`, `src/app/library/page.tsx`
- Test: `src/components/__tests__/AddTitleForm.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `useLibrary`, `catalog.ts` (`getTitle`), `allGenres`, `TitleGrid`/`TitleCard`.
- Produces:
  - `AddTitleForm()` — form calling `addCustom`; shows validation errors; clears on success.
  - `/library` — if logged out, shows a prompt + login link; if logged in, shows saved titles (mapped from ids via `getTitle`), the user's custom titles, and `AddTitleForm`.

- [ ] **Step 1: Write the failing test**

`src/components/__tests__/AddTitleForm.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LibraryProvider, useLibrary } from '@/context/LibraryContext';
import AddTitleForm from '../AddTitleForm';

function Harness() {
  const { login } = useAuth();
  const { customTitles } = useLibrary();
  return (
    <div>
      <button onClick={() => login('demo', 'demo1234')}>do-login</button>
      <span data-testid="count">{customTitles.length}</span>
      <AddTitleForm />
    </div>
  );
}
const wrap = () => <AuthProvider><LibraryProvider><Harness /></LibraryProvider></AuthProvider>;
beforeEach(() => localStorage.clear());

describe('AddTitleForm', () => {
  it('validates required fields', async () => {
    render(wrap());
    await userEvent.click(screen.getByText('do-login'));
    await userEvent.click(screen.getByRole('button', { name: /add title/i }));
    expect(await screen.findByText(/title and author are required/i)).toBeInTheDocument();
  });

  it('adds a custom title on valid submit', async () => {
    render(wrap());
    await userEvent.click(screen.getByText('do-login'));
    await userEvent.type(screen.getByLabelText(/title/i), 'My Webtoon');
    await userEvent.type(screen.getByLabelText(/author/i), 'Me');
    await userEvent.click(screen.getByRole('button', { name: /add title/i }));
    expect(await screen.findByTestId('count')).toHaveTextContent('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/AddTitleForm.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/AddTitleForm.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import type { TitleType } from '@/data/types';

const EMPTY = { title: '', author: '', type: 'manga' as TitleType, coverUrl: '', synopsis: '', genres: '' };

export default function AddTitleForm() {
  const { addCustom } = useLibrary();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);
    const res = addCustom({
      title: form.title.trim(),
      author: form.author.trim(),
      type: form.type,
      coverUrl: form.coverUrl.trim(),
      synopsis: form.synopsis.trim(),
      genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
    });
    if (res.ok) { setForm(EMPTY); setError(''); setOk(true); }
    else setError(res.error ?? 'Could not add title.');
  }

  const field = (k: keyof typeof EMPTY) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
    className: 'mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2',
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-neutral-800 p-4">
      <h3 className="font-semibold">Add your own title</h3>
      <div>
        <label htmlFor="ct-title" className="block text-sm text-neutral-300">Title</label>
        <input id="ct-title" {...field('title')} />
      </div>
      <div>
        <label htmlFor="ct-author" className="block text-sm text-neutral-300">Author</label>
        <input id="ct-author" {...field('author')} />
      </div>
      <div>
        <label htmlFor="ct-type" className="block text-sm text-neutral-300">Type</label>
        <select id="ct-type" {...field('type')}>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
        </select>
      </div>
      <div>
        <label htmlFor="ct-cover" className="block text-sm text-neutral-300">Cover image URL</label>
        <input id="ct-cover" {...field('coverUrl')} />
      </div>
      <div>
        <label htmlFor="ct-genres" className="block text-sm text-neutral-300">Genres (comma-separated)</label>
        <input id="ct-genres" {...field('genres')} />
      </div>
      <div>
        <label htmlFor="ct-syn" className="block text-sm text-neutral-300">Synopsis</label>
        <textarea id="ct-syn" {...field('synopsis')} rows={3} />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {ok && <p className="text-sm text-green-400">Added to your library.</p>}
      <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-500">Add title</button>
    </form>
  );
}
```

- [ ] **Step 4: Implement `src/app/library/page.tsx`**

```tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { getTitle } from '@/data/catalog';
import TitleGrid from '@/components/TitleGrid';
import AddTitleForm from '@/components/AddTitleForm';

export default function Library() {
  const { user } = useAuth();
  const { savedIds, customTitles, remove } = useLibrary();

  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold">My Library</h1>
        <p className="text-neutral-400">Log in to save titles and add your own.</p>
        <Link href="/login" className="inline-block rounded-lg bg-red-600 px-5 py-2.5 font-medium hover:bg-red-500">Log in</Link>
      </div>
    );
  }

  const saved = savedIds.map(getTitle).filter(Boolean) as NonNullable<ReturnType<typeof getTitle>>[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-4 text-3xl font-bold">Saved titles</h1>
        <div className="space-y-2">
          <TitleGrid titles={saved} />
          {saved.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2 text-sm">
              {saved.map((t) => (
                <li key={t.id}>
                  <button onClick={() => remove(t.id)} className="rounded bg-neutral-800 px-2 py-1 text-neutral-300 hover:bg-neutral-700">
                    Remove “{t.title}”
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Your added titles</h2>
        {customTitles.length === 0 ? (
          <p className="text-neutral-400">You haven’t added any titles yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {customTitles.map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-neutral-800">
                  {c.coverUrl && <Image src={c.coverUrl} alt={c.title} fill unoptimized className="object-cover" />}
                </div>
                <p className="line-clamp-2 text-sm font-medium">{c.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTitleForm />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/AddTitleForm.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/library/ src/components/AddTitleForm.tsx src/components/__tests__/AddTitleForm.test.tsx
git commit -m "feat: add my library page with saved titles and add-your-own form"
```

---

## Task 16: About, Legal, Contact, and 404 pages

**Files:**
- Create: `src/app/about/page.tsx`, `src/app/legal/page.tsx`, `src/app/contact/page.tsx`, `src/app/not-found.tsx`
- Test: `src/app/__tests__/static-pages.test.tsx`

**Interfaces:**
- Consumes: nothing (static content).
- Produces: `/about`, `/legal`, `/contact`, and the custom 404.

- [ ] **Step 1: Write the failing test**

`src/app/__tests__/static-pages.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from '../about/page';
import NotFound from '../not-found';

describe('static pages', () => {
  it('About renders the mission', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /about mangeki/i })).toBeInTheDocument();
  });
  it('404 renders a not-found message and a home link', () => {
    render(<NotFound />);
    expect(screen.getByText(/couldn’t find/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/__tests__/static-pages.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/app/about/page.tsx`**

```tsx
export default function About() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl">
      <h1>About Mangeki</h1>
      <p>
        Mangeki is a manga and manhwa reading experience crafted by <strong>Vaiven</strong>, an
        independent design &amp; development studio. It began as a portfolio project: a place to
        explore what a focused, beautiful reading app could feel like.
      </p>
      <h2>Our mission</h2>
      <p>
        Put the stories first. Clean browsing, thoughtful discovery, and a library that’s yours —
        without clutter. Reading itself is coming soon; for now, explore the catalog, build your
        library, and add your own titles.
      </p>
      <h2>The story so far</h2>
      <p>
        Mangeki is an evolving demo. The catalog is powered by open manga metadata, and the whole
        experience runs right in your browser.
      </p>
    </article>
  );
}
```

- [ ] **Step 4: Implement `legal`, `contact`, and `not-found`**

`src/app/legal/page.tsx`:
```tsx
export default function Legal() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl">
      <h1>Legal</h1>
      <p>Mangeki is a non-commercial portfolio demo by Vaiven studio. Catalog metadata and cover
        images are sourced from public manga databases and belong to their respective owners.</p>
      <h2>Privacy</h2>
      <p>Mangeki has no server. Your account and library are stored only in your own browser via
        <code> localStorage</code> and are never transmitted anywhere.</p>
    </article>
  );
}
```

`src/app/contact/page.tsx`:
```tsx
export default function Contact() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl">
      <h1>Contact</h1>
      <p>Mangeki is made by <strong>Vaiven</strong>. For inquiries about this project or the studio,
        reach out via the portfolio at <a href="https://lourdesschaab.com">lourdesschaab.com</a>.</p>
    </article>
  );
}
```

`src/app/not-found.tsx`:
```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-7xl font-black text-red-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-neutral-400">We couldn’t find that page. It may have moved or never existed.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 font-medium hover:bg-red-500">
        Back home
      </Link>
    </div>
  );
}
```

> Note: the 404 test matches text via the "Back home" link (`name: /home/i`) and the "couldn’t find" copy above. Keep that copy in sync with the test.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/app/__tests__/static-pages.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/about/ src/app/legal/ src/app/contact/ src/app/not-found.tsx src/app/__tests__/static-pages.test.tsx
git commit -m "feat: add about, legal, contact, and custom 404 pages"
```

---

## Task 17: Static export verification, CNAME, and GitHub Actions deploy

**Files:**
- Create: `public/CNAME`, `.github/workflows/deploy.yml`, `.nojekyll` handling (via workflow)
- Test: full build + full test suite (verification task; no unit test file)

**Interfaces:**
- Consumes: everything.
- Produces: a deployable static site and CI that seeds → builds → deploys to GitHub Pages.

- [ ] **Step 1: Add the custom-domain file**

`public/CNAME` (single line, no trailing content):
```
mangeki.lourdesschaab.com
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests across all tasks pass.

- [ ] **Step 3: Run a full static build**

Run: `npm run build`
Expected: build succeeds; `out/` contains `index.html`, `catalog/`, `title/<id>/`, `authors/<id>/`, `genres/<slug>/`, `login/`, `signup/`, `library/`, `about/`, `legal/`, `contact/`, `404.html`, and `CNAME`.
If any dynamic route errors on `generateStaticParams`, fix the offending page before proceeding.

- [ ] **Step 4: Write the deploy workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy Mangeki to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      # Refresh the catalog; if Jikan is unreachable, the committed JSON is used.
      - run: npm run seed || echo "Seed failed; using committed catalog JSON."
      - run: npm test
      - run: npm run build
      - run: touch out/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Document the one manual DNS step**

Add to `CLAUDE.md` deployment section (or a `docs/DEPLOY.md`): the repo owner must, once:
1. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. At the DNS host for `lourdesschaab.com`: add a `CNAME` record `mangeki` → `<github-username>.github.io`.
3. Push to `main`; the workflow builds and deploys; `mangeki.lourdesschaab.com` goes live after DNS propagates.

- [ ] **Step 6: Commit**

```bash
git add public/CNAME .github/workflows/deploy.yml CLAUDE.md
git commit -m "ci: add GitHub Pages deploy workflow and custom domain CNAME"
```

---

## Self-Review

**1. Spec coverage:**
- Overview/goals → Tasks 1–17 (whole app). ✔
- Sitemap: Home (T9), Catalog (T10), Title Detail (T11), Authors (T12), Genres (T13), Library (T15), Login/Signup (T14), About/Legal/Contact/404 (T16). ✔
- Functional auth + demo account + disclaimer → T5, T14. ✔
- Save/remove library, no stats → T6, T11, T15. ✔
- Add-your-own titles → T6, T15. ✔
- Auth-gating → T11 (SaveButton), T15 (Library). ✔
- Disabled reader → T11 (ReadButton). ✔
- Jikan seed → JSON, 50+ titles → T2. ✔
- localStorage schema + SSR-safe hook + contexts → T4, T5, T6. ✔
- Static export + CNAME + Actions → T1 config, T17. ✔
- Testing (Vitest + RTL) → every task. ✔
- Non-goals honored (no reader, no backend, no runtime API) → constraints + T11/T17. ✔

**2. Placeholder scan:** No "TBD/TODO"; every code step has real code. ✔

**3. Type consistency:** `Title`/`Author`/`Genre`/`CustomTitle`/`User` defined once in T2 and reused. Accessor names (`allTitles`, `getTitle`, `titlesByAuthor`, `titlesByGenre`, `featuredTitles`, `selectionByGenre`, `allGenres`, `getGenre`, `getAuthor`, `allAuthors`) consistent across T3, T9–T16. Context APIs (`useAuth` → `{user, signup, login, logout}`; `useLibrary` → `{savedIds, customTitles, isSaved, save, remove, addCustom}`) consistent across T5, T6, T11, T14, T15. Storage keys/`DEMO_ACCOUNT` from T4 used in T5/T6. ✔

**Note on Next.js version:** Task 11/12/13 use `params: Promise<{...}>` (Next 15+). If create-next-app installs Next 14, change these to `params: { id: string }` (synchronous) and drop the `await`. Verify the installed Next major after Task 1 and apply consistently.
