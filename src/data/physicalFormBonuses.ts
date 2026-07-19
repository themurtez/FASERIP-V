// Structured racial bonuses/penalties pulled from each Physical Form's
// `modifiers` text (physicalForms.ts) -- the subset that's a clean,
// unconditional Column Shift (or, for Powers, a flat count delta), split
// into three tables: Primary Ability CS deltas, Resources/Popularity CS
// deltas, and starting-Power-count deltas.
//
// Left out on purpose: anything phrased as an absolute starting value rather
// than a delta from the rolled base (e.g. "Initial Resources Poor", "Initial
// Popularity zero" -- Surgical Composite, Humanoid Race, Faun, and others all
// use this "Initial X is <rank>" wording), anything conditional on player
// choice beyond a simple "any one ability" pick (e.g. Robot - Metamorphic's
// per-extra-form penalty, Changeling's while-transforming penalty, Deity's
// Popularity split between "public"/"established religions" -- the public
// figure is used), and Ethereal's "Fighting is zero on Earth" hard override,
// which isn't a CS delta. Those stay as reference text only.

import type { PrimaryAbilityKey } from '@/types/character'

export interface PhysicalFormAbilityBonus {
  /** Deterministic CS deltas for specific Primary Abilities, e.g. Strength +1. */
  fixed?: Partial<Record<PrimaryAbilityKey, number>>
  /** CS delta applied to every one of the 7 Primary Abilities. */
  allAbilities?: number
  /** "May raise any one Primary Ability +NCS" -- one ability, chosen at
   * random (among unlocked ones) when all seven are generated together. */
  anyOne?: number
}

export const PHYSICAL_FORM_ABILITY_BONUSES: Record<string, PhysicalFormAbilityBonus> = {
  'Induced Mutant': { anyOne: 1 },
  'Random Mutation': { fixed: { endurance: 1 } },
  'Breed Mutant': { fixed: { intuition: 1, endurance: 1 } },
  Android: { anyOne: 1 },
  'Humanoid Race': { anyOne: 1 },
  'Surgical Composite': { fixed: { strength: 1, fighting: 1, endurance: 1 } },
  'Modified Human - Muscular': { fixed: { strength: 1, endurance: 1 } },
  'Modified Human - Extra Parts': { fixed: { fighting: 1 } },
  Centaur: { fixed: { strength: 1 } },
  'Avian - Harpy': { fixed: { fighting: 1 } },
  'Cyborg - Limb/Organ': { fixed: { intuition: -1 } },
  'Cyborg - Mechanical Body': { fixed: { intuition: -1, psyche: -1 } },
  'Robot - Computer': { fixed: { reason: 2, fighting: -1 } },
  Angel: { fixed: { fighting: 1, agility: 1, strength: 1, endurance: 1 } },
  Demon: { fixed: { fighting: 1, agility: 1, strength: 1, endurance: 1 } },
  Deity: { allAbilities: 2 },
  Vegetable: { fixed: { fighting: -2, endurance: 2 } },
  'Abnormal Biochemistry': { fixed: { endurance: 1 } },
  Undead: { fixed: { strength: 1, endurance: 1 } },
}

export function abilityBonusForForm(formName: string): PhysicalFormAbilityBonus | undefined {
  return PHYSICAL_FORM_ABILITY_BONUSES[formName]
}

export interface PhysicalFormSecondaryBonus {
  resources?: number
  popularity?: number
}

export const PHYSICAL_FORM_SECONDARY_BONUSES: Record<string, PhysicalFormSecondaryBonus> = {
  'Normal Human': { resources: 1 },
  Android: { popularity: -1 },
  Deity: { popularity: 2 },
  Angel: { popularity: 2 },
  Demon: { popularity: -2 },
  'Avian - Angel': { popularity: 1 },
  Merhuman: { popularity: 1 },
  'Robot - Computer': { resources: 1 },
}

export function secondaryBonusForForm(formName: string): PhysicalFormSecondaryBonus | undefined {
  return PHYSICAL_FORM_SECONDARY_BONUSES[formName]
}

/** Flat delta to the rolled starting Power count (both `current` and `max`),
 * e.g. Deity's "Two additional Powers" or Modified Human's "One less Power". */
export const PHYSICAL_FORM_POWER_COUNT_BONUSES: Record<string, number> = {
  'Random Mutation': 1,
  Android: 1,
  'Modified Human - Organic': -1,
  'Modified Human - Muscular': -1,
  'Modified Human - Skeletal': -1,
  'Modified Human - Extra Parts': -1,
  'Cyborg - Mechanically Augmented': -1,
  Deity: 2,
  Animal: -1,
}

export function powerCountBonusForForm(formName: string): number {
  return PHYSICAL_FORM_POWER_COUNT_BONUSES[formName] ?? 0
}
