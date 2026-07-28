// Weakness tables -- updated per the "Weakness Generation" reference table
// (weakness_table_updated.png), full d100 ranges, no reconstruction needed.
//
// Stimulus now includes "No Inherent Weakness" (01-50) -- half of all rolls
// have no weakness at all. Effect/Duration have no equivalent "none" entry,
// so rollWeakness() (generateCharacter.ts) skips rolling them when Stimulus
// lands there, rather than stacking a random Effect/Duration onto a
// character with no weakness to begin with.

import type { RollRange } from '@/types/reference'

export const NO_INHERENT_WEAKNESS = 'No Inherent Weakness'

export const WEAKNESS_STIMULUS: RollRange[] = [
  { name: NO_INHERENT_WEAKNESS, min: 1, max: 50 },
  { name: 'Elemental Allergy', min: 51, max: 57 },
  { name: 'Molecular Allergy', min: 58, max: 64 },
  { name: 'Energy Allergy', min: 65, max: 71 },
  { name: 'Energy Depletion', min: 72, max: 78 },
  { name: 'Energy Dampening', min: 79, max: 86 },
  { name: 'Finite Limit', min: 87, max: 93 },
  { name: 'Psychological/Mystic Curse', min: 94, max: 100 },
]

export const WEAKNESS_EFFECT: RollRange[] = [
  { name: 'Power Negation', min: 1, max: 50 },
  { name: 'Incapacitated', min: 51, max: 70 },
  { name: 'Physical Handicap', min: 71, max: 90 },
  { name: 'Fatal', min: 91, max: 100 },
]

export const WEAKNESS_DURATION: RollRange[] = [
  { name: 'Continuous with Contact', min: 1, max: 40 },
  { name: 'Limited Duration on Contact', min: 41, max: 60 },
  { name: 'Limited Duration after Contact', min: 61, max: 90 },
  { name: 'Permanent', min: 91, max: 100 },
]
