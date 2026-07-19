// The character schema: this is both the Pinia store's shape and the
// import/export JSON contract described in PLAN.md §4. Every generatable
// leaf carries its own `locked` flag so "Generate" actions can skip it.

export const SCHEMA_VERSION = 1

export const RANK_NAMES = [
  'Shift 0',
  'Feeble',
  'Poor',
  'Typical',
  'Good',
  'Excellent',
  'Remarkable',
  'Incredible',
  'Amazing',
  'Monstrous',
  'Unearthly',
  'Shift X',
  'Shift Y',
  'Shift Z',
  'Class 1000',
  'Class 3000',
  'Class 5000',
] as const

export type RankName = (typeof RANK_NAMES)[number]

export interface RankValue {
  rank: RankName
  rankNumber: number
  locked: boolean
}

export interface LockedValue<T> {
  value: T
  locked: boolean
}

export interface BasicInfo {
  player: string
  name: string
  identity: string
  group: string
  base: string
  hair: string
  eyes: string
  weight: string
  height: string
  skin: string
  age: string
  origin: LockedValue<string>
  physicalForm: LockedValue<string>
  occupation: LockedValue<string>
  notes: string
}

export interface PrimaryAbilities {
  fighting: RankValue
  agility: RankValue
  strength: RankValue
  endurance: RankValue
  reason: RankValue
  intuition: RankValue
  psyche: RankValue
}

export type PrimaryAbilityKey = keyof PrimaryAbilities

export const PRIMARY_ABILITY_KEYS: PrimaryAbilityKey[] = [
  'fighting',
  'agility',
  'strength',
  'endurance',
  'reason',
  'intuition',
  'psyche',
]

export const PRIMARY_ABILITY_LABELS: Record<PrimaryAbilityKey, string> = {
  fighting: 'Fighting',
  agility: 'Agility',
  strength: 'Strength',
  endurance: 'Endurance',
  reason: 'Reason',
  intuition: 'Intuition',
  psyche: 'Psyche',
}

export interface SecondaryAbilities {
  health: LockedValue<number>
  karma: LockedValue<number>
  resources: RankValue
  popularity: RankValue
}

export interface Weakness {
  stimulus: LockedValue<string>
  effect: LockedValue<string>
  duration: LockedValue<string>
}

export interface PowerSlot {
  slot: number
  name: string
  category: string
  rank: RankName | ''
  rankNumber: number
  locked: boolean
}

// The Powers count table (countTables.ts) tops out at 18 (roll "00"), and
// the largest racial Power-count bonus is Deity's +2 -- so 20 slots covers
// every reachable combination with no clamping needed.
export const MAX_POWER_SLOTS = 20

export interface PowersSection {
  count: { current: number; max: number; locked: boolean }
  slots: PowerSlot[]
}

export interface TalentSlot {
  slot: number
  name: string
  locked: boolean
}

export const MAX_TALENT_SLOTS = 8

export interface TalentsSection {
  count: { current: number; max: number; locked: boolean }
  slots: TalentSlot[]
}

export interface ContactSlot {
  slot: number
  name: string
  description: string
  locked: boolean
}

export interface Character {
  schemaVersion: number
  id: string
  meta: { createdAt: string; updatedAt: string }
  basicInfo: BasicInfo
  primaryAbilities: PrimaryAbilities
  secondaryAbilities: SecondaryAbilities
  weakness: Weakness
  powers: PowersSection
  talents: TalentsSection
  contacts: { slots: ContactSlot[] }
  background: string
}
