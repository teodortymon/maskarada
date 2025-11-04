# Scripts for Maskarada Teatr

This directory contains automation scripts for managing the Maskarada website.

## update_spektakle_links.py

Updates spektakle (shows) YAML files with ticket booking links extracted from Kicket HTML exports.

### Purpose

When you export event data from Kicket's event management system, this script:
1. Extracts event IDs, titles, and dates from the HTML export
2. Matches them with entries in your YAML repertoire files
3. Updates the YAML files with the correct ticket booking URLs

### Prerequisites

- Python 3.x (no external dependencies required)
- HTML export from Kicket saved as `_data/spektakle/<month_name>_raw.html`
- Existing YAML file at `_data/spektakle/<month_name>.yml`

### Usage

#### From command line:

```bash
python3 scripts/update_spektakle_links.py <month_name>
```

#### From Makefile:

```bash
make update-links month=grudzien
```

### Example Workflow

1. **Export HTML from Kicket:**
   - Log into Kicket event management system
   - Navigate to your events list
   - Export/save the page HTML
   - Save as `_data/spektakle/<month_name>_raw.html` (e.g., `grudzien_raw.html`)

2. **Run the script:**
   ```bash
   make update-links month=grudzien
   ```

3. **Review changes:**
   ```bash
   git diff _data/spektakle/grudzien.yml
   ```

4. **Commit if satisfied:**
   ```bash
   git add _data/spektakle/grudzien.yml
   git commit -m "Update ticket links for December shows"
   ```

### How It Works

The script:

1. **Parses HTML:** Extracts event data using regex patterns:
   - Event ID from URLs like `#/events/324387/update`
   - Show title from link text
   - Date/time in format `DD.MM.YYYY HH:MM (Warszawa)`

2. **Reads YAML:** Processes your existing spektakle YAML file

3. **Matches Entries:** Compares by exact title and date/time match

4. **Updates Links:** Constructs URLs in format:
   ```
   https://kicket.com/embedded/rezerwacja/{EVENT_ID}
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
- Assumes HTML follows Kicket's standard Angular format

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
