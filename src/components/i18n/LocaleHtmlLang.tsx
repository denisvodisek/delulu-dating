"use client";

import { useEffect } from "react";

export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale === "zh-HK" ? "zh-HK" : "en";
  }, [locale]);
  return null;
}
