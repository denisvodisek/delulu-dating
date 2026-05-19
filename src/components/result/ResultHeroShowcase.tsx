"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { ShareExportButtonPair } from "@/components/result/ShareExportButtonPair";
import { AnalogCounter } from "@/components/ui/AnalogCounter";
import { cn } from "@/lib/utils";
import type { Seeker } from "@/lib/types/quiz";

type Props = {
  seeker: Seeker;
  locale: string;
  estimatedMatches: number;
  n: number;
  oddsPastUiCeil: boolean;
  pctLabel: string;
  onDownloadResults?: () => void;
  onShareResults?: () => void;
  exportBusy?: boolean;
  downloadLabel: string;
  shareLabel: string;
  exportWorkingLabel: string;
};

export function ResultHeroShowcase({
  seeker,
  locale,
  estimatedMatches,
  n,
  oddsPastUiCeil,
  pctLabel,
  onDownloadResults,
  onShareResults,
  exportBusy = false,
  downloadLabel,
  shareLabel,
  exportWorkingLabel,
}: Props) {
  const t = useTranslations("result");
  const loc = locale === "zh-HK" ? "zh-HK" : "en-US";
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
  const chanceLine = t(
    seeker === "woman_seeking_man" ? "heroChanceLine_male" : "heroChanceLine_female",
    { pct: pctLabel },
  );

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
      className="relative w-full cursor-default overflow-hidden border-b-2 border-lab-on-surface/12 bg-gradient-to-b from-lab-surface via-white to-lab-primary-fixed/35 px-4 pb-28 pt-12 md:px-10 md:pb-36 md:pt-16"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#30c7ff]/28 via-white/40 to-[#ff8add]/22 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-bl from-[#ff8add]/22 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute bottom-8 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-[#30c7ff]/20 to-transparent blur-2xl" />

      <div className="relative mx-auto w-full max-w-[min(100%,420px)] md:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="rounded-[2.25rem] border-2 border-lab-on-surface/10 bg-gradient-to-b from-white/82 via-white/62 to-[#30c7ff]/12 p-8 shadow-[0_28px_80px_-28px_rgba(48,199,255,0.38),0_18px_48px_-24px_rgba(255,138,221,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-lab-on-surface/8 backdrop-blur-md sm:p-10 md:p-12"
        >
          <motion.div
            className="flex flex-col items-center gap-3 text-center sm:gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.05 }}
          >
            <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-[11px]">
              {t("heroPoolKicker")}
            </p>
            <AnalogCounter value={displayCount} locale={loc} size="hero" />
            <p
              className={cn(
                "font-lab-display max-w-md text-[clamp(1.25rem,4.5vw,2rem)] leading-tight font-bold text-lab-ink",
                latinCaps && "uppercase",
              )}
            >
              {post}
            </p>
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
                className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[#30c7ff] via-[#7ddcff] to-[#ff8add] opacity-90 blur-[2px]"
                style={{ transform: "translateZ(-4px)" }}
              />
              <div className="relative rounded-3xl border-2 border-lab-on-surface/12 bg-white/90 px-6 py-7 text-left shadow-[0_24px_64px_-20px_rgba(48,199,255,0.35),0_12px_40px_-16px_rgba(255,138,221,0.2)] backdrop-blur-md sm:px-8 sm:py-8">
                <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-[0.22em] uppercase md:text-[11px]">
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
                <p className="font-lab-body text-lab-on-surface mt-5 text-left text-sm leading-relaxed sm:text-base">
                  {chanceLine}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {onDownloadResults && onShareResults ? (
            <div className="mt-8 flex justify-center">
              <ShareExportButtonPair
                onDownload={onDownloadResults}
                onShare={onShareResults}
                downloadLabel={downloadLabel}
                shareLabel={shareLabel}
                workingLabel={exportWorkingLabel}
                busy={exportBusy}
              />
            </div>
          ) : null}

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
