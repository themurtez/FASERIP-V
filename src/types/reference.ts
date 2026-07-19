// Shapes of the static reference data in src/data/*.
// These describe the *rulebook tables*, as distinct from character.ts which
// describes a generated character.

export type PowerTier = 'godly' | 'cosmic' | null

export interface PowerEntry {
  category: string
  categorySlug: string
  roll: string
  name: string
  tier: PowerTier
  description: string
}

export interface TalentEntry {
  category: string
  categorySlug: string
  roll: string
  name: string
  description: string
}

/** A d100 sub-range within a roll table. `min`/`max` are 1-100 (100 stands in for a roll of "00"). */
export interface RollRange {
  name: string
  min: number
  max: number
}

/** Which of the 5 Random Ranks Table columns a Physical Form rolls Primary Abilities on. */
export type RandomRanksColumn = 1 | 2 | 3 | 4 | 5

export interface PhysicalFormEntry {
  name: string
  /** Broad grouping used only for <optgroup>-style display (Mutant, Demihuman, Cyborg, Robot, ...). */
  group: string
  column: RandomRanksColumn
  /** true if rules.pdf didn't actually spell out this type's column and we picked a reasonable default. */
  columnAssumed?: boolean
  /** Flavor/mechanical summary from rules.pdf, shown to the player as reference text (not auto-applied). */
  modifiers: string
}
