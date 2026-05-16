import { describe, expect, it } from "vitest";
import { calculateDelulu, calculateForSeeker } from "@/lib/calc/probability";
import type { QuizAnswersV1 } from "@/lib/types/quiz";

const base: QuizAnswersV1 = {
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

describe("calculateDelulu", () => {
  it("returns probability between 0 and 1", () => {
    const r = calculateDelulu(base);
    expect(r.probability).toBeGreaterThan(0);
    expect(r.probability).toBeLessThanOrEqual(1);
  });

  it("gets stricter when height increases", () => {
    const low = calculateDelulu({ ...base, minHeightCm: 170 }).probability;
    const high = calculateDelulu({ ...base, minHeightCm: 185 }).probability;
    expect(high).toBeLessThan(low);
  });

  it("gets stricter when income increases", () => {
    const low = calculateDelulu({ ...base, minMonthlyIncomeHKD: 20000 }).probability;
    const high = calculateDelulu({ ...base, minMonthlyIncomeHKD: 120000 }).probability;
    expect(high).toBeLessThan(low);
  });

  it("supports seeker dispatcher for v2", () => {
    const woman = calculateForSeeker(base);
    const man = calculateForSeeker({ ...base, seeker: "man_seeking_woman" });
    expect(woman.probability).toBeGreaterThan(0);
    expect(man.probability).toBeGreaterThan(0);
    expect(woman.tier).toBeDefined();
    expect(man.tier).toBeDefined();
  });
});
