import type {
  CalculationResult,
  EducationMin,
  MaritalPreference,
  QuizAnswersV1,
  BreakdownRow,
  Seeker,
} from "@/lib/types/quiz";
import {
  BASE_FEMALE_POOL,
  BASE_MALE_POOL,
  CORRELATION_BOOST,
  carFactor,
  educationFactor,
  expatPreferenceFactor,
  femaleAgeWindowFactor,
  femaleCarFactor,
  femaleEducationFactor,
  femaleHeightTail,
  femaleIncomeTail,
  femaleMaritalFactor,
  femaleNoKidsFactor,
  femaleOwnFlatFactor,
  femaleSmokingFactor,
  maleAgeWindowFactor,
  maleHeightTail,
  maleIncomeTail,
  maritalFactor,
  noKidsFactor,
  ownFlatFactor,
  smokingFactor,
} from "@/lib/data/hk-demographics";
import { MAX_ONE_IN_DISPLAY, MAX_POOL_COUNT_DISPLAY } from "@/lib/format-one-in";

/** Back-compat alias — the canonical constant lives in hk-demographics */
export const FEMALE_BASE_POOL = BASE_FEMALE_POOL;

type ModelConfig = {
  basePool: number;
  ageFactor: (ageMin: number, ageMax: number) => number;
  heightTail: (minCm: number) => number;
  incomeTail: (minHkd: number) => number;
  maritalFactor: (pref: MaritalPreference, ageMin: number, ageMax: number) => number;
  educationFactor: (min: EducationMin) => number;
  smokingFactor: (requireNonSmoker: boolean) => number;
  noKidsFactor: (requireNoKids: boolean) => number;
  ownFlatFactor: (requireOwnFlat: boolean) => number;
  carFactor: (requireCar: boolean) => number;
};

const MALE_POOL_MODEL: ModelConfig = {
  basePool: BASE_MALE_POOL,
  ageFactor: maleAgeWindowFactor,
  heightTail: maleHeightTail,
  incomeTail: maleIncomeTail,
  maritalFactor,
  educationFactor,
  smokingFactor,
  noKidsFactor,
  ownFlatFactor,
  carFactor,
};

const FEMALE_POOL_MODEL: ModelConfig = {
  basePool: BASE_FEMALE_POOL,
  ageFactor: femaleAgeWindowFactor,
  heightTail: femaleHeightTail,
  incomeTail: femaleIncomeTail,
  maritalFactor: femaleMaritalFactor,
  educationFactor: femaleEducationFactor,
  smokingFactor: femaleSmokingFactor,
  noKidsFactor: femaleNoKidsFactor,
  ownFlatFactor: femaleOwnFlatFactor,
  carFactor: femaleCarFactor,
};

function getModel(seeker: Seeker): ModelConfig {
  return seeker === "man_seeking_woman" ? FEMALE_POOL_MODEL : MALE_POOL_MODEL;
}

export function calculateDelulu(answers: QuizAnswersV1): CalculationResult {
  return calculateForSeeker(answers);
}

/**
 * Joint match probability ≈ Π(filter factors) × CORRELATION_BOOST, clamped to
 * [1/basePool, 1]. `estimatedMatches` is round(p × basePool), clamped for display —
 * “1 in N” uses round(1/p) separately so the two headlines can differ slightly after rounding.
 */
export function calculateForSeeker(answers: QuizAnswersV1): CalculationResult {
  const model = getModel(answers.seeker);

  const fAge = model.ageFactor(answers.ageMin, answers.ageMax);
  const fHeight = model.heightTail(answers.minHeightCm);
  const fIncome = model.incomeTail(answers.minMonthlyIncomeHKD);
  const fMarital = model.maritalFactor(answers.marital, answers.ageMin, answers.ageMax);
  const fExpat = expatPreferenceFactor(answers.expatPreference);
  const fEdu = model.educationFactor(answers.educationMin);
  const fSmoke = model.smokingFactor(answers.noSmoking);
  const fKids = model.noKidsFactor(answers.noKidsFromPrev);
  const fFlat = model.ownFlatFactor(answers.requiresOwnFlat);
  const fCar = model.carFactor(answers.requiresCar);

  const raw =
    fAge *
    fHeight *
    fIncome *
    fMarital *
    fExpat *
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
    { key: "expat", labelKey: "expat", factor: fExpat },
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

/**
 * Tier labels from estimated match probability (share of pool still eligible).
 * Recalibrated so a normal tap-through (DEFAULT_QUIZ) lands ~Stage 2, not Stage 4.
 */
export const TIER_PROBABILITY_FLOORS = {
  realistic: 0.08,
  picky: 0.02,
  very_picky: 0.004,
  delulu: 0.0007,
} as const;

export function tierFromProbability(p: number): CalculationResult["tier"] {
  if (p >= TIER_PROBABILITY_FLOORS.realistic) return "realistic";
  if (p >= TIER_PROBABILITY_FLOORS.picky) return "picky";
  if (p >= TIER_PROBABILITY_FLOORS.very_picky) return "very_picky";
  if (p >= TIER_PROBABILITY_FLOORS.delulu) return "delulu";
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
