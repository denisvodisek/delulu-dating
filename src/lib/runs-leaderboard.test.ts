import { describe, expect, it } from "vitest";
import { aggregateRuns } from "@/lib/runs-leaderboard";
import type { RunRow } from "@/lib/supabase/database.types";

function row(partial: Partial<RunRow>): RunRow {
  return {
    id: "1",
    created_at: new Date().toISOString(),
    locale: "en",
    tier: null,
    seeker: null,
    probability: null,
    age_min: null,
    age_max: null,
    min_height_cm: null,
    min_monthly_income_hkd: null,
    marital: null,
    expat_preference: null,
    education_min: null,
    no_smoking: null,
    no_kids_from_prev: null,
    requires_own_flat: null,
    requires_car: null,
    ...partial,
  };
}

describe("aggregateRuns", () => {
  it("returns empty stats when no tier rows", () => {
    const stats = aggregateRuns([row({})]);
    expect(stats.hasData).toBe(false);
    expect(stats.total).toBe(0);
  });

  it("computes tier percents and averages", () => {
    const stats = aggregateRuns([
      row({
        tier: "delulu",
        seeker: "woman_seeking_man",
        min_height_cm: 170,
        min_monthly_income_hkd: 30000,
        age_min: 25,
        age_max: 35,
        no_smoking: true,
        requires_own_flat: false,
      }),
      row({
        tier: "god",
        seeker: "woman_seeking_man",
        min_height_cm: 180,
        min_monthly_income_hkd: 50000,
        age_min: 27,
        age_max: 40,
        no_smoking: false,
        requires_own_flat: true,
      }),
    ]);
    expect(stats.total).toBe(2);
    expect(stats.tierPercents.delulu).toBe(50);
    expect(stats.tierPercents.god).toBe(50);
    expect(stats.averages.minHeightCm).toBe(175);
    expect(stats.averages.minMonthlyIncomeHKD).toBe(40000);
    expect(stats.filterRates.noSmoking).toBe(50);
    expect(stats.filterRates.requiresOwnFlat).toBe(50);
  });
});
