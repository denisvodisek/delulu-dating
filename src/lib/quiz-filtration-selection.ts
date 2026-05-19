import type { QuizAnswersV1 } from "@/lib/types/quiz";

export type FiltrationFormatters = {
  quiz: (key: string) => string;
};

/** Human-readable summary of what the user picked for each filtration gate. */
export function formatFiltrationSelection(
  breakdownKey: string,
  answers: QuizAnswersV1,
  f: FiltrationFormatters,
): string {
  switch (breakdownKey) {
    case "age":
      return `${answers.ageMin}–${answers.ageMax}`;
    case "height":
      return `≥ ${answers.minHeightCm} cm`;
    case "income":
      return `≥ HK$${answers.minMonthlyIncomeHKD.toLocaleString()}`;
    case "marital":
      if (answers.marital === "never") return f.quiz("maritalNever");
      if (answers.marital === "not_married_ok") return f.quiz("maritalNotNow");
      return f.quiz("maritalAny");
    case "expat":
      if (answers.expatPreference === "local_only") return f.quiz("expatLocal");
      if (answers.expatPreference === "expat_preferred") return f.quiz("expatPreferred");
      return f.quiz("expatAny");
    case "education":
      if (answers.educationMin === "degree") return f.quiz("eduDegree");
      if (answers.educationMin === "postgrad") return f.quiz("eduPostgrad");
      return f.quiz("eduAny");
    case "smoke":
      return answers.noSmoking ? f.quiz("toggleMust") : f.quiz("toggleDontCare");
    case "kids":
      return answers.noKidsFromPrev ? f.quiz("toggleMust") : f.quiz("toggleDontCare");
    case "flat":
      return answers.requiresOwnFlat ? f.quiz("flatMust") : f.quiz("flatDontCare");
    case "car":
      return answers.requiresCar ? f.quiz("carMust") : f.quiz("carDontCare");
    case "correlation":
      return f.quiz("labFiltrationCorrelationNote");
    default:
      return "";
  }
}
