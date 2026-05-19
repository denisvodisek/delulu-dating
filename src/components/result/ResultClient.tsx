"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { calculateDelulu, oneInN } from "@/lib/calc/probability";
import { formatMatchPercent } from "@/lib/format-match";
import { MAX_ONE_IN_DISPLAY } from "@/lib/format-one-in";
import { loadQuiz, clearQuiz } from "@/lib/quiz-storage";
import type { CalculationResult, Seeker } from "@/lib/types/quiz";
import { trackEvent } from "@/lib/analytics/events";
import { pushRun } from "@/lib/run-history";
import { ResultHeroShowcase } from "@/components/result/ResultHeroShowcase";
import { PoolRealityFunnelBlock } from "@/components/result/PoolRealityFunnelBlock";
import { ResultDiagnosisExportCard } from "@/components/result/ResultDiagnosisExportCard";
import { ResultStoryExportCard } from "@/components/result/ResultStoryExportCard";
import { ShareExportButtonPair } from "@/components/result/ShareExportButtonPair";
import { downloadExportImage, shareExportImage } from "@/lib/share-export-image";
import { formatFiltrationSelection } from "@/lib/quiz-filtration-selection";
import { buildPoolRealityFunnel } from "@/lib/pool-reality-funnel";
import { buildFiltrationDebt } from "@/lib/result-filtration";

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
  const tQuiz = useTranslations("quiz");
  const tb = useTranslations("bd");
  const ts = useTranslations("share");
  const router = useRouter();
  const historySaved = useRef(false);
  const footerRef = useRef<HTMLElement>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [resultsExportBusy, setResultsExportBusy] = useState(false);
  const [diagnosisExportBusy, setDiagnosisExportBusy] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const confettiLaunched = useRef(false);
  const storyExportRef = useRef<HTMLDivElement>(null);
  const diagnosisExportRef = useRef<HTMLDivElement>(null);

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
      const delulu = ["#30c7ff", "#ff8add", "#0a1f2d", "#e8f7ff", "#f4fbff"];
      c({ particleCount: 110, spread: 70, origin: { y: 0.58 }, colors: delulu });
      window.setTimeout(() => {
        c({
          particleCount: 70,
          angle: 120,
          spread: 58,
          origin: { x: 1, y: 0.62 },
          colors: delulu,
        });
      }, 200);
      window.setTimeout(() => {
        c({
          particleCount: 70,
          angle: 60,
          spread: 58,
          origin: { x: 0, y: 0.62 },
          colors: delulu,
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

  async function downloadResultsImage() {
    if (!snap || !storyExportRef.current) return;
    setResultsExportBusy(true);
    const outcome = await downloadExportImage(storyExportRef.current, "delulu-results.png");
    void trackEvent("result_share_clicked", {
      channel: `results_download_${outcome}`,
      locale,
    });
    setResultsExportBusy(false);
  }

  function showShareNotice(outcome: Awaited<ReturnType<typeof shareExportImage>>) {
    if (outcome === "clipboard") {
      setShareNotice(ts("shareClipboardHint"));
      window.setTimeout(() => setShareNotice(null), 5000);
    }
  }

  async function shareResultsImage() {
    if (!snap || !storyExportRef.current) return;
    setResultsExportBusy(true);
    const outcome = await shareExportImage(storyExportRef.current, "delulu-results.png");
    showShareNotice(outcome);
    void trackEvent("result_share_clicked", {
      channel: `results_${outcome}`,
      locale,
    });
    setResultsExportBusy(false);
  }

  async function downloadDiagnosisImage() {
    if (!snap || !diagnosisExportRef.current) return;
    setDiagnosisExportBusy(true);
    const outcome = await downloadExportImage(diagnosisExportRef.current, "delulu-diagnosis.png");
    void trackEvent("result_share_clicked", {
      channel: `diagnosis_download_${outcome}`,
      locale,
    });
    setDiagnosisExportBusy(false);
  }

  async function shareDiagnosisImage() {
    if (!snap || !diagnosisExportRef.current) return;
    setDiagnosisExportBusy(true);
    const outcome = await shareExportImage(diagnosisExportRef.current, "delulu-diagnosis.png");
    showShareNotice(outcome);
    void trackEvent("result_share_clicked", {
      channel: `diagnosis_${outcome}`,
      locale,
    });
    setDiagnosisExportBusy(false);
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

  const debtRows = buildFiltrationDebt(seeker, calc.breakdown);
  const funnelSteps = buildPoolRealityFunnel(seeker);
  const sev = severityPercent(calc.tier);
  const alarming = sev >= 74;

  const answers = loadQuiz();
  const plainExplain = t(`labPlainExplain_${calc.tier}` as "labPlainExplain_realistic");
  const stageTitle = t(`labStageTitle_${calc.tier}` as "labStageTitle_realistic");
  const tagsRaw = t(`labTags_${calc.tier}` as "labTags_realistic");
  const poolPre = t("heroPoolKicker");
  const poolPost =
    seeker === "woman_seeking_man" ? t("heroPoolPost_male") : t("heroPoolPost_female");
  const tags = tagsRaw.split("|").map((s) => s.trim());

  const tightest = [...calc.breakdown]
    .filter((r) => r.key !== "correlation")
    .sort((a, b) => a.factor - b.factor)[0];

  const storyPre = t("heroPoolPre");
  const storyPost = seeker === "woman_seeking_man" ? t("heroPoolPost_male") : t("heroPoolPost_female");
  const storyOneIn = oddsPastUiCeil
    ? seeker === "woman_seeking_man"
      ? t("oneInCapped", { n })
      : t("oneInCapped_female", { n })
    : seeker === "woman_seeking_man"
      ? t("oneIn", { n })
      : t("oneIn_female", { n });
  const storyChance = t(
    seeker === "woman_seeking_man" ? "heroChanceLine_male" : "heroChanceLine_female",
    { pct: pctLabel },
  );

  return (
    <main className="flex flex-1 flex-col pt-20">
      {shareNotice ? (
        <div
          role="status"
          className="font-lab-body fixed top-20 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-2xl border-2 border-lab-on-surface bg-lab-surface-container-lowest px-4 py-3 text-center text-sm shadow-lg"
        >
          {shareNotice}
        </div>
      ) : null}
      <ResultHeroShowcase
        seeker={seeker}
        locale={locale}
        estimatedMatches={calc.estimatedMatches}
        n={n}
        oddsPastUiCeil={oddsPastUiCeil}
        pctLabel={pctLabel}
        onDownloadResults={() => void downloadResultsImage()}
        onShareResults={() => void shareResultsImage()}
        exportBusy={resultsExportBusy}
        downloadLabel={ts("downloadImage")}
        shareLabel={ts("shareImage")}
        exportWorkingLabel={ts("storyImageWorking")}
      />

      <section className="grid min-h-[600px] w-full grid-cols-1 border-lab-outline-variant bg-lab-surface/80 px-4 md:grid-cols-12 md:items-start md:px-16">
        <aside className="order-1 border-b border-lab-outline-variant py-8 md:order-2 md:col-span-5 md:border-b-0 md:border-l md:py-16 md:pl-12">
          <div className="sticky top-20 z-20 w-full md:top-28">
            <div className="overflow-hidden rounded-3xl border-2 border-lab-on-surface bg-lab-surface-container-lowest shadow-[0_8px_0_rgba(10,31,45,0.08)] backdrop-blur-sm">
              <div className="border-b-2 border-lab-on-surface bg-gradient-to-r from-[#30c7ff] to-[#ff8add] px-6 py-3">
                <p className="font-lab-mono text-xs font-semibold tracking-wide text-lab-on-surface uppercase drop-shadow-sm">
                  {t("labClinicalLabel")}
                </p>
              </div>
              <div className="p-8">
                <p className="font-lab-mono text-lab-primary mb-2 text-xs font-semibold tracking-wide uppercase">
                  {tierLabel}
                </p>
                <h3 className="font-lab-display text-lab-on-surface mb-3 text-2xl font-bold leading-tight md:text-3xl">
                  {stageTitle}
                </h3>
                <p className="font-lab-body text-lab-on-surface mb-4 text-sm leading-relaxed">{plainExplain}</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-lab-secondary/25 px-3 py-1 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mb-8 rounded-2xl border-2 border-lab-on-surface/12 bg-lab-surface-container-lowest/80 px-4 py-4 text-center">
                  <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-[0.18em] uppercase">
                    {poolPre}
                  </p>
                  <p className="font-lab-display mt-1 text-3xl font-bold tabular-nums text-lab-primary">
                    {calc.estimatedMatches.toLocaleString(locale === "zh" ? "zh-HK" : "en-US")}
                  </p>
                  <p className="font-lab-display text-lab-on-surface mt-1 text-sm font-bold uppercase">
                    {poolPost}
                  </p>
                </div>
                <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-xs font-semibold uppercase tracking-wide">
                  {t("labSeverityLabel")}
                </p>
                <div
                  className={cn(
                    "relative h-10 w-full overflow-hidden rounded-full border-2 border-lab-on-surface bg-lab-surface-container-lowest",
                    alarming && "ring-2 ring-lab-error/50 ring-offset-2 ring-offset-lab-surface-container-lowest",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                      alarming
                        ? "animate-pulse bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-[#30c7ff] to-[#ff8add]",
                    )}
                    style={{ width: `${sev}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end px-4">
                    <span
                      className={cn(
                        "font-lab-mono text-sm font-bold tabular-nums drop-shadow-sm",
                        alarming || sev > 40 ? "text-white" : "text-lab-on-surface",
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
          <div className="mt-8 flex flex-col gap-4">
            <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
              {t("labTransmit")}
            </p>
            <ShareExportButtonPair
              onDownload={() => void downloadDiagnosisImage()}
              onShare={() => void shareDiagnosisImage()}
              downloadLabel={ts("downloadImage")}
              shareLabel={ts("shareImage")}
              workingLabel={ts("storyImageWorking")}
              busy={diagnosisExportBusy}
              soft
              fullWidth
            />
          </div>
        </aside>

        <div className="order-2 border-b border-lab-outline-variant py-12 md:order-1 md:col-span-7 md:border-r md:border-b-0 md:py-16 md:pr-12">
          <div className="mb-12">
            <p className="font-lab-mono text-lab-primary mb-3 text-xs font-semibold tracking-wide uppercase">
              {t("labBreakdownKicker")}
            </p>
            <h2 className="font-lab-display mb-2 text-3xl uppercase md:text-5xl md:leading-[52px]">
              {t("labDebtTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body text-base leading-relaxed">
              {t("labDebtSub")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {debtRows.map((row, idx) => (
              <div
                key={row.key}
                className="grid grid-cols-12 items-center gap-y-3 rounded-2xl border-2 border-lab-on-surface/15 bg-lab-surface-container-lowest p-5 shadow-sm md:p-6"
              >
                <div className="font-lab-display col-span-12 text-2xl text-lab-primary/35 md:col-span-1">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="col-span-12 md:col-span-5">
                  <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {row.isBoost ? t("labBoostLabel") : t("labColFilter")}
                  </p>
                  <p className="font-lab-body text-lg font-bold">{tb(row.labelKey)}</p>
                  {answers ? (
                    <p className="font-lab-mono text-lab-primary mt-1.5 text-[11px] font-semibold tracking-wide uppercase">
                      {t("labYourPick")}:{" "}
                      {formatFiltrationSelection(row.key, answers, {
                        quiz: (k) => tQuiz(k as Parameters<typeof tQuiz>[0]),
                      })}
                    </p>
                  ) : null}
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
            <div className="mt-10 rounded-2xl border-2 border-lab-on-surface/15 bg-lab-primary/10 p-6 shadow-sm">
              <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-xs font-semibold uppercase">
                {t("tips")}
              </p>
              <p className="font-lab-body text-lab-on-surface text-sm leading-relaxed">
                {t("tipTight", { label: tb(tightest.labelKey) })}
              </p>
            </div>
          ) : null}

          {(calc.tier === "delulu" || calc.tier === "god") && (
            <div className="mt-8 rounded-2xl border-2 border-lab-error/45 bg-lab-error-container p-8 shadow-sm">
              <p className="font-lab-mono text-lab-on-error-container mb-2 text-xs font-semibold uppercase">
                {t("labSystemAlert_title")}
              </p>
              <p className="font-lab-body text-lab-on-error-container text-sm leading-relaxed">
                {calc.tier === "god" ? t("labSystemAlert_god") : t("labSystemAlert_delulu")}
              </p>
            </div>
          )}
        </div>

      </section>

      <section className="w-full border-t-2 border-lab-on-surface/12 bg-lab-surface/50 px-4 py-12 md:px-16 md:py-16">
        <div className="mx-auto max-w-3xl">
          <PoolRealityFunnelBlock steps={funnelSteps} locale={locale} />
        </div>
      </section>

      <section className="w-full border-t-2 border-lab-on-surface bg-lab-surface-container-lowest px-4 py-16 md:px-16 md:py-24">
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
              className="puffy-btn puffy-btn-lg puffy-btn-lavender px-8 py-5 tracking-widest"
            >
              {t("labRedoCalc")}
            </button>
            <Link
              href="/methodology"
              className="puffy-btn puffy-btn-lg puffy-btn-soft px-8 py-5 tracking-widest"
            >
              {t("labReadMethod")}
            </Link>
          </div>
        </div>
      </section>

      <footer
        ref={footerRef}
        className="relative overflow-hidden border-t-2 border-lab-on-surface bg-lab-surface px-4 py-14 md:px-16 md:py-16"
      >
        <div className="pointer-events-none absolute -top-16 -left-8 h-44 w-44 rounded-full bg-[#30c7ff]/22 blur-3xl" />
        <div className="pointer-events-none absolute -right-14 bottom-0 h-52 w-52 rounded-full bg-[#ff8add]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#30c7ff]/18 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div data-footer-showcase>
            <h4 className="font-lab-display text-3xl font-extrabold tracking-tight uppercase md:text-5xl md:leading-[1.02]">
              {t("labFooterTitle")}
            </h4>
            <p className="font-lab-body text-lab-on-surface-variant mt-4 max-w-xl text-base leading-relaxed">
              {t("labFooterSub")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-[#30c7ff]/25 px-3 py-1 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase">
                {t("labFooterBadgeModel")}
              </span>
              <span className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-[#ff8add]/28 px-3 py-1 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase">
                {t("labFooterBadgePrivate")}
              </span>
              <span className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-lab-surface-container px-3 py-1 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase">
                {t("labFooterBadgeHK")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-lab-on-surface/12 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-wider uppercase">{t("labFooterStat1Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat1Value")}</p>
          </div>
          <div className="rounded-2xl border-2 border-lab-on-surface/12 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-wider uppercase">{t("labFooterStat2Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat2Value")}</p>
          </div>
          <div className="rounded-2xl border-2 border-lab-on-surface/12 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm" data-footer-showcase>
            <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-semibold tracking-wider uppercase">{t("labFooterStat3Label")}</p>
            <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{t("labFooterStat3Value")}</p>
          </div>
        </div>

        <div
          className="relative mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 border-t-2 border-lab-on-surface/18 pt-6 md:flex-row"
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
              className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase transition-all hover:bg-[#30c7ff]/18"
            >
              {t("labFooterMethodology")}
            </Link>
            <span className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase">
              {t("labFooterPrivacy")}
            </span>
            <span className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-lab-on-surface uppercase">
              {t("labFooterSocials")}
            </span>
          </div>
        </div>
      </footer>
      <div className="pointer-events-none fixed top-0 -left-[10000px] z-[-1]" aria-hidden>
        <ResultStoryExportCard
          ref={storyExportRef}
          locale={locale}
          pre={storyPre}
          post={storyPost}
          count={calc.estimatedMatches}
          oneInLine={storyOneIn}
          chanceLine={storyChance}
          tierLabel={tierLabel}
        />
        <ResultDiagnosisExportCard
          ref={diagnosisExportRef}
          locale={locale}
          clinicalLabel={t("labClinicalLabel")}
          tierLabel={tierLabel}
          stageTitle={stageTitle}
          explain={plainExplain}
          poolPre={poolPre}
          poolCount={calc.estimatedMatches}
          poolPost={poolPost}
          tags={tags}
          severityLabel={t("labSeverityLabel")}
          severityPct={sev}
          alarming={alarming}
        />
      </div>
    </main>
  );
}
