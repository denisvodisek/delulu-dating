import type { QuizAnswersV1 } from "@/lib/types/quiz";
import { DEFAULT_QUIZ } from "@/lib/types/quiz";

const STORAGE_KEY = "delulu-dating-quiz-v1";

export function loadQuiz(): QuizAnswersV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizAnswersV1;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveQuiz(answers: QuizAnswersV1) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function clearQuiz() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function ensureQuiz(): QuizAnswersV1 {
  return loadQuiz() ?? DEFAULT_QUIZ;
}
