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

/** HK-average tap-through baseline — ~median wage, mean height, normal dating age band. */
export const DEFAULT_QUIZ: QuizAnswersV1 = {
  version: 1,
  seeker: "woman_seeking_man",
  ageMin: 25,
  ageMax: 35,
  minHeightCm: 170,
  minMonthlyIncomeHKD: 24000,
  marital: "any",
  expatPreference: "any",
  educationMin: "any",
  noSmoking: false,
  noKidsFromPrev: false,
  requiresOwnFlat: false,
  requiresCar: false,
};

/**
 * Girlfriend-mode tap-through baseline, calibrated to the female pool:
 * ~mean female height (158.7 cm), just below median female wage, typical band.
 * Lands Stage 2 ("picky") like the women's defaults do.
 */
export const DEFAULT_QUIZ_MAN_SEEKING_WOMAN: QuizAnswersV1 = {
  version: 1,
  seeker: "man_seeking_woman",
  ageMin: 24,
  ageMax: 32,
  minHeightCm: 158,
  minMonthlyIncomeHKD: 18000,
  marital: "any",
  expatPreference: "any",
  educationMin: "any",
  noSmoking: false,
  noKidsFromPrev: false,
  requiresOwnFlat: false,
  requiresCar: false,
};

export function defaultQuizFor(seeker: Seeker): QuizAnswersV1 {
  return seeker === "man_seeking_woman"
    ? { ...DEFAULT_QUIZ_MAN_SEEKING_WOMAN }
    : { ...DEFAULT_QUIZ };
}

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
