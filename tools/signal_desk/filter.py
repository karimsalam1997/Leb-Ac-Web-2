from __future__ import annotations

import re

from tools.signal_desk.models import CanonicalItem, ScoredItem, SignalTag

TAG_TERMS: dict[SignalTag, list[str]] = {
    "casualty": ["killed", "wounded", "casualty", "martyr", "dead", "injured", "شهيد", "قتيل", "جرحى", "مصاب"],
    "strike-claim": ["strike", "rocket", "missile", "drone", "idf", "hezbollah", "attack", "shelling", "غارة", "قصف", "صاروخ", "مسيّرة"],
    "rhetoric-shift": ["speech", "warning", "threat", "statement", "vow", "rhetoric", "تهديد", "تحذير", "بيان"],
    "displacement": ["displaced", "evacuation", "evacuate", "flee", "shelter", "نزوح", "نازحين", "إخلاء"],
    "humanitarian": ["humanitarian", "emergency", "relief", "aid", "health", "hospital", "resilience", "مساعدات", "إغاثة", "صحة", "مستشفى"],
    "political-maneuver": ["cabinet", "parliament", "minister", "president", "patriarch", "election", "ceasefire", "negotiation", "talks", "agreement", "sovereignty", "stability", "instability", "government", "الحكومة", "مجلس النواب", "وزير", "رئيس", "بطريرك", "انتخابات", "مفاوضات", "اتفاق", "سيادة"],
    "economic": ["bank", "currency", "inflation", "budget", "deposit", "electricity", "generator", "fuel", "diesel", "investment", "million", "business", "dining", "مصرف", "ليرة", "كهرباء", "موازنة", "مازوت", "استثمار"],
    "heritage": ["heritage", "solidere", "archaeology", "museum", "downtown", "memory", "تراث", "آثار", "متحف"],
}

SCOPE_TERMS = [
    "lebanon",
    "beirut",
    "hezbollah",
    "hizballah",
    "tyre",
    "sidon",
    "bekaa",
    "south lebanon",
    "dahiyeh",
    "blue line",
    "لبنان",
    "بيروت",
    "حزب الله",
    "الجنوب",
    "النبطية",
    "صور",
    "صيدا",
    "البقاع",
]


def contains_term(text: str, term: str) -> bool:
    if re.search(r"[\u0600-\u06ff]", term):
        return term.lower() in text.lower()
    return bool(re.search(rf"(?<!\w){re.escape(term.lower())}(?!\w)", text.lower()))


def tags_for(text: str) -> list[SignalTag]:
    lowered = text.lower()
    tags: list[SignalTag] = []
    for tag, terms in TAG_TERMS.items():
        if any(contains_term(lowered, term) for term in terms):
            tags.append(tag)
    return tags or ["political-maneuver"]


def score_item(item: CanonicalItem) -> float:
    text = f"{item.title} {item.text}".lower()
    scope_hits = sum(1 for term in SCOPE_TERMS if contains_term(text, term))
    tag_hits = sum(1 for terms in TAG_TERMS.values() for term in terms if contains_term(text, term))
    tier_bonus = 0.1 if item.raw.get("tier") == 1 else 0
    return min(1, 0.2 + scope_hits * 0.14 + tag_hits * 0.04 + tier_bonus)


def filter_items(items: list[CanonicalItem]) -> list[ScoredItem]:
    scored: list[ScoredItem] = []
    for item in items:
        relevance = score_item(item)
        text = f"{item.title} {item.text}".lower()
        has_scope = any(contains_term(text, term) for term in SCOPE_TERMS)
        has_signal = any(contains_term(text, term) for terms in TAG_TERMS.values() for term in terms)
        in_scope = (has_scope and has_signal) or bool(item.raw.get("fallback"))
        if not in_scope:
            continue
        text_en = re.sub(r"\s+", " ", item.text).strip()
        payload = item.model_dump()
        payload["in_scope"] = in_scope
        scored.append(
            ScoredItem(
                **payload,
                relevance=relevance,
                text_en=text_en,
                signal_tags=tags_for(f"{item.title} {item.text}"),
            )
        )
    return sorted(scored, key=lambda item: (item.relevance, item.published_at), reverse=True)[:60]
