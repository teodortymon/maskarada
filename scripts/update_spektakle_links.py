#!/usr/bin/env python3
"""
Script to update spektakle YAML files with ticket links extracted from HTML export

This script extracts event data (ID, title, date) from a Biletomat HTML export and
updates ALL matching YAML month files with ticket booking URLs.

Usage:
    python3 scripts/update_spektakle_links.py

The script expects:
    - HTML file: _data/spektakle/new_events_raw.html (exported from Biletomat)
    - YAML files: _data/spektakle/<month>.yml
"""

import re
from datetime import datetime
from pathlib import Path

DATA_DIR = Path('_data/spektakle')
HTML_FILE = DATA_DIR / 'new_events_raw.html'

# YAML files to skip (not month repertoire files)
SKIP_FILES = {'spektakle.yml'}


def extract_events_from_html(html_path):
    """Extract event ID, title, and date from HTML file"""
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    events = []

    event_pattern = r'href="#/events/(\d+)/update">([^<]+)</a>'
    date_pattern = r'class="ng-binding">(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}) \(Warszawa\)'

    rows = html_content.split('ng-repeat-start="item in vm.events"')

    for row in rows[1:]:  # Skip first split (before first row)
        event_match = re.search(event_pattern, row, re.DOTALL)
        if not event_match:
            continue

        event_id = event_match.group(1)
        # Normalize whitespace: collapse newlines and multiple spaces to single space
        title = re.sub(r'\s+', ' ', event_match.group(2)).strip()

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
    dt = datetime.fromisoformat(yaml_date_str.replace('Z', '+00:00'))
    return dt.strftime('%d.%m.%Y %H:%M')


def update_yaml_with_links(yaml_path, html_events):
    """Update YAML file with ticket links based on HTML events. Returns (updated, fixed, not_found, messages)."""

    with open(yaml_path, 'r', encoding='utf-8') as f:
        yaml_lines = f.readlines()

    # Create lookup: (title, date) -> event_id
    # Each Biletomat event ID is one specific performance (one date/time)
    event_lookup = {}
    for event in html_events:
        key = (event['title'], event['date'])
        event_lookup[key] = event['id']

    updated_count = 0
    not_found_count = 0
    mismatch_fixed_count = 0
    messages = []

    i = 0
    while i < len(yaml_lines):
        line = yaml_lines[i]

        if '- tytul:' in line or 'tytul:' in line:
            title_match = re.match(r'\s*-?\s*tytul:\s*(.+)', line)
            if not title_match:
                i += 1
                continue

            title = title_match.group(1).strip()

            if i + 1 < len(yaml_lines):
                data_line = yaml_lines[i + 1]
                data_match = re.match(r'\s*data:\s*(.+)', data_line)

                if data_match and i + 2 < len(yaml_lines):
                    yaml_date = data_match.group(1).strip()
                    html_date = convert_yaml_date_to_html_format(yaml_date)

                    link_line = yaml_lines[i + 2]
                    link_match = re.match(r'(\s*)link:\s*(.+)', link_line)

                    if link_match:
                        indent = link_match.group(1)
                        current_link = link_match.group(2).strip().strip("'\"")
                        key = (title, html_date)

                        if key in event_lookup:
                            event_id = event_lookup[key]
                            new_link = f'https://biletomat.pl/embedded/rezerwacja/{event_id}'

                            if current_link == '-':
                                messages.append(f"  + {title} @ {html_date} -> ID {event_id}")
                                yaml_lines[i + 2] = f"{indent}link: '{new_link}'\n"
                                updated_count += 1
                            elif current_link == new_link:
                                pass  # already correct
                            else:
                                messages.append(f"  ! {title} @ {html_date} (was {current_link})")
                                yaml_lines[i + 2] = f"{indent}link: '{new_link}'\n"
                                mismatch_fixed_count += 1
                        else:
                            if current_link == '-':
                                messages.append(f"  ? {title} @ {html_date} — no match in HTML")
                                not_found_count += 1

        i += 1

    with open(yaml_path, 'w', encoding='utf-8') as f:
        f.writelines(yaml_lines)

    return updated_count, mismatch_fixed_count, not_found_count, messages


def main():
    if not HTML_FILE.exists():
        print(f"Error: HTML file not found: {HTML_FILE}")
        print("Export events from Biletomat and save as _data/spektakle/new_events_raw.html")
        exit(1)

    print(f"Reading {HTML_FILE}...")
    html_events = extract_events_from_html(HTML_FILE)

    if not html_events:
        print("No events found in HTML. Check if the file format changed.")
        exit(1)

    print(f"Found {len(html_events)} events in HTML:\n")
    for event in html_events:
        print(f"  {event['date']} — {event['title']} (ID: {event['id']})")

    print()

    # Process all month YAML files
    yaml_files = sorted(DATA_DIR.glob('*.yml'))
    total_updated = 0
    total_fixed = 0
    total_not_found = 0

    for yaml_path in yaml_files:
        if yaml_path.name in SKIP_FILES:
            continue

        updated, fixed, not_found, messages = update_yaml_with_links(yaml_path, html_events)

        if messages:
            print(f"[{yaml_path.name}]")
            for msg in messages:
                print(msg)

        total_updated += updated
        total_fixed += fixed
        total_not_found += not_found

    print(f"\n=== Summary ===")
    print(f"Updated: {total_updated}  Fixed: {total_fixed}  No match: {total_not_found}")

    if total_updated + total_fixed > 0:
        print(f"\nReview changes: git diff _data/spektakle/")


if __name__ == '__main__':
    main()
