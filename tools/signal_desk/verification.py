from __future__ import annotations

from tools.signal_desk.models import GeoTaggedCluster, VerificationDossier, VerificationStatus


SOURCE_GAP_STATUSES = {"single-source", "unconfirmed"}
LOCATION_GAP_PRECISIONS = {"unknown", "national", "district"}


def missing_parts(cluster: GeoTaggedCluster) -> list[str]:
    missing: list[str] = []
    if cluster.confirmation_status in SOURCE_GAP_STATUSES:
        missing.append("second source")
    if cluster.location_precision in LOCATION_GAP_PRECISIONS:
        missing.append("sharper place")
    if "lebanese-local" not in cluster.source_lanes:
        missing.append("Lebanese local record")
    if "wires-regional" not in cluster.source_lanes:
        missing.append("wire or regional corroboration")
    if missing:
        return missing[:4]
    return ["casualty numbers", "exact timing", "motive"]


def verification_status_for(cluster: GeoTaggedCluster) -> VerificationStatus:
    needs_source = cluster.confirmation_status in SOURCE_GAP_STATUSES
    needs_location = cluster.location_precision in LOCATION_GAP_PRECISIONS
    if needs_source and needs_location:
        return "needs-source-and-location"
    if needs_source:
        return "needs-source"
    if needs_location:
        return "needs-location"
    if cluster.confirmation_status == "corroborated":
        return "ready"
    return "watch"


def label_for(status: VerificationStatus) -> str:
    return {
        "ready": "Ready for brief",
        "watch": "Watch with caveats",
        "needs-source": "Needs another source",
        "needs-location": "Needs sharper place",
        "needs-source-and-location": "Needs source and place",
    }[status]


def summary_for(cluster: GeoTaggedCluster, status: VerificationStatus) -> str:
    place = cluster.primary_location.name if cluster.primary_location else cluster.where or "Location unclear"
    source_count = len(cluster.sources_span)
    source_phrase = f"{source_count} source" if source_count == 1 else f"{source_count} sources"
    if status == "needs-source-and-location":
        return f"{place} is visible as a lead, but it still needs another source and a sharper place."
    if status == "needs-source":
        return f"{place} has a place trail, but the record still rests on {source_phrase}."
    if status == "needs-location":
        return f"The source trail is usable, but the place is still too broad for a settled map read."
    if status == "ready":
        return f"{place} is specific and corroborated enough to lead the brief, with caveats still kept visible."
    return f"{place} is worth watching, but it still needs one more check before it hardens into a finding."


def next_checks_for(cluster: GeoTaggedCluster, status: VerificationStatus) -> list[str]:
    checks: list[str] = []
    if cluster.recommended_next_check:
        checks.append(cluster.recommended_next_check)
    if status in {"needs-source", "needs-source-and-location"}:
        checks.append("Find one independent source outside the current claim lane.")
    if status in {"needs-location", "needs-source-and-location"}:
        checks.append("Confirm the named place, district, and time before mapping the item as local.")
    if not checks and cluster.what_to_watch:
        checks.append(cluster.what_to_watch)
    return checks[:3]


def build_verification_dossier(cluster: GeoTaggedCluster) -> VerificationDossier:
    status = verification_status_for(cluster)
    return VerificationDossier(
        status=status,
        label=label_for(status),
        summary=summary_for(cluster, status),
        source_count=len(cluster.sources_span),
        source_lanes=cluster.source_lanes,
        location_precision=cluster.location_precision,
        missing=missing_parts(cluster),
        next_checks=next_checks_for(cluster, status),
        provenance=cluster.who_says_so[:4] or cluster.sources_span[:4],
    )


def attach_verification_dossiers(clusters: list[GeoTaggedCluster]) -> list[GeoTaggedCluster]:
    return [
        cluster.model_copy(
            update={
                "verification_status": dossier.status,
                "verification": dossier,
            }
        )
        for cluster in clusters
        for dossier in [build_verification_dossier(cluster)]
    ]
