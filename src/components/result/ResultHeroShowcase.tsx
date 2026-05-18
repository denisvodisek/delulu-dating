"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Seeker } from "@/lib/types/quiz";

type Props = {
  seeker: Seeker;
  locale: string;
  estimatedMatches: number;
  n: number;
  oddsPastUiCeil: boolean;
  pctLabel: string;
};

export function ResultHeroShowcase({
  seeker,
  locale,
  estimatedMatches,
  n,
  oddsPastUiCeil,
  pctLabel,
}: Props) {
  const t = useTranslations("result");
  const loc = locale === "zh" ? "zh-HK" : "en-US";
  const latinCaps = locale === "en";
  const [displayCount, setDisplayCount] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const rotX = useSpring(0, { stiffness: 280, damping: 32 });
  const rotY = useSpring(0, { stiffness: 280, damping: 32 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayCount(estimatedMatches);
      return;
    }
    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: estimatedMatches,
      duration: 1.45,
      ease: "power3.out",
      onUpdate: () => setDisplayCount(Math.round(o.v)),
    });
    return () => {
      tw.kill();
    };
  }, [estimatedMatches]);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY.set(px * 16);
    rotX.set(-py * 12);
  }

  function onPointerLeave() {
    rotX.set(0);
    rotY.set(0);
  }

  const post =
    seeker === "woman_seeking_man" ? t("heroPoolPost_male") : t("heroPoolPost_female");

  const oneInLine = oddsPastUiCeil
    ? seeker === "woman_seeking_man"
      ? t("oneInCapped", { n })
      : t("oneInCapped_female", { n })
    : seeker === "woman_seeking_man"
      ? t("oneIn", { n })
      : t("oneIn_female", { n });

  return (
    <section
      ref={shellRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative w-full cursor-default overflow-hidden border-b border-lab-outline-variant bg-lab-surface px-4 pb-28 pt-12 md:px-10 md:pb-36 md:pt-16"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-lab-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-20 h-72 w-72 rounded-full bg-lab-tertiary/8 blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 -left-16 h-64 w-64 rounded-full bg-lab-outline-variant/40 blur-2xl" />

      <div className="relative mx-auto w-full max-w-[min(100%,420px)] md:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="rounded-2xl border border-lab-outline-variant bg-lab-surface-container-lowest p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.12)] sm:p-10 md:p-12"
        >
          <motion.div
            className="flex flex-col items-center gap-1 text-center sm:gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.05 }}
          >
            <span className="font-lab-sans text-[11px] font-semibold tracking-[0.42em] text-lab-on-surface-variant sm:text-xs md:tracking-[0.48em]">
              {t("heroPoolPre")}
            </span>
            <span className="font-lab-sans text-lab-primary text-[clamp(2.75rem,14vw,4.85rem)] font-black leading-[0.95] tracking-tight tabular-nums">
              {displayCount.toLocaleString(loc)}
            </span>
            <span
              className={cn(
                "font-lab-display text-[clamp(1.15rem,4.8vw,2.1rem)] font-semibold leading-[1.15] text-lab-ink",
                latinCaps && "italic",
              )}
            >
              {post}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.12 }}
            className="mt-10 flex justify-center [perspective:1400px] md:mt-12"
          >
            <motion.div
              style={{
                rotateX: rotX,
                rotateY: rotY,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="relative w-full"
            >
              <div
                className="absolute -inset-[1px] rounded-2xl bg-lab-primary/35 opacity-90 blur-[2px]"
                style={{ transform: "translateZ(-4px)" }}
              />
              <div className="relative rounded-2xl border border-lab-outline-variant bg-lab-surface-container-lowest px-6 py-7 shadow-md sm:px-8 sm:py-8">
                <p className="font-lab-mono text-[10px] font-semibold tracking-[0.22em] text-lab-on-surface-variant uppercase md:text-[11px]">
                  {t("heroOddsEyebrow")}
                </p>
                <p
                  className={cn(
                    "font-lab-display mt-3 text-2xl font-black leading-tight text-lab-ink sm:text-4xl sm:leading-tight",
                    latinCaps && "uppercase",
                  )}
                >
                  {oneInLine}
                </p>
                <div className="font-lab-mono mt-5 rounded-lg border border-lab-outline-variant bg-lab-surface px-4 py-3 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase sm:text-[11px]">
                  {t(
                    seeker === "woman_seeking_man" ? "heroChanceLine_male" : "heroChanceLine_female",
                    { pct: pctLabel },
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.45 }}
            className="text-lab-on-surface-variant font-lab-body mt-8 text-center text-sm leading-relaxed md:text-base"
          >
            {seeker === "woman_seeking_man" ? t("labHeroSub_male") : t("labHeroSub_female")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
