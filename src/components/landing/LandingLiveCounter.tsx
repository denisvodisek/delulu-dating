"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLocale, useTranslations } from "next-intl";
import { AnalogCounter } from "@/components/ui/AnalogCounter";

const LS_KEY = "delulu-landing-run-display-v2";

/** Small session bump on top of API baseline so the counter keeps climbing. */
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

function randomTickStep(): number {
  return 37 + Math.floor(Math.random() * 91);
}

export function LandingLiveCounter() {
  const t = useTranslations("landing");
  const hint = t("liveCounterHint").trim();
  const locale = useLocale();
  const loc = locale === "zh" ? "zh-HK" : "en-US";
  const wrapRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<number | null>(null);
  const apiBaseRef = useRef(0);
  const sessionExtraRef = useRef(0);

  useEffect(() => {
    sessionExtraRef.current = sessionBump();

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { runsToday?: number }) => {
        const base = typeof d.runsToday === "number" && d.runsToday > 0 ? d.runsToday : 8840;
        apiBaseRef.current = base;
        setDisplay(base + sessionExtraRef.current);
      })
      .catch(() => {
        apiBaseRef.current = 8840;
        setDisplay(8840 + sessionExtraRef.current);
      });
  }, []);

  useEffect(() => {
    if (display == null) return;
    let cancelled = false;
    let timer: number | null = null;

    const schedule = () => {
      const delay = 2800 + Math.floor(Math.random() * 5200);
      timer = window.setTimeout(() => {
        sessionExtraRef.current += randomTickStep();
        persistSessionBump(sessionExtraRef.current);
        setDisplay(apiBaseRef.current + sessionExtraRef.current);
        if (!cancelled) schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [display != null]);

  useEffect(() => {
    if (!wrapRef.current || display == null) return;
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
  }, [display]);

  if (display == null) {
    return (
      <div
        className="h-28 w-full max-w-lg rounded-2xl border-2 border-lab-on-surface bg-lab-surface-container-lowest px-6 py-5 md:h-32"
        aria-hidden
      />
    );
  }

  return (
    <div ref={wrapRef} className="group relative w-full max-w-lg select-none">
      <div
        role="status"
        aria-live="polite"
        className="relative w-full overflow-hidden rounded-2xl border-2 border-lab-on-surface bg-lab-surface-container-lowest px-5 py-5 text-left shadow-[0_6px_0_rgba(10,31,45,0.12)] md:px-7 md:py-6"
      >
        <div className="pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full bg-[#30c7ff]/25 blur-2xl" data-float />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-[#ff8add]/22 blur-2xl" data-float />
        <p className="font-lab-mono text-lab-on-surface-variant relative text-[10px] font-semibold tracking-[0.18em] uppercase md:text-xs">
          {t("liveCounterLabel")}
        </p>
        <div className="relative mt-3">
          <AnalogCounter value={display} locale={loc} size="md" />
        </div>
        {hint ? (
          <p className="font-lab-mono text-lab-on-surface-variant relative mt-2 text-[10px] md:text-[11px]">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
