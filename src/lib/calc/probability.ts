import type { CalculationResult, QuizAnswersV1, BreakdownRow } from "@/lib/types/quiz";
import {
  BASE_MALE_POOL,
  CORRELATION_BOOST,
  districtUnionFactor,
  educationFactor,
  maleAgeWindowFactor,
  maleHeightTail,
  maleIncomeTail,
  maritalFactor,
  noKidsFactor,
  smokingFactor,
} from "@/lib/data/hk-demographics";

export function calculateDelulu(answers: QuizAnswersV1): CalculationResult {
  const fAge = maleAgeWindowFactor(answers.ageMin, answers.ageMax);
  const fHeight = maleHeightTail(answers.minHeightCm);
  const fIncome = maleIncomeTail(answers.minMonthlyIncomeHKD);
  const fMarital = maritalFactor(answers.marital, answers.ageMin, answers.ageMax);
  const fDistrict = districtUnionFactor(answers.districts);
  const fEdu = educationFactor(answers.educationMin);
  const fSmoke = smokingFactor(answers.noSmoking);
  const fKids = noKidsFactor(answers.noKidsFromPrev);

  const raw =
    fAge *
    fHeight *
    fIncome *
    fMarital *
    fDistrict *
    fEdu *
    fSmoke *
    fKids *
    CORRELATION_BOOST;

  const probability = Math.min(1, Math.max(1 / BASE_MALE_POOL, raw));

  const breakdown: BreakdownRow[] = [
    { key: "age", labelKey: "age", factor: fAge },
    { key: "height", labelKey: "height", factor: fHeight },
    { key: "income", labelKey: "income", factor: fIncome },
    { key: "marital", labelKey: "marital", factor: fMarital },
    { key: "district", labelKey: "district", factor: fDistrict },
    { key: "education", labelKey: "education", factor: fEdu },
    { key: "smoke", labelKey: "smoke", factor: fSmoke },
    { key: "kids", labelKey: "kids", factor: fKids },
    { key: "correlation", labelKey: "correlation", factor: CORRELATION_BOOST },
  ];

  const tier = tierFromProbability(probability);
  const estimatedMatches = Math.max(1, Math.round(probability * BASE_MALE_POOL));

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
  if (p <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(1, Math.round(1 / p));
}
