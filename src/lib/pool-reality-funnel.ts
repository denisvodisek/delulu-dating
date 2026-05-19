import { FEMALE_BASE_POOL } from "@/lib/calc/probability";
import { BASE_MALE_POOL } from "@/lib/data/hk-demographics";
import type { Seeker } from "@/lib/types/quiz";

/** Mid-2020s Hong Kong resident population (order-of-magnitude for the funnel). */
export const HK_TOTAL_POPULATION = 7_520_000;

export type PoolFunnelStep = {
  key: string;
  labelKey: string;
  count: number;
};

/** Rough share of 18–65 opposite-sex pool in a typical app age band (~25–39). */
const TYPICAL_DATING_AGE_SHARE = 0.45;

/** Intuitive shrink steps before user filters — explains why the base pool is already modest. */
export function buildPoolRealityFunnel(seeker: Seeker): PoolFunnelStep[] {
  const oppositeSex = Math.round(HK_TOTAL_POPULATION / 2);

  if (seeker === "woman_seeking_man") {
    const typicalBand = Math.round(BASE_MALE_POOL * TYPICAL_DATING_AGE_SHARE);
    return [
      { key: "hk", labelKey: "funnelHkTotal", count: HK_TOTAL_POPULATION },
      { key: "sex", labelKey: "funnelMenOppositeSex", count: oppositeSex },
      { key: "dating", labelKey: "funnelMenDatingAge", count: BASE_MALE_POOL },
      { key: "band", labelKey: "funnelMenTypicalAges", count: typicalBand },
    ];
  }

  const typicalBand = Math.round(FEMALE_BASE_POOL * TYPICAL_DATING_AGE_SHARE);
  return [
    { key: "hk", labelKey: "funnelHkTotal", count: HK_TOTAL_POPULATION },
    { key: "sex", labelKey: "funnelWomenOppositeSex", count: oppositeSex },
    { key: "dating", labelKey: "funnelWomenDatingAge", count: FEMALE_BASE_POOL },
    { key: "band", labelKey: "funnelWomenTypicalAges", count: typicalBand },
  ];
}
