"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnalogCounter } from "@/components/ui/AnalogCounter";

const LS_KEY = "delulu-landing-run-display-v3";
const MIN_DISPLAY = 2_400;
const MAX_DISPLAY = 48_500;

function sessionBump(): number {
  try {
    const raw = sessionStorage.getItem(LS_KEY);
    const n = raw != null ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function persistSessionBump(n: number) {
  try {
    sessionStorage.setItem(LS_KEY, String(n));
  } catch {
    /* noop */
  }
}

/** Believable 4–5 digit “checked today” baseline (not the raw API ~8k+). */
function theatricalBaseline(apiRuns: number): number {
  const mins = Math.max(0, Math.floor(Date.now() / 60_000) % 720);
  const seed = (apiRuns % 900) + mins * 2;
  return Math.min(MAX_DISPLAY, Math.max(MIN_DISPLAY, 3_200 + seed));
}

function randomTickStep(): number {
  return 1 + Math.floor(Math.random() * 3);
}

export function LandingLiveCounter() {
  const t = useTranslations("landing");
  const hint = t("liveCounterHint").trim();
  const locale = useLocale();
  const loc = locale === "zh" ? "zh-HK" : "en-US";
  const baselineRef = useRef(0);
  const sessionExtraRef = useRef(0);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    sessionExtraRef.current = sessionBump();

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { runsToday?: number }) => {
        const api = typeof d.runsToday === "number" && d.runsToday > 0 ? d.runsToday : 8840;
        baselineRef.current = theatricalBaseline(api);
        setDisplay(
          Math.min(MAX_DISPLAY, baselineRef.current + sessionExtraRef.current),
        );
      })
      .catch(() => {
        baselineRef.current = theatricalBaseline(8840);
        setDisplay(
          Math.min(MAX_DISPLAY, baselineRef.current + sessionExtraRef.current),
        );
      });
  }, []);

  useEffect(() => {
    if (display == null) return;
    let cancelled = false;
    let timer: number | null = null;

    const schedule = () => {
      const delay = 3200 + Math.floor(Math.random() * 4800);
      timer = window.setTimeout(() => {
        sessionExtraRef.current += randomTickStep();
        persistSessionBump(sessionExtraRef.current);
        setDisplay(
          Math.min(MAX_DISPLAY, baselineRef.current + sessionExtraRef.current),
        );
        if (!cancelled) schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [display != null]);

  if (display == null) {
    return (
      <div className="h-9 w-40 rounded-md bg-[#0a1f2d]/15" aria-hidden />
    );
  }

  return (
    <div className="select-none" role="status" aria-live="polite">
      <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase md:text-xs">
        {t("liveCounterLabel")}
      </p>
      <AnalogCounter value={display} locale={loc} size="xs" darkSeparators />
      {hint ? (
        <p className="font-lab-mono text-lab-on-surface-variant mt-2 text-[10px] md:text-[11px]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
