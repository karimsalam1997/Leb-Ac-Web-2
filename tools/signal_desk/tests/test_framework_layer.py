from __future__ import annotations

import unittest

from tools.signal_desk.analyze import choose_framework_ids, load_frameworks
from tools.signal_desk.config import load_framework_config


class StandingFrameworkLayerTest(unittest.TestCase):
    def test_all_eleven_standing_frameworks_are_loaded(self) -> None:
        frameworks = load_frameworks(load_framework_config())

        self.assertEqual(len(frameworks), 11)
        self.assertEqual(
            {framework.id for framework in frameworks},
            {
                "sovereignty_theatre",
                "franchise_sectarianism",
                "security_pretext_ratchet",
                "demographic_engineering",
                "compliance_arbitrage",
                "census_feudalism",
                "banking_mapped_heist",
                "reconstruction_land_assembly",
                "designed_dysfunction",
                "managed_decline_economy",
                "interregnum_patron_grip",
            },
        )
        self.assertTrue(all(framework.test for framework in frameworks))
        self.assertTrue(all(framework.refresh_queries for framework in frameworks))

    def test_framework_selection_uses_configured_tests_without_forcing_a_match(self) -> None:
        frameworks = load_frameworks(load_framework_config())

        selected = choose_framework_ids(
            "Israel announced another security buffer and retained hilltop positions after demanding total disarmament.",
            frameworks,
        )
        empty = choose_framework_ids(
            "A Beirut restaurant announced a new lunch menu.",
            frameworks,
        )

        self.assertIn("security_pretext_ratchet", selected)
        self.assertEqual(empty, [])


if __name__ == "__main__":
    unittest.main()
