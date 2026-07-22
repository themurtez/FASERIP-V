// Auto-save: POSTs a generated character to the Postgres-backed API
// (server/index.js) when the Options menu's "Auto-Save to Database" toggle
// is on. Fire-and-forget from the caller's perspective -- failures are
// logged, not surfaced as UI errors, since this runs after every generation
// and shouldn't interrupt the character sheet over a transient network blip.

import type { Character } from '@/types/character'

interface CharacterDbPayload {
  characterId: string
  player: string
  name: string
  identity: string
  charGroup: string
  base: string
  hair: string
  eyes: string
  weight: string
  height: string
  skin: string
  age: string
  origin: string
  physicalForm: string
  occupation: string
  notes: string
  fighting: number
  agility: number
  strength: number
  endurance: number
  reason: number
  intuition: number
  psyche: number
  health: number
  karma: number
  resources: number
  popularity: number
  weaknessStimulus: string
  weaknessEffect: string
  weaknessDuration: string
  powersCount: number
  powersMax: number
  powers: { name: string; category: string; level: number }[]
  talentsCount: number
  talentsMax: number
  talents: string[]
  background: string
}

/** Flattens a Character into the DB's column shape -- ranks become their
 * plain rankNumber (never "Excellent"/"EX" etc), and only populated
 * Power/Talent slots are included. */
export function toCharacterDbPayload(character: Character): CharacterDbPayload {
  const { basicInfo, primaryAbilities, secondaryAbilities, weakness, powers, talents, background } = character
  return {
    characterId: character.id,
    player: basicInfo.player,
    name: basicInfo.name,
    identity: basicInfo.identity,
    charGroup: basicInfo.group,
    base: basicInfo.base,
    hair: basicInfo.hair,
    eyes: basicInfo.eyes,
    weight: basicInfo.weight,
    height: basicInfo.height,
    skin: basicInfo.skin,
    age: basicInfo.age,
    origin: basicInfo.origin.value,
    physicalForm: basicInfo.physicalForm.value,
    occupation: basicInfo.occupation.value,
    notes: basicInfo.notes,

    fighting: primaryAbilities.fighting.rankNumber,
    agility: primaryAbilities.agility.rankNumber,
    strength: primaryAbilities.strength.rankNumber,
    endurance: primaryAbilities.endurance.rankNumber,
    reason: primaryAbilities.reason.rankNumber,
    intuition: primaryAbilities.intuition.rankNumber,
    psyche: primaryAbilities.psyche.rankNumber,

    health: secondaryAbilities.health.value,
    karma: secondaryAbilities.karma.value,
    resources: secondaryAbilities.resources.rankNumber,
    popularity: secondaryAbilities.popularity.rankNumber,

    weaknessStimulus: weakness.stimulus.value,
    weaknessEffect: weakness.effect.value,
    weaknessDuration: weakness.duration.value,

    powersCount: powers.count.current,
    powersMax: powers.count.max,
    powers: powers.slots
      .filter((slot) => slot.name)
      .map((slot) => ({ name: slot.name, category: slot.category, level: slot.rankNumber })),

    talentsCount: talents.count.current,
    talentsMax: talents.count.max,
    talents: talents.slots.filter((slot) => slot.name).map((slot) => slot.name),

    background,
  }
}

export async function saveCharacterToDb(character: Character): Promise<void> {
  try {
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toCharacterDbPayload(character)),
    })
    if (!res.ok) {
      console.error('Auto-save failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('Auto-save failed:', err)
  }
}

/** Bulk-generate save path (see BulkGenerateDialog.vue): unlike
 * saveCharacterToDb, failures are thrown rather than swallowed, since a
 * multi-thousand-character run needs to surface a failed batch to the
 * caller's progress UI instead of silently dropping it. */
export async function saveCharactersBulk(characters: Character[]): Promise<number> {
  const res = await fetch('/api/characters/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characters: characters.map(toCharacterDbPayload) }),
  })
  if (!res.ok) {
    throw new Error(`Bulk save failed (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  }
  const data = (await res.json()) as { inserted: number }
  return data.inserted
}
