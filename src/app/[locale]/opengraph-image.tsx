import { ImageResponse } from "next/og";

export const alt = "Delulu Dating";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const brand = "Delulu Dating";
  const tagline =
    locale === "zh-HK"
      ? "你嘅港男濾鏡有幾妄想？"
      : "How delulu is your HK boyfriend wishlist?";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fff8fb 0%, #ffd6ea 35%, #e5d7ff 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, "Noto Sans HK", "Apple Color Emoji", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: -2,
            color: "#5b21b6",
          }}
        >
          {brand}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            fontWeight: 600,
            color: "#4b5563",
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            fontWeight: 500,
            color: "#9333ea",
          }}
        >
          delulu.dating
        </div>
      </div>
    ),
    { ...size },
  );
}
