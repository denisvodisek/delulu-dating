import { MAX_POOL_COUNT_DISPLAY } from "@/lib/format-one-in";

export type SharedResultPayload = {
  p: number;
  n: number;
  tier: "realistic" | "picky" | "very_picky" | "delulu" | "god";
  ts: number;
  /** Seeker mode: "w" = woman seeking man (default), "m" = man seeking woman */
  s?: "w" | "m";
};

function clampNum(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function toBase64Url(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  const base = btoa(unescape(encodeURIComponent(input)));
  return base.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const base = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base + "=".repeat((4 - (base.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeSharedResult(payload: SharedResultPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharedResult(token: string): SharedResultPayload | null {
  try {
    const raw = fromBase64Url(token);
    const data = JSON.parse(raw) as SharedResultPayload;
    if (
      typeof data.p !== "number" ||
      typeof data.n !== "number" ||
      typeof data.ts !== "number" ||
      !["realistic", "picky", "very_picky", "delulu", "god"].includes(data.tier)
    ) {
      return null;
    }
    return {
      p: clampNum(data.p, 1e-15, 1),
      n: clampNum(Math.round(data.n), 1, MAX_POOL_COUNT_DISPLAY),
      tier: data.tier,
      ts: clampNum(data.ts, 0, 9e15),
      s: data.s === "m" ? "m" : "w",
    };
  } catch {
    return null;
  }
}

export function buildSharedResultPath(locale: string, token: string): string {
  return `/${locale}/r/${token}`;
}
