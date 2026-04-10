# Claude Instructions for Future Updates

This document contains instructions for Claude (or human developers) when updating spektakle links or performing similar tasks.

## Task: Update Ticket Links from HTML Export

### Context

The Maskarada website stores show schedules in YAML files at `_data/spektakle/<month>.yml`. When new shows are created in Biletomat's event management system, we need to update the YAML files with ticket booking links.

### Process Overview

1. **Export HTML from Biletomat**
   - Navigate to Biletomat event management
   - View events list (can include multiple months)
   - Save the page HTML as `_data/spektakle/new_events_raw.html`

2. **Run the update script**
   ```bash
   make update-links
   ```

3. **Review and commit changes**
   ```bash
   git diff _data/spektakle/
   git add _data/spektakle/
   git commit -m "Update ticket links"
   ```

## Script Details

### Location
`scripts/update_spektakle_links.py`

### What it does

1. **Parses HTML export** to extract:
   - Event ID (from URLs like `#/events/324387/update`)
   - Show title (from link text)
   - Date/time (format: `DD.MM.YYYY HH:MM (Warszawa)`)

2. **Reads YAML file** and parses:
   - Show title (`tytul`)
   - Date (`data` in ISO 8601 format)
   - Current link (`link`)

3. **Matches entries** by:
   - Exact title match
   - Exact date/time match (after converting ISO to DD.MM.YYYY HH:MM)

4. **Updates YAML** with:
   - New links: `https://biletomat.pl/embedded/rezerwacja/{EVENT_ID}`
   - Fixes mismatched links
   - Preserves formatting

### Expected HTML Structure

The script expects Biletomat's Angular-based HTML with this pattern:

```html
<a href="#/events/324387/update">Show Title</a>
...
<td class="ng-binding">14.12.2025 13:30 (Warszawa)</td>
```

### YAML Structure

Expected YAML format:

```yaml
title: Grudzień
repertuar:
  - tytul: Show Title
    data: 2025-12-14T13:30:00.000Z
    link: '-'
```

After update:

```yaml
  - tytul: Show Title
    data: 2025-12-14T13:30:00.000Z
    link: 'https://biletomat.pl/embedded/rezerwacja/324387'
```

## Modifying the Script

### Adding support for different HTML formats

If Biletomat changes their HTML structure, update these regex patterns in `extract_events_from_html()`:

```python
event_pattern = r'href="#/events/(\d+)/update">([^<]+)</a>'
date_pattern = r'class="ng-binding">(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}) \(Warszawa\)'
```

### Adding support for different date formats

If the YAML date format changes, update `convert_yaml_date_to_html_format()`.

### Adding support for different URL formats

If Biletomat changes their booking URL structure, update the URL construction:

```python
new_link = f'https://biletomat.pl/embedded/rezerwacja/{event_id}'
```

## Common Issues and Solutions

### Issue: No matches found

**Symptoms:**
```
✗ No match found: Show Title @ Date
```

**Possible causes:**
1. Event not yet created in Biletomat
2. Title mismatch between YAML and HTML
3. Date/time mismatch

**Solution:**
- Verify event exists in HTML with: `grep "Show Title" _data/spektakle/month_raw.html`
- Check dates match exactly
- Ensure show titles are identical (case-sensitive)

### Issue: Wrong event ID assigned

**Symptoms:**
```
⚠ Fixing mismatch: Show Title @ Date
  Old: https://biletomat.pl/embedded/rezerwacja/324387
  New: https://biletomat.pl/embedded/rezerwacja/324385
```

**Solution:**
- Review the HTML to verify correct event ID
- The script will automatically fix on next run

### Issue: Script fails to parse HTML

**Symptoms:**
```
Found 0 events in HTML
```

**Solution:**
- Verify HTML file is not empty
- Check if Biletomat changed their HTML structure
- Update regex patterns if needed

## Testing

Before running on production data:

1. **Make a backup:**
   ```bash
   cp _data/spektakle/month.yml _data/spektakle/month.yml.backup
   ```

2. **Test the script:**
   ```bash
   python3 scripts/update_spektakle_links.py month
   ```

3. **Review changes:**
   ```bash
   git diff _data/spektakle/month.yml
   ```

4. **Restore if needed:**
   ```bash
   mv _data/spektakle/month.yml.backup _data/spektakle/month.yml
   ```

## Future Enhancements

Potential improvements:

1. **Validation mode:** Check for broken links or invalid IDs
2. **Batch processing:** Update multiple months at once
3. **API integration:** Direct integration with Biletomat API (if available)
4. **Automatic HTML fetching:** Auto-download from Biletomat
5. **Error recovery:** Handle partial updates gracefully
6. **Link verification:** Test that generated URLs are accessible

## Related Files

- `scripts/update_spektakle_links.py` - Main script
- `scripts/README.md` - User documentation
- `Makefile` - Build automation (target: `update-links`)
- `_data/spektakle/*.yml` - Show data files
- `_data/spektakle/*_raw.html` - HTML exports (not committed to git)

## Git Ignore

Add to `.gitignore` to avoid committing HTML exports:

```
_data/spektakle/*_raw.html
```

This keeps the repository clean while allowing local processing.
