import { setRequestLocale } from "next-intl/server";
import { MethodologyClient } from "@/components/methodology/MethodologyClient";

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MethodologyClient />;
}
