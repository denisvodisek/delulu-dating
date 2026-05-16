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
