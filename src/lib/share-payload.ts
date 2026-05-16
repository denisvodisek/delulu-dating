export type SharedResultPayload = {
  p: number;
  n: number;
  tier: "realistic" | "picky" | "very_picky" | "delulu" | "god";
  ts: number;
};

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
    return data;
  } catch {
    return null;
  }
}

export function buildSharedResultPath(locale: string, token: string): string {
  return `/${locale}/r/${token}`;
}
