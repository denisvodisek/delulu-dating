"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";

const CtaR3fBackdrop = dynamic(
  () => import("./CtaR3fBackdrop").then((m) => m.CtaR3fBackdrop),
  { ssr: false },
);

export function LandingCtaSection() {
  const t = useTranslations("landing");
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(rootRef.current);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(q("[data-cta-reveal]"), { opacity: 1, y: 0 });
        return;
      }
      gsap.set(q(".orb"), { scale: 0.92, opacity: 0.55 });
      gsap.to(q(".orb"), {
        scale: 1.08,
        opacity: 0.85,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.5,
      });
      gsap.from(q("[data-cta-reveal]"), {
        opacity: 0,
        y: 36,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden px-4 py-20 text-center text-white md:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-pink-900 to-violet-950" />
      <div className="orb absolute top-10 left-[8%] h-40 w-40 rounded-full bg-pink-500/30 blur-3xl" />
      <div className="orb absolute right-[5%] bottom-16 h-52 w-52 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="absolute inset-0 hidden md:block">
        <CtaR3fBackdrop />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl">
        <h2
          data-cta-reveal
          className="font-lab-display text-4xl leading-[1.05] font-extrabold tracking-tight uppercase drop-shadow-sm md:text-6xl md:leading-[1.02] lg:text-7xl"
        >
          {t("ctaClosingTitle")}
        </h2>
        <p
          data-cta-reveal
          className="font-lab-body mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
        >
          {t("ctaClosingSub")}
        </p>
        <div data-cta-reveal className="mt-10">
          <Link
            href="/quiz"
            className="font-lab-mono inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-300 via-fuchsia-200 to-violet-200 px-12 py-5 text-xs font-extrabold tracking-[0.2em] text-fuchsia-950 uppercase shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.04] active:scale-[0.98] md:px-16 md:py-6"
          >
            {t("ctaEnterLab")}
          </Link>
        </div>
      </div>
    </section>
  );
}
