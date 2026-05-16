"use client";

import dynamic from "next/dynamic";

const KawaiiCanvas = dynamic(() => import("./KawaiiCanvas"), {
  ssr: false,
  loading: () => null,
});

export function KawaiiBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="gentle-bg absolute inset-0" aria-hidden />
      <div className="motion-reduce:hidden absolute inset-0">
        <KawaiiCanvas />
      </div>
    </div>
  );
}
