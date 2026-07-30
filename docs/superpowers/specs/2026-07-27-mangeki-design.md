# Mangeki — Design Spec

**Date:** 2026-07-27 (updated 2026-07-28 with landing screenshots)
**Status:** Approved (design), plan revision in progress
**Author:** Vaiven studio (Lourdes) with Claude Code

---

## 1. Overview & Goals

**Mangeki** is a manga/manhwa/manhua-reader web app built as a **showcase piece for the
Vaiven studio portfolio**. It is a "hybrid demo": the browsing and discovery experience is
fully built and visually polished, while the actual *reading* is intentionally disabled
(`🔒 Leer — Próximamente`). A focused set of features genuinely works — demo account login,
a personal library ("Mi Perfil"), and adding your own titles — all persisted in the browser
via `localStorage`, so there is **no backend to run**.

**Language:** the entire UI is in **Spanish**. Catalog title names remain in their original
language as provided by the data source.

### Goals
1. Look and feel like a real, polished product, matching the provided landing screenshots.
2. Demonstrate modern frontend craft (Next.js App Router + TypeScript + Tailwind CSS).
3. Include genuinely functional, interactive features (auth, library, add-your-own) to prove
   it is more than a static mockup.

### Success criteria
- Runs locally with `npm run dev`; no external accounts/services.
- A catalog of **50+** real titles (manga/manhwa/manhua) with covers, synopses, authors,
  genres, scores, view counts, and update labels.
- A visitor can sign up / log in (demo-grade), save titles to their library, remove them,
  and add their own custom titles — persisted across reloads.
- Reading is visibly present but disabled (`🔒 Leer — Próximamente`).
- The Home page reproduces the screenshot design (hero carousel, brand blocks, trending &
  updates carousels, top authors, newsletter, footer).
- Deployed as a static export to **GitHub Pages** at **`mangeki.lourdesschaab.com`**.

### Design references
Landing screenshots committed at `resources/screenshots/`:
`landing-01-hero.png`, `landing-02-trending-updates.png`, `landing-03-authors.png`,
`landing-04-newsletter-footer.png`. These are the visual source of truth for the Home page
and global chrome.

---

## 2. Sitemap (pages & routes)

Routes use Spanish slugs. **Primary nav** (header): Home · Nosotros · Nuevo & Popular ·
Autores. **Mi Perfil** and secondary pages are reached via the profile control and footer.

| Page | Route | In nav? | Purpose |
|------|-------|---------|---------|
| **Home** | `/` | ✅ | Full landing — see §8.4. |
| **Nosotros** (About) | `/nosotros` | ✅ | What Mangeki is, story/history, mission. |
| **Nuevo & Popular** | `/nuevo-y-popular` | ✅ | Discovery page: Popular + Nuevos grids with type/genre filters. Links to Catálogo & Géneros. |
| **Autores** | `/autores`, `/autores/[id]` | ✅ | Author directory + profile pages. |
| **Catálogo** | `/catalogo` | (footer) | Full grid of all titles with filters. Retained from original spec. |
| **Géneros** | `/generos`, `/generos/[slug]` | (footer) | Browse by genre. Retained. |
| **Título (detalle)** | `/titulo/[id]` | — | Cover, synopsis, score, chapters, **🔒 disabled Leer**, save-to-library. |
| **Mi Perfil** (biblioteca) | `/mi-perfil` | (profile/footer) | Saved titles + user-added titles. Auth-gated. |
| **Iniciar sesión** | `/login` | — | Demo login (shows demo credentials). |
| **Registro** | `/registro` | — | Demo sign-up. |
| **Legal** | `/legal` | (footer) | Terms/privacy. |
| **Contacto** | `/contacto` | (footer) | Contact. |
| **404** | catch-all | — | Custom not-found. |

---

## 3. Functional features (what genuinely works)

All user state lives in `localStorage`. Keys namespaced `mangeki.*`.

### 3.1 Auth (demo-grade)
- Sign-up stores `{ id, username, email, password }`.
- Login validates and sets a session; logout clears it.
- **Pre-seeded demo account:** username `otaku123`, password `demo1234` (matches the
  "¡Bienvenidx, Otaku123!" greeting in the mockups). Available on first load.
- **Login disclaimer:** the login page shows *"🔓 Esto es una demo. Inicia sesión con —
  usuario: `otaku123` · contraseña: `demo1234`."*
- ⚠️ Not real security — plaintext passwords in the browser, intentional for a demo.

### 3.2 Mi Perfil / Library (no stats)
- On Título detalle, a **Guardar** button adds the title to the user's library.
- Saved titles listed in Mi Perfil; removable. Duplicates prevented. No reading stats.

### 3.3 Add your own title
- Form to create a title: `título, autor, tipo (manga|manhwa|manhua), URL de portada,
  sinopsis, géneros`. Saved to the user's library, rendered like any card.
- Validation: título and autor required.

### 3.4 Auth-gating
- Mi Perfil, **Guardar**, and add-your-own require login; logged-out users are prompted to
  log in.

### 3.5 Newsletter (demo, non-functional)
- The Home newsletter form (Nombre, Apellido, E-Mail, category checkboxes: Cómic/Manga/
  Manhwa/Manhua) validates client-side and shows a success message on submit. **Nothing is
  stored or sent** (no backend). Purely presentational.

---

## 4. Architecture & data

### 4.1 Framework
- **Next.js App Router + TypeScript**, `output: 'export'` (static). Interactive parts are
  client components. **Tailwind CSS**.

### 4.2 Catalog data source — Jikan seed script
- `npm run seed` fetches ~60 popular titles (manga/manhwa/manhua) from **Jikan** (no key),
  maps them, and writes `src/data/titles.json`, `authors.json`, `genres.json`.
- Committed JSON is the runtime source and the CI fallback if Jikan is unreachable.

### 4.3 Domain types
```
TitleType   = 'manga' | 'manhwa' | 'manhua'
TitleStatus = 'ongoing' | 'completed' | 'hiatus'

Title  { id, slug, title, type, status, synopsis, coverUrl,
         score (0–10|null), chapters|null,
         views (mock int), latestChapter|null, updatedAgo (string, e.g. "Hace 2 horas"),
         authorIds[], genres[] }
Author { id, name, bio, photoUrl (placeholder), titleIds[] }
Genre  { slug, name }
CustomTitle { id, title, author, type, coverUrl, synopsis, genres[], createdAt }
User   { id, username, email, password }
```
- `views`, `latestChapter`, `updatedAgo` are **deterministically generated at seed time**
  (derived from score/index — no randomness) purely to populate the card UI ("196k Vistas",
  "Cap.15 · Hace 2 horas"). They are cosmetic.
- `Author.photoUrl` is a **placeholder** (Jikan doesn't reliably provide author photos);
  author cards use a grayscale placeholder behind the seigaiha motif. Swappable later.

### 4.4 `localStorage` schema
`mangeki.users` · `mangeki.session` · `mangeki.library.<userId>` ·
`mangeki.customTitles.<userId>`.

### 4.5 State management
- `useLocalStorage` hook (SSR-safe: guards `window`).
- `AuthContext` (user, signup, login, logout) and `LibraryContext` (savedIds, customTitles,
  isSaved, save, remove, addCustom).

### 4.6 Static export & hosting (GitHub Pages)
- `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`, no `basePath`.
- Dynamic routes (`/titulo/[id]`, `/autores/[id]`, `/generos/[slug]`) use
  `generateStaticParams`.
- `public/CNAME` = `mangeki.lourdesschaab.com`. DNS `CNAME mangeki → <user>.github.io`
  (owner's one manual step). GitHub Actions: seed → build → deploy on push to `main`.

---

## 5. Non-goals

- ❌ A working reader (disabled: `🔒 Leer — Próximamente`).
- ❌ Real/secure auth, a server, or a database.
- ❌ Reading stats, comments/reviews, payments, real chapter content.
- ❌ A functional newsletter, working notifications, or working app-store links (decorative).
- ❌ Live runtime catalog API calls (seed-once instead).

---

## 6. Testing

- **Vitest + React Testing Library.**
- Unit-test auth/library logic (signup, login, logout, save, remove-dup, add-custom
  validation) and the catalog/discovery accessors.
- Smoke-render key pages (Home sections, Título detalle, Mi Perfil, Nuevo & Popular).

---

## 7. Tech stack summary

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + TypeScript, static export |
| Styling | Tailwind CSS (brand tokens, §8.1) |
| Auth / Library / Custom titles | `localStorage` (client-side, demo-grade) |
| Catalog data | Jikan → seed script → local JSON (50+, manga/manhwa/manhua) |
| Testing | Vitest + React Testing Library |
| Hosting | GitHub Pages (static export) at `mangeki.lourdesschaab.com` via GitHub Actions |
| Language | Spanish UI |

---

## 8. Design System & Brand

Light UI on the Vaiven palette: brand blue, primary red, light red, navy ink. Matches the
committed landing screenshots.

### 8.1 Color tokens (Tailwind theme)

| Token | Hex | Nombre | Usage |
|-------|-----|--------|-------|
| `brand-blue` | `#576FA7` | Azul Celestial | Hero & newsletter section backgrounds. |
| `brand-red` | `#FF3E37` | Rojo Coral | Primary actions, logo mark, "red circle", the red band, footer. |
| `brand-red-light` / `brand-sakura` | `#FA9F9E` | Rosa Sakura | "Top Autores" section, values band, soft accents. |
| `brand-navy` | `#192B56` | Azul Medianoche | Primary text, icon outlines, "Leer más" buttons. |
| `brand-charcoal` | `#151515` | Negro Carbón | Body foreground text. |
| `surface` | `#FFFFFF` | Blanco Puro | Page background, cards, header. |

### 8.2 Assets

Move `resources/*` → `public/brand/`. Serve from `/brand/...`.

| File | Role |
|------|------|
| `mangeki_logo.svg` | Official Mangeki wordmark (274×69, navy `#192B56`) — header & (white-filtered) red/blue sections. |
| `hero_image.png` | Hero collage (girl + headphones + red circle). |
| `circles_svg.svg` | Seigaiha circle motif — cropped SVG on colored backgrounds (red block, footer, author cards). |
| `cloud_svg.svg` | Cloud/wave motif — available for section decoration. |
| `search_icon.svg` | Welcome-bar search icon. |
| `notifications_icon.svg` | Welcome-bar bell (decorative; red dot). |
| `profile_icon.svg` | Default profile avatar (headphoned-face mascot). |

**Provided:** `mangeki_logo.svg` is the real wordmark — use it directly. For the white-on-color
contexts (red description block, footer) render it white via CSS filter (`brightness-0 invert`)
until a dedicated white SVG is supplied.

**Recreated placeholder assets** (I generate these as code/SVG; swappable later):
- **Panda avatar** — the header profile avatar; use `profile_icon.svg` as the default.
- **App-store badges** — simple "Google Play" / "App Store" SVG badges (non-functional).
- **Social icons** — Facebook, Instagram, X circular icons (footer; non-functional).

**Section pattern ("color + cropped SVG"):** solid brand-color background with
`circles_svg` positioned and clipped (`overflow-hidden`), content layered above. Used by the
red description block, the footer, and behind each author photo.

### 8.3 Global chrome

**Header (two tiers):**
1. **White nav bar** — Mangeki wordmark (left) · nav links (Home, Nosotros, Nuevo & Popular,
   Autores) · profile avatar + username (right; links to `/login` when logged out, opens a
   menu with "Mi Perfil" / "Cerrar sesión" when logged in).
2. **Welcome bar** — greeting "¡Bienvenidx, <username>!" (or a generic prompt when logged
   out) on the left · search input ("Buscar…") + red search icon + notification bell on the
   right. Search filters/links into Catálogo (no dedicated results page).

**Footer (brand-red + seigaiha):** link column (Home, Nosotros, Nuevo & Popular, Autores,
Mi Perfil, Catálogo, Géneros) · centered white Mangeki wordmark + "Síguenos en redes" +
social icons · "Descarga nuestra app" + app-store badges · "Copyright © 2012–2026 Mangeki®.
All rights reserved."

### 8.4 Home page — section-by-section (from screenshots)

1. **Hero carousel** (`brand-blue`): `hero_image.png` left; right: "Adéntrate en el" +
   large white "**Universo Mangeki**", "¡Descarga nuestra app para mucho más!", app-store
   badges, and **carousel dots** (3–4 slides; a lightweight client carousel — slides may
   feature different promos/titles).
2. **Descripción block** (`brand-red` + seigaiha): large white Mangeki wordmark + the
   descriptive paragraph ("Mangeki, la aplicación de lectura de manga definitiva…").
3. **Values band** (`brand-red-light`): three items — **ENTRETENIMIENTO · EMOCIÓN ·
   DINAMISMO** — each with a faint red kanji overlay. Decorative/static.
4. **Tendencias** (white): heading "Tendencias" + "Semana" & "Filtro" dropdowns + a
   **horizontal card carousel**. Card = cover, **X/10** score badge (rounded), title,
   "<views> Vistas" + red eye icon.
5. **Actualizaciones** (white): heading + horizontal card carousel. Card = cover, score
   badge, title, "Cap.<latestChapter> · <updatedAgo>".
6. **Top Autores 2023** (`brand-red-light`): heading + 6 author cards (2×3). Card =
   circular grayscale photo with seigaiha motif behind top-left, name (navy), red dot, navy
   "**Leer más**" button → `/autores/[id]`.
7. **Newsletter** (`brand-blue`, faint manga collage): "¡Subscríbete a nuestro Newsletter!"
   + Nombre/Apellido/E-Mail (white pill inputs) + "¿Sobre qué tipo de lectura…?" with 4
   checkboxes (Cómic, Manga, Manhwa, Manhua) + red "Enviar". Demo-only (§3.5).
8. **Footer** (§8.3).

### 8.5 Card design

`TitleCard` supports two footer variants:
- **views**: "<views> Vistas" + red eye icon (Tendencias, Catálogo).
- **updates**: "Cap.<latestChapter> · <updatedAgo>" (Actualizaciones).
Both show the cover, a rounded **X/10** score badge (top-right), and the title; link to
`/titulo/[id]`.

### 8.6 Typography

The site uses **Quicksand** (Google Fonts, via `next/font`) for both display headings and
body — a rounded geometric sans that matches the rounded Mangeki wordmark.

### 8.7 Categories

Data/filter types: **manga, manhwa, manhua**. **Cómic** appears only as a newsletter
checkbox (no seeded titles). Filters across Catálogo / Nuevo & Popular expose the three real
types.
