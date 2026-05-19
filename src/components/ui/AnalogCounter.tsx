"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type Token =
  | { kind: "digit"; value: number; key: string }
  | { kind: "sep"; char: string; key: string };

function tokenize(value: number, locale: string): { formatted: string; tokens: Token[] } {
  const formatted = Math.max(0, Math.floor(value)).toLocaleString(locale);
  const tokens: Token[] = [];
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i]!;
    if (/\d/.test(ch)) {
      tokens.push({ kind: "digit", value: Number(ch), key: `d-${i}-${formatted.length}` });
    } else {
      tokens.push({ kind: "sep", char: ch, key: `s-${i}` });
    }
  }
  return { formatted, tokens };
}

const SLOT = {
  xs: { h: 36, w: "w-7", sepW: "w-2", text: "text-2xl" },
  sm: { h: 48, w: "w-[1.65rem]", sepW: "w-2.5", text: "text-[1.75rem]" },
  md: { h: 56, w: "w-[1.85rem] sm:w-9", sepW: "w-2.5", text: "text-4xl md:text-[2.65rem]" },
  lg: { h: 64, w: "w-10 sm:w-11", sepW: "w-3", text: "text-[2.35rem] sm:text-5xl" },
} as const;

function DigitSlot({
  digit,
  size,
}: {
  digit: number;
  size: keyof typeof SLOT;
}) {
  const reduced = useReducedMotion();
  const slot = SLOT[size];

  return (
    <motion.div
      className={cn(
        "relative shrink-0 overflow-hidden border-r-2 border-[#0a1f2d]/90 bg-[#0a1f2d] last:border-r-0",
        slot.w,
      )}
      style={{ height: slot.h }}
      aria-hidden
    >
      <motion.div
        className="flex flex-col will-change-transform"
        initial={false}
        animate={{ y: -digit * slot.h }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 280, damping: 28, mass: 0.85 }
        }
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className={cn(
              "font-lab-display flex shrink-0 items-center justify-center font-bold leading-none text-white tabular-nums",
              slot.text,
            )}
            style={{ height: slot.h }}
          >
            {d}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

export type AnalogCounterProps = {
  value: number;
  locale?: string;
  size?: keyof typeof SLOT;
  /** When true, commas sit on the same black bar as digits (default). */
  darkSeparators?: boolean;
  className?: string;
};

/** Per-digit vertical reel — analog odometer style. */
export function AnalogCounter({
  value,
  locale = "en-US",
  size = "md",
  darkSeparators = true,
  className,
}: AnalogCounterProps) {
  const { formatted, tokens } = useMemo(() => tokenize(value, locale), [value, locale]);
  const slot = SLOT[size];

  return (
    <span
      className={cn("inline-flex max-w-full align-bottom", className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{formatted}</span>
      <span
        className={cn(
          "analog-counter inline-flex overflow-hidden rounded-md",
          darkSeparators && "border-2 border-[#0a1f2d] bg-[#0a1f2d]",
        )}
        style={{ height: slot.h }}
        aria-hidden
      >
        {tokens.map((token) =>
          token.kind === "digit" ? (
            <DigitSlot key={token.key} digit={token.value} size={size} />
          ) : (
            <span
              key={token.key}
              className={cn(
                "font-lab-display flex shrink-0 items-center justify-center font-bold leading-none tabular-nums",
                slot.text,
                darkSeparators
                  ? cn("bg-[#0a1f2d] text-white", slot.sepW)
                  : "min-w-[0.55rem] bg-lab-surface-container-lowest text-lab-on-surface",
              )}
              style={{ height: slot.h }}
            >
              {token.char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
