// The generation engine: one function per generatable field/section. Each
// is a pure function -- given the relevant inputs, returns a fresh value.
// The Pinia store (stores/character.ts) is the only place that checks
// `locked` and decides whether to call these at all, so that check lives in
// exactly one place instead of being duplicated in every generator.
//
// Swapping a mocked table for a real one (PLAN.md §6) means editing the
// `src/data/*` file a function below reads from -- none of these signatures
// need to change, and neither does any component that calls into the store.

import { v4 as uuidv4 } from 'uuid'
import type {
  BasicInfo,
  Character,
  ContactSlot,
  PowerSlot,
  PowersSection,
  PrimaryAbilities,
  PrimaryAbilityKey,
  RankName,
  RankValue,
  SecondaryAbilities,
  TalentSlot,
  TalentsSection,
  Weakness,
} from '@/types/character'
import { MAX_POWER_SLOTS, MAX_TALENT_SLOTS, PRIMARY_ABILITY_KEYS } from '@/types/character'
import type { RandomRanksColumn } from '@/types/reference'
import { pickFromRanges, pickUniform } from './dice'
import { rankTier, rankIndex, RANK_TIERS, shiftRank } from '@/data/ranks'
import { PHYSICAL_FORMS, physicalFormByName } from '@/data/physicalForms'
import { abilityBonusForForm, secondaryBonusForForm, powerCountBonusForForm } from '@/data/physicalFormBonuses'
import { defaultPowersForForm, type PhysicalFormDefaultPower } from '@/data/physicalFormPowers'
import { ORIGINS } from '@/data/origins'
import { OCCUPATIONS } from '@/data/occupations'
import { WEAKNESS_STIMULUS, WEAKNESS_EFFECT, WEAKNESS_DURATION } from '@/data/weaknesses'
import { rankRangesForColumn } from '@/data/randomRanksTable'
import { ABILITY_MODIFIER_TABLE } from '@/data/abilityModifierTable'
import { POWERS_COUNT_TABLE, TALENTS_COUNT_TABLE } from '@/data/countTables'
import { POWERS, powerByName, powerSlotCost } from '@/data/powers'
import { TALENTS, talentByName } from '@/data/talents'

// ---------------------------------------------------------------------------
// Physical Form / Origin / Occupation -- simple string picks

/** Mocked: real table would weight this toward common forms (Normal Human etc). */
export function rollPhysicalForm(): string {
  return pickUniform(PHYSICAL_FORMS).name
}

export function columnForPhysicalForm(physicalFormName: string): RandomRanksColumn {
  return physicalFormByName(physicalFormName)?.column ?? 2
}

export function rollOrigin(): string {
  return pickFromRanges(ORIGINS).name
}

/** Stub data source (src/data/occupations.ts) -- picked uniformly regardless. */
export function rollOccupation(): string {
  return pickUniform(OCCUPATIONS)
}

// ---------------------------------------------------------------------------
// Primary Abilities / Secondary Abilities

export function rollAbilityRank(column: RandomRanksColumn): RankValue {
  const range = pickFromRanges(rankRangesForColumn(column))
  const tier = rankTier(range.name)
  return { rank: tier.name, rankNumber: tier.rankNumber, locked: false }
}

/** Resources start at Typical, modified by a roll on the Ability Modifier
 * Table (rules.pdf, "Generating Resources") -- clamped to Feeble..Monstrous
 * per that table's own rule. (The "Poor for aliens" starting point and the
 * "High Technology heroes may take a flat Good instead" option both depend
 * on data this app doesn't track -- alien status isn't a field on any
 * Origin/Physical Form, and "high technology" isn't a determinable trait --
 * so both are left for the player to apply manually via the rank controls.) */
export function rollResourcesRank(): RankValue {
  const modifier = pickFromRanges(ABILITY_MODIFIER_TABLE)
  const feebleIdx = rankIndex('Feeble')
  const monstrousIdx = rankIndex('Monstrous')
  const idx = Math.min(monstrousIdx, Math.max(feebleIdx, rankIndex('Typical') + modifier.delta))
  const tier = RANK_TIERS[idx] as (typeof RANK_TIERS)[number]
  return { rank: tier.name, rankNumber: tier.rankNumber, locked: false }
}

/** Deterministic CS bonus/penalty a Physical Form's race grants a given
 * Primary Ability -- "Strength +1CS", "All Primary Abilities +2CS", etc.
 * See physicalFormBonuses.ts for what is and isn't covered. */
export function racialAbilityBonus(physicalFormName: string, key: PrimaryAbilityKey): number {
  const bonus = abilityBonusForForm(physicalFormName)
  if (!bonus) return 0
  return (bonus.fixed?.[key] ?? 0) + (bonus.allAbilities ?? 0)
}

/** CS bonus for "may raise any one Primary Ability +NCS" races -- undefined
 * if this Physical Form doesn't grant a free choice. */
export function racialAnyOneAbilityBonus(physicalFormName: string): number | undefined {
  return abilityBonusForForm(physicalFormName)?.anyOne
}

/** Deterministic CS bonus/penalty a Physical Form's race grants Resources or
 * Popularity -- "Popularity +2CS", etc. See physicalFormBonuses.ts. */
export function racialSecondaryBonus(physicalFormName: string, field: 'resources' | 'popularity'): number {
  return secondaryBonusForForm(physicalFormName)?.[field] ?? 0
}

export function computeHealth(abilities: PrimaryAbilities): number {
  return (
    abilities.fighting.rankNumber +
    abilities.agility.rankNumber +
    abilities.strength.rankNumber +
    abilities.endurance.rankNumber
  )
}

export function computeKarma(abilities: PrimaryAbilities): number {
  return abilities.reason.rankNumber + abilities.intuition.rankNumber + abilities.psyche.rankNumber
}

// ---------------------------------------------------------------------------
// Weakness

export function rollWeakness(): Weakness {
  return {
    stimulus: { value: pickFromRanges(WEAKNESS_STIMULUS).name, locked: false },
    effect: { value: pickFromRanges(WEAKNESS_EFFECT).name, locked: false },
    duration: { value: pickFromRanges(WEAKNESS_DURATION).name, locked: false },
  }
}

// ---------------------------------------------------------------------------
// Powers
//
// How many Powers a character starts with uses the real book table
// (countTables.ts, POWERS_COUNT_TABLE -- rules.pdf ~page 14): a single d100
// roll looks up both `current` and the growth ceiling `max` together, rather
// than rolling them independently. A rolled Power's starting rank uses the
// real Random Ranks Table, column 4.

/** Flat +/- Power count some races grant, e.g. Deity's "Two additional
 * Powers" or a Modified Human's "One less Power initially". See
 * physicalFormBonuses.ts's PHYSICAL_FORM_POWER_COUNT_BONUSES. */
export function racialPowerCountBonus(physicalFormName: string): number {
  return powerCountBonusForForm(physicalFormName)
}

export function rollPowerCount(physicalFormName: string): { current: number; max: number } {
  const bonus = racialPowerCountBonus(physicalFormName)
  const roll = pickFromRanges(POWERS_COUNT_TABLE)
  const max = Math.min(MAX_POWER_SLOTS, Math.max(1, roll.cap + bonus))
  const current = Math.min(max, Math.max(0, roll.current + bonus))
  return { current, max }
}

/** A Power's starting rank -- rolled on Random Ranks Table column 4, unless
 * an explicit rank is given (a racially-granted Power with a specified
 * starting rank, e.g. Chiropteran's Sonar at Good). */
function resolvePowerRank(explicitRank?: RankName): { rank: RankName; rankNumber: number } {
  if (explicitRank) {
    const tier = rankTier(explicitRank)
    return { rank: tier.name, rankNumber: tier.rankNumber }
  }
  const rolled = rollAbilityRank(4)
  return { rank: rolled.rank, rankNumber: rolled.rankNumber }
}

export function rollPower(slot: number): PowerSlot {
  const entry = pickUniform(POWERS)
  const { rank, rankNumber } = resolvePowerRank()
  return {
    slot,
    name: entry.name,
    category: entry.category,
    rank,
    rankNumber,
    locked: false,
  }
}

/** Used when the player manually picks a power's name from the dropdown -- keeps the rolled rank. */
export function applyPowerName(existing: PowerSlot, name: string): PowerSlot {
  const entry = powerByName(name)
  return { ...existing, name, category: entry?.category ?? existing.category }
}

export interface DefaultPowerRoll {
  name: string
  category: string
  rank: RankName
  rankNumber: number
}

function resolveDefaultPowerGrant(spec: PhysicalFormDefaultPower, exclude: Set<string>) {
  if (spec.name) return powerByName(spec.name)
  if (spec.category) {
    const pool = POWERS.filter((p) => p.category === spec.category && !exclude.has(p.name))
    return pool.length ? pickUniform(pool) : undefined
  }
  return undefined
}

/** Some races automatically start with specific Powers -- Merhuman's Water
 * Freedom, Chiropteran's Sonar at Good rank, Deity's free (unnamed) Travel
 * Power, Animal's two Detection Powers, etc (see physicalFormPowers.ts).
 * Resolved into concrete rolls, ready to seed the first N Power slots ahead
 * of the random roll for the rest of the character's Power budget. */
export function rollDefaultPowers(physicalFormName: string): DefaultPowerRoll[] {
  const specs = defaultPowersForForm(physicalFormName)
  const picked = new Set<string>()
  const out: DefaultPowerRoll[] = []
  for (const spec of specs) {
    for (let n = 0; n < (spec.count ?? 1); n++) {
      const entry = resolveDefaultPowerGrant(spec, picked)
      if (!entry) continue
      picked.add(entry.name)
      const { rank, rankNumber } = resolvePowerRank(spec.rank)
      out.push({ name: entry.name, category: entry.category, rank, rankNumber })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Talents
//
// How many Talents a character starts with uses the real book table
// (countTables.ts, TALENTS_COUNT_TABLE -- rules.pdf ~page 14), same as Powers.

export function rollTalentCount(): { current: number; max: number } {
  const roll = pickFromRanges(TALENTS_COUNT_TABLE)
  return { current: roll.current, max: roll.cap }
}

export function rollTalent(slot: number): TalentSlot {
  const entry = pickUniform(TALENTS)
  return { slot, name: entry.name, locked: false }
}

export function applyTalentName(existing: TalentSlot, name: string): TalentSlot {
  const entry = talentByName(name)
  return { ...existing, name: entry?.name ?? name }
}

// ---------------------------------------------------------------------------
// Whole-character defaults / assembly

function emptyRank(): RankValue {
  const tier = rankTier('Typical')
  return { rank: tier.name, rankNumber: tier.rankNumber, locked: false }
}

function emptyBasicInfo(): BasicInfo {
  return {
    player: '',
    name: '',
    identity: '',
    group: '',
    base: '',
    hair: '',
    eyes: '',
    weight: '',
    height: '',
    skin: '',
    age: '',
    origin: { value: ORIGINS[0]?.name ?? 'Natal', locked: false },
    physicalForm: { value: 'Normal Human', locked: false },
    occupation: { value: OCCUPATIONS[0] ?? '', locked: false },
    notes: '',
  }
}

function emptyPrimaryAbilities(): PrimaryAbilities {
  const abilities = {} as PrimaryAbilities
  for (const key of PRIMARY_ABILITY_KEYS) {
    abilities[key] = emptyRank()
  }
  return abilities
}

function emptySecondaryAbilities(abilities: PrimaryAbilities): SecondaryAbilities {
  return {
    health: { value: computeHealth(abilities), locked: false },
    karma: { value: computeKarma(abilities), locked: false },
    resources: emptyRank(),
    popularity: emptyRank(),
  }
}

function emptyPowerSlots(): PowerSlot[] {
  return Array.from({ length: MAX_POWER_SLOTS }, (_, i) => ({
    slot: i + 1,
    name: '',
    category: '',
    rank: '' as const,
    rankNumber: 0,
    locked: false,
  }))
}

function emptyPowers(): PowersSection {
  return { count: { current: 0, max: 7, locked: false }, slots: emptyPowerSlots() }
}

function emptyTalentSlots(): TalentSlot[] {
  return Array.from({ length: MAX_TALENT_SLOTS }, (_, i) => ({ slot: i + 1, name: '', locked: false }))
}

function emptyTalents(): TalentsSection {
  return { count: { current: 0, max: 4, locked: false }, slots: emptyTalentSlots() }
}

function emptyContacts(): { slots: ContactSlot[] } {
  return { slots: [] }
}

function emptyWeakness(): Weakness {
  return {
    stimulus: { value: WEAKNESS_STIMULUS[0]?.name ?? '', locked: false },
    effect: { value: WEAKNESS_EFFECT[0]?.name ?? '', locked: false },
    duration: { value: WEAKNESS_DURATION[0]?.name ?? '', locked: false },
  }
}

// ---------------------------------------------------------------------------
// Bulk generation
//
// A fully-rolled character built end to end as a pure function, walking the
// same book order as the store's generateAll() -- but with no `locked`
// checks (every field starts fresh/unlocked) and an optional forced origin/
// physicalForm/occupation instead of always rolling them. Used by the "Bulk
// Generate & Save" dialog to mint many characters at once without routing
// each one through the Pinia store (which would overwrite the live sheet
// and bloat its localStorage-backed history).

export interface CharacterOverrides {
  origin?: string
  physicalForm?: string
  occupation?: string
}

export function rollNewCharacter(overrides: CharacterOverrides = {}): Character {
  const now = new Date().toISOString()
  const physicalForm = overrides.physicalForm ?? rollPhysicalForm()
  const origin = overrides.origin ?? rollOrigin()
  const occupation = overrides.occupation ?? rollOccupation()
  const column = columnForPhysicalForm(physicalForm)

  const primaryAbilities = {} as PrimaryAbilities
  for (const key of PRIMARY_ABILITY_KEYS) {
    const rolled = rollAbilityRank(column)
    const bonus = racialAbilityBonus(physicalForm, key)
    const tier = bonus ? shiftRank(rolled.rank, bonus) : rankTier(rolled.rank)
    primaryAbilities[key] = { rank: tier.name, rankNumber: tier.rankNumber, locked: false }
  }
  const anyOneBonus = racialAnyOneAbilityBonus(physicalForm)
  if (anyOneBonus) {
    const key = pickUniform(PRIMARY_ABILITY_KEYS)
    const tier = shiftRank(primaryAbilities[key].rank, anyOneBonus)
    primaryAbilities[key] = { rank: tier.name, rankNumber: tier.rankNumber, locked: false }
  }

  const resourcesRolled = rollResourcesRank()
  const resourcesBonus = racialSecondaryBonus(physicalForm, 'resources')
  const resourcesTier = resourcesBonus
    ? shiftRank(resourcesRolled.rank, resourcesBonus)
    : rankTier(resourcesRolled.rank)

  const popularityRolled = rollAbilityRank(column)
  const popularityBonus = racialSecondaryBonus(physicalForm, 'popularity')
  const popularityTier = popularityBonus
    ? shiftRank(popularityRolled.rank, popularityBonus)
    : rankTier(popularityRolled.rank)

  const secondaryAbilities: SecondaryAbilities = {
    health: { value: computeHealth(primaryAbilities), locked: false },
    karma: { value: computeKarma(primaryAbilities), locked: false },
    resources: { rank: resourcesTier.name, rankNumber: resourcesTier.rankNumber, locked: false },
    popularity: { rank: popularityTier.name, rankNumber: popularityTier.rankNumber, locked: false },
  }

  const powerCount = rollPowerCount(physicalForm)
  const forcedPowers = rollDefaultPowers(physicalForm)
  let forcedIndex = 0
  let remainingBudget = powerCount.current
  const powerSlots: PowerSlot[] = Array.from({ length: MAX_POWER_SLOTS }, (_, i) => {
    if (i >= powerCount.current || remainingBudget <= 0) {
      return { slot: i + 1, name: '', category: '', rank: '' as const, rankNumber: 0, locked: false }
    }
    const grant = forcedIndex < forcedPowers.length ? forcedPowers[forcedIndex] : undefined
    let rolled: PowerSlot
    if (grant) {
      forcedIndex++
      rolled = { slot: i + 1, name: grant.name, category: grant.category, rank: grant.rank, rankNumber: grant.rankNumber, locked: false }
    } else {
      rolled = rollPower(i + 1)
    }
    remainingBudget -= powerSlotCost(rolled.name)
    return rolled
  })

  const talentCount = rollTalentCount()
  const talentSlots: TalentSlot[] = Array.from({ length: MAX_TALENT_SLOTS }, (_, i) =>
    i < talentCount.current ? rollTalent(i + 1) : { slot: i + 1, name: '', locked: false },
  )

  return {
    schemaVersion: 1,
    id: uuidv4(),
    meta: { createdAt: now, updatedAt: now },
    basicInfo: {
      player: '',
      name: '',
      identity: '',
      group: '',
      base: '',
      hair: '',
      eyes: '',
      weight: '',
      height: '',
      skin: '',
      age: '',
      origin: { value: origin, locked: false },
      physicalForm: { value: physicalForm, locked: false },
      occupation: { value: occupation, locked: false },
      notes: '',
    },
    primaryAbilities,
    secondaryAbilities,
    weakness: rollWeakness(),
    powers: { count: { current: powerCount.current, max: powerCount.max, locked: false }, slots: powerSlots },
    talents: { count: { current: talentCount.current, max: talentCount.max, locked: false }, slots: talentSlots },
    contacts: { slots: [] },
    background: '',
  }
}

/** A neutral, unrolled shell -- the store immediately runs full generation
 * over this on first load so the app boots with a complete character rather
 * than a wall of blanks, but nothing here is random itself. */
export function createDefaultCharacter(): Character {
  const now = new Date().toISOString()
  const primaryAbilities = emptyPrimaryAbilities()
  return {
    schemaVersion: 1,
    id: uuidv4(),
    meta: { createdAt: now, updatedAt: now },
    basicInfo: emptyBasicInfo(),
    primaryAbilities,
    secondaryAbilities: emptySecondaryAbilities(primaryAbilities),
    weakness: emptyWeakness(),
    powers: emptyPowers(),
    talents: emptyTalents(),
    contacts: emptyContacts(),
    background: '',
  }
}
