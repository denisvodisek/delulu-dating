import type { DeluluTier, RunRow } from "@/lib/supabase/database.types";

export const TIER_ORDER: DeluluTier[] = [
  "god",
  "delulu",
  "very_picky",
  "picky",
  "realistic",
];

export type SeekerKey = "woman_seeking_man" | "man_seeking_woman";

export type CrowdSliceStats = {
  total: number;
  hasData: boolean;
  tierCounts: Record<DeluluTier, number>;
  tierPercents: Record<DeluluTier, number>;
  topTier: DeluluTier | null;
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

export type LeaderboardStats = CrowdSliceStats & {
  seekerCounts: Record<SeekerKey, number>;
  /** Share of runs with a known seeker (null seeker rows count as women filtering men). */
  seekerPercents: Record<SeekerKey, number>;
  bySeeker: Record<SeekerKey, CrowdSliceStats>;
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

/** Legacy runs without seeker were women-filtering-men only. */
export function resolveSeeker(seeker: RunRow["seeker"]): SeekerKey {
  return seeker === "man_seeking_woman" ? "man_seeking_woman" : "woman_seeking_man";
}

export function aggregateSlice(rows: (RunRow & { tier: DeluluTier })[]): CrowdSliceStats {
  const total = rows.length;

  const tierCounts = emptyTierCounts();
  for (const row of rows) {
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

  const heights = rows
    .map((r) => r.min_height_cm)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const incomes = rows
    .map((r) => r.min_monthly_income_hkd)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const ageMins = rows
    .map((r) => r.age_min)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const ageMaxs = rows
    .map((r) => r.age_max)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const marital: Record<string, number> = {};
  const educationMin: Record<string, number> = {};
  const expatPreference: Record<string, number> = {};
  for (const row of rows) {
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
    averages: {
      minHeightCm: mean(heights),
      minMonthlyIncomeHKD: mean(incomes),
      ageMin: mean(ageMins),
      ageMax: mean(ageMaxs),
    },
    filterRates: {
      noSmoking: rateTruthy(rows.map((r) => r.no_smoking)),
      noKidsFromPrev: rateTruthy(rows.map((r) => r.no_kids_from_prev)),
      requiresOwnFlat: rateTruthy(rows.map((r) => r.requires_own_flat)),
      requiresCar: rateTruthy(rows.map((r) => r.requires_car)),
    },
    marital,
    educationMin,
    expatPreference,
  };
}

const EMPTY_SLICE: CrowdSliceStats = {
  total: 0,
  hasData: false,
  tierCounts: emptyTierCounts(),
  tierPercents: emptyTierCounts(),
  topTier: null,
  averages: {
    minHeightCm: null,
    minMonthlyIncomeHKD: null,
    ageMin: null,
    ageMax: null,
  },
  filterRates: {
    noSmoking: 0,
    noKidsFromPrev: 0,
    requiresOwnFlat: 0,
    requiresCar: 0,
  },
  marital: {},
  educationMin: {},
  expatPreference: {},
};

export function aggregateRuns(rows: RunRow[]): LeaderboardStats {
  const withTier = rows.filter((r): r is RunRow & { tier: DeluluTier } => r.tier != null);

  const womenRows = withTier.filter((r) => resolveSeeker(r.seeker) === "woman_seeking_man");
  const menRows = withTier.filter((r) => resolveSeeker(r.seeker) === "man_seeking_woman");

  const seekerCounts: Record<SeekerKey, number> = {
    woman_seeking_man: womenRows.length,
    man_seeking_woman: menRows.length,
  };

  const seekerTotal = seekerCounts.woman_seeking_man + seekerCounts.man_seeking_woman;
  const seekerPercents: Record<SeekerKey, number> = {
    woman_seeking_man:
      seekerTotal > 0
        ? Math.round((seekerCounts.woman_seeking_man / seekerTotal) * 100)
        : 0,
    man_seeking_woman:
      seekerTotal > 0
        ? Math.round((seekerCounts.man_seeking_woman / seekerTotal) * 100)
        : 0,
  };

  const combined = aggregateSlice(withTier);

  return {
    ...combined,
    seekerCounts,
    seekerPercents,
    bySeeker: {
      woman_seeking_man: womenRows.length > 0 ? aggregateSlice(womenRows) : { ...EMPTY_SLICE },
      man_seeking_woman: menRows.length > 0 ? aggregateSlice(menRows) : { ...EMPTY_SLICE },
    },
  };
}
