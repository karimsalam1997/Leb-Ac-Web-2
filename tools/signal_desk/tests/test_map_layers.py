from __future__ import annotations

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT / "public" / "data" / "signal-desk"


def read_geojson(name: str) -> dict:
    with (DATA_DIR / name).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def all_positions(coordinates: object):
    if (
        isinstance(coordinates, list)
        and len(coordinates) >= 2
        and all(isinstance(value, (int, float)) for value in coordinates[:2])
    ):
        yield coordinates
        return
    if isinstance(coordinates, list):
        for value in coordinates:
            yield from all_positions(value)


class MapLayersTest(unittest.TestCase):
    def test_battlefield_layers_have_dated_sources_and_valid_coordinates(self) -> None:
        data = read_geojson("battlefield.geojson")
        kinds = {feature["properties"]["kind"] for feature in data["features"]}

        self.assertEqual(kinds, {"yellow-line", "red-zone"})
        for feature in data["features"]:
            properties = feature["properties"]
            self.assertTrue(properties["label"])
            self.assertTrue(properties["source_url"].startswith("http"))
            self.assertRegex(properties["as_of"], r"^\d{4}-\d{2}-\d{2}$")
            self.assertEqual(properties["as_of"], "2026-04-23")
            self.assertIn(properties["precision"], {"reported", "approximate", "surveyed"})
            for lng, lat, *_ in all_positions(feature["geometry"]["coordinates"]):
                self.assertGreaterEqual(lng, 34.7)
                self.assertLessEqual(lng, 36.8)
                self.assertGreaterEqual(lat, 32.8)
                self.assertLessEqual(lat, 34.8)

    def test_public_boundary_and_district_files_are_real_collections(self) -> None:
        boundary = read_geojson("lebanon-boundary.geojson")
        districts = read_geojson("lebanon-districts.geojson")

        self.assertGreaterEqual(len(boundary["features"]), 1)
        self.assertGreaterEqual(len(districts["features"]), 26)
        self.assertTrue(all(feature.get("geometry") for feature in districts["features"]))


if __name__ == "__main__":
    unittest.main()
