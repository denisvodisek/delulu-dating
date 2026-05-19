"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ResultDiagnosisExportCardProps = {
  locale: string;
  clinicalLabel: string;
  tierLabel: string;
  stageTitle: string;
  explain: string;
  poolPre: string;
  poolCount: number;
  poolPost: string;
  tags: string[];
  severityLabel: string;
  severityPct: number;
  alarming: boolean;
};

/** 9:16 clinical diagnosis card for PNG export — transparent canvas, square top. */
export const ResultDiagnosisExportCard = forwardRef<HTMLDivElement, ResultDiagnosisExportCardProps>(
  function ResultDiagnosisExportCard(
    {
      locale,
      clinicalLabel,
      tierLabel,
      stageTitle,
      explain,
      poolPre,
      poolCount,
      poolPost,
      tags,
      severityLabel,
      severityPct,
      alarming,
    },
    ref,
  ) {
    const loc = locale === "zh" ? "zh-HK" : "en-US";
    const latinCaps = locale === "en";

    return (
      <div
        ref={ref}
        className="flex flex-col justify-end bg-transparent font-lab-body text-lab-ink antialiased"
        style={{ width: 360, height: 640 }}
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden border-2 border-[#0a1f2d]"
          style={{
            background: "linear-gradient(165deg, #ffffff 0%, #eef9ff 45%, #ffe8f7 100%)",
          }}
        >
          <div className="border-b-2 border-[#0a1f2d] bg-gradient-to-r from-[#30c7ff] to-[#ff8add] px-5 py-3">
            <p className="font-lab-mono text-[10px] font-bold tracking-[0.2em] text-[#0a1f2d] uppercase">
              {clinicalLabel}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
            <div>
              <p className="font-lab-mono text-[10px] font-semibold tracking-[0.16em] text-lab-primary uppercase">
                {tierLabel}
              </p>
              <h2 className="font-lab-display mt-1.5 text-[1.5rem] font-bold leading-tight text-lab-ink">
                {stageTitle}
              </h2>
              <p className="font-lab-body mt-3 text-[13px] leading-relaxed text-lab-on-surface">{explain}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-lab-mono rounded-full border border-[#0a1f2d]/30 bg-[#ff8add]/35 px-2.5 py-0.5 text-[8px] font-semibold tracking-wide uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <div className="rounded-2xl border-2 border-[#0a1f2d]/12 bg-white/75 px-4 py-4 text-center">
                <p className="font-lab-mono text-[9px] font-semibold tracking-[0.2em] text-lab-on-surface-variant uppercase">
                  {poolPre}
                </p>
                <p className="font-lab-display mt-1 text-[2.5rem] font-bold leading-none tabular-nums text-lab-primary">
                  {poolCount.toLocaleString(loc)}
                </p>
                <p
                  className={cn(
                    "font-lab-display mt-1 text-[1rem] font-bold leading-snug text-lab-ink",
                    latinCaps && "uppercase",
                  )}
                >
                  {poolPost}
                </p>
              </div>

              <div>
                <p className="font-lab-mono mb-2 text-[9px] font-semibold tracking-wide text-lab-on-surface-variant uppercase">
                  {severityLabel}
                </p>
                <div className="relative h-9 overflow-hidden rounded-full border-2 border-[#0a1f2d] bg-white">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      alarming
                        ? "bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-[#30c7ff] to-[#ff8add]",
                    )}
                    style={{ width: `${severityPct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end px-3">
                    <span
                      className={cn(
                        "font-lab-mono text-sm font-bold tabular-nums",
                        alarming || severityPct > 40 ? "text-white" : "text-lab-on-surface",
                      )}
                    >
                      {severityPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="border-t-2 border-[#0a1f2d]/15 py-3 text-center font-lab-mono text-[9px] font-bold tracking-[0.35em] text-lab-on-surface-variant uppercase">
            delulu.dating
          </p>
        </div>
      </div>
    );
  },
);
