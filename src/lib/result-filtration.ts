import { BASE_MALE_POOL } from "@/lib/data/hk-demographics";
import { FEMALE_BASE_POOL } from "@/lib/calc/probability";
import type { BreakdownRow, Seeker } from "@/lib/types/quiz";

export type FiltrationRow = {
  key: string;
  labelKey: string;
  factor: number;
  /** Share removed at this gate: (1 − factor)×100 for cuts; for correlation row use boost percent instead */
  pctCut: number;
  isBoost: boolean;
  remaining: number;
};

export function basePoolForSeeker(seeker: Seeker): number {
  return seeker === "man_seeking_woman" ? FEMALE_BASE_POOL : BASE_MALE_POOL;
}

/**
 * Sequential pool narrative: multiply factors in model order (excluding correlation),
 * then apply correlation boost as the final row.
 */
export function buildFiltrationDebt(seeker: Seeker, breakdown: BreakdownRow[]): FiltrationRow[] {
  const base = basePoolForSeeker(seeker);
  const ordered = breakdown.filter((r) => r.key !== "correlation");
  const corr = breakdown.find((r) => r.key === "correlation");
  let cumulative = 1;
  const rows: FiltrationRow[] = [];

  for (const row of ordered) {
    cumulative *= row.factor;
    const remaining = Math.max(1, Math.round(base * cumulative));
    const pctCut = Math.round((1 - Math.min(1, row.factor)) * 1000) / 10;
    rows.push({
      key: row.key,
      labelKey: row.labelKey,
      factor: row.factor,
      pctCut,
      isBoost: false,
      remaining,
    });
  }

  if (corr) {
    cumulative *= corr.factor;
    const remaining = Math.max(1, Math.round(base * cumulative));
    const pctBoost = Math.round((corr.factor - 1) * 1000) / 10;
    rows.push({
      key: corr.key,
      labelKey: corr.labelKey,
      factor: corr.factor,
      pctCut: pctBoost,
      isBoost: true,
      remaining,
    });
  }

  return rows;
}

/** “1 in 2.4M” style compact string (no “1 in ” prefix) */
export function formatOneInCompact(n: number, maxDisplay: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= maxDisplay) return `${maxDisplay.toLocaleString()}+`;
  if (n >= 1_000_000) {
    const x = n / 1_000_000;
    const s = x >= 10 || Number.isInteger(x) ? String(Math.round(x)) : String(Number(x.toFixed(1)));
    return `${s}M`;
  }
  if (n >= 10_000) {
    const x = n / 1000;
    const s = x >= 100 || Number.isInteger(x) ? String(Math.round(x)) : String(Number(x.toFixed(1)));
    return `${s}K`;
  }
  return n.toLocaleString();
}
