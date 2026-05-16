"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { calculateDelulu, oneInN } from "@/lib/calc/probability";
import { formatMatchPercent } from "@/lib/format-match";
import { MAX_ONE_IN_DISPLAY } from "@/lib/format-one-in";
import { loadQuiz, clearQuiz } from "@/lib/quiz-storage";
import type { CalculationResult, Seeker } from "@/lib/types/quiz";
import { buildSharedResultPath, encodeSharedResult } from "@/lib/share-payload";
import { trackEvent } from "@/lib/analytics/events";
import { pushRun } from "@/lib/run-history";
import { basePoolForSeeker, buildFiltrationDebt, formatOneInCompact } from "@/lib/result-filtration";

type Snapshot = { calc: CalculationResult; seeker: Seeker };

function severityPercent(tier: CalculationResult["tier"]): number {
  const m: Record<CalculationResult["tier"], number> = {
    realistic: 24,
    picky: 42,
    very_picky: 64,
    delulu: 86,
    god: 97,
  };
  return m[tier];
}

export default function ResultClient({
  children,
  locale,
}: {
  children?: React.ReactNode;
  locale: string;
}) {
  const t = useTranslations("result");
  const tb = useTranslations("bd");
  const ts = useTranslations("share");
  const router = useRouter();
  const historySaved = useRef(false);
  const footerRef = useRef<HTMLElement>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const confettiLaunched = useRef(false);

  useEffect(() => {
    const q = loadQuiz();
    if (!q) {
      router.replace("/quiz");
      return;
    }
    setSnap({ calc: calculateDelulu(q), seeker: q.seeker });
  }, [router]);

  useEffect(() => {
    if (!snap || confettiLaunched.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    confettiLaunched.current = true;
    void import("canvas-confetti").then((mod) => {
      const c = mod.default;
      const candy = ["#f472b6", "#c084fc", "#93c5fd", "#fda4af", "#fce7f3"];
      c({ particleCount: 110, spread: 70, origin: { y: 0.58 }, colors: candy });
      window.setTimeout(() => {
        c({
          particleCount: 70,
          angle: 120,
          spread: 58,
          origin: { x: 1, y: 0.62 },
          colors: candy,
        });
      }, 200);
      window.setTimeout(() => {
        c({
          particleCount: 70,
          angle: 60,
          spread: 58,
          origin: { x: 0, y: 0.62 },
          colors: candy,
        });
      }, 380);
    });
  }, [snap]);

  useEffect(() => {
    if (!snap || historySaved.current) return;
    const q = loadQuiz();
    if (!q) return;
    historySaved.current = true;
    pushRun({
      locale,
      answers: q,
      tier: snap.calc.tier,
      probability: snap.calc.probability,
      estimatedMatches: snap.calc.estimatedMatches,
    });
  }, [snap, locale]);

  useEffect(() => {
    if (!snap) return;
    void trackEvent("result_viewed", {
      locale,
      tier: snap.calc.tier,
      probability: Number(snap.calc.probability.toFixed(6)),
    });
  }, [snap, locale]);

  useLayoutEffect(() => {
    const root = footerRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(root);
    const nodes = q("[data-footer-showcase]");
    if (!nodes.length) return;

    if (reduced) {
      gsap.set(nodes, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(nodes, { opacity: 0, y: 24, scale: 0.98 });
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (!hit) return;
        observer.disconnect();
        gsap.to(nodes, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const shareUrl = useMemo(() => {
    if (!snap) return "https://delulu.dating";
    const token = encodeSharedResult({
      p: Number(snap.calc.probability.toFixed(8)),
      n: snap.calc.estimatedMatches,
      tier: snap.calc.tier,
      ts: Date.now(),
    });
    const path = buildSharedResultPath(locale, token);
    if (typeof window === "undefined") return `https://delulu.dating${path}`;
    return `${window.location.origin}${path}`;
  }, [snap, locale]);

  function buildShareBody(c: CalculationResult) {
    const tierLabel = t(`tier_${c.tier}`);
    const pctLabel = formatMatchPercent(c.probability);
    const n = oneInN(c.probability);
    const oddsPastUiCeil =
      Number.isFinite(c.probability) &&
      c.probability > 0 &&
      Number.isFinite(1 / c.probability) &&
      1 / c.probability > MAX_ONE_IN_DISPLAY;
    return oddsPastUiCeil
      ? t("shareTextCapped", { n, pct: pctLabel, tier: tierLabel })
      : t("shareText", { n, pct: pctLabel, tier: tierLabel });
  }

  function wa() {
    if (!snap) return;
    void trackEvent("result_share_clicked", { channel: "whatsapp", locale });
    const text = encodeURIComponent(`${buildShareBody(snap.calc)} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  async function copy() {
    if (!snap) return;
    void trackEvent("result_share_clicked", { channel: "copy", locale });
    try {
      await navigator.clipboard.writeText(`${buildShareBody(snap.calc)} ${shareUrl}`);
    } catch {
      /* noop */
    }
  }

  if (!snap) {
    return (
      <div className="font-lab-body text-lab-on-surface-variant flex min-h-[40vh] flex-1 items-center justify-center p-8">
        …
      </div>
    );
  }

  const { calc, seeker } = snap;
  const pctLabel = formatMatchPercent(calc.probability);
  const tierKey = `tier_${calc.tier}` as const;
  const tierLabel = t(tierKey);
  const n = oneInN(calc.probability);
  const oddsPastUiCeil =
    Number.isFinite(calc.probability) &&
    calc.probability > 0 &&
    Number.isFinite(1 / calc.probability) &&
    1 / calc.probability > MAX_ONE_IN_DISPLAY;

  const compactIn = oddsPastUiCeil
    ? `${MAX_ONE_IN_DISPLAY.toLocaleString()}+`
    : formatOneInCompact(n, MAX_ONE_IN_DISPLAY);

  const debtRows = buildFiltrationDebt(seeker, calc.breakdown);
  const basePool = basePoolForSeeker(seeker);
  const sev = severityPercent(calc.tier);
  const alarming = sev >= 74;

  const stageTitle = t(`labStageTitle_${calc.tier}` as "labStageTitle_realistic");
  const stageBody = t(`labStageBody_${calc.tier}` as "labStageBody_realistic");
  const tagsRaw = t(`labTags_${calc.tier}` as "labTags_realistic");
  const tags = tagsRaw.split("|").map((s) => s.trim());

  const tightest = [...calc.breakdown]
    .filter((r) => r.key !== "correlation")
    .sort((a, b) => a.factor - b.factor)[0];

  return (
    <main className="flex flex-1 flex-col pt-20">
      <section className="relative w-full overflow-hidden border-b border-pink-200/45 bg-gradient-to-b from-pink-100/70 via-white to-violet-50/50 px-4 pb-20 pt-8 md:px-16">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-pink-300/35 via-fuchsia-200/25 to-violet-300/35 blur-3xl" />
        <motion.div
          className="relative mx-auto max-w-7xl text-center"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.9 }}
        >
          <h1 className="font-lab-display mb-4 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 bg-clip-text text-5xl leading-none font-extrabold text-transparent drop-shadow-sm md:text-7xl lg:text-[84px] lg:leading-[90px]">
            <span className="mr-2 text-[0.45em] font-semibold tracking-tight md:text-[0.5em]">
              {t("labHeroInPrefix")}
            </span>
            {compactIn}
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="font-lab-mono text-lab-on-surface-variant mx-auto mt-2 max-w-2xl rounded-2xl border border-pink-200/50 bg-white/70 px-5 py-4 text-xs uppercase tracking-wide shadow-sm backdrop-blur-sm"
          >
            {t("heroChanceLine", { pct: pctLabel })}
          </motion.div>
          <p className="font-lab-body text-lab-on-surface-variant mx-auto mt-5 max-w-xl text-sm leading-relaxed">
            {t("poolExplainer", { count: calc.estimatedMatches })}
          </p>
          <p className="font-lab-body text-lab-on-surface-variant mx-auto mt-4 max-w-xl text-xs leading-relaxed opacity-80 md:text-sm md:opacity-75">
            {seeker === "woman_seeking_man" ? t("labHeroSub_male") : t("labHeroSub_female")}
          </p>
        </motion.div>
      </section>

      <section className="grid min-h-[600px] w-full grid-cols-1 border-pink-200/35 bg-gradient-to-b from-white via-pink-50/20 to-violet-50/30 px-4 md:grid-cols-12 md:items-start md:px-16">
        <div className="border-b border-pink-200/40 py-12 md:col-span-7 md:border-r md:border-b-0 md:py-16 md:pr-12">
          <div className="mb-12">
            <p className="font-lab-mono mb-3 text-xs font-semibold tracking-wide text-fuchsia-700 uppercase">
              {t("labBreakdownKicker")}
            </p>
            <h2 className="font-lab-display mb-2 text-3xl uppercase md:text-5xl md:leading-[52px]">
              {t("labDebtTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body text-base leading-relaxed">
              {t("labDebtSub", { base: basePool })}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {debtRows.map((row, idx) => (
              <div
                key={row.key}
                className="grid grid-cols-12 items-center gap-y-3 rounded-2xl border border-pink-200/50 bg-white/75 p-5 shadow-sm backdrop-blur-sm md:p-6"
              >
                <div className="font-lab-display col-span-12 text-2xl text-fuchsia-700/35 md:col-span-1">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="col-span-12 md:col-span-5">
                  <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {row.isBoost ? t("labBoostLabel") : t("labColFilter")}
                  </p>
                  <p className="font-lab-body text-lg font-bold">{tb(row.labelKey)}</p>
                </div>
                <div className="col-span-6 text-left md:col-span-3 md:text-right">
                  <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {t("labColReduction")}
                  </p>
                  <p
                    className={cn(
                      "font-lab-mono text-sm font-semibold",
                      row.isBoost ? "text-lab-tertiary" : "text-lab-error",
                    )}
                  >
                    {row.isBoost
                      ? t("labBoostValue", { pct: row.pctCut })
                      : t("labReductionValue", { pct: row.pctCut })}
                  </p>
                </div>
                <div className="col-span-6 text-right md:col-span-3">
                  <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {t("labColRemaining")}
                  </p>
                  <p className="font-lab-mono text-sm font-medium tabular-nums">
                    {row.remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {tightest ? (
            <div className="mt-10 rounded-2xl border border-pink-200/60 bg-gradient-to-br from-pink-50/80 to-violet-50/60 p-6 shadow-sm">
              <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-xs font-semibold uppercase">
                {t("tips")}
              </p>
              <p className="font-lab-body text-lab-on-surface text-sm leading-relaxed">
                {t("tipTight", { label: tb(tightest.labelKey) })}
              </p>
            </div>
          ) : null}

          {(calc.tier === "delulu" || calc.tier === "god") && (
            <div className="mt-8 rounded-2xl border-2 border-rose-300/70 bg-gradient-to-br from-rose-100 via-pink-50 to-white p-8 shadow-sm">
              <p className="font-lab-mono mb-2 text-xs font-semibold text-rose-900 uppercase">
                {t("labSystemAlert_title")}
              </p>
              <p className="font-lab-body text-sm leading-relaxed text-rose-950/90">
                {calc.tier === "god" ? t("labSystemAlert_god") : t("labSystemAlert_delulu")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 py-12 md:col-span-5 md:py-16 md:pl-12">
          <div className="sticky top-24 z-20 self-start md:top-28">
            <div className="mb-10 overflow-hidden rounded-3xl border-2 border-pink-200/55 bg-white/90 shadow-[0_20px_50px_-12px_rgba(236,72,153,0.2)] backdrop-blur-sm">
              <div className="border-b border-pink-200/50 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 px-6 py-3">
                <p className="font-lab-mono text-xs font-semibold tracking-wide text-white uppercase drop-shadow-sm">
                  {t("labClinicalLabel")}
                </p>
              </div>
              <div className="p-8">
                <p className="font-lab-mono text-lab-on-surface-variant mb-1 text-xs font-semibold uppercase">
                  {tierLabel}
                </p>
                <h3 className="font-lab-display text-lab-on-surface mb-4 text-3xl font-bold uppercase md:text-4xl">
                  {stageTitle}
                </h3>
                <div className="mb-6 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-lab-mono rounded-full border border-pink-200/60 bg-gradient-to-r from-pink-100/80 to-violet-100/80 px-3 py-1 text-[10px] font-semibold tracking-wide text-fuchsia-900 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="font-lab-body text-lab-on-surface-variant mb-8 text-sm leading-relaxed">
                  {stageBody}
                </p>

                <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-xs font-semibold uppercase tracking-wide">
                  {t("labSeverityLabel")}
                </p>
                <div
                  className={cn(
                    "relative h-10 w-full overflow-hidden rounded-full border-2 border-pink-200/50 bg-pink-50/50",
                    alarming && "ring-2 ring-rose-400 ring-offset-2 ring-offset-white",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-full",
                      alarming
                        ? "animate-pulse bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-pink-400 via-fuchsia-500 to-violet-500",
                    )}
                    style={{ width: `${sev}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end px-4">
                    <span
                      className={cn(
                        "font-lab-mono text-sm font-bold tabular-nums drop-shadow-sm",
                        alarming || sev > 40 ? "text-white" : "text-fuchsia-950",
                      )}
                    >
                      {sev}%
                    </span>
                  </div>
                </div>
                {alarming ? (
                  <p className="font-lab-mono text-lab-error mt-3 text-center text-[10px] font-bold uppercase tracking-widest">
                    {t("labSeverityCritical")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
              {t("labTransmit")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={wa}
                className="font-lab-mono flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-pink-200/70 bg-white py-4 text-xs font-semibold tracking-wide text-fuchsia-900 uppercase transition-all hover:border-fuchsia-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-violet-50"
              >
                <span className="material-symbols-outlined text-base">share</span>
                {ts("whatsapp")}
              </button>
              <button
                type="button"
                onClick={() => void copy()}
                className="font-lab-mono flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-pink-200/70 bg-white py-4 text-xs font-semibold tracking-wide text-fuchsia-900 uppercase transition-all hover:border-fuchsia-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-violet-50"
              >
                <span className="material-symbols-outlined text-base">content_copy</span>
                {ts("copy")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-pink-200/45 bg-gradient-to-r from-violet-100/40 via-pink-50/60 to-sky-50/40 px-4 py-16 md:px-16 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h4 className="font-lab-display mb-2 text-2xl uppercase md:text-4xl md:leading-[52px]">
              {t("labSecondOpinionTitle")}
            </h4>
            <p className="text-lab-on-surface-variant font-lab-body text-base">{t("labSecondOpinionSub")}</p>
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                clearQuiz();
                router.push("/quiz");
              }}
              className="font-lab-mono rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-8 py-5 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-pink-300/35 transition-all hover:brightness-105"
            >
              {t("labRedoCalc")}
            </button>
            <Link
              href="/methodology"
              className="font-lab-mono flex items-center justify-center rounded-2xl border-2 border-pink-200/70 bg-white px-8 py-5 text-xs font-semibold tracking-widest text-fuchsia-900 uppercase transition-all hover:border-fuchsia-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-violet-50"
            >
              {t("labReadMethod")}
            </Link>
          </div>
        </div>
      </section>

      <footer
        ref={footerRef}
        className="relative overflow-hidden border-t border-pink-200/40 bg-gradient-to-br from-[#fff5fb] via-[#f7f0ff] to-[#eef7ff] px-4 py-14 md:px-16 md:py-16"
      >
        <div className="pointer-events-none absolute -top-16 -left-8 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-14 bottom-0 h-52 w-52 rounded-full bg-violet-300/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div data-footer-showcase>
            <h4 className="font-lab-display text-3xl font-extrabold tracking-tight uppercase md:text-5xl md:leading-[1.02]">
              {t("labFooterTitle")}
            </h4>
            <p className="font-lab-body text-lab-on-surface-variant mt-4 max-w-xl text-base leading-relaxed">
              {t("labFooterSub")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="font-lab-mono rounded-full border border-pink-200/70 bg-white/85 px-3 py-1 text-[10px] font-semibold tracking-wide text-fuchsia-900 uppercase">
                {t("labFooterBadgeModel")}
              </span>
              <span className="font-lab-mono rounded-full border border-violet-200/70 bg-white/85 px-3 py-1 text-[10px] font-semibold tracking-wide text-violet-900 uppercase">
                {t("labFooterBadgePrivate")}
              </span>
              <span className="font-lab-mono rounded-full border border-sky-200/70 bg-white/85 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-900 uppercase">
                {t("labFooterBadgeHK")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-pink-200/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-[10px] font-semibold tracking-wider text-fuchsia-700 uppercase">{t("labFooterStat1Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat1Value")}</p>
          </div>
          <div className="rounded-2xl border border-violet-200/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-[10px] font-semibold tracking-wider text-violet-700 uppercase">{t("labFooterStat2Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat2Value")}</p>
          </div>
          <div className="rounded-2xl border border-sky-200/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-[10px] font-semibold tracking-wider text-sky-700 uppercase">{t("labFooterStat3Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat3Value")}</p>
          </div>
        </div>

        <div
          className="relative mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-pink-200/45 pt-6 md:flex-row"
          data-footer-showcase
        >
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-lab-mono text-sm font-bold uppercase tracking-wide text-lab-on-surface">
              {t("labFooterBrand")}
            </span>
            <span className="text-lab-on-surface-variant font-lab-body max-w-md text-xs md:text-sm">{t("labFooterLegal")}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <Link
              href="/methodology"
              className="font-lab-mono rounded-full border border-pink-200/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-fuchsia-900 uppercase transition-all hover:border-fuchsia-300"
            >
              {t("labFooterMethodology")}
            </Link>
            <span className="font-lab-mono rounded-full border border-pink-200/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-fuchsia-900 uppercase">
              {t("labFooterPrivacy")}
            </span>
            <span className="font-lab-mono rounded-full border border-pink-200/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-fuchsia-900 uppercase">
              {t("labFooterSocials")}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
