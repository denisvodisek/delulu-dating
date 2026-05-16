"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CircleNotch,
} from "@phosphor-icons/react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calculateDelulu } from "@/lib/calc/probability";
import { BASE_MALE_POOL, DISTRICT_MALE_SHARE } from "@/lib/data/hk-demographics";
import { DEFAULT_QUIZ, type QuizAnswersV1 } from "@/lib/types/quiz";
import { saveQuiz } from "@/lib/quiz-storage";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

const STEPS = 7;

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
  const pct = live.probability * 100;

  const districtKeys = Object.keys(DISTRICT_MALE_SHARE);

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
        districts: has
          ? prev.districts.filter((k) => k !== key)
          : [...prev.districts, key],
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

  const progress = ((step + 1) / STEPS) * 100;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calculator weight="duotone" />
            {t("livePool")}
          </span>
          <Badge variant="secondary" className="rounded-full font-mono text-xs">
            {pct >= 0.01 ? `${pct.toFixed(2)}%` : `${pct.toExponential(1)}%`}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 rounded-full" />
      </div>

      <Card className="border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
        {step === 0 && (
          <Step title={t("stepAge")} hint={t("ageHint")}>
            <div className="grid gap-6">
              <div>
                <Label className="text-sm text-muted-foreground">
                  {q.ageMin} – {q.ageMax} yrs
                </Label>
                <Slider
                  value={[q.ageMin, q.ageMax]}
                  min={18}
                  max={55}
                  step={1}
                  onValueChange={(v) => {
                    const arr = Array.isArray(v) ? v : [v, v];
                    const lo = Math.min(arr[0], arr[1]);
                    const hi = Math.max(arr[0], arr[1]);
                    setQ((p) => ({ ...p, ageMin: lo, ageMax: hi }));
                  }}
                  className="mt-4"
                />
              </div>
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title={t("stepHeight")} hint={t("heightHint")}>
            <div>
              <Label className="text-sm text-muted-foreground">
                ≥ {q.minHeightCm} cm
              </Label>
              <Slider
                value={[q.minHeightCm]}
                min={160}
                max={195}
                step={1}
                onValueChange={(v) => {
                  const h = Array.isArray(v) ? v[0] : v;
                  setQ((p) => ({ ...p, minHeightCm: h }));
                }}
                className="mt-4"
              />
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title={t("stepIncome")} hint={t("incomeHint")}>
            <div>
              <Label className="text-sm text-muted-foreground">
                ≥ HK${q.minMonthlyIncomeHKD.toLocaleString()} / mo
              </Label>
              <Slider
                value={[q.minMonthlyIncomeHKD]}
                min={15000}
                max={200000}
                step={1000}
                onValueChange={(v) => {
                  const n = Array.isArray(v) ? v[0] : v;
                  setQ((p) => ({ ...p, minMonthlyIncomeHKD: n }));
                }}
                className="mt-4"
              />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title={t("stepMarital")}>
            <div className="grid gap-2">
              {(
                [
                  ["never", t("maritalNever")],
                  ["not_married_ok", t("maritalNotNow")],
                  ["any", t("maritalAny")],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={q.marital === key ? "default" : "outline"}
                  className={cn(
                    "h-12 justify-start rounded-2xl border-2 text-left font-semibold",
                    q.marital === key && "shadow-md",
                  )}
                  onClick={() => setQ((p) => ({ ...p, marital: key }))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title={t("stepDistrict")}>
            <p className="mb-3 text-sm text-muted-foreground">{t("districtNone")}</p>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {districtKeys.map((key) => {
                const on = q.districts.includes(key);
                return (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    className="h-auto min-h-10 whitespace-normal rounded-xl px-2 py-2 text-xs font-semibold leading-tight"
                    onClick={() => toggleDistrict(key)}
                  >
                    {td(key)}
                  </Button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title={t("stepEducation")}>
            <div className="grid gap-2">
              {(
                [
                  ["any", t("eduAny")],
                  ["degree", t("eduDegree")],
                  ["postgrad", t("eduPostgrad")],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={q.educationMin === key ? "default" : "outline"}
                  className="h-12 justify-start rounded-2xl border-2 text-left font-semibold"
                  onClick={() => setQ((p) => ({ ...p, educationMin: key }))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step title={t("stepLifestyle")}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4 rounded-2xl border bg-muted/30 p-4">
                <Label htmlFor="smoke" className="text-sm font-semibold">
                  {t("noSmoke")}
                </Label>
                <Switch
                  id="smoke"
                  checked={q.noSmoking}
                  onCheckedChange={(v) => setQ((p) => ({ ...p, noSmoking: v }))}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border bg-muted/30 p-4">
                <Label htmlFor="kids" className="text-sm font-semibold">
                  {t("noKids")}
                </Label>
                <Switch
                  id="kids"
                  checked={q.noKidsFromPrev}
                  onCheckedChange={(v) => setQ((p) => ({ ...p, noKidsFromPrev: v }))}
                />
              </div>
            </div>
          </Step>
        )}
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-2xl"
          onClick={back}
          disabled={step === 0 || isRevealing}
        >
          <ArrowLeft className="mr-1" />
          {t("back")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-2xl"
          onClick={() => setQ(DEFAULT_QUIZ)}
          disabled={isRevealing}
        >
          {t("skip")}
        </Button>
        <Button
          type="button"
          className="rounded-2xl font-bold"
          onClick={next}
          disabled={isRevealing}
        >
          {step === STEPS - 1 ? t("calculate") : t("next")}
          <ArrowRight className="ml-1" />
        </Button>
      </div>

      {isRevealing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm">
          <Card className="w-full max-w-md border-white/25 bg-zinc-950/90 p-6 text-white">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <CircleNotch className="animate-spin" size={16} />
              {tr("calculating")}
            </div>
            <div className="space-y-2 font-mono text-xs">
              {revealLines.slice(0, revealIndex + 1).map((line, i) => (
                <p key={`${line}-${i}`} className="text-zinc-200">
                  {line}
                </p>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
