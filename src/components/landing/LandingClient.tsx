"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Heart, Sparkle } from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { listRecentRuns, type SavedRun } from "@/lib/run-history";
import { saveQuiz } from "@/lib/quiz-storage";

const SESSION_COUNTER_OFFSET = "delulu-counter-session-offset";

export default function LandingClient() {
  const t = useTranslations("landing");
  const tResult = useTranslations("result");
  const tMeta = useTranslations("meta");
  const locale = useLocale();
  const router = useRouter();
  const [runs, setRuns] = useState<number | null>(null);
  const [recent, setRecent] = useState<SavedRun[]>([]);

  useEffect(() => {
    setRecent(listRecentRuns(6));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let tick: ReturnType<typeof setInterval> | undefined;

    const sessionBump = (): number => {
      try {
        const raw = sessionStorage.getItem(SESSION_COUNTER_OFFSET);
        if (raw != null) {
          const n = parseInt(raw, 10);
          return Number.isFinite(n) ? n : 6;
        }
        const bump = 3 + Math.floor(Math.random() * 10);
        sessionStorage.setItem(SESSION_COUNTER_OFFSET, String(bump));
        return bump;
      } catch {
        return 6;
      }
    };

    const startTicking = () => {
      tick = setInterval(() => {
        setRuns((prev) =>
          prev == null ? prev : prev + 1 + (Math.random() < 0.28 ? 1 : 0),
        );
      }, 5500 + Math.floor(Math.random() * 4500));
    };

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { runsToday?: number }) => {
        if (cancelled) return;
        const base = typeof d.runsToday === "number" ? d.runsToday : 8840;
        const display = base + sessionBump();
        setRuns(display);
        startTicking();
      })
      .catch(() => {
        if (cancelled) return;
        setRuns(8840 + sessionBump());
        startTicking();
      });

    return () => {
      cancelled = true;
      if (tick) clearInterval(tick);
    };
  }, []);

  function openRun(run: SavedRun) {
    saveQuiz(run.answers);
    router.push("/result");
  }

  function formatWhen(iso: string) {
    try {
      return new Date(iso).toLocaleString(locale === "zh" ? "zh-HK" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  }

  return (
    <main className="page-shell flex min-h-[70vh] flex-1 flex-col justify-center gap-9 py-14 sm:gap-11 sm:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          <Sparkle className="mr-1 inline" weight="duotone" size={16} />
          {t("badge")}
        </Badge>
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("sub")}
        </p>
        {runs != null && (
          <div className="space-y-1">
            <p className="text-sm font-semibold tabular-nums text-primary/85 transition-all duration-500">
              {t("runsToday", { count: runs })}
            </p>
            <p className="text-[11px] leading-snug text-muted-foreground/90">{t("runsCounterHint")}</p>
          </div>
        )}
      </div>

      <Card className="overflow-visible rounded-3xl border-white/55 bg-white/78 p-6 shadow-[0_20px_50px_-24px_rgba(120,80,160,0.35)] backdrop-blur-md ring-1 ring-foreground/8 sm:p-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/quiz"
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex h-14 w-full items-center justify-center rounded-2xl text-lg font-bold shadow-lg shadow-primary/25",
            )}
          >
            <Heart className="mr-2" weight="fill" size={22} />
            {t("cta")}
          </Link>

          <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground/70">{t("findGirlfriend")}</p>
            <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {t("comingSoon")}
            </span>
          </div>
        </div>
      </Card>

      {recent.length > 0 ? (
        <Card className="rounded-3xl border-white/50 bg-white/60 p-5 backdrop-blur-md sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Clock className="text-primary" weight="duotone" size={20} />
            {t("recentRuns")}
          </h2>
          <ul className="flex flex-col gap-2">
            {recent.map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-white/80 px-3 py-2.5 sm:px-4"
              >
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold">{tResult(`tier_${run.tier}`)}</p>
                  <p className="text-xs text-muted-foreground">{formatWhen(run.savedAt)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-xl font-bold"
                  onClick={() => openRun(run)}
                >
                  {t("recentOpen")}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="text-center text-sm text-muted-foreground">{t("recentEmpty")}</p>
      )}

      <p className="text-center text-xs text-muted-foreground">{t("disclaimer")}</p>
      <p className="sr-only">{tMeta("description")}</p>
    </main>
  );
}
