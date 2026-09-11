from __future__ import annotations

from hashlib import sha1
import re

from tools.signal_desk.models import CanonicalItem, RawItem


def dedupe_key(item: RawItem) -> str:
    normalized = re.sub(r"\W+", " ", f"{item.title} {item.url}".lower()).strip()
    return sha1(normalized.encode("utf-8")).hexdigest()[:16]


def normalize(items: list[RawItem]) -> list[CanonicalItem]:
    by_key: dict[str, CanonicalItem] = {}
    for item in items:
        key = dedupe_key(item)
        if key in by_key:
            existing = by_key[key]
            by_key[key] = existing.model_copy(
                update={"also_seen_in": [*existing.also_seen_in, item.source_id]}
            )
            continue
        by_key[key] = CanonicalItem(**item.model_dump(), dedupe_key=key, also_seen_in=[])
    return list(by_key.values())
