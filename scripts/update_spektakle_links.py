#!/usr/bin/env python3
"""
Script to update spektakle YAML files with ticket links extracted from HTML export

This script extracts event data (ID, title, date) from Kicket HTML exports and
updates the corresponding YAML files with ticket booking URLs.

Usage:
    python3 scripts/update_spektakle_links.py <month_name>

Example:
    python3 scripts/update_spektakle_links.py grudzien

The script expects:
    - HTML file: _data/spektakle/<month_name>_raw.html
    - YAML file: _data/spektakle/<month_name>.yml
"""

import re
import sys
from datetime import datetime
from pathlib import Path

def extract_events_from_html(html_path):
    """Extract event ID, title, and date from HTML file"""
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    events = []

    # Pattern to match: href="#/events/[ID]/update">[Title]</a>
    # followed by date like: >DD.MM.YYYY HH:MM (Warszawa)<
    event_pattern = r'href="#/events/(\d+)/update">([^<]+)</a>'
    date_pattern = r'class="ng-binding">(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}) \(Warszawa\)'

    # Split HTML into sections by table rows
    rows = html_content.split('ng-repeat-start="item in vm.events"')

    for row in rows[1:]:  # Skip first split (before first row)
        # Extract event ID and title
        event_match = re.search(event_pattern, row)
        if not event_match:
            continue

        event_id = event_match.group(1)
        title = event_match.group(2)

        # Extract date (should appear after the title in the same row section)
        date_match = re.search(date_pattern, row)
        if not date_match:
            continue

        date_str = date_match.group(1)

        events.append({
            'id': event_id,
            'title': title,
            'date': date_str  # Format: DD.MM.YYYY HH:MM
        })

    return events

def convert_yaml_date_to_html_format(yaml_date_str):
    """Convert YAML ISO date to HTML format (DD.MM.YYYY HH:MM)"""
    # Parse ISO format: 2025-12-14T13:30:00.000Z
    # The Z time is treated as local Warsaw time (not UTC)
    dt = datetime.fromisoformat(yaml_date_str.replace('Z', '+00:00'))
    return dt.strftime('%d.%m.%Y %H:%M')

def update_yaml_with_links(yaml_path, html_events):
    """Update YAML file with ticket links based on HTML events"""

    # Read YAML file
    with open(yaml_path, 'r', encoding='utf-8') as f:
        yaml_lines = f.readlines()

    # Create lookup dictionary: (title, date) -> event_id
    event_lookup = {}
    for event in html_events:
        key = (event['title'], event['date'])
        event_lookup[key] = event['id']

    # Track updates
    updated_count = 0
    not_found_count = 0
    mismatch_fixed_count = 0

    # Process YAML line by line
    i = 0
    while i < len(yaml_lines):
        line = yaml_lines[i]

        # Check if this is a "- tytul:" line (YAML list item)
        if '- tytul:' in line or 'tytul:' in line:
            # Extract title
            title_match = re.match(r'\s*-?\s*tytul:\s*(.+)', line)
            if not title_match:
                i += 1
                continue

            title = title_match.group(1).strip()

            # Look for the "data:" line (should be next line)
            if i + 1 < len(yaml_lines):
                data_line = yaml_lines[i + 1]
                data_match = re.match(r'\s*data:\s*(.+)', data_line)

                if data_match:
                    yaml_date = data_match.group(1).strip()
                    html_date = convert_yaml_date_to_html_format(yaml_date)

                    # Look for the "link:" line (should be next line after data)
                    if i + 2 < len(yaml_lines):
                        link_line = yaml_lines[i + 2]
                        link_match = re.match(r'(\s*)link:\s*(.+)', link_line)

                        if link_match:
                            indent = link_match.group(1)
                            current_link = link_match.group(2).strip().strip("'\"")

                            # Check if we have a matching HTML event
                            key = (title, html_date)
                            if key in event_lookup:
                                event_id = event_lookup[key]
                                new_link = f'https://kicket.com/embedded/rezerwacja/{event_id}'

                                if current_link == '-':
                                    print(f"✓ Updating: {title} @ {html_date} -> Event ID {event_id}")
                                    yaml_lines[i + 2] = f"{indent}link: '{new_link}'\n"
                                    updated_count += 1
                                elif current_link == new_link:
                                    print(f"  Already correct: {title} @ {html_date} -> Event ID {event_id}")
                                else:
                                    print(f"⚠ Fixing mismatch: {title} @ {html_date}")
                                    print(f"  Old: {current_link}")
                                    print(f"  New: {new_link}")
                                    yaml_lines[i + 2] = f"{indent}link: '{new_link}'\n"
                                    mismatch_fixed_count += 1
                            else:
                                if current_link == '-':
                                    print(f"✗ No match found: {title} @ {html_date}")
                                    not_found_count += 1

        i += 1

    # Write updated YAML back
    with open(yaml_path, 'w', encoding='utf-8') as f:
        f.writelines(yaml_lines)

    print(f"\n=== Summary ===")
    print(f"Links updated (new): {updated_count}")
    print(f"Links fixed (mismatch): {mismatch_fixed_count}")
    print(f"No match found: {not_found_count}")
    print(f"Total HTML events: {len(html_events)}")

    return updated_count + mismatch_fixed_count

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/update_spektakle_links.py <month_name>")
        print("Example: python3 scripts/update_spektakle_links.py grudzien")
        sys.exit(1)

    month_name = sys.argv[1]
    html_path = f'_data/spektakle/{month_name}_raw.html'
    yaml_path = f'_data/spektakle/{month_name}.yml'

    # Check if files exist
    if not Path(html_path).exists():
        print(f"Error: HTML file not found: {html_path}")
        sys.exit(1)

    if not Path(yaml_path).exists():
        print(f"Error: YAML file not found: {yaml_path}")
        sys.exit(1)

    print(f"Processing {month_name}...")
    print(f"HTML source: {html_path}")
    print(f"YAML target: {yaml_path}")
    print()

    print("Extracting events from HTML...")
    html_events = extract_events_from_html(html_path)

    print(f"Found {len(html_events)} events in HTML:\n")
    for event in html_events:
        print(f"  {event['date']} - {event['title']} (ID: {event['id']})")

    print("\n" + "="*60 + "\n")
    print("Updating YAML file...\n")

    changes = update_yaml_with_links(yaml_path, html_events)

    print("\nDone!")

    if changes > 0:
        print(f"\nTo review changes, run: git diff {yaml_path}")
        print(f"To commit changes, run: git add {yaml_path} && git commit")

if __name__ == '__main__':
    main()
