/** Human-readable match chance — never scientific notation. */
export function formatMatchPercent(probability: number): string {
  if (!Number.isFinite(probability) || probability <= 0) return "0%";
  if (probability >= 1) return "100%";

  const bp = Math.round(probability * 10000 + Number.EPSILON);
  if (bp < 1) return "<0.01%";

  const raw = bp / 100;
  if (raw < 0.1) return `${Number(raw.toFixed(2))}%`;
  if (raw < 100) return `${Number(raw.toFixed(1))}%`;
  return "100%";
}

/** Rounds filter factor to a plain-language retention share (0–100%). */
export function filterKeepsPercent(factor: number): number {
  return Math.max(0, Math.min(100, Math.round(factor * 100)));
}
