"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { listRecentRuns, type SavedRun } from "@/lib/run-history";
import { saveQuiz } from "@/lib/quiz-storage";
import { safeOneInInverse, safePoolCountDisplay } from "@/lib/format-one-in";
import { LandingLiveCounter } from "@/components/landing/LandingLiveCounter";
import { LandingCtaSection } from "@/components/landing/LandingCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const HERO_IMAGE = "/hero-hk-street.png";

function specimenStripClasses(tier: SavedRun["tier"]) {
  if (tier === "god" || tier === "delulu") {
    return "bg-lab-error text-white";
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
  const [recent, setRecent] = useState<SavedRun[]>([]);

  useEffect(() => {
    setRecent(listRecentRuns(6));
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
    <main className="pt-20">
      {/* Hero */}
      <section className="grid min-h-[calc(100dvh-5rem)] w-full grid-cols-1 overflow-hidden rounded-b-3xl border-b-2 border-lab-on-surface shadow-[0_6px_0_rgba(10,31,45,0.08)] md:grid-cols-2 md:grid-rows-1">
        <div className="flex min-h-0 flex-col border-b-2 border-lab-on-surface/15 p-4 md:border-r md:border-b-0 md:p-16">
          <div className="mt-6 md:mt-10">
            <h1 className="font-lab-display text-lab-on-surface mb-10 text-5xl leading-none font-bold tracking-tight uppercase md:text-7xl md:leading-[0.95] lg:text-[84px] lg:leading-[90px]">
              {t("heroTitle1")}
              <br />
              <span className="text-lab-primary">{t("heroTitle2")}</span>
            </h1>
            <div className="max-w-md space-y-8">
              <p className="text-lab-on-surface-variant font-lab-body text-xl leading-relaxed md:text-[20px] md:leading-[30px]">
                {t("heroBody")}
              </p>
              <span className="inline-block animate-pump-cta">
              <Link
                href="/quiz"
                className="puffy-btn puffy-btn-lg group inline-flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  {t("heroCta")}
                  <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
              </Link>
              </span>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-6 md:mt-auto md:pt-10">
            <LandingLiveCounter />
          </div>
        </div>

        <div className="relative min-h-[min(28rem,55dvh)] w-full min-w-0 md:min-h-[min(calc(100dvh-5rem),56rem)]">
          <Image
            src={HERO_IMAGE}
            alt={t("heroImageAlt")}
            fill
            className="object-cover opacity-95 saturate-[1.05]"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#30c7ff]/35 via-[#ff8add]/15 to-transparent mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1f2d]/40 to-transparent" />
        </div>
      </section>

      {/* Process */}
      <section className="grid grid-cols-1 divide-y divide-lab-outline-variant border-b-2 border-lab-on-surface/15 md:grid-cols-3 md:divide-x md:divide-y-0">
        {(
          [
            { step: "01", icon: "input", titleKey: "process1Title", bodyKey: "process1Body" },
            { step: "02", icon: "query_stats", titleKey: "process2Title", bodyKey: "process2Body" },
            { step: "03", icon: "science", titleKey: "process3Title", bodyKey: "process3Body" },
          ] as const
        ).map(({ step, icon, titleKey, bodyKey }) => (
          <div
            key={step}
            className="group flex flex-col gap-6 bg-lab-surface-container-lowest/80 p-4 transition-all duration-300 hover:bg-lab-primary/10 md:p-16"
          >
            <div className="flex items-start justify-between">
              <span className="font-lab-display text-6xl leading-none text-lab-outline-variant transition-opacity group-hover:text-lab-on-surface">
                {step}
              </span>
              <span className="material-symbols-outlined text-4xl text-lab-primary">{icon}</span>
            </div>
            <div>
              <h3 className="font-lab-mono text-lab-mono text-lab-on-surface mb-4 text-xs font-semibold tracking-widest uppercase">
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
        className="scroll-mt-28 px-4 py-16 md:px-16 md:py-[var(--spacing-lab-section)]"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-[var(--spacing-lab-gutter)]">
          <div className="lg:col-span-4">
            <h2 className="font-lab-display mb-6 text-3xl uppercase md:text-5xl md:leading-[52px]">
              {t("specimensTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body mb-10 text-base leading-relaxed">
              {t("specimensSub")}
            </p>
            <div className="rounded-2xl border-2 border-lab-on-surface bg-lab-secondary/15 p-6">
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
                    className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-lab-on-surface bg-lab-surface-container-lowest/95 text-left shadow-[0_4px_0_#0a1f2d]/12 transition-all hover:border-lab-primary hover:shadow-md md:flex-row"
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
                          {oneLine} · {tResult("estimatedPool", { count: pool })}
                        </p>
                      </div>
                      <span className="material-symbols-outlined shrink-0 text-lab-on-surface/35 transition-colors group-hover:text-lab-primary">
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

      <LandingCtaSection />

      <LandingFooter />

      <p className="text-lab-on-surface-variant px-4 py-6 text-center text-xs md:px-16">{t("disclaimer")}</p>
      <p className="sr-only">{tMeta("description")}</p>
    </main>
  );
}
