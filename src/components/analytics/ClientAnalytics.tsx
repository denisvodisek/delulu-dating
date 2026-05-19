"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function ClientAnalytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
        },
      });
    });
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
