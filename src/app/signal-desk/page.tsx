import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

const deskUrl = "https://lebanese-academic-signals-desk.vercel.app/";

export const metadata: Metadata = buildPageMetadata({
  title: "Lebanon Signals Desk",
  description: "Live updates from Lebanon, mapped and read through Lebanese Academic analysis.",
  path: "/signal-desk",
  image: "/brand/la-primary-lockup.png",
});

export default function SignalDeskPage() {
  return (
    <main className="signal-desk-embed">
      <iframe src={deskUrl} title="Lebanon Signals Desk by Karim Salam" allowFullScreen loading="eager" referrerPolicy="strict-origin-when-cross-origin" />
      <noscript><p>The live desk requires JavaScript. <a href={deskUrl}>Open it here.</a></p></noscript>
    </main>
  );
}
