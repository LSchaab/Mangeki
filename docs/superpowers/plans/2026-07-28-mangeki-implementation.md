# Mangeki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Mangeki — a Spanish-language manga/manhwa/manhua-reader showcase for the Vaiven portfolio — as a fully static Next.js site that reproduces the provided landing screenshots, with a disabled reader and working `localStorage`-based auth, library, and user-added titles, deployed to GitHub Pages.

**Architecture:** Next.js App Router (static export) + TypeScript + Tailwind. Catalog data is pre-generated from the Jikan API into local JSON at build time. All user state (auth, library, custom titles) lives in `localStorage` via a `useLocalStorage` hook and two contexts (`AuthContext`, `LibraryContext`). No backend. UI is in Spanish and uses the Vaiven brand palette.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · `next/font` · Vitest + React Testing Library · Node seed script (Jikan) · GitHub Actions → GitHub Pages.

**Design source of truth:** spec `docs/superpowers/specs/2026-07-27-mangeki-design.md` (esp. §8) and screenshots in `resources/screenshots/` (`landing-01-hero`, `-02-trending-updates`, `-03-authors`, `-04-newsletter-footer`).

## Global Constraints

- **Framework:** Next.js App Router, `output: 'export'` (no server, no API routes, no runtime data fetching).
- **Language:** TypeScript. **UI copy: Spanish.** Catalog title names stay original.
- **Styling:** Tailwind with brand tokens — `brand-blue #556FA0`, `brand-red #E7403B`, `brand-red-light #FFDADA`, `brand-navy #1F2D52`, `surface #FFFFFF`. Light UI on white.
- **No backend / external services.** Auth, library, custom titles use `localStorage` only.
- **Reader disabled:** the "Leer" control is a non-interactive `🔒 Leer — Próximamente` button.
- **Auth demo-grade:** plaintext passwords in `localStorage`; pre-seeded account `otaku123` / `demo1234`; login page shows those credentials.
- **Newsletter & notifications are decorative** (no backend). Newsletter validates + shows a success message; nothing is stored.
- **Categories:** data/filters use `manga` / `manhwa` / `manhua`. `Cómic` is a newsletter checkbox only (no seeded titles).
- **`localStorage` keys** (`mangeki.*`): `mangeki.users`, `mangeki.session`, `mangeki.library.<userId>`, `mangeki.customTitles.<userId>`.
- **SSR/static-export safety:** never touch `window`/`localStorage` during server render.
- **Catalog size:** 50+ titles across manga/manhwa/manhua.
- **Hosting:** GitHub Pages at `mangeki.lourdesschaab.com` (subdomain root, no `basePath`).
- **Brand assets:** in `public/brand/` (moved from `resources/`). Recreate placeholder assets (Mangeki wordmark, panda avatar via `profile_icon.svg`, app-store badges, social icons) as code/SVG — swappable later.
- **Commits:** frequent, one per task step group.

### Route & label map (apply to every task)

| Concept | Route | Spanish label |
|---|---|---|
| Home | `/` | Home |
| About | `/nosotros` | Nosotros |
| Discovery | `/nuevo-y-popular` | Nuevo & Popular |
| Authors | `/autores`, `/autores/[id]` | Autores |
| Catalog | `/catalogo` | Catálogo |
| Genres | `/generos`, `/generos/[slug]` | Géneros |
| Title detail | `/titulo/[id]` | — |
| Library | `/mi-perfil` | Mi Perfil |
| Login | `/login` | Iniciar sesión |
| Sign-up | `/registro` | Registro |
| Legal | `/legal` | Legal |
| Contact | `/contacto` | Contacto |
| Save button | — | Guardar / ✓ En tu biblioteca |
| Read button | — | 🔒 Leer — Próximamente |

---

## File Structure

```
mangeki/
├── next.config.mjs · tailwind.config.ts · postcss.config.mjs · tsconfig.json
├── vitest.config.ts · vitest.setup.ts · package.json
├── public/
│   ├── CNAME
│   └── brand/  (hero_image.png, circles_svg.svg, cloud_svg.svg, search_icon.svg,
│                notifications_icon.svg, profile_icon.svg)
├── scripts/seed.mjs
├── .github/workflows/deploy.yml
└── src/
    ├── app/
    │   ├── layout.tsx · globals.css · page.tsx (Home) · not-found.tsx
    │   ├── nosotros/page.tsx
    │   ├── nuevo-y-popular/page.tsx
    │   ├── catalogo/page.tsx
    │   ├── titulo/[id]/page.tsx (+ LeerButton.tsx, GuardarButton.tsx)
    │   ├── autores/page.tsx · autores/[id]/page.tsx
    │   ├── generos/page.tsx · generos/[slug]/page.tsx
    │   ├── mi-perfil/page.tsx
    │   ├── login/page.tsx · registro/page.tsx
    │   ├── legal/page.tsx · contacto/page.tsx
    ├── data/  types.ts · catalog.ts · titles.json · authors.json · genres.json
    ├── lib/  storage.ts · constants.ts · format.ts
    ├── context/  AuthContext.tsx · LibraryContext.tsx
    ├── components/
    │   ├── brand/  Wordmark.tsx · AppBadges.tsx · SocialIcons.tsx · Avatar.tsx
    │   ├── Header.tsx · Footer.tsx
    │   ├── TitleCard.tsx · TitleGrid.tsx · TitleCarousel.tsx
    │   └── home/  Hero.tsx · Descripcion.tsx · ValuesBand.tsx · Tendencias.tsx ·
    │              Actualizaciones.tsx · TopAutores.tsx · Newsletter.tsx
```

---

## Task 1: Scaffold, brand tokens, assets, test harness

**Files:** `package.json`, `next.config.mjs`, `tailwind.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `src/app/globals.css`, move `resources/*`→`public/brand/`.
**Interfaces:** Consumes nothing. Produces a runnable static-export project; `dev`/`build`/`test` work; brand tokens + fonts available.

- [ ] **Step 1: Scaffold**

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
Accept proceeding in the non-empty dir (contains `CLAUDE.md`, `docs/`, `resources/`).

- [ ] **Step 2: Static export config — `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = { output: 'export', trailingSlash: true, images: { unoptimized: true } };
export default nextConfig;
```

- [ ] **Step 3: Brand tokens + fonts**

In `tailwind.config.ts` → `theme.extend.colors`:
```ts
colors: { brand: { blue: '#556FA0', red: '#E7403B', 'red-light': '#FFDADA', navy: '#1F2D52' } },
```
In `src/app/layout.tsx`, load fonts via `next/font/google` (Poppins for display, Inter for body) and expose as CSS variables (wired fully in Task 8).

- [ ] **Step 4: Move brand assets**

```bash
mkdir -p public/brand
git mv resources/hero_image.png public/brand/
git mv resources/circles_svg.svg public/brand/
git mv resources/cloud_svg.svg public/brand/
git mv resources/search_icon.svg public/brand/
git mv resources/notifications_icon.svg public/brand/
git mv resources/profile_icon.svg public/brand/
```
(Leave `resources/screenshots/` in place as design reference.)

- [ ] **Step 5: Vitest + RTL**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
```
`vitest.setup.ts`: `import '@testing-library/jest-dom/vitest';`

- [ ] **Step 6: `package.json` scripts** — `dev`, `build`, `start`, `lint`, `"seed": "node scripts/seed.mjs"`, `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 7: Smoke test** — `src/app/__tests__/smoke.test.tsx` renders a trivial component; `npm test` passes; `npm run build` produces `out/`.

- [ ] **Step 8: Commit** — `chore: scaffold static-export app with brand tokens, fonts, and assets`

---

## Task 2: Brand placeholder components (Wordmark, Avatar, AppBadges, SocialIcons)

**Files:** `src/components/brand/{Wordmark,Avatar,AppBadges,SocialIcons}.tsx`; test `src/components/brand/__tests__/brand.test.tsx`.
**Interfaces:** Produces —
- `Wordmark({ variant?: 'color' | 'white', className? })` — the Mangeki logo (red "M" mark + "angeki"; `white` renders all-white for red/blue backgrounds).
- `Avatar({ src?, alt, size? })` — round avatar; defaults to `/brand/profile_icon.svg`.
- `AppBadges({ className? })` — Google Play + App Store badge SVGs (non-functional `<span>`/links).
- `SocialIcons({ className? })` — Facebook/Instagram/X round icons (non-functional).

- [ ] **Step 1: Failing test** — assert `Wordmark` renders text "angeki"/accessible name "Mangeki"; `AppBadges` renders "Google Play" and "App Store"; `SocialIcons` renders 3 items with aria-labels (Facebook, Instagram, X).

- [ ] **Step 2: Run — FAIL** (`npx vitest run src/components/brand/__tests__/brand.test.tsx`).

- [ ] **Step 3: Implement.** `Wordmark` = an inline SVG "M" mark in `currentColor` + styled "angeki"; wrapper sets `text-brand-red`/`text-white` by variant and an `aria-label="Mangeki"`. `Avatar` = `next/image` (unoptimized) rounded. `AppBadges` = two dark rounded badges with the store name + "DISPONIBLE EN"/"Descárgalo en el" caption. `SocialIcons` = three `aria-label`ed round buttons with simple inline SVGs. Match screenshot styling (see `landing-01-hero`, `landing-04-newsletter-footer`).

- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add brand placeholder components (wordmark, avatar, badges, social)`

---

## Task 3: Domain types + Jikan seed script

**Files:** `src/data/types.ts`, `scripts/seed.mjs`, generated `src/data/{titles,authors,genres}.json`; test `scripts/__tests__/mapEntry.test.mjs`.
**Interfaces:** Produces `types.ts` with:
```
TitleType='manga'|'manhwa'|'manhua'; TitleStatus='ongoing'|'completed'|'hiatus';
Title{ id,slug,title,type,status,synopsis,coverUrl,score:number|null,chapters:number|null,
       views:number, latestChapter:number|null, updatedAgo:string, authorIds:string[], genres:string[] }
Author{ id,name,bio,photoUrl,titleIds:string[] }
Genre{ slug,name }
CustomTitle{ id,title,author,type,coverUrl,synopsis,genres:string[],createdAt }
User{ id,username,email,password }
```
and `seed.mjs` exporting `slugify(s)`, `mapEntry(jikanEntry, index)`.

- [ ] **Step 1: Write `types.ts`** with the interfaces above.

- [ ] **Step 2: Failing test** for `mapEntry`/`slugify`:
```js
import { describe, it, expect } from 'vitest';
import { mapEntry, slugify } from '../seed.mjs';
const jikan = { mal_id: 2, title: 'Berserk', synopsis: 'Guts...', images:{jpg:{large_image_url:'https://i/b.jpg'}},
  score: 9.47, status: 'Publishing', chapters: null, type: 'Manhwa',
  authors:[{name:'Miura, Kentarou'}], genres:[{name:'Action'}] };
it('slugify', () => expect(slugify('Slice of Life')).toBe('slice-of-life'));
it('maps type/status/score/genres and derives cosmetic fields', () => {
  const t = mapEntry(jikan, 0);
  expect(t.type).toBe('manhwa');
  expect(t.status).toBe('ongoing');
  expect(t.genres).toEqual(['action']);
  expect(typeof t.views).toBe('number');       // derived, deterministic
  expect(typeof t.updatedAgo).toBe('string');
});
```

- [ ] **Step 3: Run — FAIL.**

- [ ] **Step 4: Implement `seed.mjs`.** Same structure as a standard Node fetch script:
  - `slugify`, `mapStatus` (Publishing→ongoing, Hiatus→hiatus, else completed), `mapType` (manhwa/manhua/else manga).
  - `mapEntry(entry, index)` returns the `Title` shape; derive **cosmetic** fields deterministically (NO randomness): `views = Math.round((entry.score ?? 5) * 20000 + (entry.members ?? 0) / 10)`; `latestChapter = entry.chapters ?? (50 + (index % 150))`; `updatedAgo` cycles a fixed array `['Hace 2 horas','Hace 20 min.','Hace 50 min.','Hace 5 min.','Hace 1 día']` by `index % 5`.
  - `main()` fetches `top/manga` pages 1–3 + `manga?type=manhwa` + `manga?type=manhua` (600ms between calls), keeps `Manga|Manhwa|Manhua` with cover+synopsis, dedupes, builds authors (from `entry.authors`, `photoUrl:''` placeholder) and genres, requires ≥50 titles, writes the three JSON files.
  - Guard `main()` to run only when executed directly (not on import).

- [ ] **Step 5: Run — PASS**, then `npm run seed` → `Wrote N titles…` (N≥50). Retry if Jikan is down.

- [ ] **Step 6: Commit** — `feat: add domain types and Jikan seed script (manga/manhwa/manhua)`

---

## Task 4: Catalog accessors + formatting helpers

**Files:** `src/data/catalog.ts`, `src/lib/format.ts`; test `src/data/__tests__/catalog.test.ts`.
**Interfaces:** `catalog.ts` exports `allTitles`, `getTitle(id)`, `titlesByType(t)`, `allGenres`, `getGenre(slug)`, `titlesByGenre(slug)`, `allAuthors`, `getAuthor(id)`, `titlesByAuthor(id)`, `popularTitles(n?)` (by views desc), `newestTitles(n?)` (by latestChapter/updatedAgo order), `trendingTitles(n?)` (by score desc), `topAuthors(n?)` (by titleIds length). `format.ts` exports `viewsLabel(n)` → `"196k"`, `scoreOutOf10(s)` → `"8/10"|"—"`.

- [ ] **Step 1: Failing test** — 50+ titles; `getTitle` by id/undefined; `titlesByType('manhua')` all manhua; `popularTitles(5)` sorted by views desc; `topAuthors(6)` length ≤6 sorted by title count; `viewsLabel(196000)==='196k'`; `scoreOutOf10(9.47)==='9/10'`.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** `catalog.ts` (typed imports of the JSON, filter/sort helpers) and `format.ts`.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add catalog accessors and formatting helpers`

---

## Task 5: `useLocalStorage` + constants

*(unchanged in logic from prior plan; demo account username is `otaku123`.)*

**Files:** `src/lib/constants.ts`, `src/lib/storage.ts`; test `src/lib/__tests__/storage.test.tsx`.
**Interfaces:** `constants.ts` → `STORAGE_KEYS` (`users`,`session`,`library(id)`,`customTitles(id)`) and `DEMO_ACCOUNT = { id:'otaku123', username:'otaku123', email:'otaku123@mangeki.app', password:'demo1234' }`. `storage.ts` → `readJSON`, `writeJSON`, `useLocalStorage` (SSR-safe).

- [ ] TDD steps as in the storage spec: failing test (round-trip + fallback + hook persist) → implement SSR-safe helpers/hook → pass → commit `feat: add SSR-safe localStorage hook and constants`.

---

## Task 6: AuthContext (demo `otaku123` + signup/login/logout)

**Files:** `src/context/AuthContext.tsx`; test alongside.
**Interfaces:** `AuthProvider`, `useAuth()` → `{ user, signup(username,email,password), login(username,password), logout() }`, results `{ ok, error? }`. Seeds `DEMO_ACCOUNT` on first mount; restores session.

- [ ] TDD: failing tests (login demo `otaku123`/`demo1234` ok; wrong creds fail; signup + duplicate-username block; logout) → implement (as in the auth spec, Spanish error strings: "Usuario o contraseña inválidos.", "Ese usuario ya existe.", "Todos los campos son obligatorios.") → pass → commit `feat: add AuthContext with demo account`.

---

## Task 7: LibraryContext (save/remove/add-custom per user)

**Files:** `src/context/LibraryContext.tsx`; test alongside.
**Interfaces:** `LibraryProvider` (inside `AuthProvider`), `useLibrary()` → `{ savedIds, customTitles, isSaved(id), save(id), remove(id), addCustom(input) }`. Logged-out → empty + no-ops; `addCustom` returns `{ ok:false, error:'Inicia sesión.' }`.

- [ ] TDD: failing tests (save/dedupe/remove for logged-in demo; addCustom; logged-out no-op) → implement → pass → commit `feat: add LibraryContext`.

---

## Task 8: Root layout, fonts, two-tier Header, Footer

**Files:** `src/components/Header.tsx`, `src/components/Footer.tsx`; modify `src/app/layout.tsx`, `globals.css`; test `src/components/__tests__/Header.test.tsx`.
**Interfaces:** `layout.tsx` wraps pages in `AuthProvider`→`LibraryProvider`, applies fonts, renders `Header`/`Footer`. Header = **two tiers** per spec §8.3: (1) white bar: `Wordmark` + nav (Home, Nosotros, Nuevo & Popular, Autores) + `Avatar`+username (→ `/login` logged out; menu with "Mi Perfil"/"Cerrar sesión" logged in); (2) welcome bar: "¡Bienvenidx, <username>!" + search input + `/brand/search_icon.svg` + `/brand/notifications_icon.svg`. Footer per §8.3 (links, white `Wordmark`, `SocialIcons`, `AppBadges`, copyright), `brand-red` bg with `circles_svg` overlay.

- [ ] **Step 1: Failing test** — Header shows "Mangeki", nav link "Nuevo & Popular", and (logged out) a link to `/login`; welcome bar renders a "Buscar…" input.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** Header (client component; `useAuth` for username/menu), Footer, and wire providers + fonts in `layout.tsx`. Use brand tokens; match screenshots `landing-01-hero` (header) and `landing-04-newsletter-footer` (footer).
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add layout, two-tier header, and footer`

---

## Task 9: TitleCard (variants), TitleGrid, TitleCarousel

**Files:** `src/components/{TitleCard,TitleGrid,TitleCarousel}.tsx`; test `src/components/__tests__/TitleCard.test.tsx`.
**Interfaces:**
- `TitleCard({ title, variant='views' })` where `variant: 'views' | 'updates'`. Shows cover, **X/10** score badge (top-right, via `scoreOutOf10`), title, and footer: views (`<viewsLabel> Vistas` + red eye icon) or updates (`Cap.<latestChapter> · <updatedAgo>`). Links to `/titulo/[id]`.
- `TitleGrid({ titles, variant? })` — responsive grid; empty state "No hay nada aquí todavía.".
- `TitleCarousel({ titles, variant? })` — horizontal scroll row (scroll-snap) used by the Home carousels.

- [ ] **Step 1: Failing test** — card links to `/titulo/2`, shows "9/10" and (views variant) "…Vistas"; updates variant shows "Cap."; grid empty state renders.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** all three (eye icon inline SVG in `brand-red`; score badge dark pill). Match `landing-02-trending-updates`.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add title card (views/updates variants), grid, and carousel`

---

## Task 10: Home — Hero carousel

**Files:** `src/components/home/Hero.tsx`; test alongside.
**Interfaces:** `Hero()` — `brand-blue` section; `/brand/hero_image.png` left; right: "Adéntrate en el" + large white "Universo Mangeki" + "¡Descarga nuestra app para mucho más!" + `AppBadges` + **carousel dots** (3–4 slides via client state; slides may swap the tagline/featured promo). Match `landing-01-hero`.

- [ ] **Step 1: Failing test** — renders heading "Universo Mangeki", `AppBadges`, and N dot buttons (aria-labels "Ir a la diapositiva k"); clicking a dot sets `aria-current`.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** client carousel (state index, dots, transform). Keep slides simple (tagline variants + hero image).
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add home hero carousel`

---

## Task 11: Home — Descripción block + Values band

**Files:** `src/components/home/Descripcion.tsx`, `src/components/home/ValuesBand.tsx`; test alongside.
**Interfaces:** `Descripcion()` — `brand-red` + `circles_svg` overlay; centered white `Wordmark variant="white"` + the paragraph (exact copy from `landing-01-hero`: "Mangeki, la aplicación de lectura de manga definitiva, ofrece…"). `ValuesBand()` — `brand-red-light`; three items ENTRETENIMIENTO/EMOCIÓN/DINAMISMO with faint red kanji overlays.

- [ ] TDD: failing test (Descripción renders "Mangeki" wordmark + text "lectura de manga definitiva"; ValuesBand renders the three words) → implement (color+cropped-SVG pattern, `overflow-hidden`) → pass → commit `feat: add home description block and values band`.

---

## Task 12: Home — Tendencias + Actualizaciones

**Files:** `src/components/home/Tendencias.tsx`, `src/components/home/Actualizaciones.tsx`; test alongside.
**Interfaces:** `Tendencias()` — heading "Tendencias" + "Semana"/"Filtro" dropdowns (functional-ish: filter the row by period is cosmetic, genre `Filtro` filters by genre) + `TitleCarousel variant="views"` from `popularTitles`/`trendingTitles`. `Actualizaciones()` — heading "Actualizaciones" + `TitleCarousel variant="updates"` from `newestTitles`.

- [ ] TDD: failing test (Tendencias renders heading + at least one card link to `/titulo/…`; Actualizaciones renders "Actualizaciones" + a "Cap." card) → implement (dropdowns as `<select>` with red chevrons; `Filtro` filters by genre) → pass → commit `feat: add home tendencias and actualizaciones carousels`.

---

## Task 13: Home — Top Autores

**Files:** `src/components/home/TopAutores.tsx`; test alongside.
**Interfaces:** `TopAutores()` — `brand-red-light` section; heading "Top Autores 2023"; 6 cards from `topAuthors(6)`. Card = round grayscale `Avatar` (author `photoUrl` or placeholder) with `circles_svg` seigaiha behind top-left, name (navy), red dot, navy "Leer más" button → `/autores/[id]`. Match `landing-03-authors`.

- [ ] TDD: failing test (renders "Top Autores 2023" and 6 "Leer más" links to `/autores/…`) → implement (grid 2×3; seigaiha via absolutely-positioned clipped SVG) → pass → commit `feat: add home top autores section`.

---

## Task 14: Home — Newsletter + assemble the Home page

**Files:** `src/components/home/Newsletter.tsx`, `src/app/page.tsx`; tests alongside.
**Interfaces:** `Newsletter()` — `brand-blue`; "¡Subscríbete a nuestro Newsletter!" + Nombre/Apellido/E-Mail pill inputs + 4 checkboxes (Cómic/Manga/Manhwa/Manhua) + red "Enviar". Client-side validation (email format, name required); on submit shows "¡Gracias por suscribirte!" and clears. **Nothing stored** (§3.5). `page.tsx` composes: `Hero → Descripcion → ValuesBand → Tendencias → Actualizaciones → TopAutores → Newsletter` (Header/Footer come from layout).

- [ ] **Step 1: Failing test** — Newsletter shows the four category checkboxes; submitting an invalid email shows an error; valid submit shows "¡Gracias por suscribirte!". Home page renders "Universo Mangeki" and "Tendencias".
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** Newsletter (controlled form) and assemble `page.tsx`.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `feat: add newsletter section and assemble home landing`

---

## Task 15: Nuevo & Popular page

**Files:** `src/app/nuevo-y-popular/page.tsx`; test alongside.
**Interfaces:** `/nuevo-y-popular` (client) — two sections: "Popular" (`popularTitles`, grid, `variant='views'`) and "Nuevos" (`newestTitles`, grid, `variant='updates'`), with type + genre filters (reuse the Catálogo filter UI). Links to Catálogo & Géneros.

- [ ] TDD: failing test (renders "Popular" and "Nuevos" headings + cards; type filter toggles `aria-pressed`) → implement → pass → commit `feat: add nuevo y popular discovery page`.

---

## Task 16: Catálogo page (filters)

**Files:** `src/app/catalogo/page.tsx`; test alongside.
**Interfaces:** `/catalogo` (client) — full `TitleGrid` over `allTitles` with type (manga/manhwa/manhua) + genre filters; count label "<n> títulos". Spanish labels.

- [ ] TDD: failing test (heading "Catálogo"; type filter "Manhua" toggles `aria-pressed=true`; count updates) → implement → pass → commit `feat: add catalogo page with type and genre filters`.

---

## Task 17: Título detalle (disabled Leer + Guardar)

**Files:** `src/app/titulo/[id]/page.tsx`, `LeerButton.tsx`, `GuardarButton.tsx`; test `src/app/titulo/__tests__/detalle.test.tsx`.
**Interfaces:** `/titulo/[id]` with `generateStaticParams` over all title ids. `LeerButton()` = disabled `🔒 Leer — Próximamente`. `GuardarButton({ titleId })` = Guardar/✓ toggle; logged-out → link "Inicia sesión para guardar" → `/login`. Page shows cover, título, tipo/estado/★score, sinopsis, author links (`/autores/[id]`), genre chips (`/generos/[slug]`), and the two buttons.

- [ ] TDD: failing test (LeerButton disabled with name /Leer — Próximamente/; GuardarButton logged-out shows link to `/login`) → implement (server page + `await params`; client buttons) → pass → commit `feat: add titulo detalle with disabled reader and guardar`.

---

## Task 18: Autores directory + profile

**Files:** `src/app/autores/page.tsx`, `src/app/autores/[id]/page.tsx`; test alongside.
**Interfaces:** `/autores` (sorted directory with title counts) and `/autores/[id]` (`generateStaticParams`; name, bio if any, grayscale avatar, `TitleGrid` of their titles). Spanish.

- [ ] TDD: failing test (index heading "Autores" + links) → implement → pass → commit `feat: add autores directory and profile pages`.

---

## Task 19: Géneros directory + per-genre

**Files:** `src/app/generos/page.tsx`, `src/app/generos/[slug]/page.tsx`; test alongside.
**Interfaces:** `/generos` (chips with counts) and `/generos/[slug]` (`generateStaticParams`; `TitleGrid`). Spanish heading "Géneros".

- [ ] TDD: failing test (index heading "Géneros" + links) → implement → pass → commit `feat: add generos directory and per-genre pages`.

---

## Task 20: Iniciar sesión + Registro (demo disclaimer)

**Files:** `src/app/login/page.tsx`, `src/app/registro/page.tsx`; test `src/app/login/__tests__/login.test.tsx`.
**Interfaces:** `/login` — shows the disclaimer "🔓 Esto es una demo. Inicia sesión con — usuario: `otaku123` · contraseña: `demo1234`", logs in, redirects to `/mi-perfil`, shows Spanish error on failure. `/registro` — registers + redirects to `/mi-perfil`. Mock `next/navigation` `useRouter` in tests.

- [ ] TDD: failing test (disclaimer shows `otaku123`/`demo1234`; invalid login shows "Usuario o contraseña inválidos.") → implement (labels: Usuario, Contraseña, Email; button "Iniciar sesión"/"Crear cuenta") → pass → commit `feat: add login and registro pages with demo disclaimer`.

---

## Task 21: Mi Perfil (library) + AddTitleForm

**Files:** `src/components/AddTitleForm.tsx`, `src/app/mi-perfil/page.tsx`; test `src/components/__tests__/AddTitleForm.test.tsx`.
**Interfaces:** `AddTitleForm()` — Spanish fields (Título, Autor, Tipo[manga/manhwa/manhua], URL de portada, Géneros, Sinopsis); calls `addCustom`; validation ("Título y autor son obligatorios."); success "Añadido a tu biblioteca."; clears on success. `/mi-perfil` — logged-out → prompt + `/login` link; logged-in → saved titles (`getTitle` map) with remove buttons, custom titles grid, and `AddTitleForm`.

- [ ] TDD: failing test (login via harness; empty submit → "Título y autor son obligatorios."; valid submit increments custom count) → implement → pass → commit `feat: add mi perfil library page and add-your-own form`.

---

## Task 22: Nosotros, Legal, Contacto, 404

**Files:** `src/app/nosotros/page.tsx`, `src/app/legal/page.tsx`, `src/app/contacto/page.tsx`, `src/app/not-found.tsx`; test `src/app/__tests__/static-pages.test.tsx`.
**Interfaces:** Static Spanish content. `/nosotros` = the "Nosotros" story/mission (reuse the description-block copy). `/legal` = términos + privacidad (note: no server, data stays in the browser). `/contacto` = contact via `lourdesschaab.com`. `not-found` = "404 · Página no encontrada" + "Volver al inicio" → `/`.

- [ ] TDD: failing test (Nosotros heading; 404 shows "Página no encontrada" + link home to `/`) → implement → pass → commit `feat: add nosotros, legal, contacto, and 404`.

---

## Task 23: Static build verify, CNAME, GitHub Actions deploy

**Files:** `public/CNAME`, `.github/workflows/deploy.yml`; verification (no unit test).

- [ ] **Step 1:** `public/CNAME` = `mangeki.lourdesschaab.com`.
- [ ] **Step 2:** `npm test` — all pass.
- [ ] **Step 3:** `npm run build` — succeeds; `out/` contains all routes (`/`, `/nosotros/`, `/nuevo-y-popular/`, `/catalogo/`, `/titulo/<id>/`, `/autores/<id>/`, `/generos/<slug>/`, `/mi-perfil/`, `/login/`, `/registro/`, `/legal/`, `/contacto/`, `404.html`, `CNAME`). Fix any `generateStaticParams` errors.
- [ ] **Step 4:** `.github/workflows/deploy.yml` — checkout → setup-node 20 → `npm ci` → `npm run seed || echo "using committed catalog"` → `npm test` → `npm run build` → `touch out/.nojekyll` → `upload-pages-artifact` (path `out`) → `deploy-pages`. Permissions `pages: write`, `id-token: write`; trigger on push to `main` + `workflow_dispatch`.
- [ ] **Step 5:** Document the owner's one-time manual steps (Settings→Pages→Source: GitHub Actions; DNS `CNAME mangeki → <user>.github.io`).
- [ ] **Step 6: Commit** — `ci: add GitHub Pages deploy workflow and custom domain CNAME`

---

## Self-Review

**1. Spec coverage:**
- Language Spanish + route/label map → Global Constraints + every task. ✔
- Sitemap incl. Nuevo & Popular, Catálogo, Géneros, Mi Perfil, Nosotros → T15, T16, T19, T21, T22, T18. ✔
- Home landing sections (hero carousel, descripción, values, tendencias, actualizaciones, top autores, newsletter) → T10–T14. ✔
- Two-tier header + footer + brand components → T2, T8. ✔
- Card variants (views/updates) + score badge + carousel → T9. ✔
- Data model incl. manhua/views/latestChapter/updatedAgo/author photoUrl → T3; accessors → T4. ✔
- Auth (otaku123) / library / add-your-own / auth-gating → T5–T7, T17, T20, T21. ✔
- Disabled reader → T17. Newsletter demo → T14. Categories 3+Cómic → T3/T14/T16. ✔
- Static export + CNAME + Actions → T1, T23. Testing everywhere. ✔

**2. Placeholder scan:** No TBD/TODO. Logic-bearing tasks (T2–T7, T9, T14, T17, T20, T21) carry full code or exact TDD assertions; presentational tasks specify files, interfaces, exact copy, screenshot reference, and representative implementation notes. ✔

**3. Type consistency:** `TitleType` includes `manhua` everywhere; `Title` cosmetic fields (`views`,`latestChapter`,`updatedAgo`) defined in T3 and consumed by `format.ts`/cards in T4/T9; accessor names fixed in T4 and reused in T10–T19; context APIs (`useAuth`,`useLibrary`) consistent across T6/T7/T8/T17/T21; `DEMO_ACCOUNT.username='otaku123'` in T5 used by T6/T20. ✔

**Next.js version note:** dynamic pages (T17/T18/T19) use `params: Promise<{…}>` (Next 15+). If Task 1 installs Next 14, switch to synchronous `params` and drop `await`; apply consistently.
