import { describe, it, expect } from 'vitest';
import { mapEntry, slugify } from '../seed.mjs';

const jikan = {
  mal_id: 2,
  title: 'Berserk',
  synopsis: 'Guts...',
  images: { jpg: { large_image_url: 'https://i/b.jpg' } },
  score: 9.47,
  status: 'Publishing',
  chapters: null,
  type: 'Manhwa',
  authors: [{ name: 'Miura, Kentarou' }],
  genres: [{ name: 'Action' }],
};

describe('seed helpers', () => {
  it('slugify', () => expect(slugify('Slice of Life')).toBe('slice-of-life'));

  it('maps type/status/score/genres and derives cosmetic fields', () => {
    const t = mapEntry(jikan, 0);
    expect(t.type).toBe('manhwa');
    expect(t.status).toBe('ongoing');
    expect(t.genres).toEqual(['action']);
    expect(typeof t.views).toBe('number'); // derived, deterministic
    expect(typeof t.updatedAgo).toBe('string');
  });
});
