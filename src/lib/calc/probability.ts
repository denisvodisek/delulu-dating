import type { CalculationResult, QuizAnswersV1, BreakdownRow, Seeker } from "@/lib/types/quiz";
import {
  BASE_MALE_POOL,
  CORRELATION_BOOST,
  carFactor,
  districtUnionFactor,
  educationFactor,
  maleAgeWindowFactor,
  maleHeightTail,
  maleIncomeTail,
  maritalFactor,
  noKidsFactor,
  ownFlatFactor,
  smokingFactor,
} from "@/lib/data/hk-demographics";
import { MAX_ONE_IN_DISPLAY, MAX_POOL_COUNT_DISPLAY } from "@/lib/format-one-in";

type ModelConfig = {
  basePool: number;
  ageFactor: (ageMin: number, ageMax: number) => number;
  heightTail: (minCm: number) => number;
  incomeTail: (minHkd: number) => number;
};

/** Exported for result “filtration debt” walkthrough */
export const FEMALE_BASE_POOL = 1_950_000;

function femaleAgeWindowFactor(ageMin: number, ageMax: number): number {
  const min = Math.max(18, Math.min(65, ageMin));
  const max = Math.max(18, Math.min(65, ageMax));
  if (max < min) return 0;
  const span = max - min + 1;
  const full = 65 - 18 + 1;
  const uniform = span / full;
  const peakBoost = min <= 33 && max >= 24 ? 1.08 : 1.02;
  return Math.min(1, uniform * peakBoost);
}

function femaleHeightTail(minCm: number): number {
  // Rough HK female distribution proxy for v2 architecture.
  const mean = 158.7;
  const sd = 5.5;
  const z = (minCm - mean) / sd;
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.max(0, Math.min(1, 1 - cdf));
}

function femaleIncomeTail(minHkd: number): number {
  // Approximate female wage tail using slightly lower percentile anchors than male.
  const points = [
    { p: 0.1, hk: 10300 },
    { p: 0.25, hk: 14200 },
    { p: 0.5, hk: 19800 },
    { p: 0.75, hk: 30000 },
    { p: 0.9, hk: 45500 },
    { p: 0.95, hk: 62000 },
    { p: 0.99, hk: 92000 },
  ];
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

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax));
  return sign * y;
}

function getModel(seeker: Seeker): ModelConfig {
  if (seeker === "man_seeking_woman") {
    return {
      basePool: FEMALE_BASE_POOL,
      ageFactor: femaleAgeWindowFactor,
      heightTail: femaleHeightTail,
      incomeTail: femaleIncomeTail,
    };
  }

  return {
    basePool: BASE_MALE_POOL,
    ageFactor: maleAgeWindowFactor,
    heightTail: maleHeightTail,
    incomeTail: maleIncomeTail,
  };
}

export function calculateDelulu(answers: QuizAnswersV1): CalculationResult {
  return calculateForSeeker(answers);
}

export function calculateForSeeker(answers: QuizAnswersV1): CalculationResult {
  const model = getModel(answers.seeker);

  const fAge = model.ageFactor(answers.ageMin, answers.ageMax);
  const fHeight = model.heightTail(answers.minHeightCm);
  const fIncome = model.incomeTail(answers.minMonthlyIncomeHKD);
  const fMarital = maritalFactor(answers.marital, answers.ageMin, answers.ageMax);
  const fDistrict = districtUnionFactor(answers.districts);
  const fEdu = educationFactor(answers.educationMin);
  const fSmoke = smokingFactor(answers.noSmoking);
  const fKids = noKidsFactor(answers.noKidsFromPrev);
  const fFlat = ownFlatFactor(answers.requiresOwnFlat);
  const fCar = carFactor(answers.requiresCar);

  const raw =
    fAge *
    fHeight *
    fIncome *
    fMarital *
    fDistrict *
    fEdu *
    fSmoke *
    fKids *
    fFlat *
    fCar *
    CORRELATION_BOOST;

  const probability = Math.min(1, Math.max(1 / model.basePool, raw));

  const breakdown: BreakdownRow[] = [
    { key: "age", labelKey: "age", factor: fAge },
    { key: "height", labelKey: "height", factor: fHeight },
    { key: "income", labelKey: "income", factor: fIncome },
    { key: "marital", labelKey: "marital", factor: fMarital },
    { key: "district", labelKey: "district", factor: fDistrict },
    { key: "education", labelKey: "education", factor: fEdu },
    { key: "smoke", labelKey: "smoke", factor: fSmoke },
    { key: "kids", labelKey: "kids", factor: fKids },
    { key: "flat", labelKey: "flat", factor: fFlat },
    { key: "car", labelKey: "car", factor: fCar },
    { key: "correlation", labelKey: "correlation", factor: CORRELATION_BOOST },
  ];

  const tier = tierFromProbability(probability);
  const estimatedMatches = Math.min(
    MAX_POOL_COUNT_DISPLAY,
    Math.max(1, Math.round(probability * model.basePool)),
  );

  return { probability, breakdown, tier, estimatedMatches };
}

export function tierFromProbability(p: number): CalculationResult["tier"] {
  if (p >= 0.12) return "realistic";
  if (p >= 0.04) return "picky";
  if (p >= 0.008) return "very_picky";
  if (p >= 0.001) return "delulu";
  return "god";
}

export function oneInN(p: number): number {
  if (!Number.isFinite(p) || p <= 0) return MAX_ONE_IN_DISPLAY;
  const inv = 1 / p;
  if (!Number.isFinite(inv)) return MAX_ONE_IN_DISPLAY;
  const rounded = Math.round(inv);
  if (!Number.isFinite(rounded)) return MAX_ONE_IN_DISPLAY;
  return Math.min(MAX_ONE_IN_DISPLAY, Math.max(1, rounded));
}
