"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLocale, useTranslations } from "next-intl";

const LS_KEY = "delulu-landing-run-display-v1";
const MIN_DISPLAY = 10_000;
const MAX_DISPLAY = 98_000;

function clampDisplay(n: number): number {
  return Math.max(MIN_DISPLAY, Math.min(MAX_DISPLAY, n));
}

/** Seed display in a believable 10k-range based on live-ish API baseline. */
function newPersistedValue(apiRuns: number): number {
  const base = Math.max(2000, Math.floor(apiRuns));
  const boosted = base * 1.9 + Math.floor(Math.random() * 5500);
  const rounded = Math.round(boosted / 100) * 100;
  return clampDisplay(rounded);
}

function nextTickValue(current: number): number {
  const step = 100 + Math.floor(Math.random() * 700);
  return clampDisplay(current + step);
}

export function LandingLiveCounter() {
  const t = useTranslations("landing");
  const hint = t("liveCounterHint").trim();
  const locale = useLocale();
  const wrapRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const prevTargetRef = useRef<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw != null) {
        const p = parseInt(raw, 10);
        if (Number.isFinite(p) && p > 0) {
          setTarget(p);
          return;
        }
      }
    } catch {
      /* noop */
    }

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { runsToday?: number }) => {
        const base = typeof d.runsToday === "number" ? d.runsToday : 8840;
        const n = newPersistedValue(base);
        try {
          localStorage.setItem(LS_KEY, String(n));
        } catch {
          /* noop */
        }
        setTarget(n);
      })
      .catch(() => {
        const n = newPersistedValue(8840);
        try {
          localStorage.setItem(LS_KEY, String(n));
        } catch {
          /* noop */
        }
        setTarget(n);
      });
  }, []);

  useEffect(() => {
    if (target == null || !valueRef.current) return;
    const el = valueRef.current;
    const loc = locale === "zh" ? "zh-HK" : "en-US";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prev = prevTargetRef.current;
    const start = prefersReduced || prev == null ? target : prev;
    const o = { val: start };
    gsap.to(o, {
      val: target,
      duration: prefersReduced ? 0 : 0.9,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = Math.round(o.val).toLocaleString(loc);
      },
    });
    prevTargetRef.current = target;
  }, [target, locale]);

  /** Keep interval stable: do not depend on `target` or every tick clears the pending timeout and never reschedules. */
  const targetReady = target != null;
  useEffect(() => {
    if (!targetReady) return;
    let cancelled = false;
    let timer: number | null = null;

    const schedule = () => {
      const delay = 3000 + Math.floor(Math.random() * 7001);
      timer = window.setTimeout(() => {
        setTarget((prev) => {
          if (prev == null) return prev;
          const next = nextTickValue(prev);
          try {
            localStorage.setItem(LS_KEY, String(next));
          } catch {
            /* noop */
          }
          return next;
        });
        if (!cancelled) schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [targetReady]);

  useEffect(() => {
    if (!wrapRef.current || target == null) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const el = wrapRef.current;
    const ctx = gsap.context(() => {
      gsap.to(el.querySelectorAll("[data-float]"), {
        y: 6,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.35 },
      });
    }, el);
    return () => ctx.revert();
  }, [target]);

  if (target == null) {
    return (
      <div
        className="h-28 w-full max-w-lg rounded-2xl bg-gradient-to-br from-pink-100/80 to-violet-100/60 px-6 py-5 shadow-inner md:h-32"
        aria-hidden
      />
    );
  }

  return (
    <div ref={wrapRef} className="group relative w-full max-w-lg select-none">
      <div
        role="status"
        aria-live="polite"
        className="relative w-full overflow-hidden rounded-2xl border-2 border-pink-200/60 bg-gradient-to-br from-white/95 via-pink-50/90 to-violet-50/85 px-5 py-5 text-left shadow-[0_16px_40px_-12px_rgba(217,70,239,0.35)] md:px-7 md:py-6"
      >
        <div className="pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full bg-fuchsia-400/25 blur-2xl" data-float />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-pink-400/25 blur-2xl" data-float />
        <p className="font-lab-mono relative text-[10px] font-semibold tracking-[0.18em] text-fuchsia-800 uppercase md:text-xs">
          {t("liveCounterLabel")}
        </p>
        <p className="font-lab-display relative mt-1 text-[2.75rem] leading-none font-extrabold tracking-tight text-transparent tabular-nums md:text-[3.5rem]">
          <span className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 bg-clip-text">
            <span ref={valueRef} className="inline-block">
              {target.toLocaleString(locale === "zh" ? "zh-HK" : "en-US")}
            </span>
          </span>
        </p>
        {hint ? (
          <p className="font-lab-mono relative mt-2 text-[10px] text-fuchsia-900/70 md:text-[11px]">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
