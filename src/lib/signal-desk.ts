import "server-only";

import fs from "node:fs";
import path from "node:path";

export type SignalConfidence = "high" | "medium" | "low";
export type SignalSeverity = "critical" | "high" | "moderate" | "low";
export type SignalLocationPrecision = "exact" | "district" | "national" | "unknown";
export type SignalConfirmationStatus =
  | "corroborated"
  | "partly-corroborated"
  | "single-source"
  | "unconfirmed";

export type SignalLocation = {
  name: string;
  name_ar: string;
  district: string;
  caza: string;
  governorate: string;
  lat: number;
  lng: number;
  match_confidence: number;
};

export type SignalCluster = {
  id: string;
  item_ids: string[];
  headline: string;
  frameworks: string[];
  analysis: string;
  confidence: SignalConfidence;
  sources_span: string[];
  what_to_watch: string;
  signal_tags: string[];
  published_at: string;
  source_biases: string[];
  urls: string[];
  severity: SignalSeverity;
  location_precision: SignalLocationPrecision;
  civilian_impact_flags: string[];
  source_lanes: string[];
  claim_side: string;
  confirmation_status: SignalConfirmationStatus;
  recommended_next_check: string;
  what_happened: string;
  where: string;
  who_says_so: string[];
  who_disputes_or_complicates: string[];
  why_it_matters: string;
  what_is_missing: string;
  locations: SignalLocation[];
  primary_location: SignalLocation | null;
  map_marker_kind?: "pin" | "representative-area" | "unmapped";
  map_precision_label?: string;
  map_radius_meters?: number;
  map_warning?: string;
};

export type SignalFramework = {
  id: string;
  name: string;
  lens: string;
  definition: string;
  mechanism: string;
  precedent: string;
  test: string;
  refresh_queries: string[];
  match_terms: string[];
};

export type DistrictAggregate = {
  district: string;
  event_count: number;
  dominant_signal_tag: string;
};

export type SourceHealth = {
  source: string;
  ok: boolean;
  item_count: number;
  note: string;
  error_kind?: string;
};

export type SourceLaneItem = {
  title: string;
  source: string;
  source_type: string;
  url: string;
  published_at: string;
  signal_tags: string[];
  bias: string;
};

export type SourceLane = {
  id: string;
  label: string;
  question: string;
  role: string;
  item_count: number;
  sources: string[];
  items: SourceLaneItem[];
};

export type GroundNeed = {
  id: string;
  label: string;
  answer: string;
  check: string;
  related_clusters: string[];
};

export type SourceCondition = {
  status: string;
  label: string;
  summary: string;
  caution: string;
  live_source_count: number;
  snapshot_source_count: number;
  total_source_health_count: number;
  failed_source_health_count: number;
  source_failure_rate: number;
};

export type MapCoverage = {
  total_clusters: number;
  mapped_clusters: number;
  unmapped_clusters: number;
  representative_area_count: number;
  max_radius_meters: number;
  by_marker_kind: Record<string, number>;
  by_location_precision: Record<string, number>;
};

export type SourceInventory = {
  total_configured: number;
  by_language: Record<string, number>;
  by_collection_mode: Record<string, number>;
  by_tier: Record<string, number>;
  configured_sources: string[];
};

export type SignalDeskApi = {
  meta: {
    generated_at: string;
    window_start: string;
    source_count: number;
    cluster_count: number;
    located_cluster_count: number;
    mode: string;
    source_condition?: SourceCondition;
    source_inventory?: SourceInventory;
    map_coverage?: MapCoverage;
    notes: string[];
  };
  brief_markdown: string;
  clusters: SignalCluster[];
  district_aggregates: DistrictAggregate[];
  signal_tags: string[];
  frameworks: SignalFramework[];
  source_health: SourceHealth[];
  source_lanes: SourceLane[];
  ground_needs: GroundNeed[];
  daily_report: DailyReport | null;
};

export type DailyReport = {
  title: string;
  dek: string;
  byline: string;
  generated_at: string;
  word_count: number;
  body_markdown: string;
  source_count: number;
  frameworks_applied: string[];
};

export type ResearchReport = DailyReport & {
  edition_label: string;
  method: string;
};

export type SignalGeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: {
      cluster_id: string;
      headline: string;
      signal_tags: string[];
      confidence: SignalConfidence;
      frameworks: string[];
      district: string;
      analysis_short: string;
      published_at: string;
      match_confidence: number;
      severity: SignalSeverity;
      location_precision: SignalLocationPrecision;
      confirmation_status: SignalConfirmationStatus;
      claim_side: string;
      recommended_next_check: string;
      source_lanes: string[];
      civilian_impact_flags: string[];
      what_is_missing: string;
    };
  }>;
};

export type DistrictGeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      district?: string;
      name?: string;
      shapeName?: string;
      [key: string]: unknown;
    };
    geometry: Record<string, unknown>;
  }>;
};

export type BoundaryGeoJson = DistrictGeoJson;

export type BattlefieldFeatureProperties = {
  id: string;
  kind: "yellow-line" | "red-zone";
  label: string;
  short_label: string;
  description: string;
  as_of: string;
  precision: "reported" | "approximate" | "surveyed";
  source_label: string;
  source_url: string;
};

export type BattlefieldGeoJson = {
  type: "FeatureCollection";
  name?: string;
  metadata?: {
    description?: string;
    updated_at?: string;
  };
  features: Array<{
    type: "Feature";
    properties: BattlefieldFeatureProperties;
    geometry: Record<string, unknown>;
  }>;
};

const emptyEvents: SignalGeoJson = {
  type: "FeatureCollection",
  features: [],
};

const emptyDistricts: DistrictGeoJson = {
  type: "FeatureCollection",
  features: [],
};

const emptyBattlefield: BattlefieldGeoJson = {
  type: "FeatureCollection",
  features: [],
};

const dataDir = path.join(process.cwd(), "public", "data", "signal-desk");

function readJson<T>(filename: string, fallback: T): T {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function readText(filename: string, fallback = "") {
  const filePath = path.join(dataDir, filename);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : fallback;
}

export function getSignalDeskResearchReport(): ResearchReport | null {
  const body = readText("research-report.md").trim();
  if (!body) return null;

  const meta = readJson<Omit<ResearchReport, "body_markdown" | "word_count"> | null>(
    "research-report-meta.json",
    null,
  );
  if (!meta) return null;

  const wordCount = body.match(/\b[\p{L}\p{N}’'-]+\b/gu)?.length ?? 0;
  return {
    ...meta,
    body_markdown: body,
    word_count: wordCount,
  };
}

export function getSignalDeskData() {
  const researchReport = getSignalDeskResearchReport();
  const api = readJson<SignalDeskApi>("api.json", {
    meta: {
      generated_at: new Date().toISOString(),
      window_start: new Date().toISOString(),
      source_count: 0,
      cluster_count: 0,
      located_cluster_count: 0,
      mode: "empty",
      source_condition: {
        status: "empty",
        label: "No local run",
        summary: "No Signal Desk run has been loaded yet.",
        caution: "Run the dry-run command before publishing public data.",
        live_source_count: 0,
        snapshot_source_count: 0,
        total_source_health_count: 0,
        failed_source_health_count: 0,
        source_failure_rate: 0,
      },
      map_coverage: {
        total_clusters: 0,
        mapped_clusters: 0,
        unmapped_clusters: 0,
        representative_area_count: 0,
        max_radius_meters: 0,
        by_marker_kind: {},
        by_location_precision: {},
      },
      notes: ["Run python3 -m tools.signal_desk.run --only-rss --since 7d to generate dashboard data."],
    },
    brief_markdown:
      "# MENA Morning Brief\n\n## The one thing that matters today\nThe Signal Desk is waiting for its first local pipeline run.",
    clusters: [],
    district_aggregates: [],
    signal_tags: [],
    frameworks: [],
    source_health: [],
    source_lanes: [],
    ground_needs: [],
    daily_report: null,
  });
  const battlefield = readJson<BattlefieldGeoJson>("battlefield.geojson", emptyBattlefield);

  return {
    api: researchReport ? { ...api, daily_report: researchReport } : api,
    researchReport,
    events: readJson<SignalGeoJson>("events.geojson", emptyEvents),
    districts: readJson<DistrictGeoJson>("lebanon-districts.geojson", emptyDistricts),
    boundary: readJson<BoundaryGeoJson>("lebanon-boundary.geojson", emptyDistricts),
    battlefield,
  };
}
