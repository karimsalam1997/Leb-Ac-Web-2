import { ImageResponse } from "next/og";
import { essays, getEssay, getCanonicalEssaySlug } from "@/lib/content";

export const runtime = "nodejs";
export const alt = "Lebanese Academic essay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return essays.map((essay) => ({ slug: essay.slug }));
}

export default async function EssayOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonical = getCanonicalEssaySlug(slug);
  const essay = canonical ? getEssay(canonical) : undefined;

  const title = essay?.title ?? "Lebanese Academic";
  const category = essay?.category ?? "Essay";
  const byline = essay?.byline ?? "Karim Salam";
  const date = essay?.date ?? "May 2026";

  // Cinnabar on cream — the masthead palette, rendered for social cards.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(180deg, #fff1e0 0%, #f7e0c8 100%)",
          color: "#1a1208",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#a83918",
            fontWeight: 600,
          }}
        >
          <span>Lebanese Academic</span>
          <span>Issue 01 · May 2026</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#a83918",
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 64 : title.length > 36 ? 80 : 96,
              lineHeight: 0.98,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
              color: "#1a1208",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "2px solid #c14a2e",
            paddingTop: 22,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#1a1208",
              fontWeight: 600,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span>{byline}</span>
            <span
              style={{
                fontSize: 18,
                color: "#544840",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {date}
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              fontStyle: "italic",
              color: "#a83918",
              maxWidth: 360,
              textAlign: "right",
            }}
          >
            Essays from Beirut.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
