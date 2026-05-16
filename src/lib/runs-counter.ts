/** Start/end of the current calendar day in Asia/Hong_Kong (for `runs` counts). */
export function getHongKongDayBounds(now = new Date()): {
  startIso: string;
  endIso: string;
} {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startMs = Date.parse(`${ymd}T00:00:00+08:00`);
  if (Number.isNaN(startMs)) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return {
      startIso: d.toISOString(),
      endIso: new Date(d.getTime() + 86_400_000).toISOString(),
    };
  }
  return {
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(startMs + 86_400_000).toISOString(),
  };
}

function dayKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function estimateRunsToday() {
  const base = 8420;
  const h = hashString(dayKey());
  return base + (h % 1800) + Math.floor(Date.now() / 36e5) * 3;
}

/**
 * Landing-page “social proof” number only. Uses HK calendar day + intraday drift so it
 * naturally climbs. Not tied to DB or `POST /api/run` — purely theatrical.
 */
export function publicSocialCounter(now = new Date()): number {
  const fromEstimate = estimateRunsToday();
  const { startIso } = getHongKongDayBounds(now);
  const startMs = Date.parse(startIso);
  const mins = Number.isNaN(startMs)
    ? 0
    : Math.max(0, Math.floor((now.getTime() - startMs) / 60_000));
  return fromEstimate + Math.floor(mins / 5);
}
