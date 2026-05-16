import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 180, height: 180 };

/** Apple touch icon — matches public/brand-mark.svg (gradient + heart + sparkle). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, #86198f 0%, #db2777 52%, #7c3aed 100%)",
          borderRadius: 50,
        }}
      >
        <div
          style={{
            fontSize: 104,
            lineHeight: 1,
            color: "rgba(255,255,255,0.96)",
            fontFamily: 'Georgia, "Times New Roman", ui-serif, serif',
            marginTop: 14,
          }}
        >
          ♥
        </div>
      </div>
    ),
    { ...size },
  );
}
