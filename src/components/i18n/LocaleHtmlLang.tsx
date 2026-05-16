"use client";

import { useEffect } from "react";

export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-HK" : "en";
  }, [locale]);
  return null;
}
