/** Cap so UI never shows scientific notation or Infinity from bad floats or tampered URLs. */
export const MAX_ONE_IN_DISPLAY = 99_999_999;
export const MAX_POOL_COUNT_DISPLAY = 99_999_999;

/** Safe “1 in N” integer for display and sharing. */
export function safeOneInInverse(probability: number): number {
  if (!Number.isFinite(probability) || probability <= 0) return MAX_ONE_IN_DISPLAY;
  const inv = 1 / probability;
  if (!Number.isFinite(inv)) return MAX_ONE_IN_DISPLAY;
  const rounded = Math.round(inv);
  if (!Number.isFinite(rounded)) return MAX_ONE_IN_DISPLAY;
  return Math.min(MAX_ONE_IN_DISPLAY, Math.max(1, rounded));
}

export function safePoolCountDisplay(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_POOL_COUNT_DISPLAY, Math.round(n));
}
