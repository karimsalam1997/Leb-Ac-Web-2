import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SiteShell } from "@/components/site-shell";
import styles from "@/components/signal-desk/signal-desk.module.css";
import { buildPageMetadata } from "@/lib/seo";
import { getSignalDeskData } from "@/lib/signal-desk";

export const metadata: Metadata = buildPageMetadata({
  title: "Signal Desk Research Edition",
  description:
    "A source-linked research article joining Lebanese reporting, public records, and attributed X posts without confusing claims for proof.",
  path: "/signal-desk/report",
  image: "/brand/la-primary-lockup.png",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Beirut",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function SignalDeskReportPage() {
  const { api, researchReport } = getSignalDeskData();
  const report = api.daily_report;
  const activeFrameworks = api.frameworks.filter((framework) =>
    report?.frameworks_applied?.includes(framework.id),
  );

  return (
    <SiteShell activePath="/signal-desk">
      <article className={styles.reportPage}>
        <Link className={styles.reportBack} href="/signal-desk">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the map and morning record
        </Link>

        <header className={styles.reportHeader}>
          <span className={styles.sectionLabel}>Lebanon daily assessment</span>
          <h1>{report?.title ?? "The desk has not produced today’s assessment."}</h1>
          <p>
            {report?.dek ??
              "The source run did not produce enough material for a full daily assessment."}
          </p>
          <div className={styles.reportByline}>
            <span>{report?.byline ?? "Lebanese Academic Signal Desk"}</span>
            <time dateTime={report?.generated_at ?? api.meta.generated_at}>
              {formatDate(report?.generated_at ?? api.meta.generated_at)}
            </time>
            <span>{report?.word_count ?? 0} words</span>
          </div>
        </header>

        {researchReport ? (
          <aside className={styles.methodNote}>
            <span>Standing framework layer</span>
            <p>
              Today’s wire was tested against all eleven Lebanese Academic frameworks.
              Only the lenses that cleared their own test were allowed into the article.
            </p>
            {activeFrameworks.length ? (
              <ul>
                {activeFrameworks.map((framework) => (
                  <li key={framework.id}>{framework.name}</li>
                ))}
              </ul>
            ) : (
              <small>No framework was forced onto today’s material.</small>
            )}
          </aside>
        ) : null}

        <div className={styles.reportBody}>
          <ReactMarkdown>
            {report?.body_markdown ??
              "The collector returned no current assessment. The map and source record remain available with their publication dates."}
          </ReactMarkdown>
        </div>

        <footer className={styles.reportEnd}>
          This article is built from the dated evidence record displayed on the Signal Desk.
          Every reported claim remains attached to the outlet, institution, or account that made it.
        </footer>
      </article>
    </SiteShell>
  );
}
