from __future__ import annotations

from datetime import datetime
from hashlib import sha1
import html
import json
import re
import socket
import ssl
from typing import Callable
import urllib.error
import urllib.request

import certifi

from tools.signal_desk.config import load_optional_config, resolve_project_path
from tools.signal_desk.models import MediaItem, RawItem, SourceHealth


RequestHtml = Callable[[str], str]


def default_request_html(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "LebaneseAcademicSignalDesk/1.0"},
    )
    context = ssl.create_default_context(cafile=certifi.where())
    with urllib.request.urlopen(request, timeout=20, context=context) as response:
        return response.read().decode("utf-8", errors="replace")


def parse_telegram_date(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def title_from_caption(text: str) -> str:
    compact = " ".join(text.replace("\n", " ").split())
    compact = compact.replace("🟡", "").replace("🟢", "").replace("🚨", "").replace("⚔️", "")
    compact = compact.replace("Hezbollah: —", "Hezbollah:").replace("Video |", "").strip(" -")
    if not compact:
        return "Telegram field report"
    return compact[:132].rstrip()


def item_id(channel: str, post_id: object, url: str) -> str:
    return sha1(f"telegram:{channel}:{post_id}:{url}".encode("utf-8")).hexdigest()[:16]


def clean_telegram_html(value: str) -> str:
    with_breaks = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    without_tags = re.sub(r"<[^>]+>", " ", with_breaks)
    return re.sub(r"[ \t\r\f\v]+", " ", html.unescape(without_tags)).strip()


def parse_public_messages(
    page: str,
    *,
    channel: dict,
    since: datetime,
) -> list[RawItem]:
    handle = str(channel.get("handle", "")).lstrip("@")
    source_name = str(channel.get("name") or f"@{handle}")
    chunks = re.split(
        r'(?=<div class="tgme_widget_message_wrap\b)',
        page,
        flags=re.IGNORECASE,
    )
    items: list[RawItem] = []
    for chunk in chunks:
        post_match = re.search(r'data-post="([^"/]+)/(\d+)"', chunk)
        text_match = re.search(
            r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>',
            chunk,
            flags=re.IGNORECASE | re.DOTALL,
        )
        date_match = re.search(r'<time datetime="([^"]+)"', chunk)
        if not post_match or not text_match or not date_match:
            continue
        post_handle, post_id = post_match.groups()
        if post_handle.lower() != handle.lower():
            continue
        published_at = parse_telegram_date(date_match.group(1))
        if not published_at or published_at < since:
            continue
        text = clean_telegram_html(text_match.group(1))
        if not text:
            continue
        url = f"https://t.me/{post_handle}/{post_id}"
        photo_match = re.search(
            r"background-image:url\('([^']+)'\)",
            chunk,
            flags=re.IGNORECASE,
        )
        media = (
            [MediaItem(type="photo", url=html.unescape(photo_match.group(1)))]
            if photo_match
            else []
        )
        items.append(
            RawItem(
                id=item_id(post_handle, post_id, url),
                source_id=f"Telegram · {source_name}",
                source_type="telegram",
                source_bias=str(
                    channel.get(
                        "bias",
                        "Public Telegram reporting. Treat quoted official claims as attributed claims.",
                    )
                ),
                lang=str(channel.get("lang", "ar")),
                title=title_from_caption(text),
                text=text,
                url=url,
                published_at=published_at,
                media=media,
                raw={
                    "tier": channel.get("tier", 2),
                    "telegram_handle": post_handle,
                    "telegram_post_id": post_id,
                    "collection_mode": "public-web",
                },
            )
        )
    return items


def error_kind_for(exc: Exception) -> str:
    if isinstance(exc, (TimeoutError, socket.timeout)):
        return "timeout"
    if isinstance(exc, urllib.error.HTTPError):
        return "http-error"
    if isinstance(exc, urllib.error.URLError):
        if isinstance(exc.reason, (TimeoutError, socket.timeout)):
            return "timeout"
        if "Name or service not known" in str(exc.reason):
            return "dns-error"
        return "fetch-error"
    return "fetch-error"


def collect_public_channels(
    config: dict,
    since: datetime,
    *,
    request_html: RequestHtml | None = None,
) -> tuple[list[RawItem], list[SourceHealth]]:
    requester = request_html or default_request_html
    channels = [
        channel
        for channel in config.get("channels", [])
        if channel.get("enabled", True)
        and str(channel.get("handle", "")).strip()
        and str(channel.get("handle", "")).strip() != "@PLACEHOLDER"
    ]
    output_by_id: dict[str, RawItem] = {}
    health: list[SourceHealth] = []
    for channel in channels:
        handle = str(channel.get("handle", "")).lstrip("@")
        name = str(channel.get("name") or f"Telegram @{handle}")
        source_id = f"Telegram · {name}"
        pinned_posts = [str(post_id) for post_id in channel.get("pinned_posts", [])]
        urls = (
            [f"https://t.me/s/{handle}/{post_id}" for post_id in pinned_posts]
            if pinned_posts
            else [f"https://t.me/s/{handle}"]
        )
        channel_items: dict[str, RawItem] = {}
        errors: list[Exception] = []
        for url in urls:
            try:
                page_items = parse_public_messages(
                    requester(url),
                    channel=channel,
                    since=since,
                )
                channel_items = {
                    **channel_items,
                    **{item.id: item for item in page_items},
                }
            except Exception as exc:
                errors.append(exc)
        output_by_id = {**output_by_id, **channel_items}
        if channel_items or not errors:
            health.append(
                SourceHealth(
                    source=source_id,
                    ok=True,
                    item_count=len(channel_items),
                    note=(
                        f"Read {len(channel_items)} public Telegram "
                        f"{'post' if len(channel_items) == 1 else 'posts'} from @{handle}."
                    ),
                )
            )
        else:
            health.append(
                SourceHealth(
                    source=source_id,
                    ok=False,
                    item_count=0,
                    note=f"Could not read public Telegram page: {str(errors[0])[:140]}",
                    error_kind=error_kind_for(errors[0]),
                )
            )
    return list(output_by_id.values()), health


def collect_local_jsonl(config: dict, since: datetime) -> tuple[list[RawItem], list[SourceHealth]]:
    sources = config.get("local_jsonl_sources", [])
    output: list[RawItem] = []
    health: list[SourceHealth] = []
    for source in sources:
        path = resolve_project_path(str(source.get("path", "")))
        name = str(source.get("name") or path.stem)
        if not path.exists():
            health.append(SourceHealth(source=name, ok=False, item_count=0, note=f"Missing local Telegram JSONL: {path}"))
            continue

        count = 0
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                published_at = parse_telegram_date(payload.get("published_at_utc"))
                if not published_at or published_at < since:
                    continue
                text = str(payload.get("text") or "").strip()
                if not text:
                    continue
                channel = str(payload.get("channel") or name)
                url = str(payload.get("url") or "")
                media = []
                if payload.get("media_preview_url"):
                    media.append(MediaItem(type="preview", url=str(payload["media_preview_url"])))
                output.append(
                    RawItem(
                        id=item_id(channel, payload.get("post_id"), url),
                        source_id=f"Telegram @{channel}",
                        source_type="telegram",
                        source_bias=str(source.get("bias", "Telegram primary-source claim; keep as unverified until cross-checked.")),
                        lang=str(source.get("lang", "en")),
                        title=title_from_caption(text),
                        text=text,
                        url=url,
                        published_at=published_at,
                        media=media,
                        raw={
                            "tier": source.get("tier", 1),
                            "views": payload.get("views"),
                            "reactions": payload.get("reactions"),
                            "score": payload.get("score"),
                            "verification_note": payload.get("verification_note"),
                            "has_video": payload.get("has_video"),
                            "has_photo": payload.get("has_photo"),
                            "video_duration": payload.get("video_duration"),
                        },
                    )
                )
                count += 1

        health.append(SourceHealth(source=name, ok=True, item_count=count, note=f"Read local scraper output from {path.name}; no Telegram session file was touched."))
    return output, health


def collect(since: datetime) -> tuple[list[RawItem], list[SourceHealth]]:
    config = load_optional_config("telegram.yaml")
    local_items, local_health = collect_local_jsonl(config, since)
    public_items, public_health = collect_public_channels(config, since)
    if not public_health:
        return local_items, local_health + [SourceHealth(source="telegram-live", ok=True, item_count=0, note="No live Telegram handles configured yet.")]
    combined = {item.id: item for item in [*local_items, *public_items]}
    return list(combined.values()), [*local_health, *public_health]
