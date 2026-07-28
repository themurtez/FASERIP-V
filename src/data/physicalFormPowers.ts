// Default/bonus Powers a Physical Form's race grants automatically, pulled
// from the same `modifiers` text as physicalFormBonuses.ts -- the subset
// that names a specific power (or an unambiguous category to pick one from)
// cleanly enough to auto-roll. When generating a character's Powers, these
// are placed into the leading slots first (see generateCharacter.ts's
// rollDefaultPowers), then the rest of the slot budget is rolled normally.
//
// Left out on purpose: grants that are too vague to resolve to even an
// approximate Powers entry (e.g. Robot - Humanshape's "Self-repair simulates
// normal Healing"), grants tied to a sub-choice this app doesn't track
// (Modified Human - Extra Parts' "Wings give Flight" depends on which extra
// parts were rolled), and plain "gains one Power/one less Power" adjustments
// to the power count itself rather than a specific power. Those stay as
// reference text only. Where there's no exact-name match but a clear closest
// power (Angel/Demon's "Invulnerability to Fire" -> Immunity, the power
// list's flat "immune to one attack type" entry), that's used instead,
// noted per-entry below.

import type { RankName } from '@/types/character'

export interface PhysicalFormDefaultPower {
  /** Exact Powers entry name, when the race grants one specific power (e.g. Merhuman's Water Freedom). */
  name?: string
  /** Powers category to pick (a) random power from, when the race grants "at least one X power" without naming it (Deity's Travel Power). */
  category?: string
  /** How many instances of this grant, e.g. Animal's "Two Detection Powers". Defaults to 1. */
  count?: number
  /** Fixed starting rank when the rules specify one (e.g. "at Good rank"); otherwise rolled like any other Power. */
  rank?: RankName
}

export const PHYSICAL_FORM_DEFAULT_POWERS: Record<string, PhysicalFormDefaultPower[]> = {
  Chiropteran: [{ name: 'Sonar', rank: 'Good' }],
  Merhuman: [{ name: 'Water Freedom' }],
  // Fire Generation + Invulnerability to Fire is a Demon-only trait, not
  // Angel's -- no fire-specific invulnerability power exists in the list, so
  // Immunity (the closest match) stands in for it, rolled normally (no rank
  // specified). Angel's own trait is its "Bonus: magic sword (Artifact
  // Creation, Excellent damage)".
  Angel: [{ name: 'Artifact Creation', rank: 'Excellent' }],
  Demon: [{ name: 'Fire Generation', rank: 'Good' }, { name: 'Immunity' }],
  Deity: [{ category: 'Travel' }],
  Animal: [{ category: 'Detection Powers', count: 2, rank: 'Good' }],
  Vegetable: [{ name: 'Energy Absorption', rank: 'Good' }],
  'Liquid Life': [{ name: 'Phasing' }],
  'Gaseous Life': [{ name: 'Phasing' }],
  'Energy Body': [{ category: 'Energy Emission Powers' }],
}

export function defaultPowersForForm(formName: string): PhysicalFormDefaultPower[] {
  return PHYSICAL_FORM_DEFAULT_POWERS[formName] ?? []
}

/** How many guaranteed Power slots a Physical Form's default grants occupy
 * (e.g. Demon's Fire Generation + Immunity = 2, Animal's "Two Detection
 * Powers" = 2) -- a pure count, with no rank/name resolution, so it's cheap
 * to call from a computed without re-rolling anything. */
export function defaultPowerCount(formName: string): number {
  return defaultPowersForForm(formName).reduce((sum, spec) => sum + (spec.count ?? 1), 0)
}
