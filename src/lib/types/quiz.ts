export type MaritalPreference = "never" | "not_married_ok" | "any";
export type EducationMin = "any" | "degree" | "postgrad";

export type Seeker = "woman_seeking_man" | "man_seeking_woman";

export type QuizAnswersV1 = {
  version: 1;
  /** Day-1 UI uses woman_seeking_man; architecture supports v2 */
  seeker: Seeker;
  ageMin: number;
  ageMax: number;
  minHeightCm: number;
  minMonthlyIncomeHKD: number;
  marital: MaritalPreference;
  /** District keys from hk-demographics */
  districts: string[];
  educationMin: EducationMin;
  noSmoking: boolean;
  noKidsFromPrev: boolean;
};

export const DEFAULT_QUIZ: QuizAnswersV1 = {
  version: 1,
  seeker: "woman_seeking_man",
  ageMin: 25,
  ageMax: 35,
  minHeightCm: 175,
  minMonthlyIncomeHKD: 40000,
  marital: "not_married_ok",
  districts: [],
  educationMin: "any",
  noSmoking: false,
  noKidsFromPrev: false,
};

export type BreakdownRow = {
  key: string;
  labelKey: string;
  factor: number;
};

export type CalculationResult = {
  probability: number;
  breakdown: BreakdownRow[];
  tier: "realistic" | "picky" | "very_picky" | "delulu" | "god";
  estimatedMatches: number;
};
