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
      className="relative w-full cursor-default overflow-hidden border-b border-pink-200/45 bg-gradient-to-b from-[#fff5fb] via-white to-violet-50/55 px-4 pb-28 pt-12 md:px-10 md:pb-36 md:pt-16"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-400/30 via-pink-300/20 to-violet-400/25 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-bl from-pink-400/25 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-violet-400/20 to-transparent blur-2xl" />

      <div className="relative mx-auto w-full max-w-[min(100%,420px)] md:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="rounded-[2.25rem] border border-white/80 bg-gradient-to-b from-white/70 via-white/50 to-pink-50/40 p-8 shadow-[0_28px_80px_-28px_rgba(192,38,211,0.5),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-pink-200/55 backdrop-blur-md sm:p-10 md:p-12"
        >
          <motion.div
            className="flex flex-col items-center gap-1 text-center sm:gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.05 }}
          >
            <span className="font-lab-sans text-[11px] font-semibold tracking-[0.42em] text-fuchsia-900/75 sm:text-xs md:tracking-[0.48em]">
              {t("heroPoolPre")}
            </span>
            <span className="font-lab-sans bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 bg-clip-text text-[clamp(2.75rem,14vw,4.85rem)] font-black leading-[0.95] tracking-tight text-transparent tabular-nums drop-shadow-[0_4px_32px_rgba(217,70,239,0.22)]">
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
                className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-fuchsia-400 via-pink-400 to-violet-500 opacity-85 blur-[2px]"
                style={{ transform: "translateZ(-4px)" }}
              />
              <div className="relative rounded-3xl border border-white/70 bg-white/88 px-6 py-7 shadow-[0_24px_64px_-20px_rgba(192,38,211,0.45)] backdrop-blur-md sm:px-8 sm:py-8">
                <p className="font-lab-mono text-[10px] font-semibold tracking-[0.22em] text-violet-700 uppercase md:text-[11px]">
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
                <div className="font-lab-mono mt-5 rounded-2xl border border-pink-200/60 bg-gradient-to-r from-pink-50/90 to-violet-50/80 px-4 py-3 text-[10px] font-semibold tracking-wide text-fuchsia-950/90 uppercase sm:text-[11px]">
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
