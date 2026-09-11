from __future__ import annotations

import unittest

from tools.signal_desk.collectors.youtube import transcript_text


class YouTubeTranscriptTest(unittest.TestCase):
    def test_transcript_segments_become_searchable_source_text(self) -> None:
        def fetcher(video_id: str, languages: list[str]):
            self.assertEqual(video_id, "abc123")
            self.assertEqual(languages, ["ar", "en"])
            return [
                {"text": "The discussion begins in Beirut."},
                {"text": "The speaker then turns to the villages south of Tyre."},
            ]

        text, status = transcript_text("abc123", ["ar", "en"], fetcher=fetcher)

        self.assertEqual(
            text,
            "The discussion begins in Beirut. The speaker then turns to the villages south of Tyre.",
        )
        self.assertEqual(status, "transcript")

    def test_missing_caption_is_a_metadata_fallback(self) -> None:
        def fetcher(video_id: str, languages: list[str]):
            raise RuntimeError("captions disabled")

        text, status = transcript_text("abc123", ["ar", "en"], fetcher=fetcher)

        self.assertEqual(text, "")
        self.assertEqual(status, "metadata-only")


if __name__ == "__main__":
    unittest.main()
