from __future__ import annotations

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from hashlib import sha1
from html import unescape
import re
import ssl
from typing import Callable
from urllib.parse import parse_qs, urlparse
import urllib.request
import xml.etree.ElementTree as ET

import certifi

from tools.signal_desk.config import load_optional_config
from tools.signal_desk.models import RawItem, SourceHealth


TranscriptFetcher = Callable[[str, list[str]], object]


def strip_html(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", unescape(value or ""))).strip()


def local_text(element: ET.Element, name: str) -> str:
    for child in list(element):
        if child.tag.rsplit("}", 1)[-1] == name and child.text:
            return strip_html(child.text)
    return ""


def parse_date(value: str) -> datetime:
    try:
        parsed = parsedate_to_datetime(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now().astimezone()


def item_id(source: str, url: str, title: str) -> str:
    return sha1(f"youtube:{source}:{url}:{title}".encode("utf-8")).hexdigest()[:16]


def feed_url(channel: dict) -> str:
    channel_id = channel.get("channel_id")
    if channel_id:
        return f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    url = str(channel.get("url", ""))
    if "/channel/" in url:
        return f"https://www.youtube.com/feeds/videos.xml?channel_id={url.rsplit('/channel/', 1)[-1].split('/')[0]}"
    return ""


def video_id_from_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.hostname in {"youtu.be", "www.youtu.be"}:
        return parsed.path.strip("/").split("/")[0]
    if parsed.path == "/watch":
        return parse_qs(parsed.query).get("v", [""])[0]
    if "/shorts/" in parsed.path:
        return parsed.path.split("/shorts/", 1)[-1].split("/")[0]
    return ""


def default_transcript_fetcher(video_id: str, languages: list[str]) -> object:
    from youtube_transcript_api import YouTubeTranscriptApi

    return YouTubeTranscriptApi().fetch(video_id, languages=languages)


def transcript_text(
    video_id: str,
    languages: list[str],
    *,
    fetcher: TranscriptFetcher | None = None,
) -> tuple[str, str]:
    if not video_id:
        return "", "metadata-only"
    try:
        transcript = (fetcher or default_transcript_fetcher)(video_id, languages)
        segments: list[str] = []
        for segment in transcript:  # type: ignore[union-attr]
            value = segment.get("text", "") if isinstance(segment, dict) else getattr(segment, "text", "")
            cleaned = strip_html(str(value))
            if cleaned:
                segments.append(cleaned)
        text = " ".join(segments).strip()
        return (text[:30000], "transcript") if text else ("", "metadata-only")
    except Exception:
        return "", "metadata-only"


def collect_channel(
    channel: dict,
    since: datetime,
    transcript_config: dict | None = None,
) -> tuple[list[RawItem], SourceHealth]:
    url = feed_url(channel)
    name = str(channel.get("id") or channel.get("url") or "youtube")
    if not url:
        return [], SourceHealth(source=f"YouTube {name}", ok=False, item_count=0, note="Missing YouTube channel_id.")

    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 SignalDesk"})
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    try:
        with urllib.request.urlopen(request, timeout=14, context=ssl_context) as response:
            root = ET.fromstring(response.read())
    except Exception as exc:
        return [], SourceHealth(source=f"YouTube {name}", ok=False, item_count=0, note=str(exc)[:160])

    source_name = local_text(root, "title") or f"YouTube {name}"
    output: list[RawItem] = []
    transcript_settings = transcript_config or {}
    transcript_enabled = bool(transcript_settings.get("enabled", False))
    transcript_languages = list(transcript_settings.get("languages", ["ar", "en"]))
    transcript_limit = max(0, int(transcript_settings.get("max_videos_per_channel", 2)))
    transcript_attempts = 0
    transcript_successes = 0
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        title = local_text(entry, "title")
        published_at = parse_date(local_text(entry, "published") or local_text(entry, "updated"))
        if published_at < since:
            continue
        link_node = entry.find("{http://www.w3.org/2005/Atom}link")
        link = link_node.get("href", "") if link_node is not None else ""
        description = local_text(entry, "group") or title
        transcript = ""
        transcript_status = "disabled"
        video_id = video_id_from_url(link)
        if transcript_enabled and transcript_attempts < transcript_limit:
            transcript_attempts += 1
            transcript, transcript_status = transcript_text(video_id, transcript_languages)
            if transcript_status == "transcript":
                transcript_successes += 1
        output.append(
            RawItem(
                id=item_id(source_name, link, title),
                source_id=f"YouTube {source_name}",
                source_type="youtube",
                source_bias=str(channel.get("bias", "YouTube analysis source.")),
                lang=str(channel.get("lang", "en")),
                title=title or "YouTube video",
                text=transcript or description or title,
                url=link,
                published_at=published_at,
                raw={
                    "tier": channel.get("tier", 2),
                    "youtube_channel_id": channel.get("channel_id"),
                    "youtube_video_id": video_id,
                    "transcript_status": transcript_status,
                    "transcript_characters": len(transcript),
                },
            )
        )
    note = "Read public YouTube channel RSS."
    if transcript_enabled:
        note = (
            f"Read public YouTube channel RSS and attached {transcript_successes} "
            f"{'transcript' if transcript_successes == 1 else 'transcripts'} from {transcript_attempts} attempts."
        )
    return output, SourceHealth(source=f"YouTube {source_name}", ok=True, item_count=len(output), note=note)


def collect(since: datetime) -> tuple[list[RawItem], list[SourceHealth]]:
    config = load_optional_config("youtube.yaml")
    enabled = [channel for channel in config.get("channels", []) if channel.get("enabled")]
    transcript_config = config.get("transcripts", {})
    if not enabled:
        return [], [SourceHealth(source="youtube", ok=True, item_count=0, note="No YouTube channels enabled yet.")]
    items: list[RawItem] = []
    health: list[SourceHealth] = []
    for channel in enabled:
        channel_items, channel_health = collect_channel(channel, since, transcript_config)
        items.extend(channel_items)
        health.append(channel_health)
    return items, health
