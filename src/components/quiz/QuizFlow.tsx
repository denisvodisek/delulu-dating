"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleNotch } from "@phosphor-icons/react";
import { useRouter } from "@/i18n/navigation";
import { Slider } from "@/components/ui/slider";
import { calculateDelulu } from "@/lib/calc/probability";
import { BASE_MALE_POOL, DISTRICT_MALE_SHARE } from "@/lib/data/hk-demographics";
import { DEFAULT_QUIZ, type CalculationResult, type QuizAnswersV1 } from "@/lib/types/quiz";
import { saveQuiz } from "@/lib/quiz-storage";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import { LAB_STEP_TITLE_KEYS, quizRoastKey } from "@/lib/quiz-roast";

const STEPS = 9;

const choiceActive =
  "bg-gradient-to-br from-pink-200 via-fuchsia-100 to-violet-100 text-fuchsia-950 ring-2 ring-pink-400/60 shadow-sm";

const choiceInactive =
  "bg-white/85 text-slate-600 hover:bg-pink-50/95";

const choiceInactiveMuted =
  "bg-white/80 text-slate-600 hover:bg-gradient-to-br hover:from-pink-50/80 hover:to-violet-50/60";

function formatPoolPercent(prob: number): string {
  if (!Number.isFinite(prob) || prob <= 0) return "0%";
  if (prob < 0.0005) return "<0.1%";
  if (prob >= 0.999) return "100%";
  return `${(prob * 100).toFixed(1)}%`;
}

function difficultyKey(prob: number): "labDiffLow" | "labDiffMed" | "labDiffHigh" {
  if (prob >= 0.025) return "labDiffLow";
  if (prob >= 0.004) return "labDiffMed";
  return "labDiffHigh";
}

function tierRedBlocks(tier: CalculationResult["tier"]): number {
  const m: Record<CalculationResult["tier"], number> = {
    realistic: 8,
    picky: 6,
    very_picky: 4,
    delulu: 2,
    god: 1,
  };
  return m[tier];
}

function PoolBlockStrip({ redCount }: { redCount: number }) {
  const safe = Math.max(0, Math.min(10, redCount));
  return (
    <div className="grid h-8 grid-cols-10 gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-sm",
            i < safe
              ? "bg-gradient-to-t from-pink-400 to-violet-400 shadow-sm"
              : "bg-pink-100/50",
          )}
        />
      ))}
    </div>
  );
}

function SegmentedTwo({
  aActive,
  bActive,
  aLabel,
  bLabel,
  onPickA,
  onPickB,
}: {
  aActive: boolean;
  bActive: boolean;
  aLabel: string;
  bLabel: string;
  onPickA: () => void;
  onPickB: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-2xl border-2 border-pink-200/65 shadow-inner">
      <button
        type="button"
        onClick={onPickA}
        className={cn(
          "font-lab-mono text-lab-mono border-r-2 border-pink-200/55 py-4 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
          aActive ? choiceActive : choiceInactiveMuted,
        )}
      >
        {aLabel}
      </button>
      <button
        type="button"
        onClick={onPickB}
        className={cn(
          "font-lab-mono text-lab-mono py-4 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
          bActive ? choiceActive : choiceInactiveMuted,
        )}
      >
        {bLabel}
      </button>
    </div>
  );
}

export default function QuizFlow() {
  const t = useTranslations("quiz");
  const td = useTranslations("district");
  const tb = useTranslations("bd");
  const tr = useTranslations("reveal");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState<QuizAnswersV1>(DEFAULT_QUIZ);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealLines, setRevealLines] = useState<string[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);

  const live = useMemo(() => calculateDelulu(q), [q]);
  const districtKeys = Object.keys(DISTRICT_MALE_SHARE);

  const progressPct = ((step + 1) / STEPS) * 100;
  const roastKey = quizRoastKey(step, q);
  const roastText = t(roastKey as Parameters<typeof t>[0]);
  const diffKey = difficultyKey(live.probability);
  const titleKeys = LAB_STEP_TITLE_KEYS[step]!;

  useEffect(() => {
    void trackEvent("quiz_viewed", { locale, seeker: q.seeker });
  }, [locale, q.seeker]);

  useEffect(() => {
    if (!isRevealing || revealLines.length === 0) return;
    setRevealIndex(0);
    const iv = window.setInterval(() => {
      setRevealIndex((prev) => Math.min(prev + 1, revealLines.length - 1));
    }, 260);
    const done = window.setTimeout(() => {
      clearInterval(iv);
      router.push("/result");
    }, 260 * (revealLines.length + 2));
    return () => {
      clearInterval(iv);
      clearTimeout(done);
    };
  }, [isRevealing, revealLines, router]);

  function toggleDistrict(key: string) {
    setQ((prev) => {
      const has = prev.districts.includes(key);
      return {
        ...prev,
        districts: has ? prev.districts.filter((k) => k !== key) : [...prev.districts, key],
      };
    });
  }

  function buildRevealLog() {
    const lines = [tr("logIntro")];
    let pool = BASE_MALE_POOL;
    const rows = [...live.breakdown]
      .filter((row) => row.key !== "correlation")
      .sort((a, b) => a.factor - b.factor)
      .slice(0, 5);

    for (const row of rows) {
      pool = Math.max(1, Math.round(pool * row.factor));
      lines.push(`${tb(row.labelKey)} -> ~${pool.toLocaleString()}`);
    }

    lines.push(tr("calculating"));
    return lines;
  }

  function next() {
    if (isRevealing) return;

    if (step < STEPS - 1) {
      setStep((s) => s + 1);
      void trackEvent("quiz_step_next", { step: step + 1, locale });
      return;
    }

    saveQuiz(q);
    void fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    }).catch(() => {});

    void trackEvent("quiz_completed", {
      locale,
      probability: Number(live.probability.toFixed(6)),
      tier: live.tier,
      minHeightCm: q.minHeightCm,
      minMonthlyIncomeHKD: q.minMonthlyIncomeHKD,
    });

    setRevealLines(buildRevealLog());
    setIsRevealing(true);
  }

  function back() {
    if (isRevealing) return;
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="quiz-flow-root relative min-h-[calc(100dvh-5rem)] pb-36">
      <div
        className="fixed top-20 right-0 left-0 z-40 h-1.5 w-full bg-pink-100/80"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 transition-[width] duration-300 ease-out shadow-[0_0_12px_rgba(244,114,182,0.45)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <main className="flex min-h-[calc(100dvh-5rem-4px)] items-center justify-center px-4 pt-4 pb-28 md:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border-2 border-pink-200/55 bg-white/70 shadow-[0_24px_60px_-12px_rgba(236,72,153,0.22)] backdrop-blur-xl md:grid-cols-12">
          {/* Left: question + roast + stats */}
          <div className="flex flex-col justify-center gap-8 border-b border-pink-200/40 bg-gradient-to-br from-pink-50/70 via-white to-violet-50/35 p-8 md:col-span-5 md:border-r md:border-b-0 md:p-12">
            <div className="space-y-2">
              <span className="font-lab-mono text-lab-mono text-lab-primary text-xs font-semibold uppercase tracking-[0.14em]">
                {t("labQuestionKicker")}{" "}
                {String(step + 1).padStart(2, "0")}/{String(STEPS).padStart(2, "0")}
              </span>
              <h1 className="font-lab-display text-lab-on-surface text-3xl leading-tight font-normal uppercase md:text-5xl md:leading-[52px]">
                {t(titleKeys[0])}
                <br />
                <span className="text-lab-on-surface-variant text-xl normal-case italic md:text-2xl">
                  {t(titleKeys[1])}
                </span>
              </h1>
            </div>

            <div className="rounded-2xl border border-pink-200/70 bg-gradient-to-r from-pink-50 via-white to-violet-50/80 p-6 shadow-sm">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-lab-primary shrink-0">monitoring</span>
                <p className="font-lab-mono text-lab-on-surface-variant text-xs leading-relaxed font-medium uppercase">
                  {roastText}
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labPoolLabel")}
                </span>
                <span className="font-lab-display text-lab-on-surface text-4xl font-bold md:text-5xl">
                  {formatPoolPercent(live.probability)}
                </span>
              </div>
              <div className="bg-lab-outline-variant hidden h-14 w-px md:block" />
              <div className="flex flex-col gap-1">
                <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labDifficultyLabel")}
                </span>
                <span
                  className={cn(
                    "font-lab-display text-4xl font-bold md:text-5xl",
                    diffKey === "labDiffHigh" ? "text-lab-primary" : "text-lab-on-surface",
                  )}
                >
                  {t(diffKey)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex flex-col justify-center gap-10 bg-gradient-to-b from-white/90 via-pink-50/25 to-violet-50/40 p-8 md:col-span-7 md:p-12">
            {step === 0 && (
              <div className="space-y-8">
                <div className="flex items-end justify-between border-b border-lab-on-surface pb-2">
                  <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {t("labAgeBand")}
                  </span>
                  <span className="font-lab-display text-lab-on-surface text-2xl font-bold md:text-4xl">
                    {q.ageMin}–{q.ageMax}
                  </span>
                </div>
                <Slider
                  value={[q.ageMin, q.ageMax]}
                  min={18}
                  max={55}
                  step={1}
                  onValueChange={(v) => {
                    const arr = Array.isArray(v) ? v : [v, v];
                    const lo = Math.min(arr[0]!, arr[1]!);
                    const hi = Math.max(arr[0]!, arr[1]!);
                    setQ((p) => ({ ...p, ageMin: lo, ageMax: hi }));
                  }}
                  className="w-full"
                />
                <div className="font-lab-mono text-lab-on-surface-variant flex justify-between text-[10px] uppercase tracking-widest">
                  <span>{t("labAgeTickLo")}</span>
                  <span>{t("labAgeTickHi")}</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="flex items-end justify-between border-b border-lab-on-surface pb-2">
                  <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {t("labHeightBand")}
                  </span>
                  <span className="font-lab-display text-lab-on-surface text-2xl font-bold md:text-4xl">
                    ≥ {q.minHeightCm} cm
                  </span>
                </div>
                <Slider
                  value={[q.minHeightCm]}
                  min={160}
                  max={195}
                  step={1}
                  onValueChange={(v) => {
                    const h = Array.isArray(v) ? v[0]! : v;
                    setQ((p) => ({ ...p, minHeightCm: h }));
                  }}
                  className="w-full"
                />
                <div className="font-lab-mono text-lab-on-surface-variant flex justify-between text-[10px] uppercase tracking-widest">
                  <span>{t("labHeightTickLo")}</span>
                  <span>{t("labHeightTickHi")}</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labMonthlyBand")}
                </div>
                <div className="flex items-end justify-between border-b border-lab-on-surface pb-2">
                  <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                    {t("stepIncome")}
                  </span>
                  <span className="font-lab-display text-lab-on-surface text-2xl font-bold md:text-4xl">
                    HK${q.minMonthlyIncomeHKD.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[q.minMonthlyIncomeHKD]}
                  min={15000}
                  max={200000}
                  step={1000}
                  onValueChange={(v) => {
                    const n = Array.isArray(v) ? v[0]! : v;
                    setQ((p) => ({ ...p, minMonthlyIncomeHKD: n }));
                  }}
                  className="w-full"
                />
                <div className="font-lab-mono text-lab-on-surface-variant flex justify-between text-[10px] uppercase tracking-widest">
                  <span>{t("labIncomeTick15")}</span>
                  <span>{t("labIncomeTick100")}</span>
                  <span>{t("labIncomeTick200")}</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labMaritalPick")}
                </p>
                <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-pink-200/60">
                  {(
                    [
                      ["never", t("maritalNever")],
                      ["not_married_ok", t("maritalNotNow")],
                      ["any", t("maritalAny")],
                    ] as const
                  ).map(([key, label], idx, arr) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setQ((p) => ({ ...p, marital: key }))}
                      className={cn(
                        "font-lab-mono text-lab-mono px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide transition-all duration-200",
                        idx < arr.length - 1 && "border-b border-pink-100",
                        q.marital === key ? choiceActive : choiceInactive,
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labDistrictPick")}
                </p>
                <p className="text-lab-on-surface-variant font-lab-body text-sm">{t("districtNone")}</p>
                <div className="grid max-h-[min(50vh,22rem)] grid-cols-2 gap-0 overflow-y-auto overscroll-contain rounded-2xl border-2 border-pink-200/60 sm:grid-cols-3">
                  {districtKeys.map((key) => {
                    const on = q.districts.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDistrict(key)}
                        className={cn(
                          "font-lab-mono text-lab-mono min-h-11 border-b border-r border-pink-100 px-2 py-2.5 text-left text-[11px] font-semibold uppercase leading-tight transition-all duration-200 sm:text-xs",
                          on
                            ? "bg-gradient-to-br from-pink-300/90 via-fuchsia-200 to-violet-200 text-violet-950 shadow-inner ring-2 ring-white/90 ring-inset"
                            : "bg-white/75 text-slate-600 hover:bg-pink-50",
                        )}
                      >
                        {td(key)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labEducationPick")}
                </p>
                <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-pink-200/60">
                  {(
                    [
                      ["any", t("eduAny")],
                      ["degree", t("eduDegree")],
                      ["postgrad", t("eduPostgrad")],
                    ] as const
                  ).map(([key, label], idx, arr) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setQ((p) => ({ ...p, educationMin: key }))}
                      className={cn(
                        "font-lab-mono text-lab-mono px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide transition-all duration-200",
                        idx < arr.length - 1 && "border-b border-pink-100",
                        q.educationMin === key ? choiceActive : choiceInactive,
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labLifestylePick")}
                </p>
                <div className="space-y-2">
                  <p className="font-lab-body text-sm font-semibold">{t("noSmoke")}</p>
                  <SegmentedTwo
                    aActive={q.noSmoking}
                    bActive={!q.noSmoking}
                    aLabel={t("toggleMust")}
                    bLabel={t("toggleDontCare")}
                    onPickA={() => setQ((p) => ({ ...p, noSmoking: true }))}
                    onPickB={() => setQ((p) => ({ ...p, noSmoking: false }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-lab-body text-sm font-semibold">{t("noKids")}</p>
                  <SegmentedTwo
                    aActive={q.noKidsFromPrev}
                    bActive={!q.noKidsFromPrev}
                    aLabel={t("toggleMust")}
                    bLabel={t("toggleDontCare")}
                    onPickA={() => setQ((p) => ({ ...p, noKidsFromPrev: true }))}
                    onPickB={() => setQ((p) => ({ ...p, noKidsFromPrev: false }))}
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labFlatPick")}
                </p>
                <p className="text-lab-on-surface-variant font-lab-body mb-2 text-sm">{t("flatHint")}</p>
                <SegmentedTwo
                  aActive={q.requiresOwnFlat}
                  bActive={!q.requiresOwnFlat}
                  aLabel={t("flatMust")}
                  bLabel={t("flatDontCare")}
                  onPickA={() => setQ((p) => ({ ...p, requiresOwnFlat: true }))}
                  onPickB={() => setQ((p) => ({ ...p, requiresOwnFlat: false }))}
                />
              </div>
            )}

            {step === 8 && (
              <div className="space-y-4">
                <p className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {t("labCarPick")}
                </p>
                <p className="text-lab-on-surface-variant font-lab-body mb-2 text-sm">{t("carHint")}</p>
                <SegmentedTwo
                  aActive={q.requiresCar}
                  bActive={!q.requiresCar}
                  aLabel={t("carMust")}
                  bLabel={t("carDontCare")}
                  onPickA={() => setQ((p) => ({ ...p, requiresCar: true }))}
                  onPickB={() => setQ((p) => ({ ...p, requiresCar: false }))}
                />
              </div>
            )}

            <div className="space-y-3">
              <PoolBlockStrip redCount={tierRedBlocks(live.tier)} />
              <p className="font-lab-mono text-lab-on-surface-variant text-center text-[10px] uppercase tracking-widest">
                {t("labDataSource")}
              </p>
            </div>

            <p className="font-lab-mono text-lab-primary text-center text-[10px] font-semibold uppercase tracking-wide">
              {t("noSpoilers")}
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center gap-4 border-t border-pink-200/50 bg-white/85 px-4 py-6 shadow-[0_-8px_40px_rgba(236,72,153,0.08)] backdrop-blur-xl md:flex-row md:justify-between md:px-16">
        <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || isRevealing}
            className="font-lab-mono text-fuchsia-700/80 hover:text-fuchsia-600 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t("back")}
          </button>
          <button
            type="button"
            onClick={() => setQ(DEFAULT_QUIZ)}
            disabled={isRevealing}
            className="font-lab-mono text-fuchsia-700/70 hover:text-fuchsia-600 text-[10px] font-semibold uppercase tracking-wide underline-offset-4 hover:underline disabled:opacity-40"
          >
            {t("skip")}
          </button>
          <div className="bg-lab-outline-variant hidden h-6 w-px md:block" />
          <p className="font-lab-mono text-lab-on-surface-variant hidden text-[10px] font-semibold uppercase tracking-widest md:block">
            {t("labFooterTagline")}
          </p>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={isRevealing}
          className="font-lab-mono text-lab-mono flex w-full items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 py-4 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-pink-300/40 transition-all hover:brightness-105 disabled:opacity-50 md:w-auto md:px-12"
        >
          {step === STEPS - 1 ? t("calculate") : t("labNextCriterion")}
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </footer>

      {isRevealing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-fuchsia-950/35 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border-2 border-pink-200/80 bg-gradient-to-br from-pink-50 via-white to-violet-100 p-8 shadow-[0_24px_80px_rgba(192,132,252,0.35)] sm:max-w-lg">
            <div className="font-lab-mono mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-fuchsia-900 uppercase">
              <CircleNotch className="animate-spin text-fuchsia-500" size={18} />
              {t("labRevealTitle")}
            </div>
            <div className="font-lab-mono space-y-2 text-xs leading-relaxed">
              {revealLines.slice(0, revealIndex + 1).map((line, i) => (
                <p key={`${line}-${i}`} className="text-fuchsia-900/90 uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
