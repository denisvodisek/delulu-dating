"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ResultStoryExportCardProps = {
  locale: string;
  pre: string;
  post: string;
  count: number;
  oneInLine: string;
  chanceLine: string;
  tierLabel: string;
};

/** Fixed 360×640 (9:16) card for PNG export — off-screen in parent. */
export const ResultStoryExportCard = forwardRef<HTMLDivElement, ResultStoryExportCardProps>(
  function ResultStoryExportCard(
    { locale, pre, post, count, oneInLine, chanceLine, tierLabel },
    ref,
  ) {
    const loc = locale === "zh" ? "zh-HK" : "en-US";
    const latinCaps = locale === "en";
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-stretch justify-between rounded-[28px] border-2 border-white/90 p-8 text-center antialiased shadow-inner",
          "font-lab-sans text-lab-ink",
        )}
        style={{
          width: 360,
          height: 640,
          background: "linear-gradient(160deg, #fff1f7 0%, #f5f0ff 42%, #eef8ff 100%)",
        }}
      >
        <header>
          <p className="font-lab-mono text-[9px] font-bold tracking-[0.35em] text-fuchsia-800 uppercase">
            delulu.dating
          </p>
          <p className="font-lab-mono mt-5 text-[9px] font-semibold tracking-[0.22em] text-violet-700 uppercase">
            {tierLabel}
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-2">
          <span className="font-lab-sans text-[11px] font-semibold tracking-[0.38em] text-fuchsia-900/78 uppercase">
            {pre}
          </span>
          <span className="font-lab-sans bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 bg-clip-text text-[3.25rem] font-black leading-none tracking-tight text-transparent tabular-nums">
            {count.toLocaleString(loc)}
          </span>
          <span
            className={cn(
              "font-lab-display max-w-[16rem] text-[1.35rem] font-semibold leading-snug text-lab-ink",
              latinCaps && "italic",
            )}
          >
            {post}
          </span>
        </div>

        <footer className="rounded-2xl border border-pink-200/80 bg-white/85 px-3 py-3">
          <p
            className={cn(
              "font-lab-display text-[1.05rem] font-bold leading-snug text-lab-ink",
              latinCaps && "uppercase",
            )}
          >
            {oneInLine}
          </p>
          <p className="font-lab-mono mt-2 text-[8px] font-semibold leading-relaxed tracking-wide text-fuchsia-900/88 uppercase">
            {chanceLine}
          </p>
        </footer>
      </div>
    );
  },
);
