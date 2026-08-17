// The Ultimate Powers Table -- the master d100 table that picks which Power
// category a rolled Power comes from (source: "Classic Marvel Forever - MSH
// Classic RPG - Ultimate Powers List.html", table[0], not the per-category
// sub-tables scripts/extract-powers.py pulls into powers.json).
//
// `name` matches the `category` strings actually stored in powers.json 1:1
// (the master table's own labels differ slightly in a few spots, e.g. "Matter
// Control" vs. "Matter Control Powers" -- normalized here so this table can
// be used directly to filter POWERS by category).
//
// Rule Powers (70-75) is a homebrew addition not in the original book table
// -- inserted by trimming Mental Enhancements' tail (58-71 -> 58-69) and
// Physical Enhancements' head (72-85 -> 76-85), keeping the table at 100.

import type { RollRange } from '@/types/reference'

export const POWER_CATEGORIES_TABLE: RollRange[] = [
  { name: 'Defensive Powers', min: 1, max: 5 },
  { name: 'Detection Powers', min: 6, max: 11 },
  { name: 'Energy Control Powers', min: 12, max: 16 },
  { name: 'Energy Emission Powers', min: 17, max: 24 },
  { name: 'Fighting Powers', min: 25, max: 29 },
  { name: 'Illusionary Powers', min: 30, max: 31 },
  { name: 'Life Control Powers', min: 32, max: 35 },
  { name: 'Magic', min: 36, max: 40 },
  { name: 'Matter Control Powers', min: 41, max: 47 },
  { name: 'Matter Conversion Powers', min: 48, max: 53 },
  { name: 'Matter Creation Powers', min: 54, max: 57 },
  { name: 'Mental Enhancements', min: 58, max: 69 },
  { name: 'Rule Powers', min: 70, max: 75 },
  { name: 'Physical Enhancements', min: 76, max: 85 },
  { name: 'Power Control', min: 86, max: 88 },
  { name: 'Self-Alteration', min: 89, max: 92 },
  { name: 'Travel', min: 93, max: 100 },
]

/** The same Ultimate Powers Table with the homebrew "Rule Powers" band
 * (70-75) removed. Its 6-point range is redistributed exactly as the user
 * configured: Mental Enhancements absorb 70-71 (becoming 58-71) and Physical
 * Enhancements absorb 72-75 (becoming 72-85). */
export const POWER_CATEGORIES_TABLE_SKIP_RULE_POWERS: RollRange[] = [
  { name: 'Defensive Powers', min: 1, max: 5 },
  { name: 'Detection Powers', min: 6, max: 11 },
  { name: 'Energy Control Powers', min: 12, max: 16 },
  { name: 'Energy Emission Powers', min: 17, max: 24 },
  { name: 'Fighting Powers', min: 25, max: 29 },
  { name: 'Illusionary Powers', min: 30, max: 31 },
  { name: 'Life Control Powers', min: 32, max: 35 },
  { name: 'Magic', min: 36, max: 40 },
  { name: 'Matter Control Powers', min: 41, max: 47 },
  { name: 'Matter Conversion Powers', min: 48, max: 53 },
  { name: 'Matter Creation Powers', min: 54, max: 57 },
  { name: 'Mental Enhancements', min: 58, max: 71 },
  { name: 'Physical Enhancements', min: 72, max: 85 },
  { name: 'Power Control', min: 86, max: 88 },
  { name: 'Self-Alteration', min: 89, max: 92 },
  { name: 'Travel', min: 93, max: 100 },
]
