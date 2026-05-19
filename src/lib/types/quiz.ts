export type MaritalPreference = "never" | "not_married_ok" | "any";
export type EducationMin = "any" | "degree" | "postgrad";
/** Local vs international / expat-background dating preference (illustrative prior — see /methodology). */
export type ExpatPreference = "any" | "local_only" | "expat_preferred";

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
  expatPreference: ExpatPreference;
  educationMin: EducationMin;
  noSmoking: boolean;
  noKidsFromPrev: boolean;
  /** Must own (not rent) private housing — illustrative prior, see methodology */
  requiresOwnFlat: boolean;
  /** Must keep a private car — illustrative prior */
  requiresCar: boolean;
};

export const DEFAULT_QUIZ: QuizAnswersV1 = {
  version: 1,
  seeker: "woman_seeking_man",
  ageMin: 25,
  ageMax: 35,
  minHeightCm: 175,
  minMonthlyIncomeHKD: 40000,
  marital: "not_married_ok",
  expatPreference: "any",
  educationMin: "any",
  noSmoking: false,
  noKidsFromPrev: false,
  requiresOwnFlat: false,
  requiresCar: false,
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
