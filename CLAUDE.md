# CLAUDE.md — Mangeki

Project-context file for Claude Code. Read this first.

## What Mangeki is

**Mangeki** is a manga/manhwa/manhua-reader web app built as a **showcase piece for the
Vaiven studio portfolio** (Vaiven is Lourdes Schaab's studio brand). It is a **hybrid
demo**: the browsing/discovery UI is fully built and polished (matching the landing
screenshots in `resources/screenshots/`), while actual *reading* is intentionally disabled
(`🔒 Leer — Próximamente`). A focused set of features genuinely works — demo login, a
personal library ("Mi Perfil"), and adding your own titles — all persisted in the browser
via `localStorage`, so there is **no backend**.

**UI language is Spanish.** Catalog title names stay in their original language.

Full design spec: `docs/superpowers/specs/2026-07-27-mangeki-design.md` (source of truth).

## Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS**
- **Auth / library / custom titles → `localStorage`** (client-side, demo-grade)
- **Catalog → Jikan API seed script → local JSON** (`src/data/*.json`, 50+ titles)
- **Testing → Vitest + React Testing Library**
- **Hosting → GitHub Pages (static export)** at `mangeki.lourdesschaab.com`

## Key constraints (do not violate)

- **No backend, no external services.** Auth, library, and user-added titles live in
  `localStorage` only. Do not introduce Supabase/Vercel/any hosted DB or auth.
- **The reader is disabled by design.** The "Leer" control is a visibly disabled
  `🔒 Leer — Próximamente` button. Do not build a functional reader.
- **Auth is demo-grade, not secure.** Passwords sit in the browser in plain form; this is
  intentional for a portfolio demo. A pre-seeded `otaku123` / `demo1234` account exists and
  the login page shows a disclaimer with those credentials.
- **Categories:** data/filters use `manga` / `manhwa` / `manhua`. `Cómic` is a
  newsletter-only checkbox with no seeded titles. The newsletter is decorative (no backend).
- **Static export only.** Must build with `output: 'export'` (GitHub Pages has no server).
  Dynamic routes use `generateStaticParams`; images are `unoptimized`. No server-side
  code, API routes, or runtime data fetching.
- **Catalog is seeded, not live.** Never fetch the catalog at runtime — regenerate the
  JSON via the seed script instead.

## Pages (sitemap — Spanish routes)

Nav: **Home** (`/`) · **Nosotros** (`/nosotros`) · **Nuevo & Popular**
(`/nuevo-y-popular`) · **Autores** (`/autores`, `/autores/[id]`).
Also: **Catálogo** (`/catalogo`) · **Géneros** (`/generos`, `/generos/[slug]`) ·
**Título detalle** (`/titulo/[id]`) · **Mi Perfil** (`/mi-perfil`, auth-gated) ·
**Iniciar sesión** (`/login`) · **Registro** (`/registro`) · **Legal** (`/legal`) ·
**Contacto** (`/contacto`) · 404.

The **Home** page is a full landing (hero carousel, red description block, values band,
Tendencias & Actualizaciones carousels, Top Autores, newsletter, footer) — see spec §8.4.

## `localStorage` schema (namespaced `mangeki.*`)

| Key | Value |
|-----|-------|
| `mangeki.users` | registered demo accounts |
| `mangeki.session` | current logged-in user id |
| `mangeki.library.<userId>` | saved catalog title ids |
| `mangeki.customTitles.<userId>` | user-created titles |

Access `localStorage` only through the `useLocalStorage` hook and the `AuthContext` /
`LibraryContext` providers. Always guard `window` for SSR/static-export safety.

## Commands

> These will exist once the project is scaffolded (see the implementation plan).

- `npm run dev` — local dev server
- `npm run seed` — fetch catalog from Jikan → write `src/data/*.json`
- `npm run build` — static export to `out/`
- `npm test` — Vitest

## Deployment

- GitHub Actions (`.github/workflows/deploy.yml`): seed → build → deploy to GitHub Pages
  on push to `main`.
- `public/CNAME` contains `mangeki.lourdesschaab.com`.
- **Manual step (owner only):** DNS `CNAME` record `mangeki` → `<username>.github.io`.

## Status

Design approved; implementation not yet started. Follow the spec and the forthcoming
implementation plan under `docs/superpowers/`.
