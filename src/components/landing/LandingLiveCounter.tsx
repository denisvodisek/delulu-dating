"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLocale, useTranslations } from "next-intl";

const LS_KEY = "delulu-landing-run-display-v1";

/** Theatrical count, always rounded to thousands; stable per browser via localStorage. */
function newPersistedValue(apiRuns: number): number {
  const k = Math.max(1, Math.floor(apiRuns));
  const salt = 2048 + Math.floor(Math.random() * 8192);
  return Math.round((k * 1000 + salt) / 1000) * 1000;
}

export function LandingLiveCounter() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const wrapRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
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
    const start = prefersReduced ? target : Math.floor(target * 0.88);
    const o = { val: start };
    gsap.to(o, {
      val: target,
      duration: prefersReduced ? 0 : 2.4,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = Math.round(o.val).toLocaleString(loc);
      },
    });
  }, [target, locale]);

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

  function poke() {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current,
      { scale: 1 },
      { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" },
    );
  }

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
      <button
        type="button"
        onClick={poke}
        className="relative w-full overflow-hidden rounded-2xl border-2 border-pink-200/60 bg-gradient-to-br from-white/95 via-pink-50/90 to-violet-50/85 px-5 py-5 text-left shadow-[0_16px_40px_-12px_rgba(217,70,239,0.35)] transition-shadow hover:shadow-[0_20px_44px_-12px_rgba(236,72,153,0.45)] focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:outline-none md:px-7 md:py-6"
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
        <p className="font-lab-mono relative mt-2 text-[10px] text-fuchsia-900/70 md:text-[11px]">
          {t("liveCounterHint")}
        </p>
        <p className="font-lab-mono relative mt-3 text-[9px] text-slate-500 uppercase tracking-wider">
          {t("liveCounterTap")}
        </p>
      </button>
    </div>
  );
}
