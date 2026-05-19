import type { DeluluTier, RunRow } from "@/lib/supabase/database.types";

export const TIER_ORDER: DeluluTier[] = [
  "god",
  "delulu",
  "very_picky",
  "picky",
  "realistic",
];

export type LeaderboardStats = {
  total: number;
  hasData: boolean;
  tierCounts: Record<DeluluTier, number>;
  tierPercents: Record<DeluluTier, number>;
  topTier: DeluluTier | null;
  seekerCounts: {
    woman_seeking_man: number;
    man_seeking_woman: number;
  };
  averages: {
    minHeightCm: number | null;
    minMonthlyIncomeHKD: number | null;
    ageMin: number | null;
    ageMax: number | null;
  };
  filterRates: {
    noSmoking: number;
    noKidsFromPrev: number;
    requiresOwnFlat: number;
    requiresCar: number;
  };
  marital: Record<string, number>;
  educationMin: Record<string, number>;
  expatPreference: Record<string, number>;
};

function emptyTierCounts(): Record<DeluluTier, number> {
  return {
    realistic: 0,
    picky: 0,
    very_picky: 0,
    delulu: 0,
    god: 0,
  };
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function rateTruthy(values: (boolean | null)[]): number {
  const defined = values.filter((v): v is boolean => v === true || v === false);
  if (defined.length === 0) return 0;
  const on = defined.filter(Boolean).length;
  return Math.round((on / defined.length) * 100);
}

function bump(map: Record<string, number>, key: string | null | undefined) {
  if (!key) return;
  map[key] = (map[key] ?? 0) + 1;
}

export function aggregateRuns(rows: RunRow[]): LeaderboardStats {
  const withTier = rows.filter((r): r is RunRow & { tier: DeluluTier } => r.tier != null);
  const total = withTier.length;

  const tierCounts = emptyTierCounts();
  for (const row of withTier) {
    tierCounts[row.tier] += 1;
  }

  const tierPercents = emptyTierCounts();
  for (const tier of TIER_ORDER) {
    tierPercents[tier] = total > 0 ? Math.round((tierCounts[tier] / total) * 100) : 0;
  }

  let topTier: DeluluTier | null = null;
  let topCount = 0;
  for (const tier of TIER_ORDER) {
    if (tierCounts[tier] > topCount) {
      topCount = tierCounts[tier];
      topTier = tier;
    }
  }

  const seekerCounts = {
    woman_seeking_man: withTier.filter((r) => r.seeker === "woman_seeking_man").length,
    man_seeking_woman: withTier.filter((r) => r.seeker === "man_seeking_woman").length,
  };

  const heights = withTier
    .map((r) => r.min_height_cm)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const incomes = withTier
    .map((r) => r.min_monthly_income_hkd)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const ageMins = withTier
    .map((r) => r.age_min)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const ageMaxs = withTier
    .map((r) => r.age_max)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const marital: Record<string, number> = {};
  const educationMin: Record<string, number> = {};
  const expatPreference: Record<string, number> = {};
  for (const row of withTier) {
    bump(marital, row.marital);
    bump(educationMin, row.education_min);
    bump(expatPreference, row.expat_preference);
  }

  return {
    total,
    hasData: total > 0,
    tierCounts,
    tierPercents,
    topTier,
    seekerCounts,
    averages: {
      minHeightCm: mean(heights),
      minMonthlyIncomeHKD: mean(incomes),
      ageMin: mean(ageMins),
      ageMax: mean(ageMaxs),
    },
    filterRates: {
      noSmoking: rateTruthy(withTier.map((r) => r.no_smoking)),
      noKidsFromPrev: rateTruthy(withTier.map((r) => r.no_kids_from_prev)),
      requiresOwnFlat: rateTruthy(withTier.map((r) => r.requires_own_flat)),
      requiresCar: rateTruthy(withTier.map((r) => r.requires_car)),
    },
    marital,
    educationMin,
    expatPreference,
  };
}
