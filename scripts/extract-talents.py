#!/usr/bin/env python3
"""Regenerates src/data/talents.json from the Ultimate Talents List HTML export.

Usage: python3 scripts/extract-talents.py
Requires: beautifulsoup4 (pip install beautifulsoup4)

Source: "Classic Marvel Forever - MSH Classic RPG _ Ultimate Talents List.html"
must exist at the repo root (save the page as "Webpage, HTML only" from the
classicmarvelforever.com Ultimate Talents List page).
"""
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Classic Marvel Forever - MSH Classic RPG _ Ultimate Talents List.html"
DEST = ROOT / "src" / "data" / "talents.json"


def extract():
    with open(SOURCE, encoding="utf-8", errors="ignore") as f:
        soup = BeautifulSoup(f, "html.parser")

    talents_table = soup.find_all("table")[1]
    rows = [r for r in talents_table.find_all("tr") if r.find_parent("table") is talents_table]

    talents = []
    current_category = None
    current_slug = None
    notes = {}

    for r in rows:
        cells = [c for c in r.find_all(["td", "th"]) if c.find_parent("tr") is r]
        if len(cells) == 1:
            cell = cells[0]
            text = cell.get_text(" ", strip=True)
            # Header cells look like "(01-06) Alternative Sciences" (the roll
            # range is itself a "back to top" link) or start with "top ".
            text = re.sub(r"^top\s+", "", text).strip()
            text = re.sub(r"^\(\d{2}-\d{2}\)\s*", "", text).strip()
            if text.lower().startswith("note:"):
                notes[current_slug] = text
                continue
            slug = None
            for a in cell.find_all("a"):
                slug = a.get("id") or a.get("name") or slug
            current_category = text
            current_slug = slug or re.sub(r"\W+", "", text)
            continue
        if len(cells) == 3:
            roll = cells[0].get_text(" ", strip=True)
            name = cells[1].get_text(" ", strip=True)
            desc = cells[2].get_text(" ", strip=True)
            talents.append(
                {
                    "category": current_category,
                    "categorySlug": current_slug,
                    "roll": roll,
                    "name": name,
                    "description": desc,
                }
            )

    return talents, notes


def main():
    talents, notes = extract()
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with open(DEST, "w") as out:
        json.dump(talents, out, indent=2)
        out.write("\n")
    print(f"Wrote {len(talents)} talents to {DEST}")
    if notes:
        print("Category notes (informational only):")
        for slug, note in notes.items():
            print(f"  {slug}: {note}")


if __name__ == "__main__":
    main()
