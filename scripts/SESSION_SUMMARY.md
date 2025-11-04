# Session Summary - Ticket Links Automation

**Date:** 2025-11-04
**Task:** Create automation for updating ticket booking links from HTML exports

## What Was Created

### 1. Main Script
**File:** `scripts/update_spektakle_links.py`

A Python script that:
- Extracts event data from Kicket HTML exports
- Matches events with YAML entries by title and date
- Updates YAML files with ticket booking URLs
- Handles edge cases (mismatches, missing data, etc.)

**Features:**
- No external dependencies (pure Python 3)
- Detailed progress reporting
- Safe: only updates mismatched or missing links
- Preserves YAML formatting

### 2. Documentation

**scripts/QUICKSTART.md**
- Simple step-by-step guide for end users
- Common troubleshooting scenarios
- Examples for each month

**scripts/README.md**
- Comprehensive technical documentation
- Usage instructions
- How the script works
- Limitations and troubleshooting

**scripts/CLAUDE_INSTRUCTIONS.md**
- Detailed instructions for Claude (or future developers)
- Technical implementation details
- How to modify/extend the script
- Common issues and solutions

### 3. Makefile Integration

Added command to Makefile:
```makefile
update-links: # Update ticket links in spektakle YAML from HTML export
    python3 scripts/update_spektakle_links.py $(month)
```

**Usage:**
```bash
make update-links month=grudzien
```

### 4. Git Configuration

Updated `.gitignore` to exclude HTML exports:
```
# Spektakle HTML exports (temporary processing files)
_data/spektakle/*_raw.html
```

## Test Results

Successfully tested with December (grudzień):
- ✓ 10 events extracted from HTML
- ✓ 10 links updated in YAML
- ✓ 1 mismatch corrected
- ✓ 15 entries without HTML data (expected - events not created yet)
- ✓ All links follow correct format

## Current Git Status

Files ready to commit:
```
M .gitignore          - Added HTML export exclusion
M Makefile            - Added update-links command
?? scripts/           - New directory with all automation
   - update_spektakle_links.py
   - README.md
   - CLAUDE_INSTRUCTIONS.md
   - QUICKSTART.md
   - SESSION_SUMMARY.md (this file)
```

## Next Steps

### For This Session

1. **Review the changes:**
   ```bash
   git diff .gitignore Makefile
   ```

2. **Test the Makefile command (optional):**
   ```bash
   make update-links month=grudzien
   ```

3. **Commit everything:**
   ```bash
   git add scripts/ .gitignore Makefile
   git commit -m "Add automation for updating ticket links from HTML exports

   - Created scripts/update_spektakle_links.py for extracting links
   - Added comprehensive documentation (README, QUICKSTART, CLAUDE_INSTRUCTIONS)
   - Added Makefile target: make update-links month=NAME
   - Updated .gitignore to exclude HTML exports
   "
   ```

4. **Push to remote:**
   ```bash
   git push
   ```

### For Future Use

When you need to update links for a new month:

1. Export HTML from Kicket and save as `_data/spektakle/MONTH_raw.html`
2. Run: `make update-links month=MONTH`
3. Review: `git diff _data/spektakle/MONTH.yml`
4. Commit if satisfied

See `scripts/QUICKSTART.md` for detailed instructions.

## Technical Details

### How It Works

1. **HTML Parsing:**
   - Regex pattern: `href="#/events/(\d+)/update">([^<]+)</a>`
   - Extracts: Event ID, Show title
   - Date pattern: `(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}) \(Warszawa\)`

2. **YAML Processing:**
   - Line-by-line parsing (no external YAML library needed)
   - Preserves exact formatting and indentation
   - Converts ISO 8601 dates to DD.MM.YYYY HH:MM for matching

3. **URL Construction:**
   - Format: `https://kicket.com/embedded/rezerwacja/{EVENT_ID}`

### Data Flow

```
Kicket System → HTML Export → Python Script → Updated YAML → Git Commit → Website
```

### Files Involved

```
_data/spektakle/
├── grudzien.yml          # Show schedule (committed)
├── grudzien_raw.html     # HTML export (temporary, not committed)
├── [other months].yml
scripts/
├── update_spektakle_links.py    # Main script
├── README.md                     # User documentation
├── CLAUDE_INSTRUCTIONS.md        # Developer/Claude docs
├── QUICKSTART.md                 # Quick reference
└── SESSION_SUMMARY.md            # This file
```

## Maintenance

### When Kicket Updates Their Interface

If the HTML structure changes, update the regex patterns in `extract_events_from_html()`:

```python
event_pattern = r'href="#/events/(\d+)/update">([^<]+)</a>'
date_pattern = r'class="ng-binding">(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}) \(Warszawa\)'
```

### When URL Format Changes

Update the link construction in `update_yaml_with_links()`:

```python
new_link = f'https://kicket.com/embedded/rezerwacja/{event_id}'
```

## Success Metrics

✅ Script successfully processes HTML exports
✅ Accurately matches events by title and date
✅ Updates YAML files with correct URLs
✅ Handles edge cases gracefully
✅ Provides clear user feedback
✅ No external dependencies required
✅ Fully documented for future use
✅ Integrated with existing Makefile
✅ Works with existing workflow

## Future Enhancements (Optional)

- [ ] Batch processing for multiple months
- [ ] Validation mode to check for broken links
- [ ] API integration (if Kicket provides one)
- [ ] Automatic HTML fetching
- [ ] Email notifications for processing results

## Support

For questions or issues:
1. Check `scripts/QUICKSTART.md` for common scenarios
2. Check `scripts/README.md` for detailed docs
3. Check `scripts/CLAUDE_INSTRUCTIONS.md` for technical details
4. Ask Claude: "Help with scripts/update_spektakle_links.py"

---

**Session completed successfully!**
All automation is in place and ready for future use.
