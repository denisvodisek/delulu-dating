import { describe, expect, it } from "vitest";
import { formatMatchPercent, filterKeepsPercent } from "./format-match";

describe("formatMatchPercent", () => {
  it("uses <0.01% for tiny probabilities", () => {
    expect(formatMatchPercent(0.00001)).toBe("<0.01%");
  });

  it("never returns scientific notation", () => {
    expect(formatMatchPercent(0.00004)).toBe("<0.01%");
    expect(formatMatchPercent(15 / 100_000)).toBe("0.02%");
  });

  it("scales decimal places by magnitude", () => {
    expect(formatMatchPercent(0.001)).toBe("0.1%");
    expect(formatMatchPercent(0.05)).toBe("5%");
    expect(formatMatchPercent(0.152)).toBe("15.2%");
    expect(formatMatchPercent(0.42)).toBe("42%");
  });
});

describe("filterKeepsPercent", () => {
  it("clamps to 0–100", () => {
    expect(filterKeepsPercent(-0.1)).toBe(0);
    expect(filterKeepsPercent(1.2)).toBe(100);
    expect(filterKeepsPercent(0.334)).toBe(33);
  });
});
