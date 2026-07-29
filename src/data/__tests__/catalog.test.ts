import { describe, it, expect } from 'vitest';
import {
  allTitles,
  getTitle,
  titlesByType,
  allGenres,
  getGenre,
  titlesByGenre,
  allAuthors,
  getAuthor,
  titlesByAuthor,
  popularTitles,
  newestTitles,
  trendingTitles,
  topAuthors,
} from '@/data/catalog';
import { viewsLabel, scoreOutOf10 } from '@/lib/format';

describe('catalog accessors', () => {
  it('exposes 50+ titles', () => {
    expect(allTitles().length).toBeGreaterThanOrEqual(50);
  });

  it('getTitle returns a title by id, undefined when missing', () => {
    const first = allTitles()[0];
    expect(getTitle(first.id)).toEqual(first);
    expect(getTitle('__nope__')).toBeUndefined();
  });

  it('titlesByType(manhua) returns only manhua', () => {
    const rows = titlesByType('manhua');
    expect(rows.every((t) => t.type === 'manhua')).toBe(true);
    // and every manhua in the catalog is present
    const expected = allTitles().filter((t) => t.type === 'manhua').length;
    expect(rows.length).toBe(expected);
  });

  it('popularTitles(5) is sorted by views desc and capped', () => {
    const rows = popularTitles(5);
    expect(rows.length).toBe(5);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].views).toBeGreaterThanOrEqual(rows[i].views);
    }
    expect(rows[0].views).toBe(Math.max(...allTitles().map((t) => t.views)));
  });

  it('newestTitles(n) is capped at n', () => {
    expect(newestTitles(4).length).toBe(4);
  });

  it('trendingTitles(5) is sorted by score desc', () => {
    const rows = trendingTitles(5);
    expect(rows.length).toBe(5);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].score ?? 0).toBeGreaterThanOrEqual(rows[i].score ?? 0);
    }
  });

  it('topAuthors(6) is capped at 6 and sorted by title count desc', () => {
    const rows = topAuthors(6);
    expect(rows.length).toBeLessThanOrEqual(6);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].titleIds.length).toBeGreaterThanOrEqual(
        rows[i].titleIds.length,
      );
    }
  });

  it('genre and author accessors resolve and cross-reference', () => {
    const genre = allGenres()[0];
    expect(getGenre(genre.slug)).toEqual(genre);
    expect(getGenre('__nope__')).toBeUndefined();
    expect(titlesByGenre(genre.slug).every((t) => t.genres.includes(genre.slug))).toBe(true);

    const author = allAuthors()[0];
    expect(getAuthor(author.id)).toEqual(author);
    expect(getAuthor('__nope__')).toBeUndefined();
    expect(titlesByAuthor(author.id).every((t) => t.authorIds.includes(author.id))).toBe(true);
  });
});

describe('format helpers', () => {
  it('viewsLabel formats thousands', () => {
    expect(viewsLabel(196000)).toBe('196k');
  });

  it('viewsLabel handles small numbers and millions', () => {
    expect(viewsLabel(950)).toBe('950');
    expect(viewsLabel(1_500_000)).toBe('1.5M');
  });

  it('scoreOutOf10 rounds to n/10', () => {
    expect(scoreOutOf10(9.47)).toBe('9/10');
    expect(scoreOutOf10(null)).toBe('—');
  });
});
