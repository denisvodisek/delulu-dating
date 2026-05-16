"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing");

  const pill =
    "rounded-full border border-pink-200/70 bg-white/90 px-5 py-2.5 text-xs font-semibold text-fuchsia-900 uppercase tracking-wide shadow-sm transition hover:border-fuchsia-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-violet-50";

  return (
    <footer className="relative overflow-hidden border-t border-pink-200/50 bg-gradient-to-b from-white via-pink-50/30 to-violet-50/40 px-4 py-14 backdrop-blur-md md:px-16 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
      <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="font-lab-display text-2xl font-extrabold tracking-tight text-fuchsia-950 uppercase">
            {t("footerBrand")}
          </p>
          <p className="font-lab-body mt-3 max-w-md text-sm leading-relaxed text-slate-600">{t("footerLegal")}</p>
          <p className="font-lab-mono mt-4 text-[10px] uppercase tracking-[0.2em] text-fuchsia-700/80">{t("footerTag")}</p>
        </div>

        <div className="flex flex-col gap-3 md:col-span-3">
          <p className="font-lab-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">{t("footerColExplore")}</p>
          <Link href="/quiz" className={pill}>
            {t("footerLinkQuiz")}
          </Link>
          <Link href="/methodology" className={pill}>
            {t("footerMethodology")}
          </Link>
          <Link href="/#specimens" className={pill}>
            {t("footerLinkArchive")}
          </Link>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4">
          <p className="font-lab-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">{t("footerColMeta")}</p>
          <p className="font-lab-body text-sm text-slate-600">{t("footerBlurb")}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full bg-fuchsia-100/80 px-3 py-1 text-[10px] font-semibold text-fuchsia-900">{t("footerChipSatire")}</span>
            <span className="rounded-full bg-violet-100/80 px-3 py-1 text-[10px] font-semibold text-violet-900">{t("footerChipHK")}</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-pink-200/40 pt-8 text-center md:flex-row md:text-left">
        <span className="font-lab-mono text-[10px] text-slate-500 uppercase tracking-widest">{t("footerRegion")}</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-slate-400">{t("footerPrivacy")}</span>
          <span className="text-xs text-slate-400">{t("footerSocials")}</span>
        </div>
      </div>
    </footer>
  );
}
