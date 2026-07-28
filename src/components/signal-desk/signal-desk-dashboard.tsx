"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  Clock3,
  Radio,
} from "lucide-react";
import type {
  BattlefieldGeoJson,
  BoundaryGeoJson,
  DistrictGeoJson,
  SignalCluster,
  SignalDeskApi,
  SourceLaneItem,
} from "@/lib/signal-desk";
import styles from "./signal-desk.module.css";

const SignalDeskMap = dynamic(
  () => import("./signal-desk-map").then((module) => module.SignalDeskMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Drawing Lebanon…</div>,
  },
);

type DeskTopic = "all" | "security" | "politics" | "humanitarian" | "economy";

function formatDate(value: string, includeTime = false) {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        timeZone: "Asia/Beirut",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : { timeZone: "Asia/Beirut", month: "long", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(value));
}

function topicFor(cluster: SignalCluster): Exclude<DeskTopic, "all"> {
  if (cluster.signal_tags.includes("economic")) return "economy";
  if (
    cluster.signal_tags.includes("strike-claim") ||
    cluster.severity === "critical" ||
    cluster.severity === "high"
  ) {
    return "security";
  }
  if (
    cluster.signal_tags.includes("humanitarian") ||
    cluster.signal_tags.includes("displacement") ||
    cluster.signal_tags.includes("casualty")
  ) {
    return "humanitarian";
  }
  return "politics";
}

const translatedTitles = new Map<string, string>([
  [
    "السيد مجتبى لمجاهدي حزب الله: أنتم روّاد فصائل الجهاد.. وصون سيادة لبنان شرط أوّل لإيران - almayadeen.net",
    "Mojtaba Khamenei tells Hezbollah fighters that protecting Lebanese sovereignty is a first condition for Iran",
  ],
  [
    "لبنان: وزارة الصحة: الحصيلة التراكمية الإجمالية للعدوان الإسرائيلي بلغت 4332 شهيدا و12236 جريحا - almayadeen.net",
    "Lebanese Health Ministry reports a cumulative toll of 4,332 killed and 12,236 wounded in the Israeli assault",
  ],
  [
    "لبنان: وزارة الصحة: الحصيلة التراكمية الإجمالية للعدوان الإسرائيلي بلغت 4332 شهيدا و12236 جريحا",
    "Lebanese Health Ministry reports a cumulative toll of 4,332 killed and 12,236 wounded in the Israeli assault",
  ],
  [
    "إيران: السيد مجتبى لمجاهدي حزب الله: إيران أدرجت صون السيادة اللبنانية وإنهاء العدوان بصورة كاملة بلا أي قيد أو شرط بمذكرة التفاهم - almayadeen.net",
    "Iran says its memorandum calls for Lebanese sovereignty and a complete end to the Israeli assault",
  ],
  [
    "إيران: السيد مجتبى لمجاهدي حزب الله: إيران أدرجت صون السيادة اللبنانية وإنهاء العدوان بصورة كاملة بلا أي قيد أو شرط بمذكرة التفاهم",
    "Iran says its memorandum calls for Lebanese sovereignty and a complete end to the Israeli assault",
  ],
  [
    "بعد الاتفاق، في لبنان السياديون والسياديون \"عنجد\" ينتظرون ما سيفرض عليهم",
    "After the agreement, Lebanon’s rival camps wait to learn what will be imposed on them",
  ],
  [
    "مفاوضات الصورة التذكارية: لا حرب شاملة ولا انسحاب كامل",
    "Negotiations for the photograph: no full war and no complete withdrawal",
  ],
]);

function displayTitle(title: string) {
  return translatedTitles.get(title) ?? title;
}

function displaySummary(cluster: SignalCluster) {
  const summary = cluster.what_happened || cluster.analysis;
  return /[\u0600-\u06ff]/.test(summary) ? cluster.analysis : summary;
}

function flattenSourceWire(api: SignalDeskApi): SourceLaneItem[] {
  const seen = new Set<string>();
  return api.source_lanes
    .flatMap((lane) => lane.items)
    .filter((item) => item.source_type !== "analysis" && !item.url.startsWith("local:"))
    .sort((left, right) => Date.parse(right.published_at) - Date.parse(left.published_at))
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .slice(0, 18);
}

function reportExcerpt(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 78)
    .join(" ");
}

function sourceLabel(cluster: SignalCluster) {
  return cluster.sources_span[0] ?? cluster.source_lanes[0]?.replaceAll("-", " ") ?? "Source linked";
}

function locationLabel(cluster: SignalCluster) {
  return cluster.primary_location?.name || cluster.where || "Lebanon";
}

function sourceStatusLabel(source: SignalDeskApi["source_health"][number]) {
  if (!source.ok) return "unavailable";
  if (source.error_kind === "snapshot" || source.note.toLowerCase().includes("snapshot")) {
    return "saved snapshot";
  }
  return "contacted";
}

export function SignalDeskDashboard({
  api,
  districts,
  boundary,
  battlefield,
}: {
  api: SignalDeskApi;
  districts: DistrictGeoJson;
  boundary: BoundaryGeoJson;
  battlefield: BattlefieldGeoJson;
}) {
  const [topic, setTopic] = useState<DeskTopic>("all");
  const [selectedId, setSelectedId] = useState<string | null>(api.clusters[0]?.id ?? null);

  const visibleClusters = useMemo(
    () =>
      api.clusters
        .filter((cluster) => topic === "all" || topicFor(cluster) === topic)
        .toSorted(
          (left, right) => Date.parse(right.published_at) - Date.parse(left.published_at),
        ),
    [api.clusters, topic],
  );
  const sourceWire = useMemo(() => flattenSourceWire(api), [api]);
  const report = api.daily_report;
  const mappedReportCount = visibleClusters.filter(
    (cluster) => cluster.primary_location && cluster.location_precision !== "unknown",
  ).length;
  const selectedCluster =
    visibleClusters.find((cluster) => cluster.id === selectedId) ?? visibleClusters[0] ?? null;
  const reportingSources = new Set(sourceWire.map((item) => item.source));
  const contactedSources = api.source_health.filter(
    (source) => source.ok && !source.note.includes("framework context"),
  ).length;
  const configuredSources =
    api.meta.source_inventory?.total_configured ?? api.source_health.length;
  const editorialSources = new Set(sourceWire.map((item) => item.source)).size;

  function changeTopic(value: DeskTopic) {
    setTopic(value);
    const next = api.clusters.find(
      (cluster) => value === "all" || topicFor(cluster) === value,
    );
    setSelectedId(next?.id ?? null);
  }

  return (
    <main className={styles.page} aria-label="Lebanese Academic Signal Desk">
      <header className={styles.deskHeader}>
        <div>
          <span className={styles.kicker}>
            <Radio size={14} aria-hidden="true" />
            Lebanon monitor
          </span>
          <h1>Signal Desk</h1>
          <p>Lebanon’s morning evidence record, with every claim kept close to its source.</p>
        </div>
        <div className={styles.edition}>
          <span>
            <CircleDot size={13} aria-hidden="true" />
            Research edition
          </span>
          <time dateTime={api.meta.generated_at}>
            Updated {formatDate(api.meta.generated_at, true)} Beirut
          </time>
        </div>
      </header>

      <section className={styles.mapDesk} aria-labelledby="map-title">
        <div className={styles.mapColumn}>
          <div className={styles.mapToolbar}>
            <div>
              <span className={styles.sectionLabel}>Dated map</span>
              <h2 id="map-title">What can be placed</h2>
            </div>
            <div className={styles.controls}>
              <label>
                <span>Subject</span>
                <select
                  value={topic}
                  onChange={(event) => changeTopic(event.target.value as DeskTopic)}
                >
                  <option value="all">All reporting</option>
                  <option value="security">Military</option>
                  <option value="humanitarian">Civilian life</option>
                  <option value="politics">Politics</option>
                  <option value="economy">Economy</option>
                </select>
              </label>
            </div>
          </div>

          <div className={styles.mapStage}>
            <SignalDeskMap
              clusters={visibleClusters}
              districts={districts}
              boundary={boundary}
              battlefield={battlefield}
              selectedId={selectedCluster?.id ?? null}
              showTerritory
              onSelect={setSelectedId}
            />
            <div className={styles.mapCount}>
              {mappedReportCount} mapped {mappedReportCount === 1 ? "report" : "reports"}
            </div>
          </div>

          <div className={styles.legend} aria-label="Map legend">
            <span>
              <i data-layer="border" />
              Administrative outline
            </span>
            <span>
              <i data-layer="yellow" />
              Israeli-published yellow line
            </span>
            <span>
              <i data-layer="red" />
              Israeli-designated zone
            </span>
            <small>The Blue Line awaits a separate authoritative dataset. It is not a border.</small>
          </div>
        </div>

        <aside className={styles.liveRail} aria-label="Chronological reports">
          <div className={styles.railHeader}>
            <div>
              <span className={styles.sectionLabel}>Morning record</span>
              <h2>Claims &amp; reports</h2>
            </div>
            <span>{visibleClusters.length}</span>
          </div>
          <div className={styles.railList}>
            {visibleClusters.length ? (
              visibleClusters.map((cluster) => (
                <article
                  className={styles.railItem}
                  data-active={selectedCluster?.id === cluster.id}
                  key={cluster.id}
                >
                  <button type="button" onClick={() => setSelectedId(cluster.id)}>
                    <span className={styles.railMeta}>
                      <time dateTime={cluster.published_at}>
                        {formatDate(cluster.published_at, true)}
                      </time>
                      <i data-severity={cluster.severity}>{locationLabel(cluster)}</i>
                    </span>
                    <strong>{displayTitle(cluster.headline)}</strong>
                    <span>{displaySummary(cluster)}</span>
                  </button>
                  <div className={styles.claimRecord}>
                    <span data-status={cluster.confirmation_status}>
                      {cluster.confirmation_status.replaceAll("-", " ")}
                    </span>
                    <span>{cluster.location_precision} location</span>
                  </div>
                  {cluster.urls[0] ? (
                    <a href={cluster.urls[0]} target="_blank" rel="noreferrer">
                      {sourceLabel(cluster)}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <small>{sourceLabel(cluster)}</small>
                  )}
                </article>
              ))
            ) : (
              <div className={styles.emptyRail}>
                No reports fall inside this period and subject. Change either filter to widen the record.
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className={styles.dailySection} aria-labelledby="daily-report-title">
        <div className={styles.reportLead}>
          <span className={styles.sectionLabel}>
            <CalendarDays size={14} aria-hidden="true" />
            Research article · {formatDate(report?.generated_at ?? api.meta.generated_at)}
          </span>
          <h2 id="daily-report-title">
            {report?.title ?? api.clusters[0]?.headline ?? "The desk is waiting for today’s source run."}
          </h2>
          <p className={styles.reportDek}>
            {report?.dek ??
              "When the collector produces a current record, the morning assessment will appear here."}
          </p>
          {report ? (
            <p className={styles.reportExcerpt}>{reportExcerpt(report.body_markdown)}…</p>
          ) : null}
          <Link className={styles.reportLink} href="/signal-desk/report">
            Read the full research document
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <aside className={styles.reportFacts} aria-label="Daily report details">
          <span className={styles.sectionLabel}>Edition record</span>
          <dl>
            <div>
              <dt>Length</dt>
              <dd>{report?.word_count ?? 0} words</dd>
            </div>
            <div>
              <dt>Sources cited</dt>
              <dd>{report?.source_count ?? api.meta.source_count}</dd>
            </div>
            <div>
              <dt>Evidence record</dt>
              <dd>{api.clusters.length} event dossiers</dd>
            </div>
            <div>
              <dt>Frameworks applied</dt>
              <dd>{report?.frameworks_applied?.length ?? 0} of {api.frameworks.length}</dd>
            </div>
          </dl>
          <p>
            News reports, public records, and X posts are joined without flattening their differences.
            A post proves that an account made a claim. Corroboration still has to come from elsewhere.
          </p>
        </aside>
      </section>

      <section className={styles.wireSection} aria-labelledby="source-wire-title">
        <div className={styles.wireHeader}>
          <div>
            <span className={styles.sectionLabel}>Source wire</span>
            <h2 id="source-wire-title">What the desk collected</h2>
          </div>
          <p>Public reporting only. Local framework notes remain private to the research process.</p>
        </div>
        <div className={styles.wireGrid}>
          {sourceWire.map((item) => (
            <article className={styles.wireItem} key={item.url}>
              <span>
                <time dateTime={item.published_at}>{formatDate(item.published_at, true)}</time>
                <i>{item.source_type === "x" ? "X" : item.source_type}</i>
              </span>
              <h3>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {displayTitle(item.title)}
                </a>
              </h3>
              <p>{item.source}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sourceStatus} aria-labelledby="collection-title">
        <div>
          <span className={styles.sectionLabel}>
            <Clock3 size={14} aria-hidden="true" />
            Collection status
          </span>
          <h2 id="collection-title">Four numbers, instead of one inflated claim</h2>
          <p>
            Configured, contacted, returned, and published sources are different things. The desk now says so.
          </p>
          <dl className={styles.collectionFacts}>
            <div><dt>Configured</dt><dd>{configuredSources}</dd></div>
            <div><dt>Contacted</dt><dd>{contactedSources}</dd></div>
            <div><dt>Returned current items</dt><dd>{reportingSources.size}</dd></div>
            <div><dt>Reached public wire</dt><dd>{editorialSources}</dd></div>
          </dl>
        </div>
        <details>
          <summary>Open source status</summary>
          <div className={styles.sourceTable}>
            {api.source_health.map((source) => {
              const status = sourceStatusLabel(source);
              return (
                <div key={source.source}>
                  <span className={styles.sourceIdentity}>
                    <b>{source.source}</b>
                    {source.note ? <small>{source.note}</small> : null}
                  </span>
                  <span>{source.item_count} items</span>
                  <i data-ok={source.ok} data-status={status}>
                    {status}
                  </i>
                </div>
              );
            })}
          </div>
        </details>
      </section>
    </main>
  );
}
