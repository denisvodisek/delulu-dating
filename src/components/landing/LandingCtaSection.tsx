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
      className="relative overflow-hidden border-y-2 border-lab-on-surface bg-[#0a1f2d] px-4 py-20 text-center text-white md:py-28"
    >
      <div className="orb absolute top-10 left-[8%] h-40 w-40 rounded-full bg-[#30c7ff]/35 blur-3xl" />
      <div className="orb absolute right-[5%] bottom-16 h-52 w-52 rounded-full bg-[#ff8add]/30 blur-3xl" />
      <div className="absolute inset-0 hidden md:block">
        <CtaR3fBackdrop />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl">
        <h2
          data-cta-reveal
          className="font-lab-display text-4xl leading-[1.05] font-extrabold tracking-tight uppercase md:text-6xl md:leading-[1.02] lg:text-7xl"
        >
          {t("ctaClosingTitle")}
        </h2>
        <p
          data-cta-reveal
          className="font-lab-body mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg"
        >
          {t("ctaClosingSub")}
        </p>
        <div data-cta-reveal className="mt-10">
          <Link href="/quiz" className="puffy-btn puffy-btn-lg puffy-btn-lavender inline-flex">
            {t("ctaEnterLab")}
          </Link>
        </div>
      </div>
    </section>
  );
}
