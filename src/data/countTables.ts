// The Powers/Talents/Contacts starting-count table (rules.pdf, ~page 14):
// a d100 roll -> {current, cap} for each of the three tracks. Replaces the
// earlier placeholder (a flat uniform roll over an arbitrary span) now that
// the real book table has been sourced.
//
// The scanned table's Powers row for 67-75 read "2/8", which breaks the
// column's otherwise strictly-ascending current sequence
// (1,2,3,4,5,_,7,8,9,10,12,14) -- corrected to 6/8 here as the near-certain
// intended value (2 and 6 are an easy misread in a worn scan). Worth
// double-checking against the physical book if exact odds matter.

import type { RollRange } from '@/types/reference'

export interface CountRoll extends RollRange {
  current: number
  cap: number
}

function row(min: number, max: number, current: number, cap: number): CountRoll {
  return { name: `${min}-${max}`, min, max, current, cap }
}

export const POWERS_COUNT_TABLE: CountRoll[] = [
  row(1, 12, 1, 3),
  row(13, 26, 2, 4),
  row(27, 41, 3, 5),
  row(42, 55, 4, 6),
  row(56, 66, 5, 7),
  row(67, 75, 6, 8), // scanned as 2/8 -- corrected, see header note
  row(76, 83, 7, 9),
  row(84, 89, 8, 10),
  row(90, 94, 9, 12),
  row(95, 97, 10, 12),
  row(98, 99, 12, 14),
  row(100, 100, 14, 18), // "00"
]

export const TALENTS_COUNT_TABLE: CountRoll[] = [
  row(1, 12, 0, 3),
  row(13, 26, 1, 4),
  row(27, 41, 1, 6),
  row(42, 55, 2, 4),
  row(56, 66, 2, 6),
  row(67, 75, 2, 8),
  row(76, 83, 3, 4),
  row(84, 89, 3, 6),
  row(90, 94, 4, 8),
  row(95, 97, 4, 4),
  row(98, 99, 5, 6),
  row(100, 100, 6, 8), // "00"
]

// Compound Body Type's "Number of Body Types combined" table (rules.pdf
// p.9-10) -- one roll gives both how many Body Types (2-5) make up the
// Compound and what % of each one's advantages/disadvantages is retained.
// Not itself enough to auto-generate a Compound (the actual N sub-rolls and
// merging their bonuses/powers is a manual, Judge-assisted step -- see
// physicalForms.ts's Compound/Changeling notes), but useful to surface the
// roll result to the player.

export interface CompoundRoll extends RollRange {
  count: number
  retainPercent: number
}

function compoundRow(min: number, max: number, count: number, retainPercent: number): CompoundRoll {
  return { name: `${min}-${max}`, min, max, count, retainPercent }
}

export const COMPOUND_NUMBER_TABLE: CompoundRoll[] = [
  compoundRow(1, 50, 2, 50),
  compoundRow(51, 75, 3, 33),
  compoundRow(76, 95, 4, 25),
  compoundRow(96, 100, 5, 20), // "00"
]

export const CONTACTS_COUNT_TABLE: CountRoll[] = [
  row(1, 12, 0, 2),
  row(13, 26, 0, 4),
  row(27, 41, 1, 4),
  row(42, 55, 2, 4),
  row(56, 66, 2, 6),
  row(67, 75, 3, 3),
  row(76, 83, 3, 4),
  row(84, 89, 3, 6),
  row(90, 94, 4, 4),
  row(95, 97, 4, 5),
  row(98, 99, 5, 5),
  row(100, 100, 6, 6), // "00"
]
