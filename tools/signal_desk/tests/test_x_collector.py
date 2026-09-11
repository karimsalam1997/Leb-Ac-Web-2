from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest

from tools.signal_desk.collectors import x_api
from tools.signal_desk.config import load_optional_config


NOW = datetime(2026, 7, 27, 7, 0, tzinfo=timezone.utc)


class XCollectorTest(unittest.TestCase):
    def test_requested_accounts_and_arabic_search_terms_are_configured(self) -> None:
        config = load_optional_config("x.yaml")
        handles = {account["handle"] for account in config["accounts"]}

        self.assertTrue({"AlarabyTV", "Lebanon24", "kon_mowaten"}.issubset(handles))
        self.assertTrue({"حزب الله", "إسرائيل", "بنت جبيل"}.issubset(config["keywords"]))

    def test_missing_token_is_visible_without_crashing_the_run(self) -> None:
        items, health = x_api.collect(
            NOW,
            token="",
            config={"enabled": True, "accounts": [{"handle": "MarioLeb79"}]},
        )

        self.assertEqual(items, [])
        self.assertEqual(health[0].error_kind, "auth-missing")
        self.assertFalse(health[0].ok)

    def test_saved_public_profile_snapshot_keeps_the_prototype_working(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            snapshot_path = Path(directory) / "x.json"
            snapshot_path.write_text(
                json.dumps(
                    {
                        "observed_at": "2026-07-27T07:00:00Z",
                        "posts": [
                            {
                                "id": "123",
                                "username": "MarioLeb79",
                                "created_at": "2026-07-27T06:40:00Z",
                                "lang": "en",
                                "text": "A reported military development near Taybeh in southern Lebanon.",
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            items, health = x_api.collect(
                datetime(2026, 7, 27, 6, 0, tzinfo=timezone.utc),
                token="",
                config={
                    "enabled": True,
                    "snapshot_path": str(snapshot_path),
                    "accounts": [{"handle": "MarioLeb79", "bias": "Personal Lebanon feed"}],
                },
            )

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].source_id, "X · @MarioLeb79")
        self.assertTrue(health[0].ok)
        self.assertEqual(health[0].error_kind, "snapshot")

    def test_posts_are_normalized_with_handle_and_original_url(self) -> None:
        requests: list[tuple[str, dict[str, str], dict[str, str]]] = []

        def request_json(url: str, headers: dict[str, str], params: dict[str, str]) -> dict:
            requests.append((url, headers, params))
            return {
                "data": [
                    {
                        "id": "1234567890",
                        "author_id": "101",
                        "created_at": "2026-07-27T06:40:00.000Z",
                        "lang": "en",
                        "text": "Video from the road east of Tyre after a reported strike.",
                    },
                    {
                        "id": "2234567890",
                        "author_id": "202",
                        "created_at": "2026-07-27T06:45:00.000Z",
                        "lang": "en",
                        "text": "Lebanon update: traffic moving north from the border districts.",
                    },
                ],
                "includes": {
                    "users": [
                        {"id": "101", "username": "MarioLeb79", "name": "Mario Leb"},
                        {"id": "202", "username": "MarioNawfal", "name": "Mario Nawfal"},
                    ]
                },
                "meta": {"result_count": 2},
            }

        items, health = x_api.collect(
            datetime(2026, 7, 27, 6, 0, tzinfo=timezone.utc),
            token="unit-test",
            config={
                "enabled": True,
                "accounts": [
                    {"handle": "MarioLeb79", "bias": "Personal Lebanon war feed", "tier": 2},
                    {"handle": "MarioNawfal", "bias": "Large breaking-news account", "tier": 2},
                ],
                "keywords": ["Lebanon", "Tyre", "الجنوب", "لبنان"],
                "max_results": 50,
            },
            request_json=request_json,
        )

        self.assertEqual(len(items), 2)
        self.assertEqual(items[0].source_type, "x")
        self.assertEqual(items[0].source_id, "X · @MarioLeb79")
        self.assertEqual(items[0].url, "https://x.com/MarioLeb79/status/1234567890")
        self.assertEqual(items[1].source_id, "X · @MarioNawfal")
        self.assertTrue(health[0].ok)
        self.assertEqual(health[0].item_count, 2)
        self.assertEqual(requests[0][1]["Authorization"], "Bearer unit-test")
        self.assertIn("from:MarioLeb79", requests[0][2]["query"])
        self.assertIn("Lebanon", requests[0][2]["query"])

    def test_recent_search_paginates_and_preserves_context_fields(self) -> None:
        requests: list[dict[str, str]] = []

        def request_json(url: str, headers: dict[str, str], params: dict[str, str]) -> dict:
            requests.append(dict(params))
            page = len(requests)
            if page == 1:
                return {
                    "data": [
                        {
                            "id": "first",
                            "author_id": "101",
                            "created_at": "2026-07-27T06:40:00.000Z",
                            "lang": "en",
                            "text": "Lebanon report with a quoted military claim.",
                            "attachments": {"media_keys": ["media-one"]},
                            "geo": {"place_id": "place-one"},
                            "referenced_tweets": [{"type": "quoted", "id": "quoted-one"}],
                            "conversation_id": "thread-one",
                        }
                    ],
                    "includes": {
                        "users": [{"id": "101", "username": "UNIFIL_", "name": "UNIFIL"}],
                        "media": [{"media_key": "media-one", "type": "photo", "url": "https://example.com/photo.jpg"}],
                        "places": [{"id": "place-one", "full_name": "South Lebanon"}],
                        "tweets": [{"id": "quoted-one", "text": "Original quoted claim"}],
                    },
                    "meta": {"result_count": 1, "next_token": "page-two"},
                }
            return {
                "data": [
                    {
                        "id": "second",
                        "author_id": "101",
                        "created_at": "2026-07-27T06:45:00.000Z",
                        "lang": "en",
                        "text": "A second Lebanon report.",
                        "conversation_id": "thread-two",
                    }
                ],
                "includes": {
                    "users": [{"id": "101", "username": "UNIFIL_", "name": "UNIFIL"}],
                },
                "meta": {"result_count": 1},
            }

        items, health = x_api.collect(
            datetime(2026, 7, 27, 6, 0, tzinfo=timezone.utc),
            token="unit-test",
            config={
                "enabled": True,
                "accounts": [{"handle": "UNIFIL_", "bias": "Official UN account", "tier": 1}],
                "keywords": ["Lebanon"],
                "max_results": 10,
                "max_pages": 3,
            },
            request_json=request_json,
        )

        self.assertEqual(len(items), 2)
        self.assertEqual(len(requests), 2)
        self.assertEqual(requests[1]["pagination_token"], "page-two")
        self.assertEqual(items[0].raw["conversation_id"], "thread-one")
        self.assertEqual(items[0].raw["place"]["full_name"], "South Lebanon")
        self.assertEqual(items[0].raw["quoted_post"]["text"], "Original quoted claim")
        self.assertEqual(items[0].media[0].url, "https://example.com/photo.jpg")
        self.assertIn("attachments", requests[0]["tweet.fields"])
        self.assertIn("attachments.media_keys", requests[0]["expansions"])
        self.assertIn("2 pages", health[0].note)


if __name__ == "__main__":
    unittest.main()
