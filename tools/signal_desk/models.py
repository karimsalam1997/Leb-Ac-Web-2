from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field, HttpUrl


SignalTag = Literal[
    "casualty",
    "strike-claim",
    "rhetoric-shift",
    "displacement",
    "humanitarian",
    "political-maneuver",
    "economic",
    "heritage",
]

Confidence = Literal["high", "medium", "low"]
Severity = Literal["critical", "high", "moderate", "low"]
LocationPrecision = Literal["exact", "district", "national", "unknown"]
ConfirmationStatus = Literal["corroborated", "partly-corroborated", "single-source", "unconfirmed"]
MapMarkerKind = Literal["pin", "representative-area", "unmapped"]
SourceConditionStatus = Literal["healthy", "degraded", "snapshot-only", "fallback-only", "empty"]
VerificationStatus = Literal[
    "ready",
    "watch",
    "needs-source",
    "needs-location",
    "needs-source-and-location",
]
SourceHealthErrorKind = Literal[
    "ok",
    "auth-missing",
    "dns-error",
    "timeout",
    "http-error",
    "tls-error",
    "parse-error",
    "fetch-error",
    "snapshot",
    "snapshot-missing",
    "fallback",
]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MediaItem(BaseModel):
    type: str
    url: str
    local_path: str | None = None


class RawItem(BaseModel):
    id: str
    source_id: str
    source_type: Literal["telegram", "youtube", "rss", "analysis", "x"]
    source_bias: str
    lang: str
    title: str
    text: str
    url: str
    published_at: datetime
    media: list[MediaItem] = Field(default_factory=list)
    raw: dict[str, Any] = Field(default_factory=dict)


class CanonicalItem(RawItem):
    dedupe_key: str
    also_seen_in: list[str] = Field(default_factory=list)
    in_scope: bool = True


class ScoredItem(CanonicalItem):
    relevance: float = Field(ge=0, le=1)
    text_en: str
    signal_tags: list[SignalTag] = Field(default_factory=list)


class Location(BaseModel):
    name: str
    name_ar: str = ""
    district: str
    caza: str
    governorate: str
    lat: float
    lng: float
    match_confidence: float = Field(ge=0, le=1)


class VerificationDossier(BaseModel):
    status: VerificationStatus = "needs-source"
    label: str = "Needs another source"
    summary: str = "The cluster still needs a second source before it can carry much weight."
    source_count: int = 0
    source_lanes: list[str] = Field(default_factory=list)
    location_precision: LocationPrecision = "unknown"
    missing: list[str] = Field(default_factory=list)
    next_checks: list[str] = Field(default_factory=list)
    provenance: list[str] = Field(default_factory=list)


class AnalyzedCluster(BaseModel):
    id: str
    item_ids: list[str]
    headline: str
    frameworks: list[str] = Field(default_factory=list)
    analysis: str
    confidence: Confidence
    sources_span: list[str] = Field(default_factory=list)
    what_to_watch: str
    signal_tags: list[SignalTag] = Field(default_factory=list)
    published_at: datetime
    source_biases: list[str] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    severity: Severity = "low"
    location_precision: LocationPrecision = "unknown"
    civilian_impact_flags: list[str] = Field(default_factory=list)
    source_lanes: list[str] = Field(default_factory=list)
    claim_side: str = "mixed reporting"
    confirmation_status: ConfirmationStatus = "unconfirmed"
    recommended_next_check: str = ""
    what_happened: str = ""
    where: str = ""
    who_says_so: list[str] = Field(default_factory=list)
    who_disputes_or_complicates: list[str] = Field(default_factory=list)
    why_it_matters: str = ""
    what_is_missing: str = ""
    map_marker_kind: MapMarkerKind = "unmapped"
    map_precision_label: str = "Unmapped"
    map_radius_meters: int = 0
    map_warning: str = "No precise place is available yet."
    verification_status: VerificationStatus = "needs-source"
    verification: VerificationDossier = Field(default_factory=VerificationDossier)


class GeoTaggedCluster(AnalyzedCluster):
    locations: list[Location] = Field(default_factory=list)
    primary_location: Location | None = None


class Framework(BaseModel):
    id: str
    name: str
    lens: str = ""
    definition: str = ""
    mechanism: str = ""
    precedent: str = ""
    test: str = ""
    refresh_queries: list[str] = Field(default_factory=list)
    match_terms: list[str] = Field(default_factory=list)


class DistrictAggregate(BaseModel):
    district: str
    event_count: int
    dominant_signal_tag: str


class SourceHealth(BaseModel):
    source: str
    ok: bool
    item_count: int
    note: str = ""
    error_kind: SourceHealthErrorKind = "ok"


class SourceLaneItem(BaseModel):
    title: str
    source: str
    source_type: str
    url: str
    published_at: datetime
    signal_tags: list[str] = Field(default_factory=list)
    bias: str = ""


class SourceLane(BaseModel):
    id: str
    label: str
    question: str
    role: str
    item_count: int
    sources: list[str] = Field(default_factory=list)
    items: list[SourceLaneItem] = Field(default_factory=list)


class GroundNeed(BaseModel):
    id: str
    label: str
    answer: str
    check: str
    related_clusters: list[str] = Field(default_factory=list)


class SourceCondition(BaseModel):
    status: SourceConditionStatus = "empty"
    label: str = "No source condition"
    summary: str = "No source run has been assessed yet."
    caution: str = "Treat the run as unavailable until source health is known."
    live_source_count: int = 0
    snapshot_source_count: int = 0
    total_source_health_count: int = 0
    failed_source_health_count: int = 0
    source_failure_rate: float = 0
    error_kind_counts: dict[str, int] = Field(default_factory=dict)


class SourceInventory(BaseModel):
    total_configured: int = 0
    by_language: dict[str, int] = Field(default_factory=dict)
    by_collection_mode: dict[str, int] = Field(default_factory=dict)
    by_tier: dict[str, int] = Field(default_factory=dict)
    configured_sources: list[str] = Field(default_factory=list)


class MapCoverage(BaseModel):
    total_clusters: int = 0
    mapped_clusters: int = 0
    unmapped_clusters: int = 0
    representative_area_count: int = 0
    max_radius_meters: int = 0
    by_marker_kind: dict[str, int] = Field(default_factory=dict)
    by_location_precision: dict[str, int] = Field(default_factory=dict)


class ApiMeta(BaseModel):
    generated_at: datetime
    window_start: datetime
    source_count: int
    cluster_count: int
    located_cluster_count: int
    mode: str
    source_condition: SourceCondition = Field(default_factory=SourceCondition)
    source_inventory: SourceInventory = Field(default_factory=SourceInventory)
    map_coverage: MapCoverage = Field(default_factory=MapCoverage)
    notes: list[str] = Field(default_factory=list)


class DailyReport(BaseModel):
    title: str
    dek: str
    byline: str = "Lebanese Academic Signal Desk"
    generated_at: datetime
    word_count: int
    body_markdown: str
    source_count: int = 0
    frameworks_applied: list[str] = Field(default_factory=list)


class SignalDeskApi(BaseModel):
    meta: ApiMeta
    brief_markdown: str
    clusters: list[GeoTaggedCluster]
    district_aggregates: list[DistrictAggregate]
    signal_tags: list[str]
    frameworks: list[Framework]
    source_health: list[SourceHealth]
    source_lanes: list[SourceLane] = Field(default_factory=list)
    ground_needs: list[GroundNeed] = Field(default_factory=list)
    daily_report: DailyReport | None = None
