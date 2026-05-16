import { describe, expect, it } from "vitest";
import { MAX_ONE_IN_DISPLAY, safeOneInInverse, safePoolCountDisplay } from "./format-one-in";
import { oneInN } from "@/lib/calc/probability";

describe("safeOneInInverse", () => {
  it("caps huge odds", () => {
    expect(safeOneInInverse(1e-20)).toBe(MAX_ONE_IN_DISPLAY);
  });
});

describe("oneInN", () => {
  it("never returns Infinity", () => {
    expect(Number.isFinite(oneInN(1e-30))).toBe(true);
  });
});

describe("safePoolCountDisplay", () => {
  it("clamps garbage", () => {
    expect(safePoolCountDisplay(Number.NaN)).toBe(1);
    expect(safePoolCountDisplay(1e20)).toBe(MAX_ONE_IN_DISPLAY);
  });
});
