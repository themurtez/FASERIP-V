#!/usr/bin/env python3
"""Regenerates src/data/powers.json from the Ultimate Powers List HTML export.

Usage: python3 scripts/extract-powers.py
Requires: beautifulsoup4 (pip install beautifulsoup4)

Source: "Classic Marvel Forever - MSH Classic RPG _ Ultimate Powers List.html"
must exist at the repo root (save the page as "Webpage, HTML only" from the
classicmarvelforever.com Ultimate Powers List page).
"""
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Classic Marvel Forever - MSH Classic RPG _ Ultimate Powers List.html"
DEST = ROOT / "src" / "data" / "powers.json"


def extract():
    with open(SOURCE, encoding="utf-8", errors="ignore") as f:
        soup = BeautifulSoup(f, "html.parser")

    powers_table = soup.find_all("table")[1]
    # Only rows whose nearest ancestor table IS powers_table -- some power
    # descriptions embed their own little rules sub-tables, and a naive
    # find_all('tr') recurses into those too.
    rows = [r for r in powers_table.find_all("tr") if r.find_parent("table") is powers_table]

    powers = []
    current_category = None
    current_slug = None
    notes = {}

    for r in rows:
        cells = [c for c in r.find_all(["td", "th"]) if c.find_parent("tr") is r]
        if len(cells) == 1:
            cell = cells[0]
            text = re.sub(r"^top\s+", "", cell.get_text(" ", strip=True)).strip()
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
            tier = None
            if name.endswith("**"):
                tier, name = "cosmic", name[:-2].strip()
            elif name.endswith("*"):
                tier, name = "godly", name[:-1].strip()
            powers.append(
                {
                    "category": current_category,
                    "categorySlug": current_slug,
                    "roll": roll,
                    "name": name,
                    "tier": tier,
                    "description": desc,
                }
            )

    return powers, notes


def main():
    powers, notes = extract()
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with open(DEST, "w") as out:
        json.dump(powers, out, indent=2)
        out.write("\n")
    print(f"Wrote {len(powers)} powers to {DEST}")
    if notes:
        print("Category notes (not stored per-power, informational only):")
        for slug, note in notes.items():
            print(f"  {slug}: {note}")


if __name__ == "__main__":
    main()
