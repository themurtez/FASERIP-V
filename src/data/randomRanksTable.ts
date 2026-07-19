// The Random Ranks Table: 5 columns, each a d100 -> rank lookup, used to
// generate Primary Abilities (and, per rules.pdf, Resources/Popularity too).
// Which column a character uses is decided by their Physical Form
// (see physicalForms.ts).
//
// MEDIUM CONFIDENCE: rules.pdf's text extraction visually scrambled this
// table's layout (columns got read top-to-bottom instead of row-by-row).
// This is a reconstruction from that scrambled text -- each column's ranges
// are internally consistent (span 1-100 with no gaps/overlaps) and the shape
// matches the body-type flavor text (e.g. Column 2 tops out at Excellent,
// fitting "Normal Human"; Column 5 reaches Monstrous most easily, fitting
// Deities/Energy Beings) -- but it hasn't been checked against the original
// book page. Worth verifying if exact odds matter (see PLAN.md §9).

import type { RandomRanksColumn, RollRange } from '@/types/reference'

export const RANDOM_RANKS_COLUMNS: Record<RandomRanksColumn, RollRange[]> = {
  1: [
    { name: 'Feeble', min: 1, max: 5 },
    { name: 'Poor', min: 6, max: 10 },
    { name: 'Typical', min: 11, max: 20 },
    { name: 'Good', min: 21, max: 40 },
    { name: 'Excellent', min: 41, max: 60 },
    { name: 'Remarkable', min: 61, max: 80 },
    { name: 'Incredible', min: 81, max: 96 },
    { name: 'Amazing', min: 97, max: 100 },
  ],
  2: [
    { name: 'Feeble', min: 1, max: 5 },
    { name: 'Poor', min: 6, max: 25 },
    { name: 'Typical', min: 26, max: 75 },
    { name: 'Good', min: 76, max: 95 },
    { name: 'Excellent', min: 96, max: 100 },
  ],
  3: [
    { name: 'Feeble', min: 1, max: 5 },
    { name: 'Poor', min: 6, max: 10 },
    { name: 'Typical', min: 11, max: 40 },
    { name: 'Good', min: 41, max: 80 },
    { name: 'Excellent', min: 81, max: 95 },
    { name: 'Remarkable', min: 96, max: 100 },
  ],
  4: [
    { name: 'Feeble', min: 1, max: 5 },
    { name: 'Poor', min: 6, max: 10 },
    { name: 'Typical', min: 11, max: 15 },
    { name: 'Good', min: 16, max: 40 },
    { name: 'Excellent', min: 41, max: 50 },
    { name: 'Remarkable', min: 51, max: 70 },
    { name: 'Incredible', min: 71, max: 90 },
    { name: 'Amazing', min: 91, max: 98 },
    { name: 'Monstrous', min: 99, max: 100 },
  ],
  5: [
    { name: 'Feeble', min: 1, max: 10 },
    { name: 'Poor', min: 11, max: 20 },
    { name: 'Typical', min: 21, max: 30 },
    { name: 'Good', min: 31, max: 40 },
    { name: 'Excellent', min: 41, max: 60 },
    { name: 'Remarkable', min: 61, max: 70 },
    { name: 'Incredible', min: 71, max: 80 },
    { name: 'Amazing', min: 81, max: 95 },
    { name: 'Monstrous', min: 96, max: 100 },
  ],
}

export function rankRangesForColumn(column: RandomRanksColumn): RollRange[] {
  return RANDOM_RANKS_COLUMNS[column]
}
