"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "horizontal" | "vertical";
  layout?: string;
  className?: string;
}

export function AdUnit({ slot, format = "auto", layout, className }: AdUnitProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      adsbygoogle.push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-4524750683541633"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
      {...(layout && { "data-ad-layout": layout })}
    />
  );
}
