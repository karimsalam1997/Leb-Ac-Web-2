from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re

from tools.signal_desk.models import DistrictAggregate, GeoTaggedCluster, Location


FALLBACK_GAZETTEER = [
    {"name": "Beirut", "name_ar": "بيروت", "aliases": ["ras beirut", "hamra", "downtown beirut", "dahiyeh", "dahieh"], "lat": 33.8938, "lng": 35.5018, "district": "Beirut", "caza": "Beirut", "governorate": "Beirut"},
    {"name": "Tyre", "name_ar": "صور", "aliases": ["sour", "sur", "tyr"], "lat": 33.2704, "lng": 35.2038, "district": "Tyre", "caza": "Tyre", "governorate": "South Lebanon"},
    {"name": "Sidon", "name_ar": "صيدا", "aliases": ["saida", "sayda"], "lat": 33.5571, "lng": 35.3715, "district": "Sidon", "caza": "Sidon", "governorate": "South Lebanon"},
    {"name": "Nabatieh", "name_ar": "النبطية", "aliases": ["nabatiyeh"], "lat": 33.3772, "lng": 35.4838, "district": "Nabatieh", "caza": "Nabatieh", "governorate": "Nabatieh"},
    {"name": "Bint Jbeil", "name_ar": "بنت جبيل", "aliases": ["bint jbeil", "bint jbeil district"], "lat": 33.1198, "lng": 35.4335, "district": "Bint Jbeil", "caza": "Bint Jbeil", "governorate": "Nabatieh"},
    {"name": "Marjayoun", "name_ar": "مرجعيون", "aliases": ["marjeyoun"], "lat": 33.3603, "lng": 35.5914, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Khiam", "name_ar": "الخيام", "aliases": ["al khiam", "khiyam"], "lat": 33.3294, "lng": 35.6147, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Aitaroun", "name_ar": "عيترون", "aliases": ["aitarun"], "lat": 33.1155, "lng": 35.4702, "district": "Bint Jbeil", "caza": "Bint Jbeil", "governorate": "Nabatieh"},
    {"name": "Baalbek", "name_ar": "بعلبك", "aliases": ["baalbeck"], "lat": 34.0058, "lng": 36.2181, "district": "Baalbek", "caza": "Baalbek", "governorate": "Baalbek-Hermel"},
    {"name": "Hermel", "name_ar": "الهرمل", "aliases": ["el hermel"], "lat": 34.3942, "lng": 36.3847, "district": "Hermel", "caza": "Hermel", "governorate": "Baalbek-Hermel"},
    {"name": "Zahle", "name_ar": "زحلة", "aliases": ["zahle"], "lat": 33.8468, "lng": 35.9020, "district": "Zahle", "caza": "Zahle", "governorate": "Beqaa"},
    {"name": "Tripoli", "name_ar": "طرابلس", "aliases": ["tarabulus"], "lat": 34.4367, "lng": 35.8497, "district": "Tripoli", "caza": "Tripoli", "governorate": "North Lebanon"},
    {"name": "Akkar", "name_ar": "عكار", "aliases": ["akkar"], "lat": 34.5333, "lng": 36.0833, "district": "Akkar", "caza": "Akkar", "governorate": "Akkar"},
    {"name": "Byblos", "name_ar": "جبيل", "aliases": ["jbeil", "jubayl"], "lat": 34.1230, "lng": 35.6519, "district": "Byblos", "caza": "Byblos", "governorate": "Mount Lebanon"},
    {"name": "Mount Lebanon", "name_ar": "جبل لبنان", "aliases": ["mount lebanon"], "lat": 33.8347, "lng": 35.7664, "district": "Mount Lebanon", "caza": "Mount Lebanon", "governorate": "Mount Lebanon"},
    {"name": "Dahiyeh", "name_ar": "الضاحية", "aliases": ["dahieh", "southern suburb", "beirut southern suburbs"], "lat": 33.8547, "lng": 35.5176, "district": "Baabda", "caza": "Baabda", "governorate": "Mount Lebanon"},
    {"name": "South Lebanon", "name_ar": "جنوب لبنان", "aliases": ["southern lebanon", "the south"], "lat": 33.2750, "lng": 35.4300, "district": "South Lebanon", "caza": "South Lebanon", "governorate": "South Lebanon"},
    {"name": "Naqoura", "name_ar": "الناقورة", "aliases": ["naqura"], "lat": 33.1181, "lng": 35.1397, "district": "Tyre", "caza": "Tyre", "governorate": "South Lebanon"},
    {"name": "Shebaa", "name_ar": "شبعا", "aliases": ["shebaa farms", "shabaa"], "lat": 33.3211, "lng": 35.7243, "district": "Hasbaya", "caza": "Hasbaya", "governorate": "Nabatieh"},
    {"name": "Litani River", "name_ar": "نهر الليطاني", "aliases": ["litani"], "lat": 33.3558, "lng": 35.6132, "district": "South Lebanon", "caza": "South Lebanon", "governorate": "South Lebanon"},
    {"name": "Kfar Kila", "name_ar": "كفركلا", "aliases": ["kfar kila", "kfar kela", "kfar kila"], "lat": 33.2797, "lng": 35.5558, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Houla", "name_ar": "حولا", "aliases": ["hula"], "lat": 33.2210, "lng": 35.5169, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Tayr Harfa", "name_ar": "طير حرفا", "aliases": ["tayr harfa", "teir harfa", "tair harfa"], "lat": 33.1552, "lng": 35.2344, "district": "Tyre", "caza": "Tyre", "governorate": "South Lebanon"},
    {"name": "Taybeh", "name_ar": "الطيبة", "aliases": ["taybeh", "taibeh", "tayyiba", "tayyibah"], "lat": 33.3118, "lng": 35.5797, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Hadatha", "name_ar": "حداثا", "aliases": ["hadatha", "hadatha bint jbeil"], "lat": 33.1542, "lng": 35.4147, "district": "Bint Jbeil", "caza": "Bint Jbeil", "governorate": "Nabatieh"},
    {"name": "Chamaa", "name_ar": "شمع", "aliases": ["chamaa", "shamaa", "chama"], "lat": 33.1451, "lng": 35.2550, "district": "Tyre", "caza": "Tyre", "governorate": "South Lebanon"},
    {"name": "Debel", "name_ar": "دبل", "aliases": ["debel", "debil"], "lat": 33.1084, "lng": 35.4219, "district": "Bint Jbeil", "caza": "Bint Jbeil", "governorate": "Nabatieh"},
    {"name": "Deir Seryan", "name_ar": "دير سريان", "aliases": ["deir seryan", "deir siriane", "deir siryan"], "lat": 33.2872, "lng": 35.5966, "district": "Marjayoun", "caza": "Marjayoun", "governorate": "Nabatieh"},
    {"name": "Rshaf", "name_ar": "رشاف", "aliases": ["rshaf", "rchaf", "reshaf"], "lat": 33.1596, "lng": 35.3724, "district": "Bint Jbeil", "caza": "Bint Jbeil", "governorate": "Nabatieh"},
]

FALLBACK_DISTRICTS = {
    "type": "FeatureCollection",
    "features": [
        {"type": "Feature", "properties": {"district": "Akkar"}, "geometry": {"type": "Polygon", "coordinates": [[[35.82, 34.35], [36.38, 34.35], [36.38, 34.72], [35.82, 34.72], [35.82, 34.35]]]}},
        {"type": "Feature", "properties": {"district": "North Lebanon"}, "geometry": {"type": "Polygon", "coordinates": [[[35.58, 34.14], [36.05, 34.14], [36.05, 34.45], [35.58, 34.45], [35.58, 34.14]]]}},
        {"type": "Feature", "properties": {"district": "Beirut"}, "geometry": {"type": "Polygon", "coordinates": [[[35.45, 33.86], [35.56, 33.86], [35.56, 33.94], [35.45, 33.94], [35.45, 33.86]]]}},
        {"type": "Feature", "properties": {"district": "Mount Lebanon"}, "geometry": {"type": "Polygon", "coordinates": [[[35.42, 33.55], [36.02, 33.55], [36.02, 34.22], [35.42, 34.22], [35.42, 33.55]]]}},
        {"type": "Feature", "properties": {"district": "Beqaa"}, "geometry": {"type": "Polygon", "coordinates": [[[35.78, 33.52], [36.28, 33.52], [36.28, 34.1], [35.78, 34.1], [35.78, 33.52]]]}},
        {"type": "Feature", "properties": {"district": "Baalbek-Hermel"}, "geometry": {"type": "Polygon", "coordinates": [[[36.02, 33.9], [36.62, 33.9], [36.62, 34.52], [36.02, 34.52], [36.02, 33.9]]]}},
        {"type": "Feature", "properties": {"district": "South Lebanon"}, "geometry": {"type": "Polygon", "coordinates": [[[35.08, 33.08], [35.55, 33.08], [35.55, 33.64], [35.08, 33.64], [35.08, 33.08]]]}},
        {"type": "Feature", "properties": {"district": "Nabatieh"}, "geometry": {"type": "Polygon", "coordinates": [[[35.35, 33.05], [35.82, 33.05], [35.82, 33.58], [35.35, 33.58], [35.35, 33.05]]]}},
    ],
}


FOREIGN_PLACE_HINTS = ["gaza", "gaza strip", "southern gaza strip", "northern gaza strip", "palestinian territory"]
BROAD_AREA_RADII = {
    "Lebanon": 70000,
    "South Lebanon": 36000,
    "Mount Lebanon": 32000,
    "Litani River": 24000,
}


def has_place_token(text: str, name: str) -> bool:
    return bool(re.search(rf"(?<!\w){re.escape(name.lower())}(?!\w)", text.lower()))


def has_lebanon_context(text: str) -> bool:
    for place in FALLBACK_GAZETTEER:
        names = [place["name"], place.get("name_ar", ""), *place.get("aliases", [])]
        if any(has_place_token(text, name) for name in names if name):
            return True
    return has_place_token(text, "Lebanon") or has_place_token(text, "Lebanese") or has_place_token(text, "Hezbollah")


def has_foreign_place_without_lebanon_context(text: str) -> bool:
    return any(has_place_token(text, hint) for hint in FOREIGN_PLACE_HINTS) and not has_lebanon_context(text)


def match_locations(text: str) -> list[Location]:
    if has_foreign_place_without_lebanon_context(text):
        return []
    matches: list[Location] = []
    for place in FALLBACK_GAZETTEER:
        names = [place["name"], place.get("name_ar", ""), *place.get("aliases", [])]
        found = False
        for name in sorted([name for name in names if name], key=len, reverse=True):
            if has_place_token(text, name):
                found = True
                break
        if found:
            matches.append(Location(**{key: place[key] for key in ["name", "name_ar", "district", "caza", "governorate", "lat", "lng"]}, match_confidence=0.88))
    return matches


def map_display_values(cluster: GeoTaggedCluster) -> dict[str, object]:
    location = cluster.primary_location
    if not location or cluster.location_precision == "unknown":
        return {
            "map_marker_kind": "unmapped",
            "map_precision_label": "Unmapped",
            "map_radius_meters": 0,
            "map_warning": "No precise place is available yet, so this item should not be read as a mapped event.",
        }

    if cluster.location_precision == "exact":
        return {
            "map_marker_kind": "pin",
            "map_precision_label": "Named place pin",
            "map_radius_meters": 2500,
            "map_warning": "The place name was matched, but the claim still needs the source checks listed in the record.",
        }

    return {
        "map_marker_kind": "representative-area",
        "map_precision_label": "Representative area",
        "map_radius_meters": BROAD_AREA_RADII.get(location.name, 18000),
        "map_warning": "This is a representative center for a broader place mention, not a street-level pin.",
    }


def geo_tag(clusters: list[GeoTaggedCluster]) -> list[GeoTaggedCluster]:
    tagged: list[GeoTaggedCluster] = []
    for cluster in clusters:
        source_titles = " ".join(
            source_record.split(": ", 1)[1]
            if ": " in source_record
            else source_record
            for source_record in cluster.who_says_so
        )
        text = " ".join([cluster.headline, source_titles])
        locations = match_locations(text)
        if not locations:
            locations = [
                Location(
                    name="Location unclear",
                    name_ar="",
                    district="Unlocated",
                    caza="Unlocated",
                    governorate="Unlocated",
                    lat=33.86,
                    lng=35.72,
                    match_confidence=0.2,
                )
            ]
            missing = cluster.what_is_missing
            if "precise place" not in missing:
                missing = "Missing: a precise place, " + missing.removeprefix("Missing: ")
            updated = cluster.model_copy(
                update={
                    "location_precision": "unknown",
                    "where": "Place not established",
                    "recommended_next_check": (
                        "Look for a named place and time in Lebanese local reporting, an opposing source, "
                        "and a wire or regional source before treating this as actionable."
                    ),
                    "what_is_missing": missing,
                    "locations": locations,
                    "primary_location": locations[0],
                }
            )
        else:
            broad_places = {"Lebanon", "South Lebanon", "Mount Lebanon", "Litani River"}
            if locations[0].name in broad_places or locations[0].match_confidence < 0.5:
                precision = "district"
                locations = [
                    locations[0].model_copy(update={"match_confidence": min(locations[0].match_confidence, 0.52)}),
                    *locations[1:],
                ]
            else:
                precision = "exact"
            updated = cluster.model_copy(
                update={
                    "location_precision": precision,
                    "where": locations[0].name,
                    "locations": locations,
                    "primary_location": locations[0],
                }
            )
        tagged.append(updated.model_copy(update=map_display_values(updated)))
    return tagged


def district_aggregates(clusters: list[GeoTaggedCluster]) -> list[DistrictAggregate]:
    by_district: dict[str, Counter[str]] = {}
    for cluster in clusters:
        district = cluster.primary_location.district if cluster.primary_location else "Unlocated"
        if district not in by_district:
            by_district[district] = Counter()
        for tag in cluster.signal_tags or ["political-maneuver"]:
            by_district[district][tag] += 1
    return [
        DistrictAggregate(district=district, event_count=sum(counter.values()), dominant_signal_tag=counter.most_common(1)[0][0])
        for district, counter in sorted(by_district.items())
    ]


def events_geojson(clusters: list[GeoTaggedCluster]) -> dict:
    features = []
    for cluster in clusters:
        location = cluster.primary_location
        if not location or cluster.location_precision == "unknown":
            continue
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [location.lng, location.lat]},
                "properties": {
                    "cluster_id": cluster.id,
                    "headline": cluster.headline,
                    "signal_tags": cluster.signal_tags,
                    "confidence": cluster.confidence,
                    "frameworks": cluster.frameworks,
                    "district": location.district,
                    "analysis_short": cluster.analysis[:220],
                    "published_at": cluster.published_at.isoformat(),
                    "match_confidence": location.match_confidence,
                    "severity": cluster.severity,
                    "location_precision": cluster.location_precision,
                    "confirmation_status": cluster.confirmation_status,
                    "claim_side": cluster.claim_side,
                    "recommended_next_check": cluster.recommended_next_check,
                    "source_lanes": cluster.source_lanes,
                    "civilian_impact_flags": cluster.civilian_impact_flags,
                    "what_is_missing": cluster.what_is_missing,
                    "verification_status": cluster.verification_status,
                    "verification_label": cluster.verification.label,
                    "verification_missing": cluster.verification.missing,
                    "map_marker_kind": cluster.map_marker_kind,
                    "map_precision_label": cluster.map_precision_label,
                    "map_radius_meters": cluster.map_radius_meters,
                    "map_warning": cluster.map_warning,
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


def write_fallback_districts(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(FALLBACK_DISTRICTS, indent=2), encoding="utf-8")
