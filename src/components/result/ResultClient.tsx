"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { Confetti } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateDelulu, oneInN } from "@/lib/calc/probability";
import { loadQuiz, clearQuiz } from "@/lib/quiz-storage";
import type { CalculationResult } from "@/lib/types/quiz";
import { buildSharedResultPath, encodeSharedResult } from "@/lib/share-payload";
import { trackEvent } from "@/lib/analytics/events";

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

  const tightest = sortedBreakdown[0];

  if (!calc) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        …
      </div>
    );
  }

  const pct = calc.probability * 100;
  const pctLabel = pct >= 0.01 ? `${pct.toFixed(2)}%` : `${pct.toExponential(1)}%`;
  const tierKey = `tier_${calc.tier}` as
    | "tier_realistic"
    | "tier_picky"
    | "tier_very_picky"
    | "tier_delulu"
    | "tier_god";
  const tierLabel = t(tierKey);
  const n = oneInN(calc.probability);

  const shareBody = t("shareText", {
    pct: pctLabel,
    tier: tierLabel,
  });

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
    <main ref={rootRef} className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <div className="reveal-item text-center">
        <Badge className="mb-3 rounded-full bg-white/70 px-4 py-1 text-xs font-bold shadow-sm backdrop-blur">
          <Confetti className="mr-1 inline" weight="duotone" />
          {tierLabel}
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("title")}</h1>
      </div>

      <Card className="reveal-item border-white/60 bg-white/85 p-8 text-center shadow-2xl backdrop-blur-md">
        <p
          className="reveal-item text-6xl font-black tracking-tighter text-primary sm:text-7xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          {pctLabel}
        </p>
        <p className="reveal-item mt-2 text-sm font-medium text-muted-foreground">
          {t("oneIn", { n })}
        </p>
        <p className="reveal-item mt-4 text-xs text-muted-foreground">
          {t("estimatedPool", { count: calc.estimatedMatches })}
        </p>
      </Card>

      {tightest ? (
        <Card className="reveal-item border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed">
          {t("tipTight", { label: tb(tightest.labelKey) })}
        </Card>
      ) : null}

      <div className="reveal-item space-y-3">
        <h2 className="text-lg font-bold">{t("breakdown")}</h2>
        <div className="space-y-2">
          {sortedBreakdown.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between rounded-2xl border bg-card/60 px-4 py-3 text-sm"
            >
              <span className="font-medium">{tb(row.labelKey)}</span>
              <span className="font-mono text-xs text-muted-foreground">×{row.factor.toFixed(3)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl border bg-card/60 px-4 py-3 text-sm">
            <span className="font-medium">{tb("correlation")}</span>
            <span className="font-mono text-xs text-muted-foreground">×1.12</span>
          </div>
        </div>
      </div>

      <Separator className="reveal-item opacity-60" />

      <div className="reveal-item space-y-3">
        <h2 className="text-lg font-bold">{t("share")}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={() => void nativeShare()}>
            {ts("native")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={wa}>
            {ts("whatsapp")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={threads}>
            {ts("threads")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={lineShare}>
            {ts("line")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={telegramShare}>
            {ts("telegram")}
          </Button>
          <Button variant="secondary" className="rounded-2xl font-semibold" onClick={() => void copy()}>
            {ts("copy")}
          </Button>
        </div>
      </div>

      <div className="reveal-item flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 rounded-2xl font-bold"
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
            "flex flex-1 items-center justify-center rounded-2xl font-bold",
          )}
        >
          {t("methodologyCta")}
        </Link>
      </div>

      {children ? <div className="reveal-item mt-2">{children}</div> : null}
    </main>
  );
}
