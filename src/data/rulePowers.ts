// Rule Powers -- a homebrew Power category (not in the original Ultimate
// Powers List) rolled on the Ultimate Powers Table at 70-75, see
// powerCategories.ts. Table below is the full d100 sub-table for this
// category, in the same shape as the powers.json entries so it can be
// merged into POWERS for normal rolling/dropdown display.

import type { PowerEntry } from '@/types/reference'

export const RULE_POWERS_CATEGORY = 'Rule Powers'

export const RULE_POWERS: PowerEntry[] = [
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '01-12',
    name: 'Attribute Change',
    tier: null,
    description: '',
    code: 'R1',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '13-29',
    name: 'Attribute Pool',
    tier: null,
    description: '',
    code: 'R2',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '30-41',
    name: 'Attribute Rearrangement',
    tier: null,
    description: '',
    code: 'R3',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '42-47',
    name: 'Award Change',
    tier: null,
    description: '',
    code: 'R4',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '48-59',
    name: 'Award Pool',
    tier: null,
    description: '',
    code: 'R5',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '60-65',
    name: 'Award Rearrangement',
    tier: null,
    description: '',
    code: 'R6',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '66-71',
    name: 'Initiative Change',
    tier: null,
    description: '',
    code: 'R7',
  },
  {
    category: RULE_POWERS_CATEGORY,
    categorySlug: 'RulePowers',
    roll: '72-00',
    name: 'Power Combination',
    tier: null,
    description: '',
    code: 'R8',
  },
]
