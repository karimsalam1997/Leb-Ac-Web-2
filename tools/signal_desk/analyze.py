from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from hashlib import sha1
import re

from tools.signal_desk.models import AnalyzedCluster, Framework, GeoTaggedCluster, ScoredItem
from tools.signal_desk.source_lanes import lane_for


CORROBORATING_LANES = {"lebanese-local", "israeli-dissent", "wires-regional"}
PRIMARY_CLAIM_LANES = {"resistance-apparatus", "israeli-establishment"}
LEBANESE_PLACE_HINTS = ["Tyre", "Bint Jbeil", "Marjayoun", "Nabatieh", "Sidon", "Beirut", "Baalbek", "Tripoli", "Dahiyeh", "South Lebanon"]
LEBANON_CONTEXT_HINTS = [*LEBANESE_PLACE_HINTS, "Lebanon", "Lebanese", "Hezbollah"]
FOREIGN_PLACE_HINTS = ["Gaza", "Gaza Strip", "Southern Gaza Strip", "Northern Gaza Strip", "Palestinian territory"]


def load_frameworks(config: dict) -> list[Framework]:
    return [Framework(**framework) for framework in config.get("frameworks", [])]


def choose_framework_ids(text: str, frameworks: list[Framework]) -> list[str]:
    lowered = text.lower()
    matches = [
        framework.id
        for framework in frameworks
        if any(term.lower() in lowered for term in framework.match_terms)
    ]
    return matches[:2]


def confidence_for(items: list[ScoredItem]) -> str:
    if is_fallback_sample_cluster(items):
        return "low"
    source_count = len({item.source_id for item in items})
    if source_count >= 3:
        return "high"
    if source_count == 2:
        return "medium"
    return "low"


def source_lane_ids(items: list[ScoredItem]) -> list[str]:
    if is_fallback_sample_cluster(items):
        return ["pipeline-sample"]
    return sorted({lane_for(item) for item in items})


def confirmation_status_for(items: list[ScoredItem]) -> str:
    if is_fallback_sample_cluster(items):
        return "unconfirmed"
    source_count = len({item.source_id for item in items})
    if source_count <= 1:
        return "single-source"
    # Automation can establish that several outlets are reporting related
    # material. It cannot promote its own grouping into a verified finding.
    return "partly-corroborated"


def severity_for(tags: list[str], text: str, confirmation_status: str) -> str:
    lowered = text.lower()
    danger_words = ["strike", "shelling", "drone", "missile", "rocket", "raid", "bombing", "incursion"]
    civilian_words = ["killed", "wounded", "injured", "evacuation", "displaced", "hospital", "school", "road"]
    if any(word in lowered for word in danger_words) and any(word in lowered for word in civilian_words):
        return "critical"
    if "casualty" in tags or "displacement" in tags:
        return "high"
    if "humanitarian" in tags:
        return "moderate"
    if "strike-claim" in tags and confirmation_status in {"corroborated", "partly-corroborated"}:
        return "high"
    if "strike-claim" in tags:
        return "moderate"
    if "rhetoric-shift" in tags or "political-maneuver" in tags:
        return "moderate"
    return "low"


def civilian_flags_for(text: str, tags: list[str]) -> list[str]:
    lowered = text.lower()
    flags: list[str] = []
    checks = [
        ("casualties", ["killed", "wounded", "injured", "casualty", "martyr"]),
        ("evacuation", ["evacuation", "evacuate", "warning to residents"]),
        ("displacement", ["displaced", "flee", "shelter"]),
        ("roads", ["road", "highway", "crossing", "route"]),
        ("hospitals", ["hospital", "ambulance", "civil defense", "rescue"]),
        ("schools", ["school", "university"]),
        ("water", ["water", "pumping"]),
        ("electricity", ["electricity", "power", "generator"]),
        ("telecoms", ["telecom", "internet", "phone"]),
    ]
    for label, terms in checks:
        if any(term in lowered for term in terms):
            flags.append(label)
    if "casualty" in tags and "casualties" not in flags:
        flags.append("casualties")
    if "displacement" in tags and "displacement" not in flags:
        flags.append("displacement")
    return flags


def claim_side_for(items: list[ScoredItem], lanes: list[str]) -> str:
    if is_fallback_sample_cluster(items):
        return "Review-only fallback sample"
    lane_set = set(lanes)
    if lane_set == {"resistance-apparatus"}:
        return "Resistance primary claim"
    if lane_set == {"israeli-establishment"}:
        return "Israeli security narrative"
    if "israeli-dissent" in lane_set:
        return "Israeli dissent or complication"
    if "lebanese-local" in lane_set and lane_set & {"wires-regional", "israeli-establishment", "resistance-apparatus"}:
        return "Cross-source field record"
    if "video-analysis" in lane_set or "framework-desk" in lane_set:
        return "Analysis frame"
    if "wires-regional" in lane_set:
        return "Regional and wire reporting"
    return "Mixed reporting"


def location_precision_for(location: str) -> str:
    broad = {"lebanon", "israel", "iran", "syria"}
    district = {"south lebanon", "mount lebanon", "nabatieh", "beqaa", "bekaa", "baalbek-hermel"}
    lowered = location.lower()
    if lowered in {"location unclear", "external place"}:
        return "unknown"
    if lowered in broad:
        return "national"
    if lowered in district:
        return "district"
    return "exact"


def who_says_so_for(items: list[ScoredItem]) -> list[str]:
    return [
        f"{item.source_id}: {item.title[:92].rstrip()}"
        for item in sorted(items, key=lambda item: item.published_at, reverse=True)[:4]
    ]


def who_complicates_for(items: list[ScoredItem], lanes: list[str], confirmation_status: str) -> list[str]:
    lane_set = set(lanes)
    notes: list[str] = []
    if confirmation_status in {"single-source", "unconfirmed"}:
        notes.append("No independent confirming source appears inside this cluster yet.")
    if "resistance-apparatus" in lane_set and "israeli-establishment" not in lane_set:
        notes.append("No matching Israeli record appears in this cluster.")
    if "israeli-establishment" in lane_set and "lebanese-local" not in lane_set:
        notes.append(
            "This is an Israeli official or security-facing claim. Its account of targets, "
            "casualties, and mission success is self-reported until an independent record tests it."
        )
    if "israeli-dissent" in lane_set:
        notes.append("Israeli dissent reporting complicates the official line.")
    if not notes:
        notes.append("The sources do not fully agree on meaning, even when they overlap on place or timing.")
    return notes[:3]


def missing_for(items: list[ScoredItem], confirmation_status: str, precision: str, lanes: list[str]) -> str:
    if is_fallback_sample_cluster(items):
        return "Missing: live source access, a real source record, current confirmation, and field checks."
    missing: list[str] = []
    if confirmation_status in {"single-source", "unconfirmed"}:
        missing.append("a second source")
    if precision != "exact":
        missing.append("a precise place")
    if "lebanese-local" not in lanes:
        missing.append("Lebanese local confirmation")
    if "wires-regional" not in lanes:
        missing.append("wire or regional corroboration")
    if not missing:
        return "The record is stronger than most items here, but casualty numbers, exact timing, and motive still need care."
    return "Missing: " + ", ".join(missing[:4]) + "."


def next_check_for(signal: str, confirmation_status: str, location: str, lanes: list[str]) -> str:
    if "pipeline-sample" in lanes:
        return "Restore live source access or provide cached source snapshots before treating this as a real signal."
    if signal in {"casualty", "displacement", "strike-claim"}:
        return f"Check {location} against Lebanese local reporting, municipal or rescue updates, and one opposing-source record before acting on it."
    if confirmation_status in {"single-source", "unconfirmed"}:
        return f"Look for the same place and time in a Lebanese local source, an Israeli source, and a wire or regional source."
    if "israeli-establishment" in lanes or "israeli-dissent" in lanes:
        return "Compare the Israeli establishment line with Haaretz, +972, Lebanese local reporting, and wires."
    return "Check whether this remains one report or becomes a repeated pattern across separate source lanes."


def cluster_key(item: ScoredItem) -> str:
    place = re_key(location_hint(f"{item.title} {item.text_en}"))
    if item.source_type == "telegram":
        source_band = "telegram"
    elif item.source_type == "analysis":
        source_band = "analysis"
    else:
        source_band = "reporting"
    if item.signal_tags:
        return f"{source_band}:{place}:{item.signal_tags[0]}"
    return f"{source_band}:{place}:political-maneuver"


HEADLINE_STOPWORDS = {
    "about", "after", "against", "amid", "and", "are", "from", "into", "is", "its",
    "lebanon", "lebanese", "israel", "israeli", "hezbollah", "near", "new", "over",
    "said", "says", "the", "their", "this", "to", "with",
    "على", "عن", "في", "من", "إلى", "بعد", "لبنان", "لبناني", "إسرائيل", "الإسرائيلي",
    "حزب", "الله",
}


def headline_tokens(item: ScoredItem) -> set[str]:
    words = re.findall(r"[\w\u0600-\u06ff]{3,}", item.title.lower())
    return {word for word in words if word not in HEADLINE_STOPWORDS and not word.isdigit()}


def related_headlines(left: ScoredItem, right: ScoredItem) -> bool:
    if cluster_key(left).rsplit(":", 1)[-1] != cluster_key(right).rsplit(":", 1)[-1]:
        return False
    if abs((left.published_at - right.published_at).total_seconds()) > 48 * 60 * 60:
        return False
    left_tokens = headline_tokens(left)
    right_tokens = headline_tokens(right)
    shared = left_tokens & right_tokens
    if len(shared) < 2:
        return False
    smaller = min(len(left_tokens), len(right_tokens))
    return smaller > 0 and len(shared) / smaller >= 0.4


def signal_from_key(key: str) -> str:
    return key.rsplit(":", 1)[-1]


def re_key(value: str) -> str:
    return value.lower().replace(" ", "-")


def has_place_token(text: str, name: str) -> bool:
    return bool(re.search(rf"(?<!\w){re.escape(name.lower())}(?!\w)", text.lower()))


def has_lebanon_context(text: str) -> bool:
    return any(has_place_token(text, hint) for hint in LEBANON_CONTEXT_HINTS)


def has_foreign_place_without_lebanon_context(text: str) -> bool:
    return any(has_place_token(text, hint) for hint in FOREIGN_PLACE_HINTS) and not has_lebanon_context(text)


def is_fallback_sample_cluster(items: list[ScoredItem]) -> bool:
    return bool(items) and all(bool(item.raw.get("fallback")) for item in items)


def clean_headline(title: str) -> str:
    parts = title.rsplit(" - ", 1)
    if len(parts) == 2 and len(parts[1]) <= 42:
        title = parts[0]
    title = re.sub(r"\s+", " ", title).strip()
    return title if len(title) <= 150 else title[:146].rstrip() + "…"


def analyze(items: list[ScoredItem], frameworks: list[Framework]) -> list[GeoTaggedCluster]:
    event_items = [item for item in items if item.source_type != "analysis"]
    grouped_items: list[list[ScoredItem]] = []
    for item in sorted(event_items, key=lambda candidate: candidate.published_at, reverse=True):
        matching_group = next(
            (
                group
                for group in grouped_items
                if any(related_headlines(item, existing) for existing in group)
            ),
            None,
        )
        if matching_group is None:
            grouped_items.append([item])
        else:
            matching_group.append(item)

    clusters: list[GeoTaggedCluster] = []
    for group_index, bucket in enumerate(grouped_items):
        key = f"{group_index}:{cluster_key(bucket[0])}"
        ranked = sorted(bucket, key=lambda item: item.relevance, reverse=True)[:4]
        lead = ranked[0]
        fallback_sample = is_fallback_sample_cluster(ranked)
        text = " ".join([item.title + " " + item.text_en for item in ranked])
        framework_ids = choose_framework_ids(text, frameworks)
        sources = sorted({item.source_id for item in ranked})
        biases = sorted({item.source_bias for item in ranked if item.source_bias})
        all_tags = sorted({tag for item in ranked for tag in item.signal_tags})
        signal = signal_from_key(key)
        location_phrase = location_hint(text)
        lanes = source_lane_ids(ranked)
        status = confirmation_status_for(ranked)
        precision = location_precision_for(location_phrase)
        severity = "low" if fallback_sample else severity_for(all_tags, text, status)
        civilian_flags = civilian_flags_for(text, all_tags)
        headline = clean_headline(lead.title)
        if fallback_sample and not headline.startswith("Fallback sample:"):
            headline = "Fallback sample: " + headline
        analysis = build_fallback_analysis(location_phrase) if fallback_sample else build_analysis(location_phrase, signal, ranked, framework_ids)
        watch = build_watch(location_phrase, signal)
        missing = missing_for(ranked, status, precision, lanes)
        cluster_id = sha1(f"{key}:{headline}:{lead.published_at.isoformat()}".encode("utf-8")).hexdigest()[:12]
        clusters.append(
            GeoTaggedCluster(
                id=cluster_id,
                item_ids=[item.id for item in ranked],
                headline=headline,
                frameworks=framework_ids,
                analysis=analysis,
                confidence=confidence_for(ranked),
                sources_span=sources,
                what_to_watch=watch,
                signal_tags=all_tags or [key],
                published_at=max(item.published_at for item in ranked),
                source_biases=biases,
                urls=[item.url for item in ranked if item.url],
                severity=severity,
                location_precision=precision,
                civilian_impact_flags=civilian_flags,
                source_lanes=lanes,
                claim_side=claim_side_for(ranked, lanes),
                confirmation_status=status,
                recommended_next_check=next_check_for(signal, status, location_phrase, lanes),
                what_happened=(
                    build_fallback_what_happened()
                    if fallback_sample
                    else build_what_happened(
                        location_phrase,
                        signal,
                        headline,
                        lead.source_id,
                        lead.text_en,
                    )
                ),
                where=location_phrase,
                who_says_so=who_says_so_for(ranked),
                who_disputes_or_complicates=who_complicates_for(ranked, lanes, status),
                why_it_matters=build_fallback_why_it_matters() if fallback_sample else build_why_it_matters(location_phrase, signal, severity, civilian_flags),
                what_is_missing=missing,
            )
        )

    return sorted(clusters, key=lambda cluster: (severity_rank(cluster.severity), cluster.published_at), reverse=True)[:18]


def severity_rank(severity: str) -> int:
    return {"critical": 4, "high": 3, "moderate": 2, "low": 1}.get(severity, 0)


def location_hint(text: str) -> str:
    if has_foreign_place_without_lebanon_context(text):
        return "Location unclear"
    for place in LEBANESE_PLACE_HINTS:
        if has_place_token(text, place):
            return place
    if has_place_token(text, "Lebanon"):
        return "Lebanon"
    if has_lebanon_context(text):
        return "Lebanon"
    return "Location unclear"


def build_analysis(location: str, signal: str, items: list[ScoredItem], framework_ids: list[str]) -> str:
    source_line = ", ".join(sorted({item.source_id for item in items})[:3])
    if signal == "strike-claim":
        return f"{location} is where the military story and the civilian story are crossing today. The item set is still source-bound, with {source_line} carrying the available record, so the dashboard treats the claim as a signal before it treats it as settled fact."
    if signal == "economic":
        return f"{location} is not being described as a sudden failure so much as a familiar machine under stress. The useful reading is structural: when public capacity weakens, private fees and political brokerage usually become the hidden tax."
    if signal == "displacement":
        return f"{location} is registering pressure on ordinary movement, shelter, and household calculation. The strongest opposing argument is that evacuation language can be ordinary wartime caution, but in Lebanon it also changes who can stay, who can work, and who quietly loses the map."
    if framework_ids:
        framework_label = framework_ids[0].replace("_", " ")
        return (
            f"{location} clears the {framework_label} test in the standing layer. "
            "The report should spend its words on the actor, place, date, and material result, "
            "while keeping the source check in the evidence footer."
        )
    return f"{location} is the pressure point in this cluster. The strongest cautious reading is that these are separate reports, but the pattern matters because Lebanon's weak state makes every local event travel through sectarian brokerage, foreign pressure, and private survival systems."


def build_fallback_analysis(location: str) -> str:
    return f"{location} appears only because local fallback sample text was emitted after live sources failed. This is a pipeline diagnostic, not a field signal."


def evidence_excerpt(text: str, fallback: str, limit: int = 360) -> str:
    compact = re.sub(r"\s+", " ", text or "").strip()
    divider_segments = [
        segment.strip(" -")
        for segment in re.split(r"─{3,}|-{5,}", compact)
        if segment.strip(" -")
    ]
    segments = [
        candidate.strip()
        for segment in divider_segments
        for candidate in re.split(r"(?<=[.!?])\s+(?=[A-Z])", segment)
        if candidate.strip()
    ]
    english_segments = [
        segment
        for segment in segments
        if len(re.findall(r"[A-Za-z]", segment)) >= 24
        and "whatsapp.com" not in segment.lower()
    ]
    selected = english_segments[0] if english_segments else (segments[0] if segments else fallback)
    sentences = re.split(r"(?<=[.!?])\s+", selected)
    chosen: list[str] = []
    for candidate in sentences[:3]:
        proposed = " ".join([*chosen, candidate]).strip()
        if chosen and len(proposed) > limit:
            break
        chosen.append(candidate)
    excerpt = " ".join(chosen).strip() or selected
    if len(excerpt) <= limit:
        return excerpt
    shortened = excerpt[:limit].rsplit(" ", 1)[0].rstrip(" ,;:-")
    return f"{shortened}…"


def build_what_happened(
    location: str,
    signal: str,
    headline: str,
    source: str,
    source_text: str,
) -> str:
    place = "Lebanon" if location in {"Location unclear", "Place not established"} else location
    excerpt = evidence_excerpt(source_text, headline)
    if signal == "strike-claim":
        return f"{source} reported a military development tied to {place}: {excerpt}"
    if signal == "displacement":
        return f"{source} reported a change in movement, shelter, or return around {place}: {excerpt}"
    if signal == "humanitarian":
        return f"{source} reported a humanitarian or public-service development connected to {place}: {excerpt}"
    if signal == "casualty":
        return f"{source} reported casualties around {place}: {excerpt}"
    if signal == "rhetoric-shift":
        return f"{source} carried a statement or warning tied to {place}: {excerpt}"
    if signal == "economic":
        return f"{source} reported an economic development tied to {place}: {excerpt}"
    if signal == "heritage":
        return f"{source} reported a culture or memory development tied to {place}: {excerpt}"
    return f"{source} reported this development around {place}: {excerpt}"


def build_fallback_what_happened() -> str:
    return "This is a review-only fallback sample emitted because live sources returned no usable items."


def build_why_it_matters(location: str, signal: str, severity: str, civilian_flags: list[str]) -> str:
    place = "Lebanon" if location in {"Location unclear", "Place not established"} else location
    if severity in {"critical", "high"}:
        return f"{place} matters here because the report may affect civilian safety, movement, or casualty accounting."
    if civilian_flags:
        return f"{place} matters because the story touches civilian systems: {', '.join(civilian_flags[:3])}."
    if signal == "humanitarian":
        return f"The development matters because it concerns aid, health, or emergency capacity in {place}."
    if signal == "rhetoric-shift":
        return "The statement matters because rhetoric often prepares the ground for later military, diplomatic, or media moves."
    return f"The development matters if it stops being an isolated item and begins repeating across separate source records in {place}."


def build_fallback_why_it_matters() -> str:
    return "It matters only as a pipeline check. It should disappear once live sources or cached source snapshots are available."


def build_watch(location: str, signal: str) -> str:
    if signal == "strike-claim":
        return f"Watch whether {location} is named again by opposing sources within the next 24 hours."
    if signal == "economic":
        return f"Watch whether the language moves from reform promise to who pays the bill in {location}."
    if signal == "displacement":
        return f"Watch shelter numbers, school closures, and municipal language around {location}."
    return f"Watch whether {location} remains isolated or becomes part of a repeated pattern."
