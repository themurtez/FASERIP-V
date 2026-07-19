// Weakness tables -- rules.pdf, cleanly extracted (Stimulus/Effect/Duration,
// full d100 ranges, no reconstruction needed).

import type { RollRange } from '@/types/reference'

export const WEAKNESS_STIMULUS: RollRange[] = [
  { name: 'Elemental Allergy', min: 1, max: 13 },
  { name: 'Molecular Allergy', min: 14, max: 18 },
  { name: 'Energy Allergy', min: 19, max: 43 },
  { name: 'Energy Depletion', min: 44, max: 68 },
  { name: 'Energy Dampening', min: 69, max: 81 },
  { name: 'Finite Limit', min: 82, max: 94 },
  { name: 'Psychological', min: 95, max: 100 },
]

export const WEAKNESS_EFFECT: RollRange[] = [
  { name: 'Power Negation', min: 1, max: 50 },
  { name: 'Incapacitation', min: 51, max: 90 },
  { name: 'Fatal', min: 91, max: 100 },
]

export const WEAKNESS_DURATION: RollRange[] = [
  { name: 'Continuous with Contact', min: 1, max: 40 },
  { name: 'Limited Duration with Contact', min: 41, max: 60 },
  { name: 'Limited Duration after Contact', min: 61, max: 90 },
  { name: 'Permanent', min: 91, max: 100 },
]
