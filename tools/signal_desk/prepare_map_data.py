from __future__ import annotations

import json
from pathlib import Path
import ssl
import urllib.request

import certifi

from tools.signal_desk.config import PUBLIC_DATA_DIR


ADM0_URL = (
    "https://github.com/wmgeolab/geoBoundaries/raw/90a1d52/"
    "releaseData/gbOpen/LBN/ADM0/geoBoundaries-LBN-ADM0.geojson"
)
ADM2_URL = (
    "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/"
    "releaseData/gbOpen/LBN/ADM2/geoBoundaries-LBN-ADM2.geojson"
)

YELLOW_LINE = [
    [35.19287, 33.16792],
    [35.22693, 33.15125],
    [35.26726, 33.16554],
    [35.32983, 33.15414],
    [35.35884, 33.15475],
    [35.39012, 33.16615],
    [35.42226, 33.15916],
    [35.46780, 33.19358],
    [35.46469, 33.22202],
    [35.46402, 33.24990],
    [35.42866, 33.29539],
    [35.46222, 33.32278],
    [35.50000, 33.31500],
    [35.52604, 33.33150],
    [35.54535, 33.30196],
    [35.59111, 33.36028],
    [35.62694, 33.35711],
    [35.64241, 33.32066],
    [35.69259, 33.32766],
    [35.70786, 33.39580],
    [35.77758, 33.43458],
]

SOUTHERN_BOUNDARY_EAST_TO_WEST = [
    [35.7870, 33.3360],
    [35.7350, 33.2830],
    [35.6760, 33.2390],
    [35.6160, 33.2380],
    [35.5660, 33.2440],
    [35.5200, 33.2110],
    [35.4770, 33.1260],
    [35.4350, 33.0960],
    [35.3830, 33.0720],
    [35.3350, 33.0750],
    [35.2860, 33.0910],
    [35.2390, 33.0900],
    [35.1900, 33.0760],
    [35.1500, 33.0870],
    [35.1060, 33.0900],
]

def read_remote_geojson(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": "LebaneseAcademicSignalDesk/1.0"})
    context = ssl.create_default_context(cafile=certifi.where())
    with urllib.request.urlopen(request, timeout=30, context=context) as response:
        return json.loads(response.read())


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def battlefield_geojson() -> dict:
    red_ring = [*YELLOW_LINE, *SOUTHERN_BOUNDARY_EAST_TO_WEST, YELLOW_LINE[0]]
    line_source = (
        "https://www.lemonde.fr/en/international/article/2026/04/23/"
        "in-lebanon-israel-establishes-an-uninhabited-buffer-zone-behind-a-yellow-line_6752747_4.html"
    )
    return {
        "type": "FeatureCollection",
        "name": "Lebanon battlefield reference layers",
        "metadata": {
            "description": (
                "Dated editorial reconstruction for the Lebanese Academic Signal Desk. "
                "The geometry is approximate and must not be used for navigation or personal safety."
            ),
            "updated_at": "2026-07-28",
        },
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Polygon", "coordinates": [red_ring]},
                "properties": {
                    "id": "israeli-designated-red-zone",
                    "kind": "red-zone",
                    "label": "Israeli-designated no-return and forward-operations zone",
                    "short_label": "Israeli-designated zone",
                    "description": (
                        "Approximate area south of the line published by the Israeli military. "
                        "This is Lebanese territory and the layer does not describe a legal border."
                    ),
                    "as_of": "2026-04-23",
                    "precision": "approximate",
                    "source_label": "Le Monde, April 23, 2026",
                    "source_url": line_source,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": YELLOW_LINE},
                "properties": {
                    "id": "yellow-line-2026-04-23",
                    "kind": "yellow-line",
                    "label": "Israeli-published “yellow line”",
                    "short_label": "Yellow line",
                    "description": (
                        "Approximate reconstruction through named villages. "
                        "It is a military line published by Israel, not Lebanon's legal border."
                    ),
                    "as_of": "2026-04-23",
                    "precision": "approximate",
                    "source_label": "Le Monde, April 23, 2026",
                    "source_url": line_source,
                },
            },
        ],
    }


def prepare(output_dir: Path = PUBLIC_DATA_DIR) -> None:
    boundary = read_remote_geojson(ADM0_URL)
    districts = read_remote_geojson(ADM2_URL)
    for feature in districts.get("features", []):
        properties = feature.setdefault("properties", {})
        properties["district"] = properties.get("shapeName", "")
        properties["source"] = "geoBoundaries LBN ADM2, 2021"
    for feature in boundary.get("features", []):
        properties = feature.setdefault("properties", {})
        properties["source"] = "geoBoundaries LBN ADM0, 2010"
    write_json(output_dir / "lebanon-boundary.geojson", boundary)
    write_json(output_dir / "lebanon-districts.geojson", districts)
    write_json(output_dir / "battlefield.geojson", battlefield_geojson())


if __name__ == "__main__":
    prepare()
    print(f"Signal Desk map data written to {PUBLIC_DATA_DIR}")
