"use client";

type EventProps = Record<string, string | number | boolean | null | undefined>;

export async function trackEvent(name: string, props: EventProps = {}) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.capture(name, props);
  } catch {
    // analytics must never break product flow
  }
}
