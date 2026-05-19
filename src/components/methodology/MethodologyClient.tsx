"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "b1", icon: "functions", hue: "from-[#30c7ff]/35 to-[#30c7ff]/8", tilt: -2 },
  { id: "b2", icon: "height", hue: "from-[#ff8add]/35 to-[#ff8add]/8", tilt: 2 },
  { id: "b3", icon: "payments", hue: "from-[#30c7ff]/30 to-[#ff8add]/12", tilt: -1 },
  { id: "b4", icon: "cake", hue: "from-[#ff8add]/32 to-[#30c7ff]/10", tilt: 3 },
  { id: "b6", icon: "smoke_free", hue: "from-[#ff8add]/30 to-[#30c7ff]/10", tilt: 1 },
  { id: "b7", icon: "apartment", hue: "from-[#30c7ff]/32 to-[#ff8add]/10", tilt: -3 },
  { id: "b8", icon: "public", hue: "from-[#ff8add]/34 to-[#30c7ff]/12", tilt: 2 },
] as const;

type SectionKey = (typeof SECTIONS)[number]["id"];

function FloatingBlob({
  className,
  delay = 0,
  reduced,
}: {
  className?: string;
  delay?: number;
  reduced: boolean;
}) {
  if (reduced) {
    return <div className={cn("pointer-events-none absolute rounded-full opacity-40", className)} aria-hidden />;
  }

  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full opacity-50 blur-[1px]", className)}
      aria-hidden
      animate={{ y: [0, -14, 6, 0], rotate: [0, 8, -6, 0], scale: [1, 1.06, 0.96, 1] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function MethodologySectionCard({
  index,
  sectionKey,
  icon,
  hue,
  tilt,
  reduced,
}: {
  index: number;
  sectionKey: SectionKey;
  icon: string;
  hue: string;
  tilt: number;
  reduced: boolean;
}) {
  const t = useTranslations("methodology");
  const titleKey = `${sectionKey}Title` as "b1Title";
  const bodyKey = sectionKey;

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 28, rotate: tilt }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.55, delay: reduced ? 0 : index * 0.06, type: "spring", stiffness: 120, damping: 18 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 border-lab-on-surface/15 bg-white/88 p-6 shadow-[0_10px_0_rgba(10,31,45,0.06)] backdrop-blur-sm sm:p-8",
        index % 2 === 1 && "md:ml-6",
        index % 2 === 0 && "md:mr-6",
      )}
    >
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-br opacity-90", hue)}
        aria-hidden
        animate={reduced ? undefined : { opacity: [0.65, 0.95, 0.7] }}
        transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex gap-4 sm:gap-6">
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-lab-on-surface bg-lab-surface-container-lowest shadow-[0_4px_0_rgba(10,31,45,0.12)] sm:h-16 sm:w-16"
          animate={reduced ? undefined : { rotate: [0, -6, 6, 0] }}
          transition={{ duration: 4.2 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="material-symbols-outlined text-3xl text-lab-on-surface sm:text-4xl">{icon}</span>
        </motion.div>
        <motion.div className="min-w-0 flex-1">
          <p className="font-lab-mono text-lab-on-surface-variant mb-1 text-[10px] font-semibold tracking-[0.2em] uppercase">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="font-lab-display mb-3 text-2xl leading-tight font-extrabold tracking-tight text-lab-on-surface uppercase sm:text-3xl">
            {t(titleKey)}
          </h2>
          <p className="font-lab-body text-base leading-relaxed text-lab-on-surface sm:text-lg">{t(bodyKey)}</p>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function MethodologyClient() {
  const t = useTranslations("methodology");
  const reduced = useReducedMotion() ?? false;

  return (
    <main className="relative mx-auto flex w-full max-w-[min(100%,40rem)] flex-1 flex-col gap-10 px-4 pt-32 pb-16 sm:gap-12 sm:px-6 md:max-w-3xl md:pt-36 lg:max-w-[56rem] lg:px-8 lg:pb-20">
      <FloatingBlob
        reduced={reduced}
        className="top-8 -left-8 h-28 w-28 bg-[#30c7ff]/40"
        delay={0}
      />
      <FloatingBlob
        reduced={reduced}
        className="top-32 -right-6 h-20 w-20 bg-[#ff8add]/45"
        delay={1.2}
      />

      <header className="relative">
        <motion.p
          initial={reduced ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-lab-mono text-lab-primary mb-4 text-xs font-semibold tracking-[0.25em] uppercase"
        >
          {t("kicker")}
        </motion.p>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
          className="font-lab-display text-5xl leading-[0.95] font-black tracking-tight text-lab-on-surface uppercase sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-lab-body mt-6 max-w-2xl text-lg leading-relaxed text-lab-on-surface-variant sm:text-xl"
        >
          {t("intro")}
        </motion.p>
        <motion.div
          className="methodology-lab-tube mt-8 inline-flex items-center gap-2 rounded-full border-2 border-lab-on-surface bg-lab-primary/20 px-4 py-2"
          animate={reduced ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="material-symbols-outlined text-lg">science</span>
          <span className="font-lab-mono text-xs font-semibold tracking-wide text-lab-on-surface uppercase">
            {t("badge")}
          </span>
        </motion.div>
      </header>

      <div className="relative flex flex-col gap-6 sm:gap-8">
        {SECTIONS.map((section, index) => (
          <MethodologySectionCard key={section.id} index={index} reduced={reduced} {...section} sectionKey={section.id} />
        ))}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.94 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
        className="relative overflow-hidden rounded-3xl border-4 border-lab-on-surface bg-gradient-to-br from-[#30c7ff]/30 via-white to-[#ff8add]/35 p-8 text-center shadow-[0_12px_0_rgba(10,31,45,0.1)] sm:p-12 md:p-14"
      >
        {!reduced ? (
          <>
            <motion.span
              className="absolute top-4 left-6 text-3xl opacity-70"
              animate={{ rotate: [0, 12, -8, 0], y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              aria-hidden
            >
              🧪
            </motion.span>
            <motion.span
              className="absolute right-8 bottom-6 text-3xl opacity-70"
              animate={{ rotate: [0, -10, 10, 0], y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 0.6 }}
              aria-hidden
            >
              📊
            </motion.span>
          </>
        ) : null}
        <p className="font-lab-mono text-lab-on-surface-variant mb-3 text-xs font-semibold tracking-[0.22em] uppercase">
          {t("outroKicker")}
        </p>
        <p className="font-lab-display mx-auto max-w-3xl text-2xl leading-[1.15] font-black tracking-tight text-lab-on-surface uppercase sm:text-3xl md:text-4xl lg:text-[2.75rem]">
          {t("outro")}
        </p>
      </motion.div>

      <Link href="/" className="puffy-btn puffy-btn-lg puffy-btn-soft w-fit">
        {t("back")}
      </Link>
    </main>
  );
}
