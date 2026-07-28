from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha1
import json
import os
from typing import Callable
from urllib.parse import urlencode
import urllib.request

from tools.signal_desk.config import load_optional_config, resolve_project_path
from tools.signal_desk.models import MediaItem, RawItem, SourceHealth


RequestJson = Callable[[str, dict[str, str], dict[str, str]], dict]
RECENT_SEARCH_URL = "https://api.x.com/2/tweets/search/recent"


def parse_date(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def default_request_json(url: str, headers: dict[str, str], params: dict[str, str]) -> dict:
    request = urllib.request.Request(f"{url}?{urlencode(params)}", headers=headers)
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read())


def account_query(accounts: list[dict], keywords: list[str]) -> str:
    handles = [str(account.get("handle", "")).lstrip("@") for account in accounts]
    handles = [handle for handle in handles if handle]
    account_part = " OR ".join(f"from:{handle}" for handle in handles)
    keyword_part = " OR ".join(f'"{keyword}"' if " " in keyword else keyword for keyword in keywords if keyword)
    return f"({account_part}) ({keyword_part}) -is:retweet"


def raw_item(
    post: dict,
    users: dict[str, dict],
    accounts: dict[str, dict],
    *,
    media: dict[str, dict] | None = None,
    places: dict[str, dict] | None = None,
    referenced_posts: dict[str, dict] | None = None,
) -> RawItem:
    author = users.get(str(post.get("author_id")), {})
    handle = str(author.get("username", "unknown")).lstrip("@")
    account = accounts.get(handle.lower(), {})
    text = str(post.get("text", "")).strip()
    post_id = str(post.get("id", ""))
    url = f"https://x.com/{handle}/status/{post_id}"
    media_index = media or {}
    place_index = places or {}
    referenced_index = referenced_posts or {}
    media_items = [
        MediaItem(
            type=str(media_index[key].get("type", "unknown")),
            url=str(
                media_index[key].get("url")
                or media_index[key].get("preview_image_url")
                or ""
            ),
        )
        for key in post.get("attachments", {}).get("media_keys", [])
        if key in media_index
        and (
            media_index[key].get("url")
            or media_index[key].get("preview_image_url")
        )
    ]
    place = place_index.get(str(post.get("geo", {}).get("place_id", "")), {})
    quoted_reference = next(
        (
            reference
            for reference in post.get("referenced_tweets", [])
            if reference.get("type") == "quoted"
        ),
        None,
    )
    quoted_post = (
        referenced_index.get(str(quoted_reference.get("id", "")), {})
        if quoted_reference
        else {}
    )
    return RawItem(
        id=sha1(f"x:{post_id}".encode("utf-8")).hexdigest()[:16],
        source_id=f"X · @{handle}",
        source_type="x",
        source_bias=str(account.get("bias", "Public X account. Carry claims with direct attribution.")),
        lang=str(post.get("lang") or account.get("lang") or "und"),
        title=text[:180] or f"Post by @{handle}",
        text=text,
        url=url,
        published_at=parse_date(str(post["created_at"])),
        media=media_items,
        raw={
            "tier": account.get("tier", 2),
            "x_post_id": post_id,
            "x_author_id": post.get("author_id"),
            "x_handle": handle,
            "public_metrics": post.get("public_metrics", {}),
            "conversation_id": post.get("conversation_id"),
            "place": place,
            "referenced_tweets": post.get("referenced_tweets", []),
            "quoted_post": quoted_post,
        },
    )


def collect_snapshot(
    path_value: str,
    since: datetime,
    accounts: list[dict],
) -> tuple[list[RawItem], list[SourceHealth]]:
    path = resolve_project_path(path_value)
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        account_index = {str(account.get("handle", "")).lstrip("@").lower(): account for account in accounts}
        posts = list(payload.get("posts", []))
        users = {
            str(index): {
                "id": str(index),
                "username": str(post.get("username", "")).lstrip("@"),
            }
            for index, post in enumerate(posts)
        }
        normalized: list[RawItem] = []
        for index, post in enumerate(posts):
            candidate = {
                **post,
                "author_id": str(index),
            }
            item = raw_item(candidate, users, account_index)
            if item.published_at >= since:
                item = item.model_copy(
                    update={
                        "raw": {
                            **item.raw,
                            "x_snapshot": True,
                            "observed_at": payload.get("observed_at", ""),
                        }
                    }
                )
                normalized.append(item)
        return normalized, [
            SourceHealth(
                source="X public-profile snapshot",
                ok=True,
                item_count=len(normalized),
                note=(
                    f"Used the saved public-profile snapshot observed at "
                    f"{payload.get('observed_at', 'an unknown time')}."
                ),
                error_kind="snapshot",
            )
        ]
    except Exception as exc:
        return [], [
            SourceHealth(
                source="X public-profile snapshot",
                ok=False,
                item_count=0,
                note=f"Could not read {path}: {str(exc)[:120]}",
                error_kind="snapshot-missing",
            )
        ]


def collect(
    since: datetime,
    *,
    token: str | None = None,
    config: dict | None = None,
    request_json: RequestJson | None = None,
) -> tuple[list[RawItem], list[SourceHealth]]:
    settings = config if config is not None else load_optional_config("x.yaml")
    if not settings.get("enabled", True):
        return [], [SourceHealth(source="X API", ok=True, item_count=0, note="X collection is disabled.")]

    accounts = [account for account in settings.get("accounts", []) if account.get("enabled", True)]
    if not accounts:
        return [], [SourceHealth(source="X API", ok=True, item_count=0, note="No X accounts are configured.")]

    bearer = token if token is not None else os.environ.get("X_BEARER_TOKEN", "")
    if not bearer:
        snapshot_path = str(settings.get("snapshot_path", "")).strip()
        if snapshot_path:
            return collect_snapshot(snapshot_path, since, accounts)
        return [], [
            SourceHealth(
                source="X API",
                ok=False,
                item_count=0,
                note="Set X_BEARER_TOKEN to collect the configured public accounts.",
                error_kind="auth-missing",
            )
        ]

    keywords = list(settings.get("keywords", ["Lebanon", "Lebanese", "Beirut", "Hezbollah", "لبنان", "الجنوب"]))
    query = account_query(accounts, keywords)
    base_params = {
        "query": query,
        "start_time": since.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "max_results": str(max(10, min(int(settings.get("max_results", 100)), 100))),
        "tweet.fields": (
            "author_id,created_at,lang,public_metrics,conversation_id,"
            "attachments,geo,referenced_tweets"
        ),
        "expansions": (
            "author_id,attachments.media_keys,geo.place_id,"
            "referenced_tweets.id,referenced_tweets.id.author_id"
        ),
        "user.fields": "name,username",
        "media.fields": "media_key,type,url,preview_image_url,width,height,alt_text",
        "place.fields": "id,full_name,name,country,country_code,geo",
    }
    requester = request_json or default_request_json
    try:
        headers = {
            "Authorization": f"Bearer {bearer}",
            "User-Agent": "LebaneseAcademicSignalDesk/1.0",
        }
        max_pages = max(1, min(int(settings.get("max_pages", 5)), 20))
        page_count = 0
        pagination_token = ""
        posts: list[dict] = []
        users: dict[str, dict] = {}
        media: dict[str, dict] = {}
        places: dict[str, dict] = {}
        referenced_posts: dict[str, dict] = {}

        while page_count < max_pages:
            params = {
                **base_params,
                **({"pagination_token": pagination_token} if pagination_token else {}),
            }
            payload = requester(RECENT_SEARCH_URL, headers, params)
            includes = payload.get("includes", {})
            posts = [*posts, *payload.get("data", [])]
            users = {
                **users,
                **{str(user.get("id")): user for user in includes.get("users", [])},
            }
            media = {
                **media,
                **{
                    str(item.get("media_key")): item
                    for item in includes.get("media", [])
                    if item.get("media_key")
                },
            }
            places = {
                **places,
                **{
                    str(place.get("id")): place
                    for place in includes.get("places", [])
                    if place.get("id")
                },
            }
            referenced_posts = {
                **referenced_posts,
                **{
                    str(tweet.get("id")): tweet
                    for tweet in includes.get("tweets", [])
                    if tweet.get("id")
                },
            }
            page_count += 1
            pagination_token = str(payload.get("meta", {}).get("next_token", ""))
            if not pagination_token:
                break

        account_index = {str(account.get("handle", "")).lstrip("@").lower(): account for account in accounts}
        items = [
            raw_item(
                post,
                users,
                account_index,
                media=media,
                places=places,
                referenced_posts=referenced_posts,
            )
            for post in posts
            if post.get("id") and post.get("author_id") and post.get("created_at")
        ]
        return items, [
            SourceHealth(
                source="X API",
                ok=True,
                item_count=len(items),
                note=(
                    f"Read {len(items)} recent posts across {page_count} "
                    f"{'page' if page_count == 1 else 'pages'} from "
                    f"{len(accounts)} configured public accounts through the official X API."
                ),
            )
        ]
    except Exception as exc:
        return [], [
            SourceHealth(
                source="X API",
                ok=False,
                item_count=0,
                note=str(exc)[:180],
                error_kind="fetch-error",
            )
        ]
