'use client';

/**
 * The reader is not part of this build. Render a clearly disabled affordance so
 * users understand the feature is coming rather than missing.
 */
export default function LeerButton() {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
    >
      🔒 Leer — Próximamente
    </button>
  );
}
