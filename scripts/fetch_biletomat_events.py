# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright>=1.40", "tzdata"]
# ///
"""
Log into eventadmin.biletomat.pl and capture the organizer's events list,
writing a normalized JSON file that update_spektakle_links.py consumes.

This replaces the old manual step of hand-saving the events page as
_data/spektakle/new_events_raw.html — the new Event Admin PLG SPA renders a
different markup and serves the events over a JSON API, which we intercept.

Credentials are read from the environment (injected by mise, never printed):
    BILETOMAT_USER, BILETOMAT_PASS
Optional:
    BILETOMAT_ORGANIZER_ID   (default: 333)

Usage:
    uv run scripts/fetch_biletomat_events.py [--recon] [--headed]

    --recon   Dump every JSON response seen after login to
              _data/spektakle/.biletomat_debug/ so the events endpoint and
              field names can be confirmed. Also implied on first setup.
    --headed  Run with a visible browser window (debugging).
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
from zoneinfo import ZoneInfo

from playwright.sync_api import sync_playwright

DATA_DIR = Path("_data/spektakle")
OUT_JSON = DATA_DIR / "new_events.json"
DEBUG_DIR = DATA_DIR / ".biletomat_debug"
WARSAW = ZoneInfo("Europe/Warsaw")

ORGANIZER_ID = os.environ.get("BILETOMAT_ORGANIZER_ID", "333")
BASE = "https://eventadmin.biletomat.pl"
LOGIN_URL = f"{BASE}/login"
LIST_URL = f"{BASE}/events/list?organizerId={ORGANIZER_ID}"

# The Event Admin SPA loads the events list from this JSON endpoint. We intercept
# the SPA's own authenticated request, then replay it page-by-page so the result
# is complete even when there are more events than fit on the first page.
EVENTS_API_MARK = "api.biletomat.pl/repertoire/events?"
PAGE_SIZE = 200


def require_env(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        sys.exit(
            f"Error: {name} is not set. It is injected by mise from the "
            f"age-encrypted [env] block in mise.toml — run this via "
            f"`mise run fetch-events` (or `mise run update-links`)."
        )
    return val


def to_warsaw_wallclock(raw) -> str | None:
    """Normalize an API date value to 'DD.MM.YYYY HH:MM' Warsaw wall-clock.

    The month YAML files store show times as Warsaw wall-clock (labelled with a
    'Z' suffix), and update_spektakle_links.py keys events on that string, so we
    must produce the same representation here regardless of the API's format.
    """
    if raw is None:
        return None
    dt = None
    if isinstance(raw, (int, float)):
        # epoch — seconds vs milliseconds
        secs = raw / 1000 if raw > 1e12 else raw
        dt = datetime.fromtimestamp(secs, tz=ZoneInfo("UTC"))
    elif isinstance(raw, str):
        s = raw.strip()
        m = re.match(r"^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{2}):(\d{2})", s)
        if m:  # already DD.MM.YYYY HH:MM (assume Warsaw wall-clock)
            d, mo, y, h, mi = m.groups()
            return f"{d}.{mo}.{y} {h}:{mi}"
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return None
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(WARSAW)
    return dt.strftime("%d.%m.%Y %H:%M")


def normalize_events(events_raw) -> list[dict]:
    """Map Biletomat event objects to {id, title, date} entries.

    Each event's `displayDateTime` is an ISO timestamp with a Warsaw offset
    (e.g. 2026-09-19T12:30:00+02:00); to_warsaw_wallclock() renders it as the
    'DD.MM.YYYY HH:MM' Warsaw wall-clock string update_spektakle_links.py keys on.
    """
    out = []
    for e in events_raw:
        eid = e.get("id")
        title = e.get("title") or (e.get("show") or {}).get("title")
        date = to_warsaw_wallclock(
            e.get("displayDateTime") or e.get("startsDateTime")
            or (e.get("displayPeriod") or {}).get("startsAt")
        )
        if eid is None or not title or date is None:
            continue
        out.append({
            "id": str(eid),
            "title": re.sub(r"\s+", " ", str(title)).strip(),
            "date": date,
        })
    return out


def fetch_all_pages(request, sample_url: str, auth: str | None) -> list[dict]:
    """Replay the SPA's events request across every page, returning all content.

    `sample_url` is the exact events URL the SPA called (carrying organizerId,
    sort and dateFrom); we keep its filters, bump the page size, and walk pages
    until the API reports the last one.
    """
    parsed = urlparse(sample_url)
    params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
    params["size"] = str(PAGE_SIZE)
    headers = {"Authorization": auth} if auth else {}

    content: list[dict] = []
    page = 0
    while True:
        params["page"] = str(page)
        url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{urlencode(params)}"
        resp = request.get(url, headers=headers)
        if not resp.ok:
            raise SystemExit(
                f"Events API returned HTTP {resp.status} for page {page} ({url})."
            )
        body = resp.json()
        content.extend(body.get("content", []))
        if body.get("last", True) or page >= body.get("totalPages", 1) - 1:
            break
        page += 1
    return content


def main() -> None:
    recon = "--recon" in sys.argv
    headed = "--headed" in sys.argv

    user = require_env("BILETOMAT_USER")
    password = require_env("BILETOMAT_PASS")

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    captured: list[tuple[str, object]] = []
    events_req: dict = {"url": None, "auth": None}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        context = browser.new_context()
        page = context.new_page()

        def on_response(resp):
            if EVENTS_API_MARK in resp.url and events_req["url"] is None:
                events_req["url"] = resp.url
                events_req["auth"] = (resp.request.headers or {}).get("authorization")
            if not recon:
                return
            if "application/json" not in (resp.headers or {}).get("content-type", ""):
                return
            try:
                captured.append((resp.url, resp.json()))
            except Exception:
                pass

        page.on("response", on_response)

        # --- Login ---
        page.goto(LOGIN_URL, wait_until="networkidle")
        page.locator('input:not([type="password"])').first.fill(user)
        page.locator('input[type="password"]').first.fill(password)
        page.locator('button[type="submit"]').first.click()
        try:
            page.wait_for_url(lambda u: "/login" not in u, timeout=20000)
        except Exception:
            sys.exit(
                "Login did not complete (still on /login). Check BILETOMAT_USER/"
                "BILETOMAT_PASS, or run with --headed to watch."
            )

        # --- Events list: trigger the SPA's events request, then page it fully ---
        page.goto(LIST_URL, wait_until="networkidle")
        page.wait_for_timeout(2500)  # let the events XHR fire

        if recon:
            _dump_recon(captured)

        if not events_req["url"]:
            sys.exit(
                "Did not observe the events API request. Re-run with --recon "
                "(and --headed) to inspect what the page loaded."
            )

        events_raw = fetch_all_pages(context.request, events_req["url"], events_req["auth"])
        browser.close()

    events = normalize_events(events_raw)
    if not events:
        keys = list(events_raw[0].keys()) if events_raw else "(none returned)"
        sys.exit(
            f"Fetched {len(events_raw)} raw events but mapped 0. Keys seen: {keys}. "
            f"Adjust normalize_events()."
        )

    OUT_JSON.write_text(json.dumps(events, ensure_ascii=False, indent=2))
    print(f"Captured {len(events)} events for organizer {ORGANIZER_ID}")
    print(f"Wrote {OUT_JSON}")
    for e in events[:10]:
        print(f"  {e['date']} — {e['title']} (ID: {e['id']})")
    if len(events) > 10:
        print(f"  … and {len(events) - 10} more")


def _dump_recon(captured) -> None:
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    index = []
    for i, (url, body) in enumerate(captured):
        fn = DEBUG_DIR / f"resp_{i:02d}.json"
        fn.write_text(json.dumps(body, ensure_ascii=False, indent=2))
        if isinstance(body, list):
            shape = f"list[{len(body)}]"
        elif isinstance(body, dict):
            shape = f"dict keys={list(body.keys())[:12]}"
        else:
            shape = type(body).__name__
        index.append({"file": fn.name, "url": url, "shape": shape})
    (DEBUG_DIR / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2))
    print(f"[recon] wrote {len(captured)} JSON responses to {DEBUG_DIR}/")
    for row in index:
        print(f"  {row['file']}  {row['shape']}\n            {row['url']}")


if __name__ == "__main__":
    main()
