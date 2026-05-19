"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ResultDiagnosisExportCardProps = {
  locale: string;
  clinicalLabel: string;
  tierLabel: string;
  headline: string;
  explain: string;
  stageTitle: string;
  stageBody: string;
  tags: string[];
  severityLabel: string;
  severityPct: number;
  alarming: boolean;
};

/** 9:16 clinical diagnosis card for PNG export. */
export const ResultDiagnosisExportCard = forwardRef<HTMLDivElement, ResultDiagnosisExportCardProps>(
  function ResultDiagnosisExportCard(
    {
      locale,
      clinicalLabel,
      tierLabel,
      headline,
      explain,
      stageTitle,
      stageBody,
      tags,
      severityLabel,
      severityPct,
      alarming,
    },
    ref,
  ) {
    const latinCaps = locale === "en";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-[28px] border-2 border-[#0a1f2d] text-left antialiased shadow-inner",
          "font-lab-body text-lab-ink",
        )}
        style={{
          width: 360,
          height: 640,
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
            <p className="font-lab-mono text-[9px] font-semibold tracking-[0.18em] text-lab-on-surface-variant uppercase">
              {tierLabel}
            </p>
            <h2
              className={cn(
                "font-lab-display mt-2 text-[1.65rem] font-bold leading-tight text-lab-ink",
                latinCaps && "uppercase",
              )}
            >
              {headline}
            </h2>
            <p className="font-lab-body mt-2 text-[13px] leading-relaxed text-lab-on-surface">{explain}</p>
            <p className="font-lab-mono mt-2 text-[10px] font-medium italic text-lab-on-surface-variant">
              {stageTitle}
            </p>
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

          <p className="font-lab-body text-[12px] leading-relaxed text-lab-on-surface-variant">{stageBody}</p>

          <div className="mt-auto">
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

        <p className="border-t-2 border-[#0a1f2d]/15 py-3 text-center font-lab-mono text-[9px] font-bold tracking-[0.35em] text-lab-on-surface-variant uppercase">
          delulu.dating
        </p>
      </div>
    );
  },
);
