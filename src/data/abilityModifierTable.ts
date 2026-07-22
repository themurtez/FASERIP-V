// The Ability Modifier Table (rules.pdf): a d100 roll that shifts a rank up
// or down by a variable number of ranks. Currently used for Resources
// generation only (see "Generating Resources" in rules.pdf) -- the book
// doesn't say this table is reused elsewhere, so it isn't wired into
// anything else.
//
// "Unless noted otherwise, no ability may be adjusted in any fashion below
// Feeble or above Monstrous" -- that floor/ceiling is specific to this
// table's own roll and is applied where it's used (generateCharacter.ts),
// not baked into the generic rank ladder (data/ranks.ts's shiftRank isn't
// clamped this way, since manual +/- shifting elsewhere in the app is meant
// to reach the full ladder).

import type { RollRange } from '@/types/reference'

export interface AbilityModifierRoll extends RollRange {
  /** Rank-ladder shift: -1 = reduce one rank, 0 = unchanged, +1..+4 = increase that many ranks. */
  delta: number
}

export const ABILITY_MODIFIER_TABLE: AbilityModifierRoll[] = [
  { name: '01-15', min: 1, max: 15, delta: -1 },
  { name: '16-50', min: 16, max: 50, delta: 0 },
  { name: '51-70', min: 51, max: 70, delta: 1 },
  { name: '71-85', min: 71, max: 85, delta: 2 },
  { name: '86-95', min: 86, max: 95, delta: 3 },
  { name: '96-100', min: 96, max: 100, delta: 4 }, // "96-00"
]
