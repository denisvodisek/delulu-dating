/**
 * Hong Kong demographic constants for "woman seeking man" dating pool estimates.
 * Sources (see /methodology):
 * - Census 2021 population / district profiles (censtatd.gov.hk)
 * - AEHS 2024 male wage percentiles (info.gov.hk / censtatd)
 * - Population Health Survey 2014/15 male mean height 169.5 cm (chp.gov.hk) — still the clean published male mean bundle for curve-fitting; replace when CHP issues a newer one
 * - Anthropometric literature: SD ~5.8 cm for HK Chinese adult males (cityu.edu.hk anthropometry chapter)
 */

/** Rough count of HK-resident males aged 18–65 in the "dating pool" universe */
export const BASE_MALE_POOL = 1_850_000;

/** Male height: normal model (cm) */
export const HEIGHT_MEAN_CM = 169.5;
export const HEIGHT_SD_CM = 5.8;

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

/** Tail probability for monthly wage >= min (male employees, HK$) */
export function maleIncomeTail(minHkd: number): number {
  if (minHkd <= MALE_WAGE_POINTS[0].hk) return 1;
  if (minHkd >= MALE_WAGE_POINTS[MALE_WAGE_POINTS.length - 1].hk) {
    const last = MALE_WAGE_POINTS[MALE_WAGE_POINTS.length - 1];
    const ratio = minHkd / last.hk;
    const tail = 1 - last.p;
    return Math.max(0.0001, tail * Math.exp(-1.2 * (ratio - 1)));
  }
  for (let i = 0; i < MALE_WAGE_POINTS.length - 1; i++) {
    const a = MALE_WAGE_POINTS[i];
    const b = MALE_WAGE_POINTS[i + 1];
    if (minHkd >= a.hk && minHkd <= b.hk) {
      const t = (minHkd - a.hk) / (b.hk - a.hk);
      const pAt = a.p + t * (b.p - a.p);
      return Math.max(0.0005, 1 - pAt);
    }
  }
  return 0.01;
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
  pref: "never" | "not_married_ok" | "any",
  ageMin: number,
  ageMax: number,
): number {
  if (pref === "any") return 1;
  if (pref === "never") return neverMarriedFactor(ageMin, ageMax);
  return notMarriedNowFactor(ageMin, ageMax);
}

export function educationFactor(min: "any" | "degree" | "postgrad"): number {
  if (min === "any") return 1;
  if (min === "degree") return 0.36;
  return 0.14;
}

export function smokingFactor(requireNonSmoker: boolean): number {
  if (!requireNonSmoker) return 1;
  return 0.9;
}

export function noKidsFactor(requireNoKids: boolean): number {
  if (!requireNoKids) return 1;
  return 0.72;
}

/**
 * Illustrative only: owning (vs renting) private housing is rare among younger HK men in the model.
 * Calibrated harsh so the toggle is felt — not a mortgage underwriting table.
 */
export function ownFlatFactor(requireOwnFlat: boolean): number {
  if (!requireOwnFlat) return 1;
  return 0.11;
}

/**
 * Illustrative: share of men in the modeled pool who keep a private car for regular use.
 */
export function carFactor(requireCar: boolean): number {
  if (!requireCar) return 1;
  return 0.24;
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
