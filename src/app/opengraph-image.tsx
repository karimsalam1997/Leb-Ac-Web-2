import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Lebanese Academic — Essays from Beirut.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function HomeOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "72px",
          background:
            "linear-gradient(180deg, #fff1e0 0%, #f7e0c8 100%)",
          color: "#1a1208",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a83918",
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Lebanese Academic · Issue 01 · May 2026
        </div>

        <div
          style={{
            fontSize: 124,
            lineHeight: 0.95,
            fontWeight: 850,
            letterSpacing: "-0.02em",
            color: "#1a1208",
            textAlign: "center",
            maxWidth: 1000,
          }}
        >
          Essays from Beirut.
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            fontStyle: "italic",
            color: "#544840",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          An independent publication on Lebanon. Long, structural essays on
          power, sect, memory, and the architecture of a state kept
          deliberately weak.
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: "2px solid #c14a2e",
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#a83918",
            fontWeight: 600,
          }}
        >
          lebaneseacademic.com
        </div>
      </div>
    ),
    { ...size },
  );
}
