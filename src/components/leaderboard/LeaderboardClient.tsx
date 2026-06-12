"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TIER_ORDER, type CrowdSliceStats, type LeaderboardStats, type SeekerKey } from "@/lib/runs-leaderboard";
import type { DeluluTier } from "@/lib/supabase/database.types";

type SeekerFilter = "all" | SeekerKey;

function viewForFilter(stats: LeaderboardStats, filter: SeekerFilter): CrowdSliceStats {
  if (filter === "all") return stats;
  return stats.bySeeker[filter];
}

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

const FILTER_ICONS: Record<FilterKey, string> = {
  noSmoking: "smoke_free",
  noKidsFromPrev: "child_care",
  requiresOwnFlat: "apartment",
  requiresCar: "directions_car",
};

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
  const reduced = useReducedMotion() ?? false;
  const tierListRef = useRef<HTMLUListElement>(null);

  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [activeTier, setActiveTier] = useState<DeluluTier | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [activeSeeker, setActiveSeeker] = useState<SeekerFilter>("all");

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
  }, [stats?.hasData, reduced, activeSeeker]);

  const view = stats ? viewForFilter(stats, activeSeeker) : null;

  const topMarital = view ? topKey(view.marital) : null;
  const topEducation = view ? topKey(view.educationMin) : null;
  const topExpat = view ? topKey(view.expatPreference) : null;

  const filterLabel: Record<FilterKey, string> = {
    noSmoking: t("filterNoSmoking"),
    noKidsFromPrev: t("filterNoKids"),
    requiresOwnFlat: t("filterOwnFlat"),
    requiresCar: t("filterCar"),
  };

  const filterPct = (key: FilterKey) => {
    if (!view) return 0;
    return view.filterRates[key];
  };

  function pickSeeker(next: SeekerFilter) {
    setActiveSeeker(next);
    if (!stats) return;
    const slice = viewForFilter(stats, next);
    if (slice.topTier) setActiveTier(slice.topTier);
    setActiveFilter(null);
  }

  return (
    <main className="relative mx-auto w-full max-w-4xl px-4 pt-32 pb-24 md:px-8 md:pt-36">
      <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
        <FloatingBlob
          reduced={reduced}
          className="top-12 -left-6 h-32 w-32 bg-[#30c7ff]/35 md:-left-12"
          delay={0}
        />
        <FloatingBlob
          reduced={reduced}
          className="top-48 -right-4 h-24 w-24 bg-[#ff8add]/40 md:-right-10"
          delay={1.4}
        />
      </div>

      <div className="relative z-10">
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

      {!loading && stats?.hasData && (
        <motion.div
          className="space-y-10"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Who ran the quiz — participation split */}
          <section className="rounded-3xl border-4 border-lab-on-surface/15 bg-white/95 p-6 shadow-[0_10px_0_rgba(10,31,45,0.07)] md:p-8">
            <h2 className="font-lab-display flex items-center gap-2 text-2xl font-black tracking-tight uppercase">
              <span className="material-symbols-outlined text-lab-primary">pie_chart</span>
              {t("seekerSplitTitle")}
            </h2>
            <p className="text-lab-on-surface-variant font-lab-body mt-2 text-sm">{t("seekerTap")}</p>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-lab-surface-container-high">
              <div className="flex h-full w-full">
                <div
                  className="h-full bg-gradient-to-r from-[#ff8add] to-[#e879f9] transition-[width] duration-500"
                  style={{ width: `${stats.seekerPercents.woman_seeking_man}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#30c7ff] to-[#38bdf8] transition-[width] duration-500"
                  style={{ width: `${stats.seekerPercents.man_seeking_woman}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SeekerSplitCard
                active={activeSeeker === "woman_seeking_man"}
                pct={stats.seekerPercents.woman_seeking_man}
                label={t("seekerWomenPct", { pct: stats.seekerPercents.woman_seeking_man })}
                sub={t("seekerWomenSub")}
                detail={t("seekerWomenDetail", { n: stats.seekerCounts.woman_seeking_man })}
                accent="from-[#ff8add]/25 to-[#e879f9]/15"
                reduced={reduced}
                onClick={() => pickSeeker(activeSeeker === "woman_seeking_man" ? "all" : "woman_seeking_man")}
              />
              <SeekerSplitCard
                active={activeSeeker === "man_seeking_woman"}
                pct={stats.seekerPercents.man_seeking_woman}
                label={t("seekerMenPct", { pct: stats.seekerPercents.man_seeking_woman })}
                sub={t("seekerMenSub")}
                detail={t("seekerMenDetail", { n: stats.seekerCounts.man_seeking_woman })}
                accent="from-[#30c7ff]/25 to-[#38bdf8]/15"
                reduced={reduced}
                onClick={() => pickSeeker(activeSeeker === "man_seeking_woman" ? "all" : "man_seeking_woman")}
              />
            </div>

            {activeSeeker !== "all" ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="font-lab-mono text-lab-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                  {activeSeeker === "woman_seeking_man" ? t("filteredHint_woman") : t("filteredHint_man")}
                </span>
                <button
                  type="button"
                  onClick={() => pickSeeker("all")}
                  className="font-lab-mono rounded-full border-2 border-lab-on-surface bg-lab-surface-container-lowest px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors hover:bg-lab-primary/15"
                >
                  {t("seekerAll")}
                </button>
              </div>
            ) : null}
          </section>

          {view?.hasData && activeTier ? (
            <>
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
              {TIER_ICON[view.topTier ?? activeTier]}
            </motion.span>
            <p className="font-lab-mono text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
              {t("hallLabel")}
            </p>
            <motion.p
              key={`${activeSeeker}-${view.topTier}`}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-lab-display mt-4 text-2xl font-extrabold tracking-tight uppercase md:text-4xl"
            >
              {view.topTier
                ? t("topTierLine", { tier: tResult(`tier_${view.topTier}`) })
                : t("topTierLine", { tier: tResult(`tier_${activeTier}`) })}
              <span className="text-lab-primary ml-2 text-lg md:text-xl">
                ({view.topTier ? view.tierPercents[view.topTier] : stats.tierPercents[activeTier]}%)
              </span>
            </motion.p>
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
                const pct = view.tierPercents[tier];
                const hasTier = view.tierCounts[tier] > 0;
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
                            width: `${Math.max(pct, hasTier ? 6 : 0)}%`,
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
                        {t(`tierRoast_${tier}` as "tierRoast_god")}
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
              {activeSeeker === "woman_seeking_man"
                ? t("averagesTitle_woman")
                : activeSeeker === "man_seeking_woman"
                  ? t("averagesTitle_man")
                  : t("averagesTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon="height"
                title={t("avgHeight")}
                value={
                  view.averages.minHeightCm != null ? `${view.averages.minHeightCm} cm` : "—"
                }
                reduced={reduced}
              />
              <StatCard
                icon="payments"
                title={t("avgIncome")}
                value={formatHkd(view.averages.minMonthlyIncomeHKD, locale)}
                reduced={reduced}
              />
              <StatCard
                icon="cake"
                title={t("avgAge")}
                value={
                  view.averages.ageMin != null && view.averages.ageMax != null
                    ? t("ageRange", { min: view.averages.ageMin, max: view.averages.ageMax })
                    : "—"
                }
                reduced={reduced}
              />
            </div>
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

            <div className="mt-10 space-y-8 border-t border-lab-outline-variant/40 pt-8">
              <h3 className="font-lab-display text-lg font-bold tracking-tight uppercase">
                {t("popularPicksTitle")}
              </h3>
              <motion.div className="grid gap-4 sm:grid-cols-3">
                {topMarital && (
                  <PickCard
                    icon="favorite"
                    kicker={t("topMaritalKicker")}
                    value={t(`marital_${topMarital}` as "marital_any")}
                    reduced={reduced}
                  />
                )}
                {topEducation && (
                  <PickCard
                    icon="school"
                    kicker={t("topEducationKicker")}
                    value={t(`education_${topEducation}` as "education_any")}
                    reduced={reduced}
                  />
                )}
                {topExpat && (
                  <PickCard
                    icon="public"
                    kicker={t("topExpatKicker")}
                    value={t(`expat_${topExpat}` as "expat_any")}
                    reduced={reduced}
                  />
                )}
              </motion.div>

              <h3 className="font-lab-display text-lg font-bold tracking-tight uppercase">
                {t("filterCardsTitle")}
              </h3>
              <motion.div className="grid gap-4 sm:grid-cols-2">
                {FILTER_KEYS.map((key) => (
                  <PickCard
                    key={key}
                    icon={FILTER_ICONS[key]}
                    kicker={filterLabel[key]}
                    value={`${filterPct(key)}%`}
                    reduced={reduced}
                  />
                ))}
              </motion.div>
            </div>
          </section>

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
            </>
          ) : activeSeeker !== "all" ? (
            <div className="rounded-3xl border-4 border-dashed border-lab-on-surface/20 bg-white/90 p-10 text-center">
              <p className="font-lab-body text-lg text-lab-on-surface-variant">{t("seekerSliceEmpty")}</p>
            </div>
          ) : null}
        </motion.div>
      )}
      </div>
    </main>
  );
}

function SeekerSplitCard({
  active,
  label,
  sub,
  detail,
  accent,
  reduced,
  onClick,
}: {
  active: boolean;
  pct: number;
  label: string;
  sub: string;
  detail: string;
  accent: string;
  reduced: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className={cn(
        "rounded-2xl border-2 p-5 text-left transition-shadow",
        active
          ? "border-lab-on-surface bg-lab-primary/15 shadow-[0_8px_0_rgba(10,31,45,0.08)] ring-2 ring-lab-primary/30"
          : cn("border-lab-on-surface/12 bg-gradient-to-br hover:border-lab-primary/35", accent),
      )}
    >
      <p className="font-lab-display text-3xl font-black tabular-nums">{label}</p>
      <p className="font-lab-body mt-1 text-sm font-semibold text-lab-on-surface">{sub}</p>
      <p className="text-lab-on-surface-variant mt-2 text-xs">{detail}</p>
    </motion.button>
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

function PickCard({
  icon,
  kicker,
  value,
  reduced,
}: {
  icon: string;
  kicker: string;
  value: string;
  reduced: boolean;
}) {
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3, boxShadow: "0 12px 0 rgba(10,31,45,0.09)" }}
      className="rounded-2xl border-2 border-lab-on-surface/15 bg-white/95 p-5 shadow-[0_8px_0_rgba(10,31,45,0.06)]"
    >
      <span className="material-symbols-outlined text-lab-primary mb-3 block text-2xl">{icon}</span>
      <p className="text-lab-on-surface-variant text-xs leading-snug font-semibold tracking-wide uppercase">
        {kicker}
      </p>
      <p className="font-lab-body text-lab-on-surface mt-2 text-base leading-snug font-semibold md:text-lg">
        {value}
      </p>
    </motion.div>
  );
}
