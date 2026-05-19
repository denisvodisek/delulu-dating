"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function FlipDigit({
  digit,
  className,
  reducedMotion,
}: {
  digit: string;
  className?: string;
  reducedMotion: boolean;
}) {
  const [display, setDisplay] = useState(digit);
  const [offset, setOffset] = useState(0);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (digit === prevRef.current) return;
    if (reducedMotion) {
      prevRef.current = digit;
      setDisplay(digit);
      return;
    }
    setOffset(-1);
    const swap = window.setTimeout(() => {
      setDisplay(digit);
      setOffset(0);
      prevRef.current = digit;
    }, 280);
    return () => window.clearTimeout(swap);
  }, [digit, reducedMotion]);

  return (
    <span
      className={cn(
        "relative inline-block h-[1em] w-[0.58em] overflow-hidden align-bottom",
        className,
      )}
      aria-hidden
    >
      <span
        className="flex flex-col transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateY(${offset * 100}%)` }}
      >
        <span className="flex h-[1em] items-center justify-center">{display}</span>
        <span className="flex h-[1em] items-center justify-center">{digit}</span>
      </span>
    </span>
  );
}

export type FlipCounterProps = {
  value: number;
  locale?: string;
  className?: string;
  digitClassName?: string;
};

/** Odometer-style rolling digits for live counters and hero stats. */
export function FlipCounter({ value, locale = "en-US", className, digitClassName }: FlipCounterProps) {
  const safe = Math.max(0, Math.floor(value));
  const formatted = safe.toLocaleString(locale);
  const chars = formatted.split("");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{formatted}</span>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={`sep-${i}`} className="inline-block min-w-[0.28em] text-center">
              {ch}
            </span>
          );
        }
        return (
          <FlipDigit
            key={`d-${i}-${chars.length}`}
            digit={ch}
            className={digitClassName}
            reducedMotion={reducedMotion}
          />
        );
      })}
    </span>
  );
}
