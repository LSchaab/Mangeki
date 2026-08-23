import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://api.jikan.moe/v4';
const RATE_LIMIT_MS = 600;

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Curated set of genuinely famous mangaka + their notable work. `fallbackPhoto`
// is a hardcoded valid MyAnimeList CDN portrait so EVERY entry is guaranteed a
// non-empty photoUrl even if the Jikan people lookup fails or returns no image.
const AUTHORS = [
  {
    name: 'Eiichiro Oda',
    notableWork: 'One Piece',
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/2/30751.jpg',
  },
  {
    name: 'Kentaro Miura',
    notableWork: 'Berserk',
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/1/52320.jpg',
  },
  {
    name: 'Hirohiko Araki',
    notableWork: "JoJo's Bizarre Adventure",
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/3/20335.jpg',
  },
  {
    name: 'Akira Toriyama',
    notableWork: 'Dragon Ball',
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/2/40040.jpg',
  },
  {
    name: 'Kohei Horikoshi',
    notableWork: 'My Hero Academia',
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/2/19467.jpg',
  },
  {
    name: 'Tatsuki Fujimoto',
    notableWork: 'Chainsaw Man',
    fallbackPhoto: 'https://cdn.myanimelist.net/images/voiceactors/2/61876.jpg',
  },
];

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

async function fetchPhoto(name) {
  const url = `${API}/people?q=${encodeURIComponent(name)}&limit=1`;
  const data = await fetchJson(url);
  return data.data?.[0]?.images?.jpg?.image_url ?? '';
}

async function main() {
  const topAuthors = [];
  for (let i = 0; i < AUTHORS.length; i++) {
    const author = AUTHORS[i];
    console.log(`Fetching portrait for ${author.name} ...`);
    let photoUrl = '';
    try {
      photoUrl = await fetchPhoto(author.name);
    } catch (err) {
      console.warn(`  WARN: people lookup failed (${err.message}); using fallback.`);
    }
    if (!photoUrl) {
      console.warn(`  No portrait for ${author.name}; using fallback.`);
      photoUrl = author.fallbackPhoto;
    }
    topAuthors.push({
      id: slugify(author.name),
      name: author.name,
      photoUrl,
      notableWork: author.notableWork,
    });
    if (i < AUTHORS.length - 1) await sleep(RATE_LIMIT_MS);
  }

  const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    join(dataDir, 'topAuthors.json'),
    JSON.stringify(topAuthors, null, 2) + '\n',
  );

  console.log(`Wrote ${topAuthors.length} top authors.`);
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
