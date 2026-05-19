import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import QuizFlow from "@/components/quiz/QuizFlow";
import { metadataForLocalePage } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalePage(locale, "quiz");
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QuizFlow />;
}
