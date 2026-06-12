import { describe, expect, it } from "vitest";
import { aggregateRuns, resolveSeeker } from "@/lib/runs-leaderboard";
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

describe("resolveSeeker", () => {
  it("treats null seeker as woman_seeking_man (legacy runs)", () => {
    expect(resolveSeeker(null)).toBe("woman_seeking_man");
    expect(resolveSeeker("woman_seeking_man")).toBe("woman_seeking_man");
    expect(resolveSeeker("man_seeking_woman")).toBe("man_seeking_woman");
  });
});

describe("aggregateRuns", () => {
  it("returns empty stats when no tier rows", () => {
    const stats = aggregateRuns([row({})]);
    expect(stats.hasData).toBe(false);
    expect(stats.total).toBe(0);
    expect(stats.bySeeker.woman_seeking_man.hasData).toBe(false);
    expect(stats.bySeeker.man_seeking_woman.hasData).toBe(false);
  });

  it("computes tier percents and averages on combined slice", () => {
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
    expect(stats.seekerPercents.woman_seeking_man).toBe(100);
    expect(stats.seekerPercents.man_seeking_woman).toBe(0);
  });

  it("splits stats by seeker and computes participation percents", () => {
    const stats = aggregateRuns([
      row({
        tier: "picky",
        seeker: "woman_seeking_man",
        min_height_cm: 170,
        min_monthly_income_hkd: 24000,
      }),
      row({
        tier: "realistic",
        seeker: "man_seeking_woman",
        min_height_cm: 158,
        min_monthly_income_hkd: 18000,
      }),
      row({
        tier: "picky",
        seeker: "man_seeking_woman",
        min_height_cm: 162,
        min_monthly_income_hkd: 20000,
      }),
    ]);

    expect(stats.seekerCounts.woman_seeking_man).toBe(1);
    expect(stats.seekerCounts.man_seeking_woman).toBe(2);
    expect(stats.seekerPercents.woman_seeking_man).toBe(33);
    expect(stats.seekerPercents.man_seeking_woman).toBe(67);

    expect(stats.bySeeker.woman_seeking_man.averages.minHeightCm).toBe(170);
    expect(stats.bySeeker.man_seeking_woman.averages.minHeightCm).toBe(160);
    expect(stats.bySeeker.man_seeking_woman.tierPercents.realistic).toBe(50);
    expect(stats.bySeeker.man_seeking_woman.tierPercents.picky).toBe(50);
  });

  it("buckets legacy null-seeker rows with women filtering men", () => {
    const stats = aggregateRuns([
      row({ tier: "picky", seeker: null, min_height_cm: 172 }),
      row({ tier: "picky", seeker: "man_seeking_woman", min_height_cm: 160 }),
    ]);
    expect(stats.seekerCounts.woman_seeking_man).toBe(1);
    expect(stats.seekerCounts.man_seeking_woman).toBe(1);
    expect(stats.seekerPercents.woman_seeking_man).toBe(50);
    expect(stats.bySeeker.woman_seeking_man.averages.minHeightCm).toBe(172);
  });
});
