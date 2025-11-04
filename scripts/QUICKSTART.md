# Quick Start Guide - Update Ticket Links

A simple guide for updating ticket booking links in your show schedules.

## TL;DR

```bash
# 1. Save HTML from Kicket as _data/spektakle/MONTH_raw.html
# 2. Run:
make update-links month=MONTH_NAME
# 3. Review and commit:
git diff _data/spektakle/MONTH_NAME.yml
git add _data/spektakle/MONTH_NAME.yml
git commit -m "Update ticket links for MONTH_NAME"
```

## Step-by-Step

### 1. Export HTML from Kicket

1. Log into Kicket event management system
2. Go to Events → List
3. Make sure you can see the events for your month
4. Save the page (Cmd+S on Mac, Ctrl+S on Windows)
   - Or right-click → "Save As..."
   - Or use browser's "Save Page As" option
5. Save as: `_data/spektakle/MONTH_raw.html`
   - Replace MONTH with: `styczen`, `luty`, `marzec`, `kwiecien`, `maj`, `czerwiec`, `lipiec`, `sierpien`, `wrzesien`, `pazdziernik`, `listopad`, `grudzien`

### 2. Run the Script

From your project root directory:

```bash
make update-links month=grudzien
```

Replace `grudzien` with your month name.

### 3. Review the Output

The script will show:

- ✓ **Updated links** - New links added
- ⚠ **Fixed mismatches** - Wrong links corrected
- ✗ **No match found** - Events in YAML but not in HTML (normal if events not created yet)
- **Already correct** - Links that were already set correctly

### 4. Check the Changes

```bash
git diff _data/spektakle/grudzien.yml
```

Review that the changes look correct:
- Links should be in format: `https://kicket.com/embedded/rezerwacja/XXXXX`
- Each show should have the right event ID

### 5. Commit the Changes

If everything looks good:

```bash
git add _data/spektakle/grudzien.yml
git commit -m "Update ticket links for December shows"
git push
```

## Troubleshooting

### "No module named 'yaml'" or similar Python error

This script doesn't require any external Python packages. If you see this error, you might be running an old version. Use the script from `scripts/update_spektakle_links.py`.

### "File not found: _data/spektakle/month_raw.html"

Make sure you:
1. Saved the HTML file in the right location
2. Named it correctly (e.g., `grudzien_raw.html` not `december_raw.html`)
3. Are running the command from the project root directory

### "Found 0 events in HTML"

The HTML file might be:
1. Empty or corrupted
2. From a different system (not Kicket)
3. In a different format (Kicket might have updated their interface)

Try re-exporting the HTML from Kicket.

### All shows show "No match found"

Check that:
1. Show titles in YAML exactly match titles in Kicket (case-sensitive)
2. Dates and times match exactly
3. Events have been created in Kicket system

### Script updates wrong events

Review the changes carefully with `git diff`. If something is wrong:

1. Don't commit the changes
2. Restore the original file: `git checkout -- _data/spektakle/month.yml`
3. Check that your HTML export is from the right month
4. Verify the event details in Kicket

## Examples

### December (Grudzień)

```bash
# Save HTML as: _data/spektakle/grudzien_raw.html
make update-links month=grudzien
git diff _data/spektakle/grudzien.yml
git add _data/spektakle/grudzien.yml
git commit -m "Update ticket links for December shows"
```

### January (Styczeń)

```bash
# Save HTML as: _data/spektakle/styczen_raw.html
make update-links month=styczen
git diff _data/spektakle/styczen.yml
git add _data/spektakle/styczen.yml
git commit -m "Update ticket links for January shows"
```

## Month Names Reference

Polish month names for the script:

- January: `styczen`
- February: `luty`
- March: `marzec`
- April: `kwiecien`
- May: `maj`
- June: `czerwiec`
- July: `lipiec`
- August: `sierpien`
- September: `wrzesien`
- October: `pazdziernik`
- November: `listopad`
- December: `grudzien`

## Need Help?

- Check `scripts/README.md` for detailed documentation
- Check `scripts/CLAUDE_INSTRUCTIONS.md` for technical details
- Ask Claude: "Update ticket links for [month] using scripts/update_spektakle_links.py"
