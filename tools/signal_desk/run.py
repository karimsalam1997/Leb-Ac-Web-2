from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import time
from typing import Callable, TypeVar

from tools.signal_desk.analyze import analyze, load_frameworks
from tools.signal_desk.collectors import local_analysis, rss, telegram, x_api, youtube
from tools.signal_desk.config import PUBLIC_DATA_DIR, STORE_DIR, load_feeds, load_framework_config, load_optional_config, parse_since, resolve_project_path
from tools.signal_desk.filter import filter_items
from tools.signal_desk.geo import district_aggregates, events_geojson, geo_tag
from tools.signal_desk.models import ApiMeta, MapCoverage, SignalDeskApi, SourceCondition, SourceHealth, SourceInventory
from tools.signal_desk.normalize import normalize
from tools.signal_desk.review import apply_review_overrides
from tools.signal_desk.source_lanes import build_ground_needs, build_source_lanes
from tools.signal_desk.synthesize import synthesize_brief, synthesize_daily_report
from tools.signal_desk.verification import attach_verification_dossiers


T = TypeVar("T")


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, default=str), encoding="utf-8")


def timed(stage_timings: dict[str, float], name: str, work: Callable[[], T]) -> T:
    started = time.perf_counter()
    try:
        return work()
    finally:
        stage_timings[name] = round(time.perf_counter() - started, 3)


def source_health_summary(source_health: list[SourceHealth]) -> dict[str, object]:
    failed = [status.source for status in source_health if not status.ok]
    live_ok = [
        status
        for status in source_health
        if status.ok and status.error_kind not in {"fallback", "snapshot"}
    ]
    snapshot_ok = [status for status in source_health if status.ok and status.error_kind == "snapshot"]
    fallback_ok = [status for status in source_health if status.ok and status.error_kind == "fallback"]
    error_kind_counts = Counter(status.error_kind for status in source_health)
    return {
        "total": len(source_health),
        "ok": len(source_health) - len(failed),
        "live_ok": len(live_ok),
        "snapshot_ok": len(snapshot_ok),
        "fallback_ok": len(fallback_ok),
        "failed": len(failed),
        "failed_sources": failed[:12],
        "items_returned": sum(status.item_count for status in source_health),
        "error_kind_counts": dict(sorted(error_kind_counts.items())),
    }


def build_source_inventory(
    feeds: list[dict[str, object]],
    *,
    x_accounts: list[dict[str, object]] | None = None,
    telegram_channels: list[dict[str, object]] | None = None,
    youtube_channels: list[dict[str, object]] | None = None,
) -> SourceInventory:
    x_sources = [account for account in (x_accounts or []) if account.get("enabled", True)]
    telegram_sources = [
        channel
        for channel in (telegram_channels or [])
        if channel.get("enabled", True)
        and str(channel.get("handle", "")).strip()
        and str(channel.get("handle", "")).strip() != "@PLACEHOLDER"
    ]
    youtube_sources = [channel for channel in (youtube_channels or []) if channel.get("enabled", True)]
    records = [
        *feeds,
        *[{**account, "kind": "x", "name": f"X · @{str(account.get('handle', '')).lstrip('@')}"} for account in x_sources],
        *[
            {
                **channel,
                "kind": "telegram",
                "name": f"Telegram · {channel.get('name') or '@' + str(channel.get('handle', '')).lstrip('@')}",
            }
            for channel in telegram_sources
        ],
        *[
            {**channel, "kind": "youtube", "name": f"YouTube · {channel.get('id', 'channel')}"}
            for channel in youtube_sources
        ],
    ]
    languages = Counter(str(record.get("lang", "unknown")) for record in records)
    collection_modes = Counter(str(record.get("kind", "rss")) for record in records)
    tiers = Counter(f"tier-{record.get('tier', 'unknown')}" for record in records)

    return SourceInventory(
        total_configured=len(records),
        by_language=dict(sorted(languages.items())),
        by_collection_mode=dict(sorted(collection_modes.items())),
        by_tier=dict(sorted(tiers.items())),
        configured_sources=[str(record.get("name", "Unnamed source")) for record in records],
    )


def build_map_coverage(clusters: list[object]) -> MapCoverage:
    mapped_clusters = [
        cluster
        for cluster in clusters
        if getattr(cluster, "primary_location", None) is not None
        and getattr(cluster, "location_precision", "unknown") != "unknown"
    ]
    marker_counts = Counter(str(getattr(cluster, "map_marker_kind", "unmapped")) for cluster in clusters)
    precision_counts = Counter(str(getattr(cluster, "location_precision", "unknown")) for cluster in clusters)
    radii = [int(getattr(cluster, "map_radius_meters", 0) or 0) for cluster in clusters]

    return MapCoverage(
        total_clusters=len(clusters),
        mapped_clusters=len(mapped_clusters),
        unmapped_clusters=len(clusters) - len(mapped_clusters),
        representative_area_count=marker_counts.get("representative-area", 0),
        max_radius_meters=max(radii, default=0),
        by_marker_kind=dict(sorted(marker_counts.items())),
        by_location_precision=dict(sorted(precision_counts.items())),
    )


def is_live_source_item(item: object) -> bool:
    raw = getattr(item, "raw", {})
    return (
        getattr(item, "source_type", "") != "analysis"
        and not raw.get("fallback")
        and not raw.get("rss_snapshot")
        and not raw.get("x_snapshot")
    )


def build_source_condition(
    *,
    source_health: list[SourceHealth],
    raw_item_count: int,
    live_source_count: int,
    snapshot_source_count: int,
) -> SourceCondition:
    total = len(source_health)
    failed = len([status for status in source_health if not status.ok])
    failure_rate = (failed / total) if total else 1.0
    error_kind_counts = dict(sorted(Counter(status.error_kind for status in source_health).items()))

    if raw_item_count == 0:
        status = "empty"
        label = "No source output"
        summary = "The run produced no source items."
        caution = "Do not use this run for analysis."
    elif live_source_count == 0 and snapshot_source_count > 0:
        status = "snapshot-only"
        label = "Snapshot-only source run"
        summary = f"The run used {snapshot_source_count} cached {plural(snapshot_source_count, 'source')} and no live source items."
        caution = "Use it to test structure and analysis, not to describe the current day."
    elif live_source_count == 0:
        status = "fallback-only"
        label = "Fallback-only source run"
        summary = "No live sources returned items; the visible clusters come from local fallback samples."
        caution = "Treat the brief as a pipeline diagnostic until live source access returns."
    elif failure_rate > 0.75:
        status = "degraded"
        label = "Degraded source run"
        summary = f"{live_source_count} live {plural(live_source_count, 'source')} returned items, but source failure is {failure_rate:.0%}."
        caution = "Read the brief with source-shelf caution and check the failed lanes before publishing."
    else:
        status = "healthy"
        label = "Live source run"
        summary = f"{live_source_count} live {plural(live_source_count, 'source')} returned items with source failure at {failure_rate:.0%}."
        caution = "Normal verification caveats still apply to each cluster."

    return SourceCondition(
        status=status,
        label=label,
        summary=summary,
        caution=caution,
        live_source_count=live_source_count,
        snapshot_source_count=snapshot_source_count,
        total_source_health_count=total,
        failed_source_health_count=failed,
        source_failure_rate=round(failure_rate, 3),
        error_kind_counts=error_kind_counts,
    )


def plural(value: int, singular: str, plural_form: str | None = None) -> str:
    if value == 1:
        return singular
    return plural_form or f"{singular}s"


def publication_guard(
    *,
    source_health: list[SourceHealth],
    live_source_count: int,
    scored_item_count: int,
    min_live_sources: int,
    min_scored_items: int,
    max_source_failure_rate: float,
    override: bool,
) -> dict[str, object]:
    total_sources = len(source_health)
    failed_sources = len([status for status in source_health if not status.ok])
    live_ok_sources = len([status for status in source_health if status.ok and status.error_kind not in {"fallback", "snapshot"}])
    failure_rate = (failed_sources / total_sources) if total_sources else 1.0
    reasons: list[str] = []

    if live_source_count < min_live_sources:
        reasons.append(f"Only {live_source_count} live {plural(live_source_count, 'source')} returned items; minimum is {min_live_sources}.")
    if live_ok_sources < min_live_sources:
        reasons.append(f"Only {live_ok_sources} live source-health {plural(live_ok_sources, 'check')} passed; minimum is {min_live_sources}.")
    if scored_item_count < min_scored_items:
        reasons.append(f"Only {scored_item_count} scored {plural(scored_item_count, 'item')} survived filtering; minimum is {min_scored_items}.")
    if failure_rate > max_source_failure_rate:
        reasons.append(f"Source failure rate is {failure_rate:.0%}; maximum allowed is {max_source_failure_rate:.0%}.")

    return {
        "public_copy_allowed": override or not reasons,
        "override_used": override,
        "reasons": reasons,
        "metrics": {
            "live_source_count": live_source_count,
            "live_ok_source_health_count": live_ok_sources,
            "failed_source_health_count": failed_sources,
            "source_failure_rate": round(failure_rate, 3),
            "scored_item_count": scored_item_count,
            "min_live_sources": min_live_sources,
            "min_scored_items": min_scored_items,
            "max_source_failure_rate": max_source_failure_rate,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Lebanese Academic Signal Desk pipeline.")
    parser.add_argument("--since", default="7d", help="Window to collect, e.g. 24h, 3d, 7d, or ISO date.")
    parser.add_argument("--only-rss", action="store_true", help="Skip Telegram and YouTube collectors.")
    parser.add_argument("--no-public-copy", action="store_true", help="Do not copy latest output into public/data.")
    parser.add_argument("--dry-run", action="store_true", help="Run the full pipeline and health checks without writing output files.")
    parser.add_argument("--rss-snapshot-dir", help="Read cached RSS, Atom, or HTML source snapshots from this directory.")
    parser.add_argument("--rss-snapshot-only", action="store_true", help="When using --rss-snapshot-dir, do not fetch missing RSS sources from the network.")
    parser.add_argument("--min-live-sources", type=int, default=3, help="Minimum live sources required before public copy.")
    parser.add_argument("--min-scored-items", type=int, default=6, help="Minimum scored items required before public copy.")
    parser.add_argument("--max-source-failure-rate", type=float, default=0.75, help="Maximum source-health failure rate allowed before public copy.")
    parser.add_argument("--allow-unsafe-public-copy", action="store_true", help="Override the publication guard and copy public files anyway.")
    args = parser.parse_args()

    since = parse_since(args.since)
    rss_snapshot_dir = resolve_project_path(args.rss_snapshot_dir) if args.rss_snapshot_dir else None
    generated_at = datetime.now(timezone.utc)
    run_dir = STORE_DIR / generated_at.strftime("%Y-%m-%d")
    stage_timings: dict[str, float] = {}
    configured_feeds = timed(stage_timings, "load-source-inventory", load_feeds)
    x_config = timed(stage_timings, "load-x-inventory", lambda: load_optional_config("x.yaml"))
    telegram_config = timed(
        stage_timings,
        "load-telegram-inventory",
        lambda: load_optional_config("telegram.yaml"),
    )
    youtube_config = timed(stage_timings, "load-youtube-inventory", lambda: load_optional_config("youtube.yaml"))
    source_inventory = build_source_inventory(
        configured_feeds,
        x_accounts=list(x_config.get("accounts", [])),
        telegram_channels=list(telegram_config.get("channels", [])),
        youtube_channels=list(youtube_config.get("channels", [])),
    )

    raw_items, source_health = timed(
        stage_timings,
        "collect:rss",
        lambda: rss.collect(since, snapshot_dir=rss_snapshot_dir, snapshot_only=args.rss_snapshot_only),
    )
    if not args.only_rss:
        for name, collector in (
            ("collect:x", x_api),
            ("collect:telegram", telegram),
            ("collect:youtube", youtube),
            ("collect:local-analysis", local_analysis),
        ):
            items, health = timed(stage_timings, name, lambda collector=collector: collector.collect(since))
            raw_items.extend(items)
            source_health.extend(health)

    canonical = timed(stage_timings, "normalize", lambda: normalize(raw_items))
    scored = timed(stage_timings, "filter", lambda: filter_items(canonical))
    framework_config = timed(stage_timings, "load-frameworks-config", load_framework_config)
    frameworks = timed(stage_timings, "load-frameworks", lambda: load_frameworks(framework_config))
    review_config = timed(stage_timings, "load-review-ledger", lambda: load_optional_config("reviewed.yaml"))
    clusters = timed(
        stage_timings,
        "analyze-geo-review-verify",
        lambda: attach_verification_dossiers(
            apply_review_overrides(geo_tag(analyze(scored, frameworks)), review_config)
        ),
    )
    map_coverage = build_map_coverage(clusters)
    source_count = len({item.source_id for item in raw_items})
    live_source_count = len({item.source_id for item in raw_items if is_live_source_item(item)})
    snapshot_source_count = len(
        {
            item.source_id
            for item in raw_items
            if item.raw.get("rss_snapshot") or item.raw.get("x_snapshot")
        }
    )
    source_condition = build_source_condition(
        source_health=source_health,
        raw_item_count=len(raw_items),
        live_source_count=live_source_count,
        snapshot_source_count=snapshot_source_count,
    )
    brief = timed(stage_timings, "synthesize-brief", lambda: synthesize_brief(clusters, generated_at, source_condition))
    daily_report = timed(
        stage_timings,
        "synthesize-daily-report",
        lambda: synthesize_daily_report(
            clusters,
            generated_at,
            source_condition,
            frameworks,
        ),
    )
    aggregates = timed(stage_timings, "district-aggregates", lambda: district_aggregates(clusters))
    tags = timed(stage_timings, "signal-tags", lambda: sorted({tag for cluster in clusters for tag in cluster.signal_tags}))
    source_lanes = timed(stage_timings, "source-lanes", lambda: build_source_lanes(scored))
    ground_needs = timed(stage_timings, "ground-needs", lambda: build_ground_needs(clusters))
    public_item_counts = Counter(item.source_id for item in scored)
    public_source_health = [
        status.model_copy(
            update={
                "item_count": public_item_counts.get(status.source, 0),
                "note": status.note or (
                    "Source responded, but no item matched the Lebanon desk's editorial scope."
                    if status.ok and public_item_counts.get(status.source, 0) == 0
                    else ""
                ),
            }
        )
        for status in source_health
    ]

    api = SignalDeskApi(
        meta=ApiMeta(
            generated_at=generated_at,
            window_start=since,
            source_count=len({item.source_id for item in raw_items}),
            cluster_count=len(clusters),
            located_cluster_count=len([cluster for cluster in clusters if cluster.primary_location and cluster.location_precision != "unknown"]),
            mode="daily-multisource",
            source_condition=source_condition,
            source_inventory=source_inventory,
            map_coverage=map_coverage,
            notes=[
                "X posts enter through the official API and remain visibly attributed to the account that published them.",
                "YouTube captions are attached when a public transcript is available; otherwise the video remains a metadata lead.",
                "Event pins update with the daily run. Dated territorial layers change only when a sourced map supports the edit.",
            ],
        ),
        brief_markdown=brief,
        clusters=clusters,
        district_aggregates=aggregates,
        signal_tags=tags,
        frameworks=frameworks,
        source_health=public_source_health,
        source_lanes=source_lanes,
        ground_needs=ground_needs,
        daily_report=daily_report,
    )

    guard = publication_guard(
        source_health=source_health,
        live_source_count=live_source_count,
        scored_item_count=len(scored),
        min_live_sources=args.min_live_sources,
        min_scored_items=args.min_scored_items,
        max_source_failure_rate=args.max_source_failure_rate,
        override=args.allow_unsafe_public_copy,
    )
    store_output_written = not args.dry_run
    public_copy_requested = store_output_written and not args.no_public_copy
    public_copy_written = public_copy_requested and bool(guard["public_copy_allowed"])
    public_output_files = [
        "brief.md",
        "clusters.json",
        "events.geojson",
        "api.json",
        "lebanon-districts.geojson",
        "lebanon-boundary.geojson",
        "battlefield.geojson",
    ]
    store_output_files = [*public_output_files, "run-health.json"]
    health = {
        "generated_at": generated_at.isoformat(),
        "window_start": since.isoformat(),
        "dry_run": args.dry_run,
        "only_rss": args.only_rss,
        "rss_snapshot_dir": str(rss_snapshot_dir) if rss_snapshot_dir else "",
        "rss_snapshot_only": args.rss_snapshot_only,
        "store_output_written": store_output_written,
        "public_copy_requested": public_copy_requested,
        "public_copy_written": public_copy_written,
        "run_dir": str(run_dir),
        "public_data_dir": str(PUBLIC_DATA_DIR),
        "raw_item_count": len(raw_items),
        "canonical_item_count": len(canonical),
        "scored_item_count": len(scored),
        "cluster_count": len(clusters),
        "located_cluster_count": len([cluster for cluster in clusters if cluster.primary_location and cluster.location_precision != "unknown"]),
        "source_count": source_count,
        "live_source_count": live_source_count,
        "snapshot_source_count": snapshot_source_count,
        "source_inventory": source_inventory.model_dump(mode="json"),
        "map_coverage": map_coverage.model_dump(mode="json"),
        "source_health": source_health_summary(source_health),
        "source_condition": source_condition.model_dump(mode="json"),
        "publication_guard": guard,
        "source_lane_counts": {lane.id: lane.item_count for lane in source_lanes},
        "stage_timings_seconds": stage_timings,
        "store_output_files": store_output_files if store_output_written else [],
        "public_output_files": public_output_files if public_copy_written else [],
    }

    if store_output_written:
        run_dir.mkdir(parents=True, exist_ok=True)
        (run_dir / "brief.md").write_text(brief, encoding="utf-8")
        write_json(run_dir / "clusters.json", [cluster.model_dump(mode="json") for cluster in clusters])
        write_json(run_dir / "events.geojson", events_geojson(clusters))
        write_json(run_dir / "api.json", api.model_dump(mode="json"))
        for reference_name in ("lebanon-districts.geojson", "lebanon-boundary.geojson", "battlefield.geojson"):
            source_path = PUBLIC_DATA_DIR / reference_name
            if not source_path.exists():
                raise FileNotFoundError(
                    f"Missing {source_path}. Run python3 -m tools.signal_desk.prepare_map_data before the daily pipeline."
                )
            shutil.copyfile(source_path, run_dir / reference_name)
        write_json(run_dir / "run-health.json", health)

    if public_copy_written:
        PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
        for name in public_output_files:
            shutil.copyfile(run_dir / name, PUBLIC_DATA_DIR / name)

    if args.dry_run:
        print(f"Signal Desk dry run complete: {run_dir}")
    else:
        print(f"Signal Desk run complete: {run_dir}")
    print(f"Clusters: {len(clusters)} / Items: {len(raw_items)}")
    print("Stage timings:")
    for stage, seconds in stage_timings.items():
        print(f"- {stage}: {seconds:.3f}s")
    print("Run health:")
    print(json.dumps(health, indent=2, ensure_ascii=False, default=str))
    if public_copy_requested and not guard["public_copy_allowed"]:
        print("Public copy blocked by publication guard:")
        for reason in guard["reasons"]:
            print(f"- {reason}")
        raise SystemExit(2)


if __name__ == "__main__":
    main()
