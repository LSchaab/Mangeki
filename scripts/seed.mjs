import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://api.jikan.moe/v4';
const RATE_LIMIT_MS = 600;

const UPDATED_AGO = [
  'Hace 2 horas',
  'Hace 20 min.',
  'Hace 50 min.',
  'Hace 5 min.',
  'Hace 1 día',
];

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mapStatus(status) {
  if (status === 'Publishing') return 'ongoing';
  if (status === 'Hiatus' || status === 'On Hiatus') return 'hiatus';
  return 'completed';
}

export function mapType(type) {
  if (type === 'Manhwa') return 'manhwa';
  if (type === 'Manhua') return 'manhua';
  return 'manga';
}

export function mapEntry(entry, index) {
  const genres = (entry.genres ?? []).map((g) => slugify(g.name));
  const authorIds = (entry.authors ?? []).map((a) => slugify(a.name));
  const coverUrl =
    entry.images?.jpg?.large_image_url ?? entry.images?.jpg?.image_url ?? '';

  return {
    id: String(entry.mal_id),
    slug: slugify(entry.title),
    title: entry.title,
    type: mapType(entry.type),
    status: mapStatus(entry.status),
    synopsis: entry.synopsis ?? '',
    coverUrl,
    score: entry.score ?? null,
    chapters: entry.chapters ?? null,
    // Cosmetic fields — derived DETERMINISTICALLY (no randomness, no Date.now).
    views: Math.round((entry.score ?? 5) * 20000 + (entry.members ?? 0) / 10),
    latestChapter: entry.chapters ?? 50 + (index % 150),
    updatedAgo: UPDATED_AGO[index % 5],
    authorIds,
    genres,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, attempt = 0) {
  try {
    const res = await fetch(url);
    if (res.status === 429 && attempt < 3) {
      await sleep(RATE_LIMIT_MS * (attempt + 2));
      return fetchJson(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    if (attempt < 3) {
      await sleep(RATE_LIMIT_MS * (attempt + 2));
      return fetchJson(url, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  // Jikan currently returns HTTP 504 for ANY filtered query (`type=` and
  // `filter=` alike, on both /manga and /top/manga), so we cannot target
  // manhwa/manhua directly. The only healthy endpoint is the plain ranked
  // `/top/manga?page=N`, where manhwa/manhua are scattered throughout. We pull
  // many pages so they accumulate naturally: pages 1-4 required (well past the
  // >=50 guard), pages 5-8 best-effort enrichment for a richer manhwa/manhua mix.
  const requiredUrls = [
    `${API}/top/manga?page=1`,
    `${API}/top/manga?page=2`,
    `${API}/top/manga?page=3`,
    `${API}/top/manga?page=4`,
  ];
  const optionalUrls = [
    `${API}/top/manga?page=5`,
    `${API}/top/manga?page=6`,
    `${API}/top/manga?page=7`,
    `${API}/top/manga?page=8`,
  ];

  const rawEntries = [];
  const urls = [...requiredUrls, ...optionalUrls];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const optional = optionalUrls.includes(url);
    console.log(`Fetching ${url} ...`);
    try {
      const data = await fetchJson(url);
      rawEntries.push(...(data.data ?? []));
    } catch (err) {
      if (!optional) throw err;
      console.warn(`  WARN: optional fetch failed (${err.message}); continuing.`);
    }
    if (i < urls.length - 1) await sleep(RATE_LIMIT_MS);
  }

  const allowedTypes = new Set(['Manga', 'Manhwa', 'Manhua']);
  const seen = new Set();
  const filtered = [];
  for (const entry of rawEntries) {
    if (!allowedTypes.has(entry.type)) continue;
    const cover = entry.images?.jpg?.large_image_url ?? entry.images?.jpg?.image_url;
    if (!cover) continue;
    if (!entry.synopsis) continue;
    if (seen.has(entry.mal_id)) continue;
    seen.add(entry.mal_id);
    filtered.push(entry);
  }

  const titles = filtered.map((entry, index) => mapEntry(entry, index));

  if (titles.length < 50) {
    throw new Error(
      `Only got ${titles.length} titles after filtering; need >= 50. Aborting.`,
    );
  }

  // Build authors from entry.authors.
  const authorsById = new Map();
  for (const entry of filtered) {
    const id = String(entry.mal_id);
    for (const a of entry.authors ?? []) {
      const authorId = slugify(a.name);
      if (!authorId) continue;
      if (!authorsById.has(authorId)) {
        authorsById.set(authorId, {
          id: authorId,
          name: a.name,
          bio: '',
          photoUrl: '',
          titleIds: [],
        });
      }
      const author = authorsById.get(authorId);
      if (!author.titleIds.includes(id)) author.titleIds.push(id);
    }
  }
  const authors = [...authorsById.values()];

  // Build genres.
  const genresBySlug = new Map();
  for (const entry of filtered) {
    for (const g of entry.genres ?? []) {
      const slug = slugify(g.name);
      if (!slug) continue;
      if (!genresBySlug.has(slug)) {
        genresBySlug.set(slug, { slug, name: g.name });
      }
    }
  }
  const genres = [...genresBySlug.values()];

  const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, 'titles.json'), JSON.stringify(titles, null, 2) + '\n');
  await writeFile(join(dataDir, 'authors.json'), JSON.stringify(authors, null, 2) + '\n');
  await writeFile(join(dataDir, 'genres.json'), JSON.stringify(genres, null, 2) + '\n');

  console.log(
    `Wrote ${titles.length} titles, ${authors.length} authors, ${genres.length} genres.`,
  );
}

// Guard: only run when executed directly, not when imported by tests.
const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
