/**
 * Hong Kong demographic constants for both seeker modes
 * ("woman seeking man" day-1 model + "man seeking woman" v2 model).
 * Sources (see /methodology):
 * - Census 2021 population / district profiles (censtatd.gov.hk)
 * - AEHS 2024 male/female wage percentiles (info.gov.hk / censtatd)
 * - Population Health Survey 2014/15 mean heights: male 169.5 cm, female 158.7 cm (chp.gov.hk)
 * - Anthropometric literature: SD ~5.8 cm (male) / ~5.5 cm (female) for HK Chinese adults
 */

import type { EducationMin, ExpatPreference, MaritalPreference } from "@/lib/types/quiz";

/** Rough count of HK-resident males aged 18–65 in the "dating pool" universe */
export const BASE_MALE_POOL = 1_850_000;

/** Rough count of HK-resident females aged 18–65 (HK skews female, ~840 men per 1,000 women) */
export const BASE_FEMALE_POOL = 1_950_000;

/** Male height: normal model (cm) */
export const HEIGHT_MEAN_CM = 169.5;
export const HEIGHT_SD_CM = 5.8;

/** Female height: normal model (cm) */
export const FEMALE_HEIGHT_MEAN_CM = 158.7;
export const FEMALE_HEIGHT_SD_CM = 5.5;

/**
 * District keys → approximate share of BASE_MALE_POOL living in that district.
 * Calibrated so all 18 districts sum ≈ 1.0 (simplified residential distribution).
 */
export const DISTRICT_MALE_SHARE: Record<string, number> = {
  cw: 0.028,
  wc: 0.012,
  eastern: 0.055,
  southern: 0.033,
  ytm: 0.045,
  ss: 0.038,
  kt: 0.055,
  kc: 0.042,
  wts: 0.048,
  ktng: 0.038,
  n: 0.12,
  tw: 0.065,
  tm: 0.055,
  yl: 0.065,
  ntl: 0.055,
  sk: 0.065,
  island: 0.038,
  ktd: 0.045,
};

export const DISTRICT_LABEL_KEYS: Record<string, string> = {
  cw: "district.cw",
  wc: "district.wc",
  eastern: "district.eastern",
  southern: "district.southern",
  ytm: "district.ytm",
  ss: "district.ss",
  kt: "district.kt",
  kc: "district.kc",
  wts: "district.wts",
  ktng: "district.ktng",
  n: "district.n",
  tw: "district.tw",
  tm: "district.tm",
  yl: "district.yl",
  ntl: "district.ntl",
  sk: "district.sk",
  island: "district.island",
  ktd: "district.ktd",
};

/** AEHS 2024-ish male monthly wage percentiles (HK$) for employees */
const MALE_WAGE_POINTS: { p: number; hk: number }[] = [
  { p: 0.1, hk: 11000 },
  { p: 0.25, hk: 15300 },
  { p: 0.5, hk: 23400 },
  { p: 0.75, hk: 33000 },
  { p: 0.9, hk: 51300 },
  { p: 0.95, hk: 72000 },
  { p: 0.99, hk: 105000 },
];

/** AEHS-anchored female monthly wage percentiles (HK$) — slightly lower anchors than male */
const FEMALE_WAGE_POINTS: { p: number; hk: number }[] = [
  { p: 0.1, hk: 10300 },
  { p: 0.25, hk: 14200 },
  { p: 0.5, hk: 19800 },
  { p: 0.75, hk: 30000 },
  { p: 0.9, hk: 45500 },
  { p: 0.95, hk: 62000 },
  { p: 0.99, hk: 92000 },
];

/** Age window: rough share of male 18–65 population in inclusive [min,max] */
export function maleAgeWindowFactor(ageMin: number, ageMax: number): number {
  const min = Math.max(18, Math.min(65, ageMin));
  const max = Math.max(18, Math.min(65, ageMax));
  if (max < min) return 0;
  const span = max - min + 1;
  const full = 65 - 18 + 1;
  const uniform = span / full;
  const peakBoost =
    min <= 35 && max >= 28 ? 1.12 : min <= 40 && max >= 24 ? 1.06 : 1;
  return Math.min(1, uniform * peakBoost);
}

/** Age window: rough share of female 18–65 population in inclusive [min,max] */
export function femaleAgeWindowFactor(ageMin: number, ageMax: number): number {
  const min = Math.max(18, Math.min(65, ageMin));
  const max = Math.max(18, Math.min(65, ageMax));
  if (max < min) return 0;
  const span = max - min + 1;
  const full = 65 - 18 + 1;
  const uniform = span / full;
  const peakBoost = min <= 33 && max >= 24 ? 1.08 : 1.02;
  return Math.min(1, uniform * peakBoost);
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1.0 / (1.0 + p * ax);
  const y =
    1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax));
  return sign * y;
}

/** P(height >= minCm) for HK males */
export function maleHeightTail(minCm: number): number {
  const z = (minCm - HEIGHT_MEAN_CM) / HEIGHT_SD_CM;
  return Math.max(0, Math.min(1, 1 - normalCdf(z)));
}

/** P(height >= minCm) for HK females */
export function femaleHeightTail(minCm: number): number {
  const z = (minCm - FEMALE_HEIGHT_MEAN_CM) / FEMALE_HEIGHT_SD_CM;
  return Math.max(0, Math.min(1, 1 - normalCdf(z)));
}

function wageTail(points: { p: number; hk: number }[], minHkd: number): number {
  if (minHkd <= points[0].hk) return 1;
  if (minHkd >= points[points.length - 1].hk) {
    const last = points[points.length - 1];
    const ratio = minHkd / last.hk;
    const tail = 1 - last.p;
    return Math.max(0.0001, tail * Math.exp(-1.2 * (ratio - 1)));
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (minHkd >= a.hk && minHkd <= b.hk) {
      const t = (minHkd - a.hk) / (b.hk - a.hk);
      const pAt = a.p + t * (b.p - a.p);
      return Math.max(0.0005, 1 - pAt);
    }
  }
  return 0.01;
}

/** Tail probability for monthly wage >= min (male employees, HK$) */
export function maleIncomeTail(minHkd: number): number {
  return wageTail(MALE_WAGE_POINTS, minHkd);
}

/** Tail probability for monthly wage >= min (female employees, HK$) */
export function femaleIncomeTail(minHkd: number): number {
  return wageTail(FEMALE_WAGE_POINTS, minHkd);
}

/** Never married share blended with age window (simplified) */
export function neverMarriedFactor(ageMin: number, ageMax: number): number {
  const mid = (ageMin + ageMax) / 2;
  if (mid < 26) return 0.62;
  if (mid < 32) return 0.48;
  if (mid < 40) return 0.36;
  return 0.28;
}

/** "Not married now" includes never + divorced/widowed approximate */
export function notMarriedNowFactor(ageMin: number, ageMax: number): number {
  const mid = (ageMin + ageMax) / 2;
  if (mid < 30) return 0.72;
  if (mid < 40) return 0.58;
  return 0.5;
}

export function maritalFactor(
  pref: MaritalPreference,
  ageMin: number,
  ageMax: number,
): number {
  if (pref === "any") return 1;
  if (pref === "never") return neverMarriedFactor(ageMin, ageMax);
  return notMarriedNowFactor(ageMin, ageMax);
}

/** Women marry slightly earlier in HK — never-married shares drop faster with age */
function femaleNeverMarriedFactor(ageMin: number, ageMax: number): number {
  const mid = (ageMin + ageMax) / 2;
  if (mid < 26) return 0.6;
  if (mid < 32) return 0.44;
  if (mid < 40) return 0.3;
  return 0.22;
}

function femaleNotMarriedNowFactor(ageMin: number, ageMax: number): number {
  const mid = (ageMin + ageMax) / 2;
  if (mid < 30) return 0.68;
  if (mid < 40) return 0.52;
  return 0.45;
}

export function femaleMaritalFactor(
  pref: MaritalPreference,
  ageMin: number,
  ageMax: number,
): number {
  if (pref === "any") return 1;
  if (pref === "never") return femaleNeverMarriedFactor(ageMin, ageMax);
  return femaleNotMarriedNowFactor(ageMin, ageMax);
}

export function educationFactor(min: EducationMin): number {
  if (min === "any") return 1;
  if (min === "degree") return 0.36;
  return 0.14;
}

/** Younger HK women hold degrees at higher rates than men — softer education cut */
export function femaleEducationFactor(min: EducationMin): number {
  if (min === "any") return 1;
  if (min === "degree") return 0.44;
  return 0.16;
}

export function smokingFactor(requireNonSmoker: boolean): number {
  if (!requireNonSmoker) return 1;
  return 0.9;
}

/** HK female daily-smoking prevalence is ~3% — non-smoker requirement barely cuts */
export function femaleSmokingFactor(requireNonSmoker: boolean): number {
  if (!requireNonSmoker) return 1;
  return 0.97;
}

export function noKidsFactor(requireNoKids: boolean): number {
  if (!requireNoKids) return 1;
  return 0.72;
}

/** Mothers more often keep custody — “no kids from prev” bites slightly harder on the women pool */
export function femaleNoKidsFactor(requireNoKids: boolean): number {
  if (!requireNoKids) return 1;
  return 0.68;
}

/**
 * Illustrative only: owning (vs renting) private housing is rare among younger HK men in the model.
 * Calibrated harsh so the toggle is felt — not a mortgage underwriting table.
 */
export function ownFlatFactor(requireOwnFlat: boolean): number {
  if (!requireOwnFlat) return 1;
  return 0.11;
}

/** Illustrative prior: women sole-owning private property in the modeled pool */
export function femaleOwnFlatFactor(requireOwnFlat: boolean): number {
  if (!requireOwnFlat) return 1;
  return 0.1;
}

/**
 * Illustrative: share of men in the modeled pool who keep a private car for regular use.
 */
export function carFactor(requireCar: boolean): number {
  if (!requireCar) return 1;
  return 0.24;
}

/** Illustrative: HK driving-licence holding and car keeping skew male — thinner female slice */
export function femaleCarFactor(requireCar: boolean): number {
  if (!requireCar) return 1;
  return 0.12;
}

export function districtUnionFactor(selectedKeys: string[]): number {
  if (!selectedKeys.length) return 1;
  let sum = 0;
  for (const k of selectedKeys) {
    sum += DISTRICT_MALE_SHARE[k] ?? 0;
  }
  return Math.min(1, Math.max(0.004, sum));
}

/** Mild positive correlation adjustment (documented in methodology) */
export const CORRELATION_BOOST = 1.12;

/**
 * Approximate share of the modeled resident dating pool treated as international / non-local-raised
 * for the expat filter. Hong Kong does not publish a clean annual “expat headcount”; we anchor to
 * ~8% of the population identifying as ethnic minorities in the 2021 Census, then **deflate** to ~5.5%
 * because that headline includes workers and families across ages/sexes and our base pools are already
 * narrower. Mid‑2020s press tables add year-end population totals but not a fresh ethnic breakdown, so
 * this prior stays illustrative until C&SD releases something finer (see /methodology).
 */
export const EXPAT_BACKGROUND_SHARE_DATING_POOL = 0.055;

export function expatPreferenceFactor(pref: ExpatPreference): number {
  if (pref === "any") return 1;
  const s = EXPAT_BACKGROUND_SHARE_DATING_POOL;
  if (pref === "local_only") return Math.max(0.03, 1 - s);
  return Math.max(0.004, s);
}
