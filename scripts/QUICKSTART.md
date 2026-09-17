# Quick Start Guide - Update Ticket Links

A simple guide for updating ticket booking links in your show schedules.

## TL;DR

```bash
# One command: logs into Biletomat, fetches events, updates all month YAMLs
mise run update-links

# Review and commit
git diff _data/spektakle/
git add _data/spektakle/
git commit -m "Update ticket links"
```

No more saving HTML by hand — the login and event export are automated.

## How it works

`mise run update-links` runs two steps (chained via mise `depends`):

1. **`fetch-events`** — `scripts/fetch_biletomat_events.py` logs into
   `eventadmin.biletomat.pl` (Event Admin PLG) headlessly with Playwright,
   reads the organizer's events straight from the JSON API
   (`api.biletomat.pl/repertoire/events`), and writes a normalized
   `_data/spektakle/new_events.json`.
2. **update** — `scripts/update_spektakle_links.py` reads that JSON and fills
   the `link:` field of every matching show across **all** month YAML files.

You don't pass a month — every `_data/spektakle/*.yml` is updated in one pass.

## Prerequisites (one-time)

Credentials are injected by mise from the age-encrypted `[env]` block in
`mise.toml`. If they aren't set yet (or after a password rotation):

```bash
mise set --age-encrypt --prompt BILETOMAT_USER   # you type the value
mise set --age-encrypt --prompt BILETOMAT_PASS
```

The first `mise run fetch-events` downloads the Playwright Chromium browser
automatically (~95 MB).

## Reviewing the output

The update step prints, per month file:

- `+` **Updated** — a new link was added
- `!` **Fixed** — a wrong link was corrected
- `?` **No match in Biletomat** — a YAML show with no matching event yet
  (normal — the event hasn't been created in Biletomat, link stays `-`)

Then check and commit:

```bash
git diff _data/spektakle/
git add _data/spektakle/
git commit -m "Update ticket links"
git push
```

## Troubleshooting

### `BILETOMAT_USER is not set`

The credentials aren't in mise. Set them (see Prerequisites) and run again.

### `Login did not complete (still on /login)`

The stored username/password were rejected. Re-set them, or debug interactively:

```bash
mise exec -- uv run scripts/fetch_biletomat_events.py --headed
```

### `Did not observe the events API request` / `No events array found`

Biletomat may have changed their UI or API. Inspect what the page loads:

```bash
mise exec -- uv run scripts/fetch_biletomat_events.py --recon
```

This dumps every JSON response to `_data/spektakle/.biletomat_debug/` (gitignored)
so the events endpoint and field names can be re-confirmed in
`fetch_biletomat_events.py`.

### All shows show "No match in Biletomat"

Check that show titles and times in the YAML exactly match Biletomat (the match
is on title + Warsaw wall-clock time), and that the events actually exist for
this organizer.

### Script updated the wrong events

Review with `git diff`. To undo: `git checkout -- _data/spektakle/`.

## Need Help?

- `scripts/README.md` — detailed documentation
- `scripts/CLAUDE_INSTRUCTIONS.md` — technical details
- Ask Claude: "Run mise run update-links and review the diff"
