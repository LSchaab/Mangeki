/**
 * Compact, human-friendly view count, e.g. 196000 -> "196k", 1_500_000 -> "1.5M".
 * Numbers below 1000 are returned verbatim.
 */
export function viewsLabel(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${trimTrailingZero(n / 1_000)}k`;
  return `${trimTrailingZero(n / 1_000_000)}M`;
}

function trimTrailingZero(value: number): string {
  // One decimal place, but drop it when it's ".0" (e.g. 196.0 -> "196").
  return value
    .toFixed(1)
    .replace(/\.0$/, '');
}

/**
 * Renders a numeric score as "n/10" (rounded to the nearest integer),
 * or an em dash "—" when the score is missing.
 */
export function scoreOutOf10(score: number | null): string {
  if (score === null) return '—';
  return `${Math.round(score)}/10`;
}
