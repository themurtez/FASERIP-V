// Character -> database persistence (server/index.js):
//
// - saveCharacterToDb: auto-save (Options menu toggle) -- fire-and-forget
//   insert, failures logged rather than surfaced as UI errors.
// - insertCharacterToDb: explicit "Save" (first save) / "Save As" -- inserts
//   a row, returns its DB id, and throws on failure so the caller can show it.
// - updateCharacterInDb: explicit "Save" (subsequent saves) -- updates the
//   existing row in place, leaving its character_id and created_at untouched.
// - saveCharactersBulk: bulk-generate path, throws on failure.

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
    await insertCharacterToDb(character)
  } catch (err) {
    console.error('Auto-save failed:', err)
  }
}

/** Explicit "Save"/"Save As": inserts a new row and returns its DB id. A
 * distinct `characterId` override lets "Save As" create a separate record
 * without changing the in-app character's own id. Throws on failure so the
 * caller can surface it in the UI. */
export async function insertCharacterToDb(
  character: Character,
  characterId?: string,
): Promise<{ id: number }> {
  const payload = toCharacterDbPayload(character)
  if (characterId) payload.characterId = characterId
  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${await res.text().catch(() => res.statusText)}`)
  }
  return (await res.json()) as { id: number }
}

/** Explicit "Save": updates the existing row (by DB serial id) in place.
 * character_id is left untouched so a "Save As" copy keeps its own id. */
export async function updateCharacterInDb(id: number, character: Character): Promise<void> {
  const res = await fetch(`/api/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toCharacterDbPayload(character)),
  })
  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${await res.text().catch(() => res.statusText)}`)
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
