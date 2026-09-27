import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { SignalsDeskEdition } from "@/components/signal-desk/signals-desk-edition";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lebanon Signals Desk",
  description: "Lebanon reporting, mapped and in context. Explore the saved September 2026 edition, its sources and daily analysis by Karim Salam.",
  path: "/signal-desk",
  image: "/brand/la-primary-lockup.png",
});

export default async function SignalDeskPage({ searchParams }: {
  searchParams: Promise<{ edition?: string | string[] }>;
}) {
  const params = await searchParams;
  const value = typeof params.edition === "string" ? params.edition : "";
  const edition = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  return <SiteShell activePath="/signal-desk">
    <main id="site-content" style={{ paddingTop: 24 }}>
      <SignalsDeskEdition edition={edition} />
      <noscript><p>The interactive map needs JavaScript. <a href="/signals-desk/archive/2026-09-07/index.html">Read the archived analysis.</a></p></noscript>
    </main>
  </SiteShell>;
}
