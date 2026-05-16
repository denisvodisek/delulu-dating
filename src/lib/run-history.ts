import type { QuizAnswersV1, CalculationResult } from "@/lib/types/quiz";
import { normalizeQuiz } from "@/lib/quiz-storage";

const HISTORY_KEY = "delulu-dating-runs-v1";
const MAX_ENTRIES = 15;

export type SavedRun = {
  id: string;
  savedAt: string;
  locale: string;
  answers: QuizAnswersV1;
  tier: CalculationResult["tier"];
  probability: number;
  estimatedMatches: number;
};

function readAll(): SavedRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .filter(
        (x): x is SavedRun =>
          x &&
          typeof x === "object" &&
          typeof (x as SavedRun).id === "string" &&
          typeof (x as SavedRun).savedAt === "string",
      )
      .map((x) => ({
        ...x,
        answers: normalizeQuiz((x as SavedRun).answers as QuizAnswersV1),
      }));
  } catch {
    return [];
  }
}

function writeAll(entries: SavedRun[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function listRecentRuns(limit = 8): SavedRun[] {
  return readAll()
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    .slice(0, limit);
}

export function pushRun(entry: Omit<SavedRun, "id" | "savedAt"> & { id?: string }) {
  if (typeof window === "undefined") return;
  const id =
    entry.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const row: SavedRun = {
    id,
    savedAt: new Date().toISOString(),
    locale: entry.locale,
    answers: normalizeQuiz(entry.answers),
    tier: entry.tier,
    probability: entry.probability,
    estimatedMatches: entry.estimatedMatches,
  };
  const rest = readAll().filter((r) => r.id !== id);
  writeAll([row, ...rest].slice(0, MAX_ENTRIES));
}
