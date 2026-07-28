// Rank name <-> number ladder.
//
// The Feeble..Monstrous numbers come straight from rules.pdf's "Random Ranks
// Table" (the Initial Rank Number column) and match the reference screenshot
// exactly (Typical=5, Excellent=16, etc.) -- NOT the higher "standard" MSH
// numbers (Typical=6, Excellent=20...) you'll find in general FASERIP
// references. We follow the book/screenshot on purpose.
//
// Unearthly and above are *not* in the provided rules.pdf excerpt (random
// generation tops out at Monstrous) -- they're included so manual rank
// selection isn't artificially capped, using the standard published MSH
// values. Flagged via `source: 'standard'`.

import type { RankName } from '@/types/character'

export interface RankTier {
  name: RankName
  rankNumber: number
  abbreviation: string
  source: 'book' | 'standard'
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Shift 0', rankNumber: 0, abbreviation: 'SH0', source: 'standard' },
  { name: 'Feeble', rankNumber: 1, abbreviation: 'FE', source: 'book' },
  { name: 'Poor', rankNumber: 3, abbreviation: 'PR', source: 'book' },
  { name: 'Typical', rankNumber: 5, abbreviation: 'TY', source: 'book' },
  { name: 'Good', rankNumber: 8, abbreviation: 'GD', source: 'book' },
  { name: 'Excellent', rankNumber: 16, abbreviation: 'EX', source: 'book' },
  { name: 'Remarkable', rankNumber: 26, abbreviation: 'RM', source: 'book' },
  { name: 'Incredible', rankNumber: 36, abbreviation: 'IN', source: 'book' },
  { name: 'Amazing', rankNumber: 46, abbreviation: 'AM', source: 'book' },
  { name: 'Monstrous', rankNumber: 63, abbreviation: 'MN', source: 'book' },
  { name: 'Unearthly', rankNumber: 100, abbreviation: 'UN', source: 'standard' },
  { name: 'Shift X', rankNumber: 150, abbreviation: 'SX', source: 'standard' },
  { name: 'Shift Y', rankNumber: 200, abbreviation: 'SY', source: 'standard' },
  { name: 'Shift Z', rankNumber: 500, abbreviation: 'SZ', source: 'standard' },
  { name: 'Class 1000', rankNumber: 1000, abbreviation: 'CL1000', source: 'standard' },
  { name: 'Class 3000', rankNumber: 3000, abbreviation: 'CL3000', source: 'standard' },
  { name: 'Class 5000', rankNumber: 5000, abbreviation: 'CL5000', source: 'standard' },
]

const BY_NAME = new Map<string, RankTier>(RANK_TIERS.map((t) => [t.name, t]))

/** Accepts a plain string (not just RankName) since roll tables carry rank
 * names as loosely-typed strings -- throws if it's not actually on the ladder. */
export function rankTier(name: string): RankTier {
  const tier = BY_NAME.get(name)
  if (!tier) throw new Error(`Unknown rank: ${name}`)
  return tier
}

export function rankIndex(name: RankName): number {
  return RANK_TIERS.findIndex((t) => t.name === name)
}

/** Shift a rank up/down by `delta` Column Shifts, clamped to the ladder's ends.
 * Used for both manual +/- shifting and automatic Physical Form racial
 * bonuses (e.g. Demon's "+1CS to all Physical Abilities") -- the book's
 * Feeble..Monstrous ceiling applies to a table *roll*, not to a defined,
 * deterministic bonus stacked on top of one, so a roll that lands at
 * Monstrous and then gets a racial +1CS legitimately reaches Unearthly. The
 * one case that needed capping -- a race's *random* "raise any one ability"
 * pick -- is instead simply not auto-applied at all (see
 * racialAnyOneAbilityBonus's doc comment), so no separate clamped variant is
 * needed here. */
export function shiftRank(name: RankName, delta: number): RankTier {
  const idx = rankIndex(name)
  const next = Math.min(RANK_TIERS.length - 1, Math.max(0, idx + delta))
  return RANK_TIERS[next] as RankTier
}

export function formatRank(rank: RankName, rankNumber: number): string {
  return `${rankTier(rank).abbreviation}(${rankNumber})`
}

/** The named tier a raw rank NUMBER falls under -- the highest tier on the
 * ladder whose own number is <= n (e.g. 20 -> Excellent, 999 -> Shift Z).
 * Used for manual rank-number entry ("#"), where a player types an exact
 * number rather than picking/rolling a name; the typed number itself is
 * kept as-is (not snapped to the tier's canonical number), only the label
 * next to it is derived this way. */
export function rankForNumber(n: number): RankTier {
  let match = RANK_TIERS[0] as RankTier
  for (const tier of RANK_TIERS) {
    if (tier.rankNumber > n) break
    match = tier
  }
  return match
}
