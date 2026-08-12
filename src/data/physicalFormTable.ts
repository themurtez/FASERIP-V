// The top-level Physical Form d100 table (rules.pdf p.3) -- which Physical
// Form a character gets, before any of that form's own sub-roll (Mutant's
// Induced/Random/Breed, Modified Human's four variants, Demihuman's eleven,
// Cyborg's four, Robot's four).
//
// MEDIUM-LOW CONFIDENCE: the scanned table's 48-87 span (Modified Human,
// Demihuman, Cyborg, Robot) came through with corrupted/out-of-order ranges
// (e.g. "48-19", "60-61", "52-53" for Modified Human's four rows; the eleven
// Demihuman rows as bare single numbers with no ranges at all) -- reread
// twice from the user and unchanged both times, so not a one-off OCR glitch
// that a retry would fix. The anchor rows outside that span (Normal Human,
// the Mutant trio, Android, Humanoid Race, Surgical Composite, and the
// singles from Angel/Demon through Changeling) are clean and used as given.
// Inside the corrupted span, each group's total width is trustworthy (the
// span sums correctly either way: 48-87 is exactly 40 numbers, matching
// Modified Human(4) + Demihuman(11) + Cyborg(4) + Robot(4) sub-types) but
// the boundaries between individual sub-types are an even split within each
// group, not sourced from the book. Worth correcting against the real book
// page if exact odds matter for these sub-types (see PLAN.md §9 pattern).
//
// Angel/Demon shares a single roll (88) in this table -- which of the two
// you get isn't specified by a die range here, see rollAngelOrDemon.

import type { RollRange } from '@/types/reference'

export const PHYSICAL_FORM_TABLE: RollRange[] = [
  { name: 'Normal Human', min: 1, max: 25 },
  { name: 'Mutant - Induced', min: 26, max: 30 },
  { name: 'Mutant - Random', min: 31, max: 33 },
  { name: 'Mutant - Breed', min: 34, max: 35 },
  { name: 'Android', min: 36, max: 38 },
  { name: 'Humanoid Race', min: 39, max: 46 },
  { name: 'Surgical Composite', min: 47, max: 47 },
  { name: 'Modified Human - Organic', min: 48, max: 50 },
  { name: 'Modified Human - Muscular', min: 51, max: 53 },
  { name: 'Modified Human - Skeletal', min: 54, max: 55 },
  { name: 'Modified Human - Extra Parts', min: 56, max: 57 },
  { name: 'Centaur', min: 58, max: 59 },
  { name: 'Equiman', min: 60, max: 61 },
  { name: 'Faun', min: 62, max: 63 },
  { name: 'Felinoid', min: 64, max: 64 },
  { name: 'Lupinoid', min: 65, max: 65 },
  { name: 'Avian - Angel', min: 66, max: 66 },
  { name: 'Avian - Harpy', min: 67, max: 67 },
  { name: 'Chiropteran', min: 68, max: 68 },
  { name: 'Lamian', min: 69, max: 69 },
  { name: 'Merhuman', min: 70, max: 70 },
  { name: 'Other Demihuman', min: 71, max: 71 },
  { name: 'Cyborg - Limb/Organ', min: 72, max: 73 },
  { name: 'Cyborg - Exoskeleton', min: 74, max: 75 },
  { name: 'Cyborg - Mechanical Body', min: 76, max: 77 },
  { name: 'Cyborg - Mechanically Augmented', min: 78, max: 79 },
  { name: 'Robot - Humanshape', min: 80, max: 81 },
  { name: 'Robot - Usuform', min: 82, max: 83 },
  { name: 'Robot - Metamorphic', min: 84, max: 85 },
  { name: 'Robot - Computer', min: 86, max: 87 },
  { name: 'Angel/Demon', min: 88, max: 88 },
  { name: 'Deity', min: 89, max: 89 },
  { name: 'Animal', min: 90, max: 90 },
  { name: 'Vegetable', min: 91, max: 91 },
  { name: 'Abnormal Biochemistry', min: 92, max: 92 },
  { name: 'Mineral Life', min: 93, max: 93 },
  { name: 'Gaseous Life', min: 94, max: 94 },
  { name: 'Liquid Life', min: 95, max: 95 },
  { name: 'Energy Body', min: 96, max: 96 },
  { name: 'Ethereal', min: 97, max: 97 },
  { name: 'Undead', min: 98, max: 98 },
  { name: 'Compound', min: 99, max: 99 },
  { name: 'Changeling', min: 100, max: 100 },
]

/** The table's roll names don't all match a PHYSICAL_FORMS entry 1:1 -- the
 * Mutant/Modified Human/Cyborg/Robot rows are pre-resolved to their specific
 * sub-type name already (e.g. "Mutant - Induced" -> "Induced Mutant"),
 * "Avian - Angel"/"Avian - Harpy" map to PHYSICAL_FORMS' "Avian - Angel"/
 * "Avian - Harpy" directly, and "Angel/Demon" resolves to one of the two via
 * a coin flip (rollAngelOrDemon) since the book gives them a single shared
 * roll. */
export const PHYSICAL_FORM_TABLE_NAME_MAP: Record<string, string> = {
  'Mutant - Induced': 'Induced Mutant',
  'Mutant - Random': 'Random Mutation',
  'Mutant - Breed': 'Breed Mutant',
  'Other Demihuman': 'Other Demihuman',
}
