from __future__ import annotations

from datetime import datetime, timezone
import unittest

from tools.signal_desk.analyze import confirmation_status_for, evidence_excerpt, related_headlines
from tools.signal_desk.collectors.rss import parse_date
from tools.signal_desk.filter import filter_items, tags_for
from tools.signal_desk.geo import geo_tag
from tools.signal_desk.models import CanonicalItem, ScoredItem
from tools.signal_desk.models import GeoTaggedCluster
from tools.signal_desk.review import apply_review_overrides
from tools.signal_desk.source_lanes import lane_for


NOW = datetime(2026, 7, 27, 5, 0, tzinfo=timezone.utc)


def scored(title: str, source: str = "Test source") -> ScoredItem:
    return ScoredItem(
        id=f"{source}-{title}",
        source_id=source,
        source_type="rss",
        source_bias="test",
        lang="en",
        title=title,
        text=title,
        url=f"https://example.com/{abs(hash(title))}",
        published_at=NOW,
        raw={"tier": 1},
        dedupe_key=f"key-{abs(hash(title))}",
        also_seen_in=[],
        in_scope=True,
        relevance=0.8,
        text_en=title,
        signal_tags=["strike-claim"],
    )


def canonical(title: str) -> CanonicalItem:
    return CanonicalItem(
        id=title,
        source_id="Test source",
        source_type="rss",
        source_bias="test",
        lang="en",
        title=title,
        text=title,
        url="https://example.com/item",
        published_at=NOW,
        raw={"tier": 1},
        dedupe_key=title,
        also_seen_in=[],
        in_scope=True,
    )


class EvidenceRulesTest(unittest.TestCase):
    def test_bilingual_telegram_item_uses_the_english_rendering_in_analysis(self) -> None:
        text = (
            "استعاد الصليب الأحمر الجثمان على طريق المنصوري. "
            "The Red Cross recovered the body on the Mansouri road."
        )

        self.assertEqual(
            evidence_excerpt(text, "fallback"),
            "The Red Cross recovered the body on the Mansouri road.",
        )

    def test_telegram_outlets_are_classified_by_source_not_platform(self) -> None:
        bint_jbeil = scored(
            "Local report from the Mansouri road",
            "Telegram · Bint Jbeil News",
        ).model_copy(update={"source_type": "telegram"})
        al_arabiya = scored(
            "Regional diplomatic bulletin",
            "Telegram · Al Arabiya Breaking",
        ).model_copy(update={"source_type": "telegram"})

        self.assertEqual(lane_for(bint_jbeil), "lebanese-local")
        self.assertEqual(lane_for(al_arabiya), "wires-regional")

    def test_israeli_military_wording_keeps_the_claim_in_the_israeli_lane(self) -> None:
        item = scored(
            "IDF: Israeli military says ten militants were killed near Taybeh",
            "X · @RapidAccount",
        ).model_copy(update={"source_type": "x"})

        self.assertEqual(lane_for(item), "israeli-establishment")

    def test_publisher_name_does_not_become_the_event_location(self) -> None:
        base = GeoTaggedCluster(
            id="publisher-place",
            item_ids=["one"],
            headline="A body was recovered on the Mansouri road in Tyre district",
            analysis="A local report from the road.",
            confidence="low",
            sources_span=["Telegram · Bint Jbeil News"],
            what_to_watch="Watch the local record.",
            published_at=NOW,
            who_says_so=[
                "Telegram · Bint Jbeil News: A body was recovered on the Mansouri road in Tyre district"
            ],
        )

        result = geo_tag([base])[0]

        self.assertEqual(result.primary_location.name, "Tyre")

    def test_missing_date_is_not_made_current(self) -> None:
        self.assertIsNone(parse_date(""))
        self.assertIsNone(parse_date("not a date"))

    def test_two_sources_do_not_automatically_become_reviewed(self) -> None:
        items = [
            scored("Drone strike reported near Tyre port", "Source A"),
            scored("Drone strike reported near Tyre port", "Source B"),
        ]
        self.assertEqual(confirmation_status_for(items), "partly-corroborated")

    def test_close_headlines_can_be_grouped(self) -> None:
        left = scored("Drone strike reported near Tyre port")
        right = scored("Tyre port hit in reported drone strike", "Second source")
        self.assertTrue(related_headlines(left, right))

    def test_broad_lebanon_words_do_not_merge_unrelated_stories(self) -> None:
        left = scored("Drone strike reported near Tyre port")
        right = scored("Lebanon cabinet debates 2027 public budget", "Second source")
        self.assertFalse(related_headlines(left, right))

    def test_global_story_is_not_in_scope_only_because_source_is_tier_one(self) -> None:
        result = filter_items([canonical("Election results announced in Brazil")])
        self.assertEqual(result, [])

    def test_arabic_lebanon_story_is_in_scope(self) -> None:
        result = filter_items([canonical("الجيش يصدر بياناً عن الوضع في الجنوب اللبناني")])
        self.assertEqual(len(result), 1)

    def test_aid_does_not_match_the_word_said(self) -> None:
        tags = tags_for("Nharkom Said discusses Lebanon diesel fuel crisis")
        self.assertNotIn("humanitarian", tags)
        self.assertIn("economic", tags)

    def test_only_human_ledger_can_award_reviewed_status(self) -> None:
        base = GeoTaggedCluster(
            id="review-test",
            item_ids=["one"],
            headline="A reported development",
            analysis="Analysis",
            confidence="low",
            what_to_watch="Watch",
            published_at=NOW,
            urls=["https://example.com/reported-development"],
            confirmation_status="single-source",
        )
        result = apply_review_overrides(
            [base],
            {
                "reviews": [
                    {
                        "primary_url": "https://example.com/reported-development",
                        "reviewed_at": "2026-07-27",
                        "note": "Place and time checked.",
                    }
                ]
            },
        )
        self.assertEqual(result[0].confirmation_status, "corroborated")
        self.assertEqual(base.confirmation_status, "single-source")


if __name__ == "__main__":
    unittest.main()
