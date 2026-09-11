from __future__ import annotations

from datetime import datetime, timezone
import re
import unittest

from tools.signal_desk.models import Framework, GeoTaggedCluster, SourceCondition
from tools.signal_desk.synthesize import synthesize_daily_report


NOW = datetime(2026, 7, 27, 6, 30, tzinfo=timezone.utc)


def cluster(
    identifier: str,
    headline: str,
    *,
    place: str,
    source: str,
    tag: str,
    analysis: str,
    frameworks: list[str] | None = None,
) -> GeoTaggedCluster:
    return GeoTaggedCluster(
        id=identifier,
        item_ids=[identifier],
        headline=headline,
        frameworks=frameworks or [],
        analysis=analysis,
        confidence="medium",
        sources_span=[source],
        what_to_watch=f"Watch the next official or local report from {place}.",
        signal_tags=[tag],
        published_at=NOW,
        urls=[f"https://example.com/{identifier}"],
        severity="high" if tag == "strike-claim" else "moderate",
        location_precision="exact",
        claim_side="reported claim",
        confirmation_status="single-source",
        what_happened=analysis,
        where=place,
        why_it_matters=f"The report changes what residents and officials may expect around {place}.",
        what_is_missing="A fuller public record of the event.",
        recommended_next_check=f"Check municipal and field reporting from {place}.",
        who_says_so=[source],
    )


class DailyReportTest(unittest.TestCase):
    def test_report_is_driven_by_frameworks_and_ends_with_a_short_evidence_footer(self) -> None:
        clusters = [
            cluster(
                "tyre",
                "A strike was reported east of Tyre",
                place="Tyre",
                source="X · @MarioLeb79",
                tag="strike-claim",
                analysis=(
                    "The account posted video and described an Israeli strike east of Tyre. "
                    "The location and timing are carried as the account's report."
                ),
                frameworks=["security_pretext_ratchet"],
            ),
            cluster(
                "marjayoun",
                "Movement was reported near Marjayoun",
                place="Marjayoun",
                source="LBCI",
                tag="displacement",
                analysis=(
                    "LBCI reported renewed civilian movement around Marjayoun after overnight fire. "
                    "The item belongs in the public record because it describes a change in daily life."
                ),
                frameworks=["demographic_engineering"],
            ),
            cluster(
                "cabinet",
                "The cabinet returned to the southern file",
                place="Beirut",
                source="L'Orient Today",
                tag="political-maneuver",
                analysis=(
                    "Ministers in Beirut returned to the military and diplomatic position in the south. "
                    "The discussion shows how battlefield facts are being translated into state language."
                ),
                frameworks=["sovereignty_theatre"],
            ),
            cluster(
                "aid",
                "A municipal aid appeal was issued",
                place="Bint Jbeil",
                source="National News Agency Lebanon",
                tag="humanitarian",
                analysis=(
                    "A municipality in Bint Jbeil appealed for fuel and medical supplies. "
                    "The appeal ties battlefield pressure to the practical weakness of local institutions."
                ),
            ),
        ]
        condition = SourceCondition(
            status="healthy",
            label="Live source run",
            summary="Four source lanes returned current items.",
            caution="Each item keeps its original attribution.",
            live_source_count=4,
            total_source_health_count=4,
        )
        frameworks = [
            Framework(
                id="security_pretext_ratchet",
                name="The security pretext ratchet",
                definition="Israel converts an unenforceable demand into a lasting military or territorial gain.",
                test="Does a strike or buffer-zone claim advance the ratchet?",
            ),
            Framework(
                id="demographic_engineering",
                name="Demographic engineering",
                definition="Displacement can outlast the military justification used to produce it.",
                test="Does the displacement pattern serve a strategic purpose?",
            ),
            Framework(
                id="sovereignty_theatre",
                name="Sovereignty theatre",
                definition="A Lebanese sovereign act can formalize a decision made elsewhere.",
                test="Who drew the map and set the deadline?",
            ),
        ]

        report = synthesize_daily_report(clusters, NOW, condition, frameworks)
        word_count = len(re.findall(r"\b[\w’'-]+\b", report.body_markdown))

        self.assertGreaterEqual(word_count, 400)
        self.assertLessEqual(word_count, 1000)
        self.assertEqual(report.word_count, word_count)
        self.assertIn("Tyre", report.title)
        self.assertIn("X · @MarioLeb79", report.body_markdown)
        self.assertIn("LBCI", report.body_markdown)
        self.assertIn("The security pretext ratchet", report.body_markdown)
        self.assertIn("Demographic engineering", report.body_markdown)
        self.assertIn("## Evidence record", report.body_markdown)
        self.assertIn("single-source", report.body_markdown)
        self.assertEqual(
            report.frameworks_applied,
            ["security_pretext_ratchet", "demographic_engineering", "sovereignty_theatre"],
        )
        self.assertNotIn("## Still needs checking", report.body_markdown)
        self.assertNotIn("one family car", report.body_markdown)
        self.assertNotIn("as an AI", report.body_markdown.lower())

    def test_thin_day_does_not_force_a_framework(self) -> None:
        item = cluster(
            "routine",
            "A routine ministry notice was published",
            place="Beirut",
            source="National News Agency Lebanon",
            tag="political-maneuver",
            analysis="The ministry published a routine administrative notice in Beirut.",
        )

        report = synthesize_daily_report([item], NOW, frameworks=[])

        self.assertEqual(report.frameworks_applied, [])
        self.assertIn("No standing framework clears the test", report.body_markdown)
        self.assertLess(report.word_count, 500)

    def test_internal_location_placeholder_never_reaches_the_report(self) -> None:
        item = cluster(
            "national",
            "A national casualty statement was issued",
            place="Location unclear",
            source="Lebanese Ministry of Public Health",
            tag="casualty",
            analysis="The ministry issued a national casualty statement for Lebanon.",
        )

        report = synthesize_daily_report([item], NOW)

        self.assertNotIn("Location unclear", report.title)
        self.assertNotIn("Location unclear", report.dek)
        self.assertNotIn("Location unclear", report.body_markdown)


if __name__ == "__main__":
    unittest.main()
