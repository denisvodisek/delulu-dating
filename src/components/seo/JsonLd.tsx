import { SITE_URL } from "@/lib/seo/site";

type JsonLdProps = {
  locale: string;
  name: string;
  description: string;
};

export function JsonLd({ locale, name, description }: JsonLdProps) {
  const pageUrl = `${SITE_URL}/${locale}`;

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: pageUrl,
    inLanguage: locale === "zh-HK" ? "zh-HK" : "en-HK",
  };

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: pageUrl,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "HKD",
    },
    isAccessibleForFree: true,
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          locale === "zh-HK"
            ? "Delulu Dating 係咩？"
            : "What is Delulu Dating?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "zh-HK"
              ? "用香港公開統計同你嘅擇偶條件，估算符合條件嘅男性有幾多——好笑、唔係配對平台。"
              : "A Hong Kong stats-based calculator that estimates how many men match your dating wishlist — for fun, not matchmaking.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "zh-HK"
            ? "要登記嗎？"
            : "Do I need to sign up?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "zh-HK"
              ? "唔使。做完測驗可以分享結果圖，無需帳戶。"
              : "No. Complete the quiz and share your result — no account required.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
