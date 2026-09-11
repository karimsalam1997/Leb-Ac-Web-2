from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from hashlib import sha1
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
import re
import socket
import ssl
import urllib.error
import urllib.request
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

import certifi

from tools.signal_desk.config import load_feeds
from tools.signal_desk.models import RawItem, SourceHealth, SourceHealthErrorKind


class AnchorExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.anchors: list[tuple[str, str]] = []
        self._href: str | None = None
        self._chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href")
        if not href:
            return
        self._href = href
        self._chunks = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "a" or self._href is None:
            return
        title = strip_html(" ".join(self._chunks))
        self.anchors.append((self._href, title))
        self._href = None
        self._chunks = []


def strip_html(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", unescape(value or ""))).strip()


def text_of(element: ET.Element, name: str) -> str:
    found = element.find(name)
    return strip_html(found.text if found is not None and found.text else "")


def child_text(element: ET.Element, names: list[str]) -> str:
    for child in list(element):
        local_name = child.tag.rsplit("}", 1)[-1]
        if local_name in names and child.text:
            return strip_html(child.text)
    return ""


def parse_date(value: str) -> datetime | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except Exception:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except Exception:
            return None


def entry_id(source_name: str, url: str, title: str) -> str:
    return sha1(f"{source_name}:{url}:{title}".encode("utf-8")).hexdigest()[:16]


def snapshot_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "source"


def snapshot_candidates(snapshot_dir: Path, feed: dict) -> list[Path]:
    slug = snapshot_slug(str(feed["name"]))
    if feed.get("kind") == "html_index":
        extensions = [".html", ".htm"]
    else:
        extensions = [".xml", ".rss", ".atom"]
    return [snapshot_dir / f"{slug}{extension}" for extension in extensions]


def find_snapshot(snapshot_dir: Path, feed: dict) -> Path | None:
    for candidate in snapshot_candidates(snapshot_dir, feed):
        if candidate.is_file():
            return candidate
    return None


def list_setting(feed: dict, key: str, default: list[str]) -> list[str]:
    value = feed.get(key, default)
    if value is None:
        return default
    if isinstance(value, str):
        return [value]
    return [str(item) for item in value]


def snapshot_missing_health(feed: dict, snapshot_dir: Path) -> SourceHealth:
    expected = ", ".join(candidate.name for candidate in snapshot_candidates(snapshot_dir, feed))
    return SourceHealth(
        source=str(feed["name"]),
        ok=False,
        item_count=0,
        note=f"Missing cached source snapshot in {snapshot_dir}: expected one of {expected}.",
        error_kind="snapshot-missing",
    )


def error_kind(exc: Exception) -> SourceHealthErrorKind:
    if isinstance(exc, urllib.error.HTTPError):
        return "http-error"
    if isinstance(exc, ET.ParseError):
        return "parse-error"
    if isinstance(exc, urllib.error.URLError):
        reason = exc.reason
        if isinstance(reason, socket.gaierror):
            return "dns-error"
        if isinstance(reason, (TimeoutError, socket.timeout)):
            return "timeout"
        if isinstance(reason, ssl.SSLError):
            return "tls-error"
        return "fetch-error"
    if isinstance(exc, (TimeoutError, socket.timeout)):
        return "timeout"
    if isinstance(exc, ssl.SSLError):
        return "tls-error"
    return "fetch-error"


def failed_health(source: str, exc: Exception) -> SourceHealth:
    return SourceHealth(source=source, ok=False, item_count=0, note=str(exc)[:180], error_kind=error_kind(exc))


def parse_feed_xml(feed: dict, since: datetime, xml: bytes, raw_extra: dict | None = None) -> list[RawItem]:
    name = str(feed["name"])
    raw_extra = raw_extra or {}
    root = ET.fromstring(xml)

    items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
    output: list[RawItem] = []

    for item in items[:35]:
        title = text_of(item, "title") or child_text(item, ["title"])
        link = text_of(item, "link") or child_text(item, ["link"])
        if not link:
            atom_link = item.find("{http://www.w3.org/2005/Atom}link")
            link = atom_link.get("href", "") if atom_link is not None else ""
        summary = (
            text_of(item, "description")
            or text_of(item, "summary")
            or child_text(item, ["description", "summary", "content"])
        )
        published_at = parse_date(
            text_of(item, "pubDate")
            or text_of(item, "published")
            or text_of(item, "updated")
            or child_text(item, ["pubDate", "published", "updated"])
        )
        # A missing date is not silently replaced with the collection time. That
        # made old or undated links look new on the public desk.
        if published_at is None:
            continue
        if published_at < since:
            continue
        if not title and not summary:
            continue

        output.append(
            RawItem(
                id=entry_id(name, link, title),
                source_id=name,
                source_type="rss",
                source_bias=str(feed.get("bias", "")),
                lang=str(feed.get("lang", "en")),
                title=title or "Untitled source item",
                text=summary or title,
                url=link,
                published_at=published_at,
                raw={"tier": feed.get("tier", 2), **raw_extra},
            )
        )

    return output


def fetch_feed(feed: dict, since: datetime) -> tuple[list[RawItem], SourceHealth]:
    name = str(feed["name"])
    url = str(feed["url"])
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; LebaneseAcademicSignalDesk/0.2; +https://lebaneseacademic.com)",
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.6, */*;q=0.3",
        },
    )
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        with urllib.request.urlopen(request, timeout=14, context=ssl_context) as response:
            xml = response.read()
        output = parse_feed_xml(feed, since, xml)
    except Exception as exc:
        return [], failed_health(name, exc)

    return output, SourceHealth(source=name, ok=True, item_count=len(output), error_kind="ok")


def parse_html_index(feed: dict, since: datetime, html: str, raw_extra: dict | None = None) -> list[RawItem]:
    name = str(feed["name"])
    raw_extra = raw_extra or {}
    base_url = str(feed["url"])
    link_patterns = [pattern.lower() for pattern in list_setting(feed, "link_patterns", ["/article/"])]
    terms = [term.lower() for term in list_setting(feed, "terms", [])]

    parser = AnchorExtractor()
    parser.feed(html)
    seen: set[str] = set()
    output: list[RawItem] = []
    for href, title in parser.anchors:
        link = urljoin(base_url, href)
        haystack = f"{title} {link}".lower()
        if not title or link in seen:
            continue
        if link_patterns and not any(pattern in link.lower() for pattern in link_patterns):
            continue
        if terms and not any(term in haystack for term in terms):
            continue
        seen.add(link)
        output.append(
            RawItem(
                id=entry_id(name, link, title),
                source_id=name,
                source_type="rss",
                source_bias=str(feed.get("bias", "")),
                lang=str(feed.get("lang", "en")),
                title=title[:180],
                text=title,
                url=link,
                published_at=datetime.now(timezone.utc),
                raw={"tier": feed.get("tier", 2), "html_index": True, "since": since.isoformat(), **raw_extra},
            )
        )
        if len(output) >= int(feed.get("limit", 18)):
            break

    return output


def fetch_html_index(feed: dict, since: datetime) -> tuple[list[RawItem], SourceHealth]:
    name = str(feed["name"])
    url = str(feed["url"])
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; LebaneseAcademicSignalDesk/0.2; +https://lebaneseacademic.com)",
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.6",
        },
    )
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        with urllib.request.urlopen(request, timeout=14, context=ssl_context) as response:
            html = response.read().decode("utf-8", "ignore")
        output = parse_html_index(feed, since, html)
    except Exception as exc:
        return [], failed_health(name, exc)

    return output, SourceHealth(source=name, ok=True, item_count=len(output), note="Read from public homepage because RSS was blocked or unavailable.", error_kind="ok")


def read_snapshot(feed: dict, since: datetime, snapshot_dir: Path) -> tuple[list[RawItem], SourceHealth] | None:
    path = find_snapshot(snapshot_dir, feed)
    if path is None:
        return None

    raw_extra = {"rss_snapshot": True, "snapshot_path": str(path), "snapshot_dir": str(snapshot_dir)}
    try:
        if path.suffix.lower() in {".html", ".htm"}:
            items = parse_html_index(feed, since, path.read_text(encoding="utf-8", errors="ignore"), raw_extra)
        else:
            items = parse_feed_xml(feed, since, path.read_bytes(), raw_extra)
    except Exception as exc:
        return [], SourceHealth(source=str(feed["name"]), ok=False, item_count=0, note=f"Snapshot parse failed for {path.name}: {exc}", error_kind=error_kind(exc))

    return items, SourceHealth(
        source=str(feed["name"]),
        ok=True,
        item_count=len(items),
        note=f"Read cached source snapshot from {path.name}; not counted as live reporting.",
        error_kind="snapshot",
    )


def fallback_items(since: datetime) -> list[RawItem]:
    now = datetime.now(timezone.utc)
    samples = [
        {
            "source": "Signal Desk fallback",
            "bias": "Local fallback sample, not live reporting",
            "title": "Israeli warnings and Lebanese displacement pressure converge on Tyre",
            "text": "Warnings, border strikes, and displacement pressure around Tyre and south Lebanon point to the same structural fact: civilians are being pushed to live around a military timetable they do not control.",
            "url": "https://lebaneseacademic.com/signal-desk",
            "tags": ["Tyre", "south Lebanon", "displacement"],
        },
        {
            "source": "Signal Desk fallback",
            "bias": "Local fallback sample, not live reporting",
            "title": "Cabinet paralysis keeps Beirut inside the profitable dysfunction machine",
            "text": "In Beirut, the language of reform keeps circling the same disabled institutions while private actors collect fees from the broken public system.",
            "url": "https://lebaneseacademic.com/signal-desk",
            "tags": ["Beirut", "reform", "economic"],
        },
    ]
    return [
        RawItem(
            id=entry_id(sample["source"], sample["url"], sample["title"]),
            source_id=sample["source"],
            source_type="rss",
            source_bias=sample["bias"],
            lang="en",
            title=sample["title"],
            text=sample["text"],
            url=sample["url"],
            published_at=now,
            raw={"fallback": True, "since": since.isoformat(), "tags": sample["tags"]},
        )
        for sample in samples
    ]


def collect(since: datetime, snapshot_dir: Path | None = None, snapshot_only: bool = False) -> tuple[list[RawItem], list[SourceHealth]]:
    all_items: list[RawItem] = []
    health: list[SourceHealth] = []

    def collect_one(feed: dict) -> tuple[list[RawItem], SourceHealth]:
        snapshot_result = read_snapshot(feed, since, snapshot_dir) if snapshot_dir else None
        if snapshot_result is not None:
            return snapshot_result
        if snapshot_only and snapshot_dir:
            return [], snapshot_missing_health(feed, snapshot_dir)
        if feed.get("kind") == "html_index":
            return fetch_html_index(feed, since)
        return fetch_feed(feed, since)

    feeds = load_feeds()
    # Source requests are independent. Fetching them together keeps a failed or
    # slow website from turning the morning run into a ten-minute queue.
    with ThreadPoolExecutor(max_workers=min(8, max(1, len(feeds)))) as executor:
        results = list(executor.map(collect_one, feeds))

    for items, status in results:
        all_items.extend(items)
        health.append(status)

    if not all_items:
        all_items = fallback_items(since)
        health.append(SourceHealth(source="fallback", ok=True, item_count=len(all_items), note="No live RSS items available; emitted review-only sample data.", error_kind="fallback"))

    return all_items, health
