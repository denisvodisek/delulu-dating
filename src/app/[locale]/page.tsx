import { setRequestLocale } from "next-intl/server";
import LandingClient from "@/components/landing/LandingClient";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingClient />;
}
