from __future__ import annotations

from tools.signal_desk.models import GeoTaggedCluster


def apply_review_overrides(
    clusters: list[GeoTaggedCluster],
    config: dict,
) -> list[GeoTaggedCluster]:
    reviews = {
        str(review.get("primary_url")): review
        for review in config.get("reviews", [])
        if review.get("primary_url")
    }
    output: list[GeoTaggedCluster] = []
    for cluster in clusters:
        review = next((reviews[url] for url in cluster.urls if url in reviews), None)
        if review is None:
            output.append(cluster)
            continue
        reviewed_at = str(review.get("reviewed_at", "date not recorded"))
        note = str(review.get("note", "The source record was checked by the desk."))
        output.append(
            cluster.model_copy(
                update={
                    "confirmation_status": "corroborated",
                    "confidence": "high",
                    "what_is_missing": (
                        f"Human review recorded {reviewed_at}. Remaining caution: {note}"
                    ),
                }
            )
        )
    return output
