"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { Confetti, CopySimple, ShareNetwork } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateDelulu, oneInN } from "@/lib/calc/probability";
import { filterKeepsPercent, formatMatchPercent } from "@/lib/format-match";
import { MAX_ONE_IN_DISPLAY } from "@/lib/format-one-in";
import { loadQuiz, clearQuiz } from "@/lib/quiz-storage";
import type { CalculationResult } from "@/lib/types/quiz";
import { buildSharedResultPath, encodeSharedResult } from "@/lib/share-payload";
import { trackEvent } from "@/lib/analytics/events";
import { pushRun } from "@/lib/run-history";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const historySaved = useRef(false);
  const [calc, setCalc] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const q = loadQuiz();
    if (!q) {
      router.replace("/quiz");
      return;
    }
    setCalc(calculateDelulu(q));
  }, [router]);

  useEffect(() => {
    if (!calc || historySaved.current) return;
    const q = loadQuiz();
    if (!q) return;
    historySaved.current = true;
    pushRun({
      locale,
      answers: q,
      tier: calc.tier,
      probability: calc.probability,
      estimatedMatches: calc.estimatedMatches,
    });
  }, [calc, locale]);

  useEffect(() => {
    if (!calc || !rootRef.current) return;
    void trackEvent("result_viewed", {
      locale,
      tier: calc.tier,
      probability: Number(calc.probability.toFixed(6)),
    });

    const el = rootRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(".reveal-item"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          onComplete: () => {
            void confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.62 },
              colors: ["#ffb6d9", "#c9b6ff", "#ffd0b6"],
            });
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [calc, locale]);

  const shareUrl = useMemo(() => {
    if (!calc) return "https://delulu.dating";
    const token = encodeSharedResult({
      p: Number(calc.probability.toFixed(8)),
      n: calc.estimatedMatches,
      tier: calc.tier,
      ts: Date.now(),
    });
    const path = buildSharedResultPath(locale, token);
    if (typeof window === "undefined") return `https://delulu.dating${path}`;
    return `${window.location.origin}${path}`;
  }, [calc, locale]);

  const sortedBreakdown = useMemo(() => {
    if (!calc) return [];
    return [...calc.breakdown]
      .filter((r) => r.key !== "correlation")
      .sort((a, b) => a.factor - b.factor);
  }, [calc]);

  const corr = useMemo(() => {
    if (!calc) return null;
    return calc.breakdown.find((r) => r.key === "correlation") ?? null;
  }, [calc]);

  const tightest = sortedBreakdown[0];

  if (!calc) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        …
      </div>
    );
  }

  const pctLabel = formatMatchPercent(calc.probability);
  const tierKey = `tier_${calc.tier}` as
    | "tier_realistic"
    | "tier_picky"
    | "tier_very_picky"
    | "tier_delulu"
    | "tier_god";
  const tierLabel = t(tierKey);
  const n = oneInN(calc.probability);
  const oddsPastUiCeil =
    Number.isFinite(calc.probability) &&
    calc.probability > 0 &&
    Number.isFinite(1 / calc.probability) &&
    1 / calc.probability > MAX_ONE_IN_DISPLAY;

  const shareBody = oddsPastUiCeil
    ? t("shareTextCapped", { n, pct: pctLabel, tier: tierLabel })
    : t("shareText", { n, pct: pctLabel, tier: tierLabel });

  async function nativeShare() {
    void trackEvent("result_share_clicked", { channel: "native", locale });
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Delulu Dating",
          text: shareBody,
          url: shareUrl,
        });
      }
    } catch {
      // noop
    }
  }

  function wa() {
    void trackEvent("result_share_clicked", { channel: "whatsapp", locale });
    const text = encodeURIComponent(`${shareBody} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function threads() {
    void trackEvent("result_share_clicked", { channel: "threads", locale });
    const text = encodeURIComponent(`${shareBody} ${shareUrl}`);
    window.open(`https://www.threads.net/intent/post?text=${text}`, "_blank");
  }

  function lineShare() {
    void trackEvent("result_share_clicked", { channel: "line", locale });
    const text = encodeURIComponent(`${shareBody} ${shareUrl}`);
    window.open(`https://line.me/R/msg/text/?${text}`, "_blank");
  }

  function telegramShare() {
    void trackEvent("result_share_clicked", { channel: "telegram", locale });
    const text = encodeURIComponent(`${shareBody} ${shareUrl}`);
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`,
      "_blank",
    );
  }

  async function copy() {
    void trackEvent("result_share_clicked", { channel: "copy", locale });
    try {
      await navigator.clipboard.writeText(`${shareBody} ${shareUrl}`);
    } catch {
      // noop
    }
  }

  return (
    <main
      ref={rootRef}
      className="page-shell flex flex-1 flex-col gap-7 sm:gap-8 lg:gap-10 py-8 sm:py-12"
    >
      <div className="reveal-item text-center">
        <Badge className="mb-3 rounded-full bg-white/75 px-4 py-1 text-xs font-bold shadow-md backdrop-blur">
          <Confetti className="mr-1 inline" weight="duotone" />
          {tierLabel}
        </Badge>
        <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h1>
      </div>

      <Card className="reveal-item overflow-visible rounded-3xl border-white/55 bg-white/88 p-7 text-center shadow-[0_24px_55px_-28px_rgba(90,60,140,0.45)] backdrop-blur-md ring-1 ring-foreground/8 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {t("heroKicker")}
        </p>
        <p
          className="reveal-item mt-3 text-5xl font-black tracking-tight text-primary sm:text-6xl md:text-7xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          {oddsPastUiCeil ? t("oneInCapped", { n }) : t("oneIn", { n })}
        </p>
        <p className="reveal-item mt-3 text-sm font-medium text-muted-foreground sm:text-base">
          {t("heroChanceLine", { pct: pctLabel })}
        </p>
        <p className="reveal-item mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {t("poolExplainer", { count: calc.estimatedMatches })}
        </p>
      </Card>

      {tightest ? (
        <Card className="reveal-item rounded-3xl border-primary/20 bg-primary/[0.07] p-5 text-sm leading-relaxed sm:p-6">
          {t("tipTight", { label: tb(tightest.labelKey) })}
        </Card>
      ) : null}

      <div className="reveal-item space-y-3">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">{t("breakdown")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("breakdownSubtitle")}</p>
        </div>
        <div className="grid gap-2 sm:gap-2.5">
          {sortedBreakdown.map((row) => {
            const pctKept = filterKeepsPercent(row.factor);
            return (
              <div
                key={row.key}
                className="flex flex-col gap-1 rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-3.5"
              >
                <span className="font-semibold">{tb(row.labelKey)}</span>
                <span className="text-sm text-muted-foreground">
                  {t("filterKeeps", { pct: pctKept })}
                </span>
              </div>
            );
          })}
          {corr ? (
            <div className="flex flex-col gap-1 rounded-2xl border border-dashed border-foreground/15 bg-muted/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
              <span className="font-semibold">{tb(corr.labelKey)}</span>
              <span className="text-sm text-muted-foreground">
                {t("filterBoost", {
                  pct: Math.round((corr.factor - 1) * 100),
                })}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <Separator className="reveal-item opacity-50" />

      <div className="reveal-item space-y-4 rounded-3xl border border-white/50 bg-white/55 p-5 backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-3">
          <ShareNetwork className="mt-0.5 shrink-0 text-primary" size={22} weight="duotone" />
          <div>
            <h2 className="text-lg font-bold">{t("share")}</h2>
            <p className="text-sm text-muted-foreground">{t("shareLead")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 rounded-2xl font-bold sm:flex-none sm:px-8"
            onClick={() => void nativeShare()}
          >
            {ts("native")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={wa}>
            {ts("whatsapp")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={lineShare}>
            {ts("line")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={threads}>
            {ts("threads")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={telegramShare}>
            {ts("telegram")}
          </Button>
          <Button variant="outline" className="rounded-2xl font-semibold" onClick={() => void copy()}>
            <CopySimple className="mr-1.5 inline" weight="duotone" />
            {ts("copy")}
          </Button>
        </div>
      </div>

      <div className="reveal-item flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 rounded-2xl py-6 text-base font-bold sm:rounded-3xl"
          onClick={() => {
            clearQuiz();
            router.push("/quiz");
          }}
        >
          {t("again")}
        </Button>
        <Link
          href="/methodology"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "flex flex-1 items-center justify-center rounded-2xl py-6 text-base font-bold sm:rounded-3xl",
          )}
        >
          {t("methodologyCta")}
        </Link>
      </div>

      {children ? <div className="reveal-item mt-2">{children}</div> : null}
    </main>
  );
}
