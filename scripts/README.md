# Scripts for Maskarada Teatr

This directory contains automation scripts for managing the Maskarada website.

## Updating ticket links (automated)

Two scripts, wired as mise tasks, keep the ticket booking links in the show
YAMLs up to date. Login and event export are automated — you don't save any HTML.

```bash
mise run update-links      # fetch (headless login + JSON API) + update, in one go
```

- **`fetch_biletomat_events.py`** — logs into `eventadmin.biletomat.pl` (Event
  Admin PLG) headlessly with Playwright using `BILETOMAT_USER` / `BILETOMAT_PASS`
  (injected by mise from the age-encrypted `[env]` block in `mise.toml`), reads
  the organizer's events from the JSON API (`api.biletomat.pl/repertoire/events`),
  and writes normalized `_data/spektakle/new_events.json`.
- **`update_spektakle_links.py`** — reads `new_events.json` and fills the `link:`
  field of every matching show across all `_data/spektakle/*.yml` files.

### Prerequisites

- [mise](https://mise.jdx.dev/) and [uv](https://docs.astral.sh/uv/) installed.
- Credentials set once (age-encrypted, safe to commit as ciphertext):
  ```bash
  mise set --age-encrypt --prompt BILETOMAT_USER
  mise set --age-encrypt --prompt BILETOMAT_PASS
  ```
- First run downloads Playwright's Chromium (~95 MB) automatically.

### Individual commands

```bash
mise run fetch-events                                   # only refresh new_events.json
python3 scripts/update_spektakle_links.py               # only apply it to the YAMLs
mise exec -- uv run scripts/fetch_biletomat_events.py --recon    # debug: dump API responses
mise exec -- uv run scripts/fetch_biletomat_events.py --headed   # debug: watch the browser
```

### How It Works

1. **Fetch:** `fetch_biletomat_events.py` intercepts the SPA's own authenticated
   request to `api.biletomat.pl/repertoire/events`, replays it page-by-page
   (so all events are captured, not just the first page), and normalizes each to
   `{id, title, date}` — date as `DD.MM.YYYY HH:MM` in Warsaw wall-clock time.

2. **Reads YAML:** `update_spektakle_links.py` processes every month YAML file.

3. **Matches Entries:** Compares by exact title and date/time match
   (Warsaw wall-clock). If `new_events.json` is missing it falls back to the
   legacy `new_events_raw.html` parser (old Biletomat Angular UI).

4. **Updates Links:** Constructs URLs in format:
   ```
   https://biletomat.pl/embedded/rezerwacja/{EVENT_ID}
   ```

5. **Handles Edge Cases:**
   - Skips entries already having correct links
   - Fixes mismatched links
   - Reports entries without matching HTML data
   - Preserves YAML formatting

### Output

The script provides detailed output:

```
✓ Updating: Show Title @ Date -> Event ID xxx     (new link added)
  Already correct: Show Title @ Date -> Event ID  (no change needed)
⚠ Fixing mismatch: Show Title @ Date             (wrong link corrected)
✗ No match found: Show Title @ Date              (no HTML data available)
```

### Limitations

- Only processes events that exist in both HTML and YAML
- Entries without HTML data remain unchanged (with `link: '-'`)
- Requires exact match of both title and date/time
- Assumes HTML follows Biletomat's standard Angular format

### Troubleshooting

**No matches found:**
- Verify HTML file contains the events
- Check that dates in YAML match dates in HTML
- Ensure titles are identical

**Script fails to run:**
- Check file paths are correct
- Ensure Python 3 is installed
- Verify you're in the project root directory

**Wrong links updated:**
- Review the git diff carefully
- The script shows old vs new for mismatches
- You can always revert with `git checkout -- <file>`

## Future Scripts

Additional scripts can be added here for:
- Batch image processing for show galleries
- Generating show calendars
- Validating YAML structure
- etc.
