import type { QuizAnswersV1 } from "@/lib/types/quiz";

/** next-intl key under `quiz.*` — roast line for the current step + answers */
export function quizRoastKey(step: number, q: QuizAnswersV1): string {
  switch (step) {
    case 0: {
      const span = q.ageMax - q.ageMin;
      if (span <= 5) return "roastAge_tight";
      if (span >= 14) return "roastAge_wide";
      return "roastAge_mid";
    }
    case 1: {
      if (q.minHeightCm >= 182) return "roastHeight_skyscraper";
      if (q.minHeightCm >= 178) return "roastHeight_tall";
      if (q.minHeightCm >= 173) return "roastHeight_mid";
      return "roastHeight_chill";
    }
    case 2: {
      if (q.minMonthlyIncomeHKD >= 100_000) return "roastIncome_unicorn";
      if (q.minMonthlyIncomeHKD >= 70_000) return "roastIncome_elite";
      if (q.minMonthlyIncomeHKD >= 45_000) return "roastIncome_comfy";
      if (q.minMonthlyIncomeHKD >= 28_000) return "roastIncome_normal";
      return "roastIncome_floor";
    }
    case 3: {
      if (q.marital === "never") return "roastMarital_never";
      if (q.marital === "not_married_ok") return "roastMarital_now";
      return "roastMarital_any";
    }
    case 4: {
      if (q.expatPreference === "expat_preferred") return "roastExpat_intl";
      if (q.expatPreference === "local_only") return "roastExpat_local";
      return "roastExpat_any";
    }
    case 5: {
      if (q.educationMin === "postgrad") return "roastEdu_postgrad";
      if (q.educationMin === "degree") return "roastEdu_degree";
      return "roastEdu_any";
    }
    case 6: {
      if (q.noSmoking && q.noKidsFromPrev) return "roastLife_both";
      if (q.noSmoking && !q.noKidsFromPrev) return "roastLife_smokeOnly";
      if (!q.noSmoking && q.noKidsFromPrev) return "roastLife_kidsOnly";
      return "roastLife_chaos";
    }
    case 7:
      return q.requiresOwnFlat ? "roastFlat_must" : "roastFlat_ok";
    case 8:
      return q.requiresCar ? "roastCar_must" : "roastCar_ok";
    default:
      return "roastAge_mid";
  }
}

export const LAB_STEP_TITLE_KEYS = [
  ["labStepAge_line1", "labStepAge_line2"],
  ["labStepHeight_line1", "labStepHeight_line2"],
  ["labStepIncome_line1", "labStepIncome_line2"],
  ["labStepMarital_line1", "labStepMarital_line2"],
  ["labStepExpat_line1", "labStepExpat_line2"],
  ["labStepEducation_line1", "labStepEducation_line2"],
  ["labStepLifestyle_line1", "labStepLifestyle_line2"],
  ["labStepFlat_line1", "labStepFlat_line2"],
  ["labStepCar_line1", "labStepCar_line2"],
] as const;
