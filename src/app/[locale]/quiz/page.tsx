import { setRequestLocale } from "next-intl/server";
import QuizFlow from "@/components/quiz/QuizFlow";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QuizFlow />;
}
