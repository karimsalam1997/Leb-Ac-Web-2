from __future__ import annotations

from datetime import datetime, timezone
import unittest

from tools.signal_desk.collectors import telegram


SINCE = datetime(2026, 7, 24, 0, 0, tzinfo=timezone.utc)


TELEGRAM_HTML = """
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message text_not_supported_wrap js-widget_message"
       data-post="bintjbeilnews/189267">
    <div class="tgme_widget_message_text js-message_text" dir="auto">
      تمكن الصليب الأحمر والجيش اللبناني من سحب جثمان الشاب شادي الدرويش
      على طريق المنصوري - البياضة، بعد أن أطلقت قوة إسرائيلية النار عليه.
    </div>
    <a class="tgme_widget_message_date" href="https://t.me/bintjbeilnews/189267">
      <time datetime="2026-07-27T18:34:22+00:00">Jul 27</time>
    </a>
  </div>
</div>
"""


class TelegramCollectorTest(unittest.TestCase):
    def test_public_channel_post_is_collected_with_original_url_and_attribution(self) -> None:
        requested: list[str] = []

        def request_html(url: str) -> str:
            requested.append(url)
            return TELEGRAM_HTML

        items, health = telegram.collect_public_channels(
            {
                "channels": [
                    {
                        "handle": "bintjbeilnews",
                        "name": "Bint Jbeil News",
                        "lang": "ar",
                        "tier": 1,
                        "bias": "Lebanese local reporting rooted in the south.",
                        "pinned_posts": [189267],
                    }
                ]
            },
            SINCE,
            request_html=request_html,
        )

        self.assertEqual(requested, ["https://t.me/s/bintjbeilnews/189267"])
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].source_id, "Telegram · Bint Jbeil News")
        self.assertEqual(items[0].url, "https://t.me/bintjbeilnews/189267")
        self.assertEqual(items[0].lang, "ar")
        self.assertIn("شادي", items[0].text)
        self.assertTrue(health[0].ok)

    def test_duplicate_post_returned_by_several_channel_pages_is_kept_once(self) -> None:
        items, _ = telegram.collect_public_channels(
            {
                "channels": [
                    {
                        "handle": "bintjbeilnews",
                        "name": "Bint Jbeil News",
                        "pinned_posts": [189267, 189268],
                    }
                ]
            },
            SINCE,
            request_html=lambda _: TELEGRAM_HTML,
        )

        self.assertEqual(len(items), 1)

    def test_failed_public_channel_is_visible_in_source_health(self) -> None:
        def fail(_: str) -> str:
            raise TimeoutError("timed out")

        items, health = telegram.collect_public_channels(
            {"channels": [{"handle": "alarabiyaBr", "name": "Al Arabiya Breaking"}]},
            SINCE,
            request_html=fail,
        )

        self.assertEqual(items, [])
        self.assertFalse(health[0].ok)
        self.assertEqual(health[0].error_kind, "timeout")


if __name__ == "__main__":
    unittest.main()
