import type { QuizAnswersV1 } from "@/lib/types/quiz";
import { DEFAULT_QUIZ } from "@/lib/types/quiz";

const STORAGE_KEY = "delulu-dating-quiz-v1";

/** Merge saved payloads with defaults (new filters, shape fixes). */
export function normalizeQuiz(raw: Partial<QuizAnswersV1> | null | undefined): QuizAnswersV1 {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_QUIZ };
  if ("version" in raw && raw.version !== 1) return { ...DEFAULT_QUIZ };
  return {
    ...DEFAULT_QUIZ,
    ...raw,
    version: 1,
  };
}

export function loadQuiz(): QuizAnswersV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuizAnswersV1>;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeQuiz(parsed);
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
