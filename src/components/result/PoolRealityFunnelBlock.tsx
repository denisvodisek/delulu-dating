"use client";

import { useTranslations } from "next-intl";
import type { PoolFunnelStep } from "@/lib/pool-reality-funnel";

type Props = {
  steps: PoolFunnelStep[];
  locale: string;
};

export function PoolRealityFunnelBlock({ steps, locale }: Props) {
  const t = useTranslations("result");
  const loc = locale === "zh-HK" ? "zh-HK" : "en-US";
  const maxCount = steps[0]?.count ?? 1;

  return (
    <section
      className="mt-12 overflow-hidden rounded-3xl border-2 border-lab-on-surface/12 bg-gradient-to-br from-lab-surface-container-lowest via-white to-lab-primary/10 shadow-[0_8px_0_rgba(10,31,45,0.06)]"
      aria-labelledby="pool-funnel-heading"
    >
      <div className="border-b-2 border-lab-on-surface/10 bg-lab-on-surface/[0.03] px-5 py-5 md:px-8 md:py-6">
        <p
          id="pool-funnel-heading"
          className="font-lab-mono text-lab-primary text-[10px] font-semibold tracking-[0.2em] uppercase"
        >
          {t("labFunnelTitle")}
        </p>
        <p className="font-lab-body text-lab-on-surface mt-2 max-w-2xl text-sm leading-relaxed md:text-base">
          {t("labFunnelIntro")}
        </p>
      </div>

      <ol className="divide-y divide-lab-on-surface/10 px-5 py-2 md:px-8">
        {steps.map((step, idx) => {
          const widthPct = Math.max(8, Math.round((step.count / maxCount) * 100));
          return (
            <li key={step.key} className="py-4 first:pt-5 last:pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className="font-lab-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-lab-on-surface bg-lab-primary/25 text-sm font-bold text-lab-on-surface">
                    {idx + 1}
                  </span>
                  <p className="font-lab-body pt-0.5 text-sm leading-snug text-lab-on-surface md:text-base">
                    {t(step.labelKey as "funnelHkTotal")}
                  </p>
                </div>
                <span className="font-lab-mono shrink-0 pt-0.5 text-base font-bold tabular-nums text-lab-on-surface md:text-lg">
                  {step.count.toLocaleString(loc)}
                </span>
              </div>
              <div className="mt-3 ml-11 h-2 overflow-hidden rounded-full bg-lab-outline-variant/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#30c7ff] to-[#ff8add] transition-all duration-700"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <p className="font-lab-body text-lab-on-surface-variant border-t-2 border-lab-on-surface/10 px-5 py-5 text-sm leading-relaxed md:px-8 md:text-base">
        {t("labFunnelReassurance")}
      </p>
    </section>
  );
}
