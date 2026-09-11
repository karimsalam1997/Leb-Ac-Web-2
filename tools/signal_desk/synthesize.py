from __future__ import annotations

from datetime import datetime
import re

from tools.signal_desk.models import DailyReport, Framework, GeoTaggedCluster, SourceCondition


LANE_LABELS = {
    "pipeline-sample": "pipeline sample",
    "israeli-establishment": "Israeli establishment",
    "israeli-dissent": "Israeli dissent",
    "lebanese-local": "Lebanese local record",
    "resistance-apparatus": "resistance apparatus",
    "palestinian-record": "Palestinian record",
    "gulf-official": "Gulf official line",
    "iranian-state": "Iranian state line",
    "video-analysis": "video analysis",
    "wires-regional": "wires and regionals",
    "framework-desk": "framework desk",
}

PRECISION_LABELS = {
    "exact": "specific",
    "district": "district-level",
    "national": "country-wide",
    "unknown": "unclear",
}


def compact_list(values: list[str], limit: int = 3) -> str:
    cleaned = [value.strip() for value in values if value.strip()]
    if not cleaned:
        return ""
    shown = cleaned[:limit]
    if len(shown) == 1:
        text = shown[0]
    elif len(shown) == 2:
        text = f"{shown[0]} and {shown[1]}"
    else:
        text = f"{', '.join(shown[:-1])}, and {shown[-1]}"
    remaining = len(cleaned) - len(shown)
    if remaining > 0:
        return f"{text}, plus {remaining} more"
    return text


def clean_missing(value: str) -> str:
    if not value:
        return "The missing piece is still the independent check."
    if value.startswith("Missing: "):
        return "Still missing: " + value.removeprefix("Missing: ")
    return value


def lane_text(cluster: GeoTaggedCluster) -> str:
    labels = [LANE_LABELS.get(lane, lane.replace("-", " ")) for lane in cluster.source_lanes]
    return compact_list(labels) or "no clear source lane"


def source_text(cluster: GeoTaggedCluster) -> str:
    return compact_list(cluster.sources_span) or lane_text(cluster)


def radius_text(meters: int) -> str:
    if meters <= 0:
        return ""
    kilometers = round(meters / 1000)
    return f"{kilometers} km"


def map_context_text(cluster: GeoTaggedCluster) -> str:
    place = cluster.primary_location.name if cluster.primary_location else cluster.where or "Location unclear"
    if cluster.map_marker_kind == "representative-area":
        radius = radius_text(cluster.map_radius_meters)
        radius_phrase = f" with about a {radius} radius" if radius else ""
        return f"Map: {place} is shown as a representative area{radius_phrase}. Treat the coordinate as a center marker."
    if cluster.map_marker_kind == "unmapped" or cluster.location_precision == "unknown":
        return f"Map: no pin yet because the place is unclear. {cluster.map_warning}"
    return f"Map: {place} is a named-place pin. {cluster.map_warning}"


def map_line_text(cluster: GeoTaggedCluster) -> str:
    place = cluster.primary_location.name if cluster.primary_location else "Unlocated"
    if cluster.map_marker_kind == "representative-area":
        radius = radius_text(cluster.map_radius_meters)
        radius_phrase = f", {radius} radius" if radius else ""
        return f"{place}: {cluster.headline} ({cluster.map_precision_label.lower()}{radius_phrase})"
    if cluster.map_marker_kind == "unmapped" or cluster.location_precision == "unknown":
        return f"{place}: {cluster.headline} (unmapped)"
    return f"{place}: {cluster.headline} ({cluster.map_precision_label.lower()})"


def verification_text(cluster: GeoTaggedCluster) -> str:
    missing = compact_list(cluster.verification.missing, limit=4) or clean_missing(cluster.what_is_missing)
    next_check = cluster.verification.next_checks[0] if cluster.verification.next_checks else cluster.recommended_next_check
    return (
        f"Verification: {cluster.verification.label}. "
        f"{cluster.verification.summary} "
        f"Missing: {missing}. "
        f"Next check: {next_check}"
    )


def lead_opening(cluster: GeoTaggedCluster) -> str:
    place = cluster.primary_location.name if cluster.primary_location else cluster.where or "The lead cluster"
    status = cluster.confirmation_status.replace("-", " ")
    precision = PRECISION_LABELS.get(cluster.location_precision, cluster.location_precision)
    missing = clean_missing(cluster.what_is_missing)
    sources = source_text(cluster)
    lanes = lane_text(cluster)

    if cluster.confirmation_status in {"single-source", "unconfirmed"} or cluster.location_precision in {"unknown", "national", "district"}:
        return (
            f"Start with the limit: {place} leads the run, but the record is {status} and the location is {precision}. "
            f"The live trail comes through {sources}; the source lanes are {lanes}. {cluster.verification.summary} {missing} "
            "Read this as a signal to check before treating it as a settled account."
        )

    return (
        f"{place} leads the run because separate sources are now touching the same story. "
        f"The record is {status}, the location is {precision}, and the live trail comes through {sources}. "
        f"{cluster.verification.summary} {missing} Keep the event, the source interest, and the civilian effect in view at the same time."
    )


def evidence_line(cluster: GeoTaggedCluster) -> str:
    return (
        f"Evidence: {source_text(cluster)}. "
        f"Source lanes: {lane_text(cluster)}. "
        f"{map_context_text(cluster)} "
        f"{verification_text(cluster)}"
    )


def source_condition_section(source_condition: SourceCondition | None) -> str:
    if source_condition is None:
        return ""
    return (
        "\n\n## Source condition\n"
        f"{source_condition.label}. {source_condition.summary} {source_condition.caution}"
    )


def brief_title(date_label: str) -> str:
    return f"Lebanon Signal Desk Brief, {date_label}"


def synthesize_brief(clusters: list[GeoTaggedCluster], generated_at: datetime, source_condition: SourceCondition | None = None) -> str:
    date_label = generated_at.strftime("%B %-d, %Y") if hasattr(generated_at, "strftime") else "today"
    if not clusters:
        return f"# {brief_title(date_label)}\n\n## Daily record\nNo publishable developments were produced. The honest answer is silence until the source shelf returns something current and relevant.{source_condition_section(source_condition)}\n"

    lead = clusters[0]
    moved = "\n\n".join(
        (
            f"### {cluster.headline}\n"
            f"{cluster.what_happened or cluster.analysis}\n\n"
            f"Reporting: {source_text(cluster)}. "
            f"This is {'a single report' if len(cluster.sources_span) == 1 else 'related reporting from several outlets'}, "
            "not an automatically verified finding.\n\n"
            f"Next check: {cluster.recommended_next_check or cluster.what_to_watch}"
        )
        for cluster in clusters[:6]
    )
    return f"""# {brief_title(date_label)}

## Lead
{lead.headline}

{lead.what_happened or lead.analysis}{source_condition_section(source_condition)}

## Developments
{moved}
"""


def sentence(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", value or "").strip()
    cleaned = re.sub(r"\blocation unclear\b", "Lebanon", cleaned, flags=re.IGNORECASE)
    if not cleaned:
        return ""
    return cleaned if cleaned.endswith((".", "!", "?")) else f"{cleaned}."


def report_place(cluster: GeoTaggedCluster) -> str:
    value = cluster.primary_location.name if cluster.primary_location else cluster.where
    if not value or value.strip().lower() in {
        "location unclear",
        "place not established",
        "unknown",
        "unmapped",
    }:
        return "Lebanon"
    return value


def report_source(cluster: GeoTaggedCluster) -> str:
    return compact_list(cluster.sources_span, limit=3) or lane_text(cluster)


def report_item(cluster: GeoTaggedCluster) -> str:
    place = report_place(cluster)
    source = report_source(cluster)
    account = sentence(cluster.what_happened or cluster.analysis)
    significance = sentence(cluster.why_it_matters or cluster.analysis)
    return (
        f"In {place}, {source} reported that {account[:1].lower() + account[1:] if account else cluster.headline.lower()} "
        f"{significance}"
    )


def count_words(value: str) -> int:
    return len(re.findall(r"\b[\w’'-]+\b", value))


def active_framework_ids(clusters: list[GeoTaggedCluster], frameworks: list[Framework]) -> list[str]:
    valid = {framework.id for framework in frameworks}
    ordered: list[str] = []
    for cluster in clusters:
        for framework_id in cluster.frameworks:
            if framework_id in valid and framework_id not in ordered:
                ordered.append(framework_id)
    return ordered[:3]


def evidence_record(cluster: GeoTaggedCluster) -> str:
    timestamp = cluster.published_at.strftime("%H:%M UTC, %d %B %Y")
    source = report_source(cluster)
    link = f" [Open source]({cluster.urls[0]})" if cluster.urls else ""
    claim_note = ""
    if "israeli-establishment" in cluster.source_lanes:
        claim_note = (
            " Israeli official accounts of targets, casualties, and mission success "
            "remain self-reported here."
        )
    return (
        f"- **{timestamp}.** {source}. {cluster.confirmation_status}; "
        f"{cluster.location_precision} location.{claim_note}{link}"
    )


def framework_paragraph(
    framework: Framework,
    cluster: GeoTaggedCluster,
    date_label: str,
) -> str:
    place = report_place(cluster)
    source = report_source(cluster)
    account = sentence(cluster.what_happened or cluster.analysis)
    significance = sentence(cluster.why_it_matters or cluster.analysis)
    return (
        f"## {framework.name}\n\n"
        f"{sentence(framework.definition)} On {date_label}, {place} is the place where the test clears. "
        f"{source} entered this account into the record: {account} {significance} "
        f"The governing question is plain: {sentence(framework.test)} "
        "The framework earns its place only because the current item supplies an actor, a place, "
        "and a material result. Everything else stays outside the paragraph."
    )


def synthesize_daily_report(
    clusters: list[GeoTaggedCluster],
    generated_at: datetime,
    source_condition: SourceCondition | None = None,
    frameworks: list[Framework] | None = None,
) -> DailyReport:
    date_label = generated_at.strftime("%B %-d, %Y")
    framework_shelf = frameworks or []
    if not clusters:
        body = (
            f"On {date_label}, the Lebanese Academic Signal Desk produced no current report. "
            "The collector returned no usable Lebanon items, so the page keeps the previous edition visible with its date instead of inventing a daily argument."
        )
        return DailyReport(
            title=f"No daily assessment for {date_label}",
            dek="The source run returned no usable Lebanon reporting.",
            generated_at=generated_at,
            word_count=count_words(body),
            body_markdown=body,
            source_count=0,
            frameworks_applied=[],
        )

    ordered = clusters[:8]
    lead = ordered[0]
    lead_place = report_place(lead)
    sources = sorted({source for cluster in ordered for source in cluster.sources_span if source})
    framework_index = {framework.id: framework for framework in framework_shelf}
    applied = active_framework_ids(ordered, framework_shelf)
    source_condition_text = (
        f"{source_condition.label}: {source_condition.live_source_count} live sources returned material, "
        f"with source failure at {source_condition.source_failure_rate:.0%}."
        if source_condition
        else "The collection run preserved the source and publication time attached to every item."
    )
    opening = (
        f"## {lead_place}, at the hour the record arrived\n\n"
        f"At {lead.published_at.strftime('%H:%M UTC')} on "
        f"{lead.published_at.strftime('%-d %B %Y')}, {report_source(lead)} placed a report "
        f"from {lead_place} before the desk. {sentence(lead.what_happened or lead.analysis)} "
        "The report begins there because a dated claim is more useful than an inflated overview. "
        "The source is treated as credible evidence that the report was made. If the sentence carries "
        "a belligerent's casualty figure, target description, or claim of operational success, that portion "
        "remains the belligerent's account until another record tests it."
    )

    if not applied:
        body = "\n\n".join(
            [
                opening,
                (
                    "## A thin day should remain thin\n\n"
                    "No standing framework clears the test in today's material. The item may still matter, "
                    "and the source remains in the public record, but the eleven lenses are memory rather than "
                    "decoration. Forcing sovereignty theatre, demographic engineering, or designed dysfunction "
                    "onto an administrative notice would make the framework less intelligent with every use."
                ),
                "## Evidence record\n\n"
                + "\n".join(evidence_record(cluster) for cluster in ordered[:4])
                + f"\n\n{source_condition_text}",
            ]
        )
        title = f"{lead_place}, with no argument larger than the record"
        dek = (
            f"The {date_label} wire produced a report worth keeping, "
            "but none of the standing frameworks earned control of the article."
        )
    else:
        framework_sections = [
            framework_paragraph(
                framework_index[framework_id],
                next(
                    cluster
                    for cluster in ordered
                    if framework_id in cluster.frameworks
                ),
                date_label,
            )
            for framework_id in applied
        ]
        interaction = ""
        if len(applied) > 1:
            first = framework_index[applied[0]]
            second = framework_index[applied[1]]
            interaction = (
                "## Where the mechanisms meet\n\n"
                f"{first.name} and {second.name} touch the same ground without becoming the same claim. "
                f"The first explains who sets the terms around {lead_place}; the second explains what those "
                "terms do to people, territory, money, or return. Their interaction is the argument. "
                "One mechanism supplies authority. The other records the cost."
            )
        objection = (
            "## The strongest objection\n\n"
            "A framework can become a machine for seeing whatever it expects to see. That objection is serious. "
            "A source close to Hezbollah can minimize failure, a Saudi-owned broadcaster can carry the priorities "
            "of Riyadh, and an Israeli military account can enlarge the competence and success of its own operation. "
            "The answer is to keep the source inside the sentence, test the framework against a named event, and "
            "drop the framework when the event does not clear its question. Critical reading is not disbelief. "
            "It is the refusal to let any institution grade its own violence."
        )
        footer = (
            "## Evidence record\n\n"
            + "\n".join(evidence_record(cluster) for cluster in ordered[:6])
            + f"\n\n{source_condition_text} Verification remains here, at the bottom, where it can discipline "
            "the argument without swallowing it."
        )
        body = "\n\n".join(
            [
                opening,
                *framework_sections,
                *([interaction] if interaction else []),
                objection,
                footer,
            ]
        )
        title = f"{lead_place}, read through {framework_index[applied[0]].name.lower()}"
        dek = (
            f"The {date_label} assessment tests the current wire against "
            f"{compact_list([framework_index[item].name for item in applied], limit=3)} "
            "and keeps the verification record in a short footer."
        )

    word_count = count_words(body)
    if word_count > 1000:
        body = " ".join(body.split()[:995])
        word_count = count_words(body)

    return DailyReport(
        title=title,
        dek=dek,
        generated_at=generated_at,
        word_count=word_count,
        body_markdown=body,
        source_count=len(sources),
        frameworks_applied=applied,
    )
