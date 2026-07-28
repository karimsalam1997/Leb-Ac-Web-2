import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { SignalDeskDashboard } from "@/components/signal-desk/signal-desk-dashboard";
import { buildPageMetadata } from "@/lib/seo";
import { getSignalDeskData } from "@/lib/signal-desk";

export const metadata: Metadata = buildPageMetadata({
  title: "Signal Desk",
  description:
    "Lebanon’s morning evidence record, showing what was reported, who made each claim, what supports it, and what still needs checking.",
  path: "/signal-desk",
  image: "/brand/la-primary-lockup.png",
});

export default function SignalDeskPage() {
  const data = getSignalDeskData();

  return (
    <SiteShell activePath="/signal-desk">
      <SignalDeskDashboard
        api={data.api}
        districts={data.districts}
        boundary={data.boundary}
        battlefield={data.battlefield}
      />
    </SiteShell>
  );
}
