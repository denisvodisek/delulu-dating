import { describe, expect, it } from "vitest";
import { BASE_MALE_POOL } from "@/lib/data/hk-demographics";
import { MAX_POOL_COUNT_DISPLAY } from "@/lib/format-one-in";
import {
  calculateDelulu,
  calculateForSeeker,
  FEMALE_BASE_POOL,
  tierFromProbability,
} from "@/lib/calc/probability";
import {
  DEFAULT_QUIZ,
  DEFAULT_QUIZ_MAN_SEEKING_WOMAN,
  type QuizAnswersV1,
} from "@/lib/types/quiz";

const base: QuizAnswersV1 = { ...DEFAULT_QUIZ };
const gfBase: QuizAnswersV1 = { ...DEFAULT_QUIZ_MAN_SEEKING_WOMAN };

describe("calculateDelulu", () => {
  it("returns probability between 0 and 1", () => {
    const r = calculateDelulu(base);
    expect(r.probability).toBeGreaterThan(0);
    expect(r.probability).toBeLessThanOrEqual(1);
  });

  it("estimatedMatches is rounded probability × base pool (display cap)", () => {
    const r = calculateDelulu(base);
    const expected = Math.min(
      MAX_POOL_COUNT_DISPLAY,
      Math.max(1, Math.round(r.probability * BASE_MALE_POOL)),
    );
    expect(r.estimatedMatches).toBe(expected);
  });

  it("uses female base pool for man_seeking_woman", () => {
    const r = calculateForSeeker({ ...base, seeker: "man_seeking_woman" });
    const expected = Math.min(
      MAX_POOL_COUNT_DISPLAY,
      Math.max(1, Math.round(r.probability * FEMALE_BASE_POOL)),
    );
    expect(r.estimatedMatches).toBe(expected);
  });

  it("narrows pool when preferring international-only slice", () => {
    const anyPool = calculateDelulu(base).probability;
    const intl = calculateDelulu({ ...base, expatPreference: "expat_preferred" }).probability;
    expect(intl).toBeLessThan(anyPool);
  });

  it("narrows pool when preferring local-raised only", () => {
    const anyPool = calculateDelulu(base).probability;
    const local = calculateDelulu({ ...base, expatPreference: "local_only" }).probability;
    expect(local).toBeLessThan(anyPool);
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

  it("tap-through defaults land in picky (Stage 2), not delulu", () => {
    const r = calculateDelulu(DEFAULT_QUIZ);
    expect(r.tier).toBe("picky");
    expect(r.probability).toBeGreaterThanOrEqual(0.02);
    expect(r.probability).toBeLessThan(0.08);
  });

  it("aspirational filters can reach very_picky or delulu", () => {
    const stricter = calculateDelulu({
      ...DEFAULT_QUIZ,
      minHeightCm: 175,
      minMonthlyIncomeHKD: 40000,
      marital: "not_married_ok",
    });
    expect(["very_picky", "delulu", "god"]).toContain(stricter.tier);
  });

  it("tierFromProbability uses recalibrated floors", () => {
    expect(tierFromProbability(0.09)).toBe("realistic");
    expect(tierFromProbability(0.03)).toBe("picky");
    expect(tierFromProbability(0.005)).toBe("very_picky");
    expect(tierFromProbability(0.001)).toBe("delulu");
    expect(tierFromProbability(0.0001)).toBe("god");
  });
});

describe("man_seeking_woman model", () => {
  it("girlfriend-mode tap-through defaults land in picky (Stage 2) too", () => {
    const r = calculateForSeeker(gfBase);
    expect(r.tier).toBe("picky");
    expect(r.probability).toBeGreaterThanOrEqual(0.02);
    expect(r.probability).toBeLessThan(0.08);
  });

  it("gets stricter when female height bar increases", () => {
    const low = calculateForSeeker({ ...gfBase, minHeightCm: 158 }).probability;
    const high = calculateForSeeker({ ...gfBase, minHeightCm: 170 }).probability;
    expect(high).toBeLessThan(low);
  });

  it("gets stricter when female income bar increases", () => {
    const low = calculateForSeeker({ ...gfBase, minMonthlyIncomeHKD: 15000 }).probability;
    const high = calculateForSeeker({ ...gfBase, minMonthlyIncomeHKD: 80000 }).probability;
    expect(high).toBeLessThan(low);
  });

  it("non-smoker requirement cuts the women pool less than the men pool", () => {
    const womenCut =
      calculateForSeeker({ ...gfBase, noSmoking: true }).probability /
      calculateForSeeker(gfBase).probability;
    const menCut =
      calculateDelulu({ ...base, noSmoking: true }).probability /
      calculateDelulu(base).probability;
    expect(womenCut).toBeGreaterThan(menCut);
  });

  it("car requirement cuts the women pool harder than the men pool", () => {
    const womenCut =
      calculateForSeeker({ ...gfBase, requiresCar: true }).probability /
      calculateForSeeker(gfBase).probability;
    const menCut =
      calculateDelulu({ ...base, requiresCar: true }).probability /
      calculateDelulu(base).probability;
    expect(womenCut).toBeLessThan(menCut);
  });

  it("uses female factors end-to-end (education softer for women pool)", () => {
    const womenDegree =
      calculateForSeeker({ ...gfBase, educationMin: "degree" }).probability /
      calculateForSeeker(gfBase).probability;
    const menDegree =
      calculateDelulu({ ...base, educationMin: "degree" }).probability /
      calculateDelulu(base).probability;
    expect(womenDegree).toBeGreaterThan(menDegree);
  });
});
