"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  basePoolForSeeker,
  buildFiltrationDebt,
  formatOneInCompact,
} from "@/lib/result-filtration";

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
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const q = loadQuiz();
    if (!q) {
      router.replace("/quiz");
      return;
    }
    setSnap({ calc: calculateDelulu(q), seeker: q.seeker });
  }, [router]);

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
    <main className="flex flex-1 flex-col">
      <section className="border-lab-ink bg-lab-surface-container-lowest w-full border-b px-4 pt-10 pb-20 md:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <span className="font-lab-mono text-lab-on-surface-variant mb-8 block text-xs font-semibold uppercase tracking-[0.2em]">
            {t("labHeroKicker")}
          </span>
          <h1 className="font-lab-display text-lab-primary mb-4 text-5xl leading-none font-bold md:text-7xl lg:text-[84px] lg:leading-[90px]">
            <span className="mr-2 text-[0.45em] font-semibold tracking-tight md:text-[0.5em]">
              {t("labHeroInPrefix")}
            </span>
            {compactIn}
          </h1>
          <p className="font-lab-body text-lab-on-surface-variant mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            {seeker === "woman_seeking_man" ? t("labHeroSub_male") : t("labHeroSub_female")}
          </p>
          <p className="font-lab-mono text-lab-on-surface-variant mx-auto mt-6 max-w-2xl text-xs uppercase tracking-wide">
            {t("heroChanceLine", { pct: pctLabel })}
          </p>
          <p className="font-lab-body text-lab-on-surface-variant mx-auto mt-3 max-w-xl text-sm">
            {t("poolExplainer", { count: calc.estimatedMatches })}
          </p>
        </div>
      </section>

      <section className="border-lab-ink grid min-h-[600px] w-full grid-cols-1 px-4 md:grid-cols-12 md:px-16">
        <div className="border-lab-ink border-b py-12 md:col-span-7 md:border-r md:border-b-0 md:py-16 md:pr-12">
          <div className="mb-12">
            <h2 className="font-lab-display mb-2 text-3xl uppercase md:text-5xl md:leading-[52px]">
              {t("labDebtTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body text-base leading-relaxed">
              {t("labDebtSub", { base: basePool })}
            </p>
          </div>

          <div className="border-lab-ink flex flex-col border-t">
            {debtRows.map((row, idx) => (
              <div
                key={row.key}
                className="border-lab-ink grid grid-cols-12 items-center gap-y-3 border-b py-6"
              >
                <div className="font-lab-display text-lab-primary col-span-12 text-2xl opacity-30 md:col-span-1">
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
            <div className="bg-lab-surface-container mt-10 border border-lab-ink p-6">
              <p className="font-lab-mono text-lab-on-surface-variant mb-2 text-xs font-semibold uppercase">
                {t("tips")}
              </p>
              <p className="font-lab-body text-lab-on-surface text-sm leading-relaxed">
                {t("tipTight", { label: tb(tightest.labelKey) })}
              </p>
            </div>
          ) : null}

          {(calc.tier === "delulu" || calc.tier === "god") && (
            <div className="border-lab-ink bg-lab-error-container mt-8 border p-8">
              <p className="font-lab-mono text-lab-on-error-container mb-2 text-xs font-semibold uppercase">
                {t("labSystemAlert_title")}
              </p>
              <p className="font-lab-body text-lab-on-error-container text-sm leading-relaxed">
                {calc.tier === "god" ? t("labSystemAlert_god") : t("labSystemAlert_delulu")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col py-12 md:col-span-5 md:py-16 md:pl-12">
          <div className="md:top-28 sticky">
            <div className="border-lab-ink mb-10 border">
              <div className="border-lab-ink bg-lab-primary border-b px-6 py-3">
                <p className="font-lab-mono text-lab-on-primary text-xs font-semibold uppercase tracking-wide">
                  {t("labClinicalLabel")}
                </p>
              </div>
              <div className="bg-white p-8">
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
                      className="font-lab-mono border-lab-ink bg-lab-surface-container px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
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
                    "border-lab-ink relative h-10 w-full overflow-hidden border",
                    alarming && "ring-2 ring-lab-error ring-offset-2 ring-offset-white",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
                      alarming ? "animate-pulse bg-lab-error" : "bg-lab-primary",
                    )}
                    style={{ width: `${sev}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end px-4">
                    <span
                      className={cn(
                        "font-lab-mono text-sm font-bold tabular-nums",
                        alarming
                          ? "text-white drop-shadow-sm"
                          : sev > 52
                            ? "text-lab-on-primary"
                            : "text-lab-inverse",
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

            <div className="flex flex-col gap-4">
              <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                {t("labTransmit")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={wa}
                  className="font-lab-mono border-lab-ink text-lab-on-surface flex flex-1 items-center justify-center gap-2 border py-4 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-lab-inverse hover:text-lab-on-inverse"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  {ts("whatsapp")}
                </button>
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="font-lab-mono border-lab-ink text-lab-on-surface flex flex-1 items-center justify-center gap-2 border py-4 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-lab-inverse hover:text-lab-on-inverse"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  {ts("copy")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-lab-ink bg-lab-surface-container-high w-full border-t px-4 py-16 md:px-16 md:py-24">
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
              className="font-lab-mono bg-lab-primary text-lab-on-primary border border-lab-primary px-8 py-5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-white hover:text-lab-primary"
            >
              {t("labRedoCalc")}
            </button>
            <Link
              href="/methodology"
              className="font-lab-mono border-lab-ink text-lab-on-surface flex items-center justify-center border px-8 py-5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-lab-inverse hover:text-lab-on-inverse"
            >
              {t("labReadMethod")}
            </Link>
          </div>
        </div>
      </section>

      {children ? (
        <div className="border-lab-ink mx-4 my-10 border bg-white/60 p-6 md:mx-16">{children}</div>
      ) : null}

      <div className="border-lab-ink flex h-20 w-full overflow-hidden border-t">
        <div className="bg-lab-primary-fixed border-lab-ink w-1/4 flex-none border-r" />
        <div className="bg-lab-secondary-fixed border-lab-ink w-1/4 flex-none border-r" />
        <div className="bg-lab-tertiary-fixed border-lab-ink w-1/4 flex-none border-r" />
        <div className="bg-lab-surface-variant w-1/4 flex-none" />
      </div>

      <footer className="bg-lab-surface border-lab-outline flex w-full flex-col items-center gap-8 border-t px-4 py-12 md:flex-row md:justify-between md:px-16">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:gap-8 md:text-left">
          <span className="font-lab-mono text-sm font-bold uppercase tracking-wide text-lab-on-surface">
            {t("labFooterBrand")}
          </span>
          <span className="text-lab-on-surface-variant font-lab-body max-w-md text-sm">{t("labFooterLegal")}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:justify-end">
          <Link
            href="/methodology"
            className="font-lab-mono text-lab-on-surface-variant hover:text-lab-primary text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            {t("labFooterMethodology")}
          </Link>
          <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase">
            {t("labFooterPrivacy")}
          </span>
          <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase">
            {t("labFooterSocials")}
          </span>
        </div>
      </footer>
    </main>
  );
}
