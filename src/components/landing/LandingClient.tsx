"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { listRecentRuns, type SavedRun } from "@/lib/run-history";
import { saveQuiz } from "@/lib/quiz-storage";
import { safeOneInInverse, safePoolCountDisplay } from "@/lib/format-one-in";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1600&q=85";

const SESSION_COUNTER_OFFSET = "delulu-counter-session-offset";

function specimenStripClasses(tier: SavedRun["tier"]) {
  if (tier === "god" || tier === "delulu") {
    return "bg-lab-error text-lab-on-primary";
  }
  if (tier === "very_picky" || tier === "picky") {
    return "bg-lab-primary text-lab-on-primary";
  }
  return "bg-lab-secondary text-lab-on-primary";
}

function specimenLevelKey(tier: SavedRun["tier"]): "specimenLevelSevere" | "specimenLevelHigh" | "specimenLevelStable" {
  if (tier === "god" || tier === "delulu") return "specimenLevelSevere";
  if (tier === "very_picky" || tier === "picky") return "specimenLevelHigh";
  return "specimenLevelStable";
}

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

  const marqueeLine =
    runs != null ? t("marqueeWithCount", { count: runs }) : t("marquee");

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="border-lab-outline flex min-h-[calc(100vh-80px)] flex-col border-b md:flex-row">
        <div className="border-lab-outline flex flex-1 flex-col justify-between border-b p-4 md:border-r md:border-b-0 md:p-16">
          <div className="mt-8 md:mt-12">
            <span className="font-lab-mono text-lab-mono text-lab-primary mb-4 block text-xs font-semibold tracking-[0.2em]">
              {t("heroKicker")}
            </span>
            <h1 className="font-lab-display mb-10 text-5xl leading-none font-bold uppercase tracking-tight md:text-7xl md:leading-[0.95] lg:text-[84px] lg:leading-[90px]">
              {t("heroTitle1")}
              <br />
              <span className="opacity-50">{t("heroTitle2")}</span>
            </h1>
            <div className="max-w-md space-y-8">
              <p className="text-lab-on-surface-variant font-lab-body text-xl leading-relaxed md:text-[20px] md:leading-[30px]">
                {t("heroBody")}
              </p>
              <Link
                href="/quiz"
                className="font-lab-mono text-lab-mono bg-lab-primary text-lab-on-primary inline-block py-6 px-12 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 hover:bg-lab-inverse hover:text-lab-on-inverse"
              >
                {t("heroCta")}
              </Link>
              <div className="border-lab-outline-variant bg-lab-surface/80 text-lab-on-surface-variant space-y-2 border border-dashed p-4 text-center text-xs">
                <p className="text-lab-on-surface font-semibold">{t("findGirlfriend")}</p>
                <span className="font-lab-mono bg-lab-surface-container inline-block rounded-full border border-lab-outline/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {t("comingSoon")}
                </span>
              </div>
            </div>
          </div>

          <div className="text-lab-on-primary bg-lab-primary -mx-4 overflow-hidden py-4 whitespace-nowrap md:-mx-16">
            <div className="inline-flex animate-[marquee_20s_linear_infinite]">
              <span className="font-lab-mono text-lab-mono px-8 text-xs font-semibold uppercase">
                {marqueeLine}
              </span>
              <span className="font-lab-mono text-lab-mono px-8 text-xs font-semibold uppercase">
                {marqueeLine}
              </span>
            </div>
          </div>
          {runs != null && (
            <p className="text-lab-on-surface-variant font-lab-mono mt-3 px-1 text-[10px] uppercase leading-snug tracking-wide">
              {t("runsCounterHint")}
            </p>
          )}
        </div>

        <div className="bg-lab-inverse relative min-h-[500px] flex-1 overflow-hidden md:min-h-0">
          <Image
            src={HERO_IMAGE}
            alt={t("heroImageAlt")}
            fill
            className="object-cover opacity-70 mix-blend-luminosity grayscale"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          <div className="from-lab-inverse pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent opacity-40" />
          <div className="font-lab-mono text-lab-mono text-lab-on-inverse border-lab-outline-variant/30 absolute top-0 right-0 border-l border-b p-6 text-right text-sm whitespace-pre-line backdrop-blur-sm">
            {t("heroCoords")}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-lab-outline grid grid-cols-1 divide-y border-b md:grid-cols-3 md:divide-x md:divide-y-0">
        {(
          [
            { step: "01", icon: "input", titleKey: "process1Title", bodyKey: "process1Body" },
            { step: "02", icon: "query_stats", titleKey: "process2Title", bodyKey: "process2Body" },
            { step: "03", icon: "science", titleKey: "process3Title", bodyKey: "process3Body" },
          ] as const
        ).map(({ step, icon, titleKey, bodyKey }) => (
          <div
            key={step}
            className="group hover:bg-lab-surface-container flex flex-col gap-6 p-4 transition-colors duration-300 md:p-16"
          >
            <div className="flex items-start justify-between">
              <span className="font-lab-display text-6xl leading-none opacity-20 transition-opacity group-hover:opacity-100">
                {step}
              </span>
              <span className="material-symbols-outlined text-lab-primary text-4xl">{icon}</span>
            </div>
            <div>
              <h3 className="font-lab-mono text-lab-mono text-lab-primary mb-4 text-xs font-semibold uppercase tracking-widest">
                {t(titleKey)}
              </h3>
              <p className="text-lab-on-surface-variant font-lab-body text-base leading-relaxed">
                {t(bodyKey)}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Specimens */}
      <section
        id="specimens"
        className="px-4 py-16 md:px-16 md:py-[var(--spacing-lab-section)] scroll-mt-24"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-[var(--spacing-lab-gutter)]">
          <div className="lg:col-span-4">
            <h2 className="font-lab-display mb-6 text-3xl uppercase md:text-5xl md:leading-[52px]">
              {t("specimensTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body mb-10 text-base leading-relaxed">
              {t("specimensSub")}
            </p>
            <div className="border-lab-primary bg-lab-surface-container p-6 border-l-4">
              <p className="font-lab-mono text-lab-mono text-sm italic">{t("specimenQuote")}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-8">
            {recent.length === 0 ? (
              <p className="text-lab-on-surface-variant font-lab-body border-lab-outline border p-6 text-sm">
                {t("recentEmpty")}
              </p>
            ) : (
              recent.map((run) => {
                const strip = specimenStripClasses(run.tier);
                const levelLabel = t(specimenLevelKey(run.tier));
                const n = safeOneInInverse(run.probability);
                const pool = safePoolCountDisplay(run.estimatedMatches);
                const oneLine = tResult("oneIn", { n });
                const shortId = run.id.slice(0, 8);
                return (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => openRun(run)}
                    className="border-lab-outline group flex w-full cursor-pointer flex-col overflow-hidden border text-left transition-colors hover:bg-lab-surface-container/50 md:flex-row"
                  >
                    <div
                      className={cn(
                        "font-lab-mono text-lab-mono flex w-full items-center justify-center py-4 text-xs font-semibold uppercase md:w-32 md:py-0",
                        strip,
                      )}
                    >
                      <span className="whitespace-nowrap md:-rotate-90">{levelLabel}</span>
                    </div>
                    <div className="bg-lab-surface flex flex-1 items-center justify-between gap-4 p-6">
                      <div className="min-w-0">
                        <div className="font-lab-mono text-lab-mono mb-2 flex flex-wrap gap-2 text-[10px] uppercase">
                          <span className="border-lab-outline px-2 py-0.5">{t("specimenCase", { id: shortId })}</span>
                          <span className="border-lab-outline px-2 py-0.5">{formatWhen(run.savedAt)}</span>
                        </div>
                        <h4 className="font-lab-body text-lg leading-snug font-bold">
                          {tResult(`tier_${run.tier}`)}
                        </h4>
                        <p className="text-lab-on-surface-variant mt-1 text-sm">
                          {oneLine} · ~{tResult("estimatedPool", { count: pool })}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-lab-outline group-hover:text-lab-primary shrink-0 transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lab-inverse text-lab-on-inverse px-4 py-16 text-center md:py-[var(--spacing-lab-section)]">
        <h2 className="font-lab-display mb-6 text-5xl uppercase md:text-7xl lg:text-[84px] lg:leading-[90px]">
          {t("ctaClosingTitle")}
        </h2>
        <p className="font-lab-body mx-auto mb-10 max-w-2xl text-lg opacity-70 md:text-[20px] md:leading-[30px]">
          {t("ctaClosingSub")}
        </p>
        <Link
          href="/quiz"
          className="font-lab-mono text-lab-mono bg-lab-on-inverse text-lab-inverse inline-block py-6 px-16 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 hover:bg-lab-primary hover:text-lab-on-primary"
        >
          {t("ctaEnterLab")}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-lab-outline bg-lab-surface flex w-full flex-col items-center gap-6 border-t px-4 py-12 md:flex-row md:justify-between md:px-16">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="font-lab-mono text-lab-mono text-sm font-bold uppercase tracking-wide text-lab-on-surface">
            {t("footerBrand")}
          </span>
          <span className="text-lab-on-surface-variant max-w-xs text-xs leading-snug">{t("footerLegal")}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:justify-end">
          <Link
            href="/methodology"
            className="font-lab-mono text-lab-mono text-lab-on-surface-variant hover:text-lab-primary text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            {t("footerMethodology")}
          </Link>
          <span className="text-lab-outline-variant text-xs">{t("footerPrivacy")}</span>
          <span className="text-lab-outline-variant text-xs">{t("footerSocials")}</span>
        </div>
        <div className="font-lab-mono text-lab-mono text-lab-on-surface-variant text-[10px] uppercase tracking-widest">
          {t("footerRegion")}
        </div>
      </footer>

      <p className="text-lab-on-surface-variant px-4 py-6 text-center text-xs md:px-16">{t("disclaimer")}</p>
      <p className="sr-only">{tMeta("description")}</p>
    </main>
  );
}
