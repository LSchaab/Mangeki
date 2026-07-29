# Mangeki — Design Spec

**Date:** 2026-07-27
**Status:** Approved (design), pending implementation plan
**Author:** Vaiven studio (Lourdes) with Claude Code

---

## 1. Overview & Goals

**Mangeki** is a manga/manhwa-reader web app built as a **showcase piece for the Vaiven
studio portfolio**. It is a "hybrid demo": the browsing and discovery experience is fully
built and visually polished, while the actual *reading* is intentionally disabled
(`🔒 Read — Coming soon`). A focused set of features genuinely works — demo account
login, a personal library, and the ability to add your own titles — all persisted in the
browser via `localStorage`, so there is **no backend to run or deploy**.

### Goals
1. Look and feel like a real, polished product.
2. Demonstrate modern frontend craft (Next.js App Router + TypeScript + Tailwind CSS).
3. Include a few genuinely functional, interactive features to prove it is more than a
   static mockup.

### Success criteria
- The site runs locally with `npm run dev` and requires no external accounts or services.
- A visitor can browse a catalog of **50+** real manga/manhwa titles with covers,
  synopses, authors, and genres.
- A visitor can sign up / log in (demo-grade), save titles to a personal library, remove
  them, and add their own custom titles — and these persist across page reloads.
- The reading feature is visibly present but clearly disabled, communicating "planned,
  not broken."
- The site is deployed as a static export to **GitHub Pages** at the custom subdomain
  **`mangeki.lourdesschaab.com`**.

---

## 2. Sitemap (pages)

| Page             | Route                        | Purpose |
|------------------|------------------------------|---------|
| **Home**         | `/`                          | Hero, featured titles, and an **"Our Selection from [Category]"** curated section (Mangeki's own recommendations). |
| **Catalog**      | `/catalog`                   | Grid of all titles with filters (genre, type manga/manhwa, status). |
| **Title Detail** | `/title/[id]`                | Cover, synopsis, rating, chapter list, **🔒 disabled Read** entry point, and Save-to-Library. |
| **Authors**      | `/authors`, `/authors/[id]`  | Directory of authors + individual author profile pages. |
| **Genres**       | `/genres`, `/genres/[slug]`  | Browse titles by genre. |
| **My Library**   | `/library`                   | The logged-in user's saved titles + user-added titles. Auth-gated. |
| **Login**        | `/login`                     | Demo login form. |
| **Sign-up**      | `/signup`                    | Demo registration form. |
| **About Mangeki**| `/about`                     | What the app is, its story/history, and its mission. |
| **404**          | catch-all `not-found`        | Custom-designed not-found page. |
| **Legal**        | `/legal`                     | Terms / privacy placeholder (footer link). |
| **Contact**      | `/contact`                   | Contact page (footer link). |

**Global chrome:** shared header (Mangeki logo, nav, and the brand **search /
notifications / profile** icons — see §8; auth state reflected on the profile control)
and footer ("Made by Vaiven" credit + Legal/Contact links) across all pages. Filtering
happens on the Catalog page; there is no dedicated search-results page in scope.

---

## 3. Functional features (what genuinely works)

These are the "really works" parts of the hybrid demo. All state lives in `localStorage`.

### 3.1 Auth (demo-grade)
- **Sign-up** stores a user record `{ id, username, email, password }` in `localStorage`.
- **Login** validates credentials against stored users and sets an active session.
- **Logout** clears the active session.
- **Pre-seeded demo account:** a built-in account (username `demo`, password `demo1234`)
  is available on first load so visitors can log in instantly without registering.
- **Login-page disclaimer:** the login page shows a visible note, e.g.
  *"🔓 This is a demo. Log in with — username: `demo` · password: `demo1234`."*
- ⚠️ **This is not real security.** Passwords are stored in plain form in the browser.
  This is acceptable and expected for a portfolio demo, and will be clearly noted in the
  code. No real authentication, hashing, or server is in scope.

### 3.2 My Library (no stats)
- On any Title Detail page, a **Save** button adds the title to the logged-in user's
  library.
- Saved titles are listed on `/library` and can be removed.
- Saving the same title twice is prevented (no duplicates).
- **No reading statistics** of any kind.

### 3.3 Add your own title
- If a title is not in the catalog, the user can create one via a form:
  `title, author, type (manga|manhwa), cover image URL, synopsis, genres`.
- The custom title is saved to the user's library and rendered like any other card.
- Basic validation: required fields must be present before saving.

### 3.4 Auth-gating
- `/library`, **Save**, and **Add your own** require a logged-in user.
- Logged-out users attempting these actions are prompted to log in.

---

## 4. Architecture & data

### 4.1 Framework
- **Next.js (App Router) + TypeScript.** Routes map 1:1 to the sitemap above.
- Interactive, state-driven UI (auth, library) is implemented as **client components**,
  since state lives in `localStorage`.
- **Tailwind CSS** for styling.

### 4.2 Catalog data source — Jikan seed script
The showcase catalog is generated once by a seed script, not typed by hand and not
fetched live at runtime.

- A script (`npm run seed`) fetches **~60 popular manga and manhwa** from the
  **Jikan API** (MyAnimeList, no API key required).
- It maps each entry into the app's typed shape and writes:
  - `src/data/titles.json` — the catalog
  - `src/data/authors.json` — derived author records
  - `src/data/genres.json` — derived genre list
- Rationale: real covers/synopses with zero manual data entry, while keeping the app
  **fully self-contained and offline at runtime** (no rate limits, CORS, or loading
  states in the demo). The JSON can be re-generated or hand-tweaked later.
- **Fallback:** if Jikan is unreachable when seeding, a committed snapshot of the JSON
  files ensures the app always has data. The generated JSON is committed to the repo.

### 4.6 Static export & hosting (GitHub Pages)
- Next.js is configured for **static export** (`output: 'export'`), which produces a
  fully static site — required for GitHub Pages (no Node server).
- Implications, all compatible with this app:
  - `images: { unoptimized: true }` (no server-side image optimization).
  - Dynamic routes (`/title/[id]`, `/authors/[id]`, `/genres/[slug]`) use
    `generateStaticParams` to pre-render every page from the seed data at build time.
  - `trailingSlash: true` for clean static routing on Pages.
  - No `basePath` needed — served from the root of a subdomain.
- **Custom domain:** a `public/CNAME` file containing `mangeki.lourdesschaab.com` is
  committed so Pages serves the custom subdomain.
- **DNS (user action):** add a `CNAME` record `mangeki` → `<username>.github.io` at the
  domain registrar/DNS host for `lourdesschaab.com`. (Claude handles all code/config;
  this DNS record is the one manual step for the user.)
- **CI/CD:** a GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the seed
  script, builds the static export, and deploys to GitHub Pages on every push to `main`.

### 4.3 `localStorage` schema
All keys are namespaced under `mangeki.*`:

| Key                            | Value |
|--------------------------------|-------|
| `mangeki.users`                | Array of registered demo accounts. |
| `mangeki.session`              | The currently logged-in user's id (or empty). |
| `mangeki.library.<userId>`     | Array of saved catalog title ids. |
| `mangeki.customTitles.<userId>`| Array of user-created titles. |

### 4.4 State management
- A small **`useLocalStorage` hook** wraps all reads/writes (SSR-safe: guards `window`).
- An **`AuthContext`** and a **`LibraryContext`** expose the current user and library
  operations (save, remove, add-custom, login, logout, signup) so page components stay
  clean and the logic is testable in isolation.

### 4.5 Error & edge handling
- Empty library state (friendly empty state + link to catalog).
- Duplicate save attempts (ignored, no duplicate entries).
- Invalid login (wrong credentials → clear error message).
- Add-title form with missing required fields (inline validation).
- First visit with no data yet (safe defaults).
- SSR-safe `localStorage` access (never touch `window` on the server).

---

## 5. Non-goals (explicitly out of scope)

- ❌ A working reader — reading is disabled by design (`🔒 Read — Coming soon`).
- ❌ Real or secure authentication, a server, or a database.
- ❌ Reading statistics, comments/reviews, ratings by users, payments.
- ❌ Hosting real manga chapter content.
- ❌ Live runtime API calls for the catalog (seed-once instead).
- ❌ A real backend for auth/library on the deployed site — it remains client-side
  `localStorage` even in production (each visitor's data lives in their own browser).

---

## 6. Testing

- **Vitest + React Testing Library.**
- Unit-test the auth and library logic: signup, login, logout, save, remove-duplicate
  handling, add-custom-title validation.
- Smoke-render the key pages (Home, Catalog, Title Detail, Library) with seed/mock data.

---

## 7. Tech stack summary

| Layer            | Choice |
|------------------|--------|
| Framework        | Next.js (App Router) + TypeScript |
| Styling          | Tailwind CSS |
| Auth / Library / Custom titles | `localStorage` (client-side, demo-grade) |
| Catalog data     | Jikan API → one-time seed script → local JSON (50+ titles, mixed manga/manhwa) |
| Testing          | Vitest + React Testing Library |
| Hosting          | GitHub Pages (static export) at `mangeki.lourdesschaab.com`, deployed via GitHub Actions |

---

## 8. Design System & Brand

Mangeki uses the Vaiven brand identity: a **light** UI built on brand blue, primary red,
and a navy ink color, with a manga-collage hero. (The earlier dark-theme styling in the
implementation plan is superseded by this palette.)

### 8.1 Color tokens

| Token            | Hex        | Usage |
|------------------|------------|-------|
| `brand-blue`     | `#556FA0`  | Hero and feature-section backgrounds (the base "color" behind cropped SVG motifs). |
| `brand-red`      | `#E7403B`  | Primary actions, logo, accents, the hero "red circle". |
| `brand-red-light`| `#FFDADA`  | Secondary/soft red — tints, hovers, badges, light section fills. |
| `brand-navy`     | `#1F2D52`  | Primary text, icon outlines, ink details (sampled from the brand icons). |
| `surface`        | `#FFFFFF`  | Default page background / cards. |

These become Tailwind theme colors (e.g. `bg-brand-blue`, `text-brand-navy`,
`bg-brand-red`, `bg-brand-red-light`).

### 8.2 Assets (in `resources/`, to be moved to `public/`)

The build serves these from `public/`; the plan includes moving `resources/*` →
`public/brand/` so they resolve at runtime.

| File | Type | Role |
|------|------|------|
| `hero_image.png` | raster | Hero collage (girl + headphones + red circle + ink art) on `brand-blue`. |
| `circles_svg.svg` | 1920×1925 vector | Large seigaiha-style circle motif — a **cropped SVG layered on a colored section background**. |
| `cloud_svg.svg` | vector | Japanese cloud/wave motif — another **cropped-SVG-on-color** section treatment. |
| `search_icon.svg` | 72×72 icon | Header search control (navy stroke, red inner). |
| `notifications_icon.svg` | 72×72 icon | Header notifications control (navy bell, red dot). |
| `profile_icon.svg` | 90×80 icon | Header profile/avatar control (headphoned face mascot); reflects auth state. |

**Section pattern ("color + cropped SVG"):** feature sections use a solid brand color as
the background with `circles_svg`/`cloud_svg` positioned and clipped (overflow-hidden) as
a decorative overlay, content layered above.

### 8.3 Header composition

Logo (left) · primary nav · right-aligned icon cluster: **search**, **notifications**,
**profile**. Logged out → profile icon links to `/login`. Logged in → profile control
shows the account / opens a menu with "My Library" and "Log out". (Notifications is
decorative for the demo — no backend.)

### 8.4 Typography

Bold, high-contrast display headings with a clean sans body. Exact typeface to be
finalized from the landing screenshots; until then use a strong Google sans (e.g. Poppins
or Inter for body) loaded via `next/font`.

### 8.5 Pending

The **exact landing/Home layout** (section order, hero composition, spacing) will be
finalized from the provided landing screenshots and folded into the spec and the
implementation plan's Home/styling tasks. This section 8 captures only the confirmed brand
system.
