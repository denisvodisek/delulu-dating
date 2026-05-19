"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AnalogCounter } from "@/components/ui/AnalogCounter";
import { TIER_ORDER, type LeaderboardStats } from "@/lib/runs-leaderboard";
import type { DeluluTier } from "@/lib/supabase/database.types";

type ApiResponse = {
  ok: boolean;
  configured?: boolean;
  stats: LeaderboardStats;
};

const TIER_BAR: Record<DeluluTier, string> = {
  god: "from-[#ff4d8a] to-[#ff8add]",
  delulu: "from-[#ff8add] to-[#e879f9]",
  very_picky: "from-[#30c7ff] to-[#38bdf8]",
  picky: "from-[#7dd3fc] to-[#30c7ff]",
  realistic: "from-[#86efac] to-[#4ade80]",
};

const TIER_RING: Record<DeluluTier, string> = {
  god: "ring-[#ff4d8a]/50 shadow-[0_0_24px_rgba(255,77,138,0.35)]",
  delulu: "ring-[#ff8add]/50 shadow-[0_0_20px_rgba(255,138,221,0.3)]",
  very_picky: "ring-[#30c7ff]/50 shadow-[0_0_20px_rgba(48,199,255,0.3)]",
  picky: "ring-[#7dd3fc]/40",
  realistic: "ring-[#86efac]/40",
};

const TIER_ICON: Record<DeluluTier, string> = {
  god: "👑",
  delulu: "🌀",
  very_picky: "📐",
  picky: "✨",
  realistic: "🌱",
};

const FILTER_KEYS = [
  "noSmoking",
  "noKidsFromPrev",
  "requiresOwnFlat",
  "requiresCar",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

function formatHkd(n: number | null, locale: string) {
  if (n == null) return "—";
  return new Intl.NumberFormat(locale === "zh-HK" ? "zh-HK" : "en-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0,
  }).format(n);
}

function topKey(map: Record<string, number>): string | null {
  let best: string | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(map)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best;
}

function FloatingBlob({
  className,
  delay = 0,
  reduced,
}: {
  className?: string;
  delay?: number;
  reduced: boolean;
}) {
  if (reduced) {
    return <div className={cn("pointer-events-none absolute rounded-full opacity-40", className)} aria-hidden />;
  }
  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full opacity-50 blur-[1px]", className)}
      aria-hidden
      animate={{ y: [0, -16, 8, 0], rotate: [0, 10, -8, 0], scale: [1, 1.08, 0.94, 1] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function LoadingPulse({ reduced }: { reduced: boolean }) {
  const t = useTranslations("leaderboard");
  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-16"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex gap-2"
        animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        {["🧪", "📊", "💘"].map((e, i) => (
          <motion.span
            key={e}
            className="text-4xl"
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          >
            {e}
          </motion.span>
        ))}
      </motion.div>
      <p className="font-lab-display text-xl font-bold tracking-wide uppercase">{t("loading")}</p>
    </motion.div>
  );
}

export function LeaderboardClient() {
  const t = useTranslations("leaderboard");
  const tResult = useTranslations("result");
  const locale = useLocale();
  const loc = locale === "zh-HK" ? "zh-HK" : "en-US";
  const reduced = useReducedMotion() ?? false;
  const tierListRef = useRef<HTMLUListElement>(null);

  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [activeTier, setActiveTier] = useState<DeluluTier | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [seekerFocus, setSeekerFocus] = useState<"women" | "men" | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (cancelled) return;
        setConfigured(d.configured !== false);
        setStats(d.stats);
        if (d.stats.topTier) setActiveTier(d.stats.topTier);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!stats?.hasData || !tierListRef.current || reduced) return;
    const bars = tierListRef.current.querySelectorAll("[data-tier-bar]");
    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        transformOrigin: "left center",
      },
    );
  }, [stats?.hasData, reduced]);

  const topMarital = stats ? topKey(stats.marital) : null;
  const topEducation = stats ? topKey(stats.educationMin) : null;
  const topExpat = stats ? topKey(stats.expatPreference) : null;

  const womenPct =
    stats && stats.total > 0
      ? Math.round((stats.seekerCounts.woman_seeking_man / stats.total) * 100)
      : 0;
  const menPct = stats && stats.total > 0 ? 100 - womenPct : 0;

  const filterLabel: Record<FilterKey, string> = {
    noSmoking: t("filterNoSmoking"),
    noKidsFromPrev: t("filterNoKids"),
    requiresOwnFlat: t("filterOwnFlat"),
    requiresCar: t("filterCar"),
  };

  const filterPct = (key: FilterKey) => {
    if (!stats) return 0;
    return stats.filterRates[key];
  };

  return (
    <main className="relative mx-auto w-full max-w-4xl overflow-x-hidden px-4 pt-24 pb-24 md:px-8">
      <FloatingBlob
        reduced={reduced}
        className="top-12 -left-10 h-32 w-32 bg-[#30c7ff]/35"
        delay={0}
      />
      <FloatingBlob
        reduced={reduced}
        className="top-48 -right-8 h-24 w-24 bg-[#ff8add]/40"
        delay={1.4}
      />

      <header className="relative mb-14 text-center">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-lab-mono text-lab-primary text-xs font-semibold tracking-[0.28em] uppercase"
        >
          {t("kicker")}
        </motion.p>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="font-lab-display text-lab-on-surface mt-4 text-5xl leading-[0.92] font-black tracking-tight uppercase sm:text-6xl md:text-7xl"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="text-lab-on-surface-variant font-lab-body mx-auto mt-5 max-w-xl text-lg leading-relaxed md:text-xl"
        >
          {t("subtitle")}
        </motion.p>
        <motion.div
          className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-lab-on-surface bg-lab-primary/25 px-4 py-2"
          animate={reduced ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="material-symbols-outlined text-lg">groups</span>
          <span className="font-lab-mono text-xs font-semibold tracking-wide uppercase">
            {t("badge")}
          </span>
        </motion.div>
      </header>

      {loading && <LoadingPulse reduced={reduced} />}

      {!loading && !configured && (
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-4 border-lab-on-surface bg-white/90 p-10 text-center shadow-[0_12px_0_rgba(10,31,45,0.08)]"
        >
          <p className="text-5xl" aria-hidden>
            🔌
          </p>
          <p className="font-lab-body mt-4 text-lg leading-relaxed">{t("notConfigured")}</p>
        </motion.div>
      )}

      {!loading && configured && stats && !stats.hasData && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border-4 border-dashed border-lab-primary/40 bg-gradient-to-br from-[#30c7ff]/20 via-white to-[#ff8add]/25 p-12 text-center shadow-[0_10px_0_rgba(10,31,45,0.06)]"
        >
          <motion.span
            className="text-6xl"
            animate={reduced ? undefined : { rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            aria-hidden
          >
            🧫
          </motion.span>
          <p className="font-lab-display mt-4 text-3xl font-black uppercase">{t("emptyTitle")}</p>
          <p className="text-lab-on-surface-variant font-lab-body mt-3 text-lg">{t("emptyBody")}</p>
          <span className="mt-8 inline-block animate-pump-cta">
            <Link href="/quiz" className="puffy-btn puffy-btn-lg inline-flex">
              {t("emptyCta")}
            </Link>
          </span>
        </motion.div>
      )}

      {!loading && stats?.hasData && activeTier && (
        <motion.div
          className="space-y-10"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Hall of delulu — hero stat */}
          <motion.section
            layout
            className="relative overflow-hidden rounded-3xl border-4 border-lab-on-surface bg-gradient-to-br from-[#0a1f2d] via-[#123347] to-[#1a2840] p-6 text-white shadow-[0_14px_0_rgba(10,31,45,0.15)] md:p-10"
          >
            <motion.span
              className="absolute top-4 right-4 text-4xl opacity-80"
              animate={reduced ? undefined : { rotate: [0, 12, -6, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              aria-hidden
            >
              {TIER_ICON[stats.topTier ?? activeTier]}
            </motion.span>
            <p className="font-lab-mono text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
              {t("hallLabel")}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <AnalogCounter value={stats.total} locale={loc} size="hero" darkSeparators />
              <p className="font-lab-body pb-2 text-sm text-white/75 md:text-base">{t("totalLabel")}</p>
            </div>
            <motion.p
              key={stats.topTier}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-lab-display mt-6 text-2xl font-extrabold tracking-tight uppercase md:text-3xl"
            >
              {t("topTierLine", { tier: tResult(`tier_${stats.topTier}`) })}
              <span className="text-lab-primary ml-2 text-lg md:text-xl">
                ({stats.tierPercents[stats.topTier!]}%)
              </span>
            </motion.p>
            <p className="font-lab-body mt-3 text-sm text-white/70">{t("tapTierHint")}</p>
          </motion.section>

          {/* Interactive tier board */}
          <section className="rounded-3xl border-4 border-lab-on-surface/15 bg-white/95 p-6 shadow-[0_10px_0_rgba(10,31,45,0.07)] md:p-8">
            <h2 className="font-lab-display flex items-center gap-2 text-2xl font-black tracking-tight uppercase">
              <span className="material-symbols-outlined text-lab-primary">leaderboard</span>
              {t("tierTitle")}
            </h2>
            <ul ref={tierListRef} className="mt-8 space-y-3">
              {TIER_ORDER.map((tier, index) => {
                const active = activeTier === tier;
                const pct = stats.tierPercents[tier];
                const count = stats.tierCounts[tier];
                return (
                  <li key={tier}>
                    <motion.button
                      type="button"
                      onClick={() => setActiveTier(tier)}
                      initial={reduced ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={reduced ? undefined : { scale: 1.01 }}
                      whileTap={reduced ? undefined : { scale: 0.99 }}
                      className={cn(
                        "w-full rounded-2xl border-2 p-4 text-left transition-shadow",
                        active
                          ? cn("border-lab-on-surface bg-lab-surface-container-low ring-4", TIER_RING[tier])
                          : "border-lab-on-surface/12 bg-white hover:border-lab-primary/40 hover:bg-lab-surface-container-low/50",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-bold">
                          <span className="text-2xl" aria-hidden>
                            {TIER_ICON[tier]}
                          </span>
                          <span className="font-lab-display text-base uppercase sm:text-lg">
                            {tResult(`tier_${tier}`)}
                          </span>
                        </span>
                        <span className="font-lab-display text-lab-primary text-xl font-black tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-3 h-4 overflow-hidden rounded-full bg-lab-surface-container-high">
                        <motion.div
                          data-tier-bar
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r shadow-inner",
                            TIER_BAR[tier],
                          )}
                          style={{
                            width: `${Math.max(pct, count > 0 ? 6 : 0)}%`,
                          }}
                        />
                      </div>
                      <motion.p
                        initial={false}
                        animate={{
                          height: active ? "auto" : 0,
                          opacity: active ? 1 : 0,
                          marginTop: active ? 12 : 0,
                        }}
                        className="overflow-hidden font-lab-body text-sm leading-relaxed text-lab-on-surface-variant"
                      >
                        {t(`tierRoast_${tier}` as "tierRoast_god")} · {count}{" "}
                        {t("specimens")}
                      </motion.p>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Averages — hover lift cards */}
          <section>
            <h2 className="font-lab-display mb-5 text-2xl font-black tracking-tight uppercase">
              {t("averagesTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon="height"
                title={t("avgHeight")}
                value={
                  stats.averages.minHeightCm != null ? `${stats.averages.minHeightCm} cm` : "—"
                }
                reduced={reduced}
              />
              <StatCard
                icon="payments"
                title={t("avgIncome")}
                value={formatHkd(stats.averages.minMonthlyIncomeHKD, locale)}
                reduced={reduced}
              />
              <StatCard
                icon="cake"
                title={t("avgAge")}
                value={
                  stats.averages.ageMin != null && stats.averages.ageMax != null
                    ? t("ageRange", { min: stats.averages.ageMin, max: stats.averages.ageMax })
                    : "—"
                }
                reduced={reduced}
              />
            </div>
          </section>

          {/* Seeker split — click to spotlight */}
          <section className="rounded-3xl border-4 border-lab-on-surface/15 bg-white/95 p-6 shadow-[0_10px_0_rgba(10,31,45,0.07)] md:p-8">
            <h2 className="font-lab-display text-2xl font-black tracking-tight uppercase">
              {t("seekerSplit")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body mt-2 text-sm">{t("seekerTap")}</p>
            <div className="mt-6 flex h-14 overflow-hidden rounded-2xl border-2 border-lab-on-surface">
              <motion.button
                type="button"
                onClick={() => setSeekerFocus(seekerFocus === "women" ? null : "women")}
                className={cn(
                  "flex flex-col items-center justify-center font-bold transition-colors",
                  seekerFocus === "women"
                    ? "bg-[#ff8add] text-white"
                    : "bg-[#ff8add]/35 text-lab-on-surface hover:bg-[#ff8add]/55",
                )}
                style={{ width: `${Math.max(womenPct, 8)}%` }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
              >
                <span className="text-xs uppercase">♀</span>
                <span className="font-lab-display text-sm tabular-nums">{womenPct}%</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setSeekerFocus(seekerFocus === "men" ? null : "men")}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center font-bold transition-colors",
                  seekerFocus === "men"
                    ? "bg-[#30c7ff] text-white"
                    : "bg-[#30c7ff]/35 text-lab-on-surface hover:bg-[#30c7ff]/55",
                )}
                whileTap={reduced ? undefined : { scale: 0.98 }}
              >
                <span className="text-xs uppercase">♂</span>
                <span className="font-lab-display text-sm tabular-nums">{menPct}%</span>
              </motion.button>
            </div>
            <motion.p
              key={seekerFocus ?? "all"}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-lab-body mt-4 text-center text-lg font-medium"
            >
              {seekerFocus === "women"
                ? t("seekerWomenDetail", { n: stats.seekerCounts.woman_seeking_man })
                : seekerFocus === "men"
                  ? t("seekerMenDetail", { n: stats.seekerCounts.man_seeking_woman })
                  : t("seekerLine", {
                      women: stats.seekerCounts.woman_seeking_man,
                      men: stats.seekerCounts.man_seeking_woman,
                    })}
            </motion.p>
          </section>

          {/* Harsh-o-meter filters */}
          <section className="rounded-3xl border-4 border-lab-on-surface/15 bg-gradient-to-br from-white via-[#fff8fd] to-[#f0fbff] p-6 shadow-[0_10px_0_rgba(10,31,45,0.07)] md:p-8">
            <h2 className="font-lab-display text-2xl font-black tracking-tight uppercase">
              {t("filtersTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body mt-2 text-sm">{t("filterTap")}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {FILTER_KEYS.map((key) => {
                const pct = filterPct(key);
                const on = activeFilter === key;
                return (
                  <li key={key}>
                    <motion.button
                      type="button"
                      onClick={() => setActiveFilter(on ? null : key)}
                      whileHover={reduced ? undefined : { y: -2 }}
                      whileTap={reduced ? undefined : { scale: 0.98 }}
                      className={cn(
                        "relative w-full overflow-hidden rounded-2xl border-2 px-4 py-4 text-left transition-colors",
                        on
                          ? "border-lab-on-surface bg-lab-primary/15"
                          : "border-lab-on-surface/12 bg-white hover:border-lab-primary/35",
                      )}
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 bg-lab-primary/20 transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{filterLabel[key]}</span>
                        <span className="font-lab-display text-lab-primary text-2xl font-black tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <motion.p
                        initial={false}
                        animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0, marginTop: on ? 8 : 0 }}
                        className="relative overflow-hidden text-xs text-lab-on-surface-variant"
                      >
                        {t(`filterRoast_${key}` as "filterRoast_noSmoking")}
                      </motion.p>
                    </motion.button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              {topMarital && (
                <VibeChip label={t("topMarital", { choice: t(`marital_${topMarital}` as "marital_any") })} />
              )}
              {topEducation && (
                <VibeChip
                  label={t("topEducation", {
                    choice: t(`education_${topEducation}` as "education_any"),
                  })}
                />
              )}
              {topExpat && (
                <VibeChip label={t("topExpat", { choice: t(`expat_${topExpat}` as "expat_any") })} />
              )}
            </div>
          </section>

          <p className="text-lab-on-surface-variant text-center text-sm leading-relaxed">{t("disclaimer")}</p>

          <motion.div
            className="text-center"
            animate={reduced ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="inline-block animate-pump-cta">
              <Link href="/quiz" className="puffy-btn puffy-btn-lg puffy-btn-lavender inline-flex gap-2">
                {t("cta")}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </span>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  reduced,
}: {
  icon: string;
  title: string;
  value: string;
  reduced: boolean;
}) {
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -4, boxShadow: "0 14px 0 rgba(10,31,45,0.1)" }}
      className="rounded-2xl border-2 border-lab-on-surface/12 bg-white p-5 shadow-[0_8px_0_rgba(10,31,45,0.06)]"
    >
      <motion.span
        className="material-symbols-outlined text-lab-primary mb-2 block text-3xl"
        animate={reduced ? undefined : { rotate: [0, -8, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.span>
      <p className="text-lab-on-surface-variant text-xs font-semibold tracking-wide uppercase">{title}</p>
      <p className="font-lab-display text-lab-on-surface mt-2 text-2xl font-black md:text-3xl">{value}</p>
    </motion.div>
  );
}

function VibeChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border-2 border-lab-on-surface/15 bg-white/90 px-3 py-1.5 text-xs font-medium shadow-[0_3px_0_rgba(10,31,45,0.05)]">
      {label}
    </span>
  );
}
