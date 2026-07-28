// The character store: single source of truth for the sheet being edited.
// This is the one place that checks `locked` before overwriting a field --
// every "Generate" menu action and every per-row "#" button routes through
// here, so lock semantics can't drift between call sites.

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Character, PrimaryAbilityKey } from '@/types/character'
import { PRIMARY_ABILITY_KEYS, SCHEMA_VERSION } from '@/types/character'
import { rankTier, shiftRank, rankForNumber } from '@/data/ranks'
import { powerSlotCost } from '@/data/powers'
import { defaultPowerCount } from '@/data/physicalFormPowers'
import * as gen from '@/generators/generateCharacter'
import { saveCharacterToDb } from '@/services/characterDb'

export const useCharacterStore = defineStore('character', () => {
  const character = ref<Character>(gen.createDefaultCharacter())

  function touch() {
    character.value.meta.updatedAt = new Date().toISOString()
  }

  // -- Basic Info ------------------------------------------------------------

  function generatePhysicalForm() {
    const f = character.value.basicInfo.physicalForm
    if (f.locked) return
    f.value = gen.rollPhysicalForm()
    character.value.basicInfo.notes = gen.physicalFormNotes(f.value)
    touch()
  }

  function generateOrigin() {
    const o = character.value.basicInfo.origin
    if (o.locked) return
    o.value = gen.rollOrigin()
    touch()
  }

  function generateOccupation() {
    const o = character.value.basicInfo.occupation
    if (o.locked) return
    o.value = gen.rollOccupation()
    touch()
  }

  function toggleBasicInfoLock(field: 'origin' | 'physicalForm' | 'occupation') {
    const f = character.value.basicInfo[field]
    f.locked = !f.locked
  }

  // -- Origin/Physical Form/Occupation persistence ---------------------------
  //
  // These 3 fields (value + lock state) survive a reload independent of the
  // rest of the character -- restored below before the initial boot roll
  // further down, which skips re-rolling them when a snapshot was restored
  // (see generateAll's `skipIdentity` option), and re-saved on every change
  // (roll, manual dropdown pick, or lock toggle all flow through here).

  interface BasicInfoIdentitySnapshot {
    origin: { value: string; locked: boolean }
    physicalForm: { value: string; locked: boolean }
    occupation: { value: string; locked: boolean }
  }

  const BASIC_INFO_IDENTITY_KEY = 'faserip.basicInfoIdentity.v1'

  function isLockedStringValue(v: unknown): v is { value: string; locked: boolean } {
    const candidate = v as { value?: unknown; locked?: unknown } | null
    return !!candidate && typeof candidate.value === 'string' && typeof candidate.locked === 'boolean'
  }

  function loadBasicInfoIdentity(): BasicInfoIdentitySnapshot | null {
    try {
      const raw = localStorage.getItem(BASIC_INFO_IDENTITY_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed === 'object' &&
        isLockedStringValue(parsed.origin) &&
        isLockedStringValue(parsed.physicalForm) &&
        isLockedStringValue(parsed.occupation)
      ) {
        return parsed as BasicInfoIdentitySnapshot
      }
      return null
    } catch {
      return null
    }
  }

  function persistBasicInfoIdentity() {
    try {
      const { origin, physicalForm, occupation } = character.value.basicInfo
      localStorage.setItem(BASIC_INFO_IDENTITY_KEY, JSON.stringify({ origin, physicalForm, occupation }))
    } catch {
      // Storage full or unavailable -- this just won't survive a reload this session.
    }
  }

  const persistedIdentity = loadBasicInfoIdentity()
  if (persistedIdentity) {
    character.value.basicInfo.origin = { ...persistedIdentity.origin }
    character.value.basicInfo.physicalForm = { ...persistedIdentity.physicalForm }
    character.value.basicInfo.occupation = { ...persistedIdentity.occupation }
  }

  watch(
    () => [character.value.basicInfo.origin, character.value.basicInfo.physicalForm, character.value.basicInfo.occupation],
    persistBasicInfoIdentity,
    { deep: true },
  )

  // -- Primary Abilities -------------------------------------------------------

  function currentColumn() {
    return gen.columnForPhysicalForm(character.value.basicInfo.physicalForm.value)
  }

  function generatePrimaryAbility(key: PrimaryAbilityKey) {
    const a = character.value.primaryAbilities[key]
    if (a.locked) return
    const rolled = gen.rollAbilityRank(currentColumn())
    const bonus = gen.racialAbilityBonus(character.value.basicInfo.physicalForm.value, key)
    const tier = bonus ? shiftRank(rolled.rank, bonus) : rankTier(rolled.rank)
    a.rank = tier.name
    a.rankNumber = tier.rankNumber
    recomputeHealthKarma()
    touch()
  }

  // Some races grant a free "raise any one Primary Ability +NCS" pick (e.g.
  // Humanoid Race, Android) -- the rules say "may raise", which reads as the
  // player's choice of ability, not something to auto-roll. It's left
  // unapplied; generatePhysicalForm surfaces it as a Notes-field reminder
  // instead (see gen.physicalFormNotes).

  function generateAllPrimaryAbilities() {
    for (const key of PRIMARY_ABILITY_KEYS) generatePrimaryAbility(key)
  }

  function shiftPrimaryAbility(key: PrimaryAbilityKey, delta: number) {
    const a = character.value.primaryAbilities[key]
    if (a.locked) return
    const tier = shiftRank(a.rank, delta)
    a.rank = tier.name
    a.rankNumber = tier.rankNumber
    recomputeHealthKarma()
    touch()
  }

  function togglePrimaryAbilityLock(key: PrimaryAbilityKey) {
    character.value.primaryAbilities[key].locked = !character.value.primaryAbilities[key].locked
  }

  /** Manual entry ("#"): the player types an exact rank number instead of
   * rolling/shifting -- kept as typed (not snapped to a tier's canonical
   * number), labeled with whichever named tier it falls under. */
  function setPrimaryAbilityNumber(key: PrimaryAbilityKey, value: number) {
    const a = character.value.primaryAbilities[key]
    if (a.locked) return
    a.rank = rankForNumber(value).name
    a.rankNumber = value
    recomputeHealthKarma()
    touch()
  }

  // -- Secondary Abilities ------------------------------------------------------

  function recomputeHealthKarma() {
    const health = character.value.secondaryAbilities.health
    const karma = character.value.secondaryAbilities.karma
    if (!health.locked) health.value = gen.computeHealth(character.value.primaryAbilities)
    if (!karma.locked) karma.value = gen.computeKarma(character.value.primaryAbilities)
  }

  function generateResources() {
    const r = character.value.secondaryAbilities.resources
    if (r.locked) return
    const rolled = gen.rollResourcesRank()
    const bonus = gen.racialSecondaryBonus(character.value.basicInfo.physicalForm.value, 'resources')
    const tier = bonus ? shiftRank(rolled.rank, bonus) : rankTier(rolled.rank)
    r.rank = tier.name
    r.rankNumber = tier.rankNumber
    touch()
  }

  function generatePopularity() {
    const p = character.value.secondaryAbilities.popularity
    if (p.locked) return
    const rolled = gen.rollAbilityRank(currentColumn())
    const bonus = gen.racialSecondaryBonus(character.value.basicInfo.physicalForm.value, 'popularity')
    const tier = bonus ? shiftRank(rolled.rank, bonus) : rankTier(rolled.rank)
    p.rank = tier.name
    p.rankNumber = tier.rankNumber
    touch()
  }

  function shiftSecondaryRank(field: 'resources' | 'popularity', delta: number) {
    const f = character.value.secondaryAbilities[field]
    if (f.locked) return
    const tier = shiftRank(f.rank, delta)
    f.rank = tier.name
    f.rankNumber = tier.rankNumber
    touch()
  }

  function toggleSecondaryLock(field: 'health' | 'karma' | 'resources' | 'popularity') {
    const f = character.value.secondaryAbilities[field]
    f.locked = !f.locked
  }

  /** Manual entry ("#") for Resources/Popularity -- see setPrimaryAbilityNumber. */
  function setSecondaryRankNumber(field: 'resources' | 'popularity', value: number) {
    const f = character.value.secondaryAbilities[field]
    if (f.locked) return
    f.rank = rankForNumber(value).name
    f.rankNumber = value
    touch()
  }

  // -- Weakness ------------------------------------------------------------

  function generateWeakness() {
    const w = character.value.weakness
    const rolled = gen.rollWeakness()
    if (!w.stimulus.locked) w.stimulus.value = rolled.stimulus.value
    if (!w.effect.locked) w.effect.value = rolled.effect.value
    if (!w.duration.locked) w.duration.value = rolled.duration.value
    touch()
  }

  function toggleWeaknessLock(field: 'stimulus' | 'effect' | 'duration') {
    const f = character.value.weakness[field]
    f.locked = !f.locked
  }

  // -- Powers ------------------------------------------------------------

  function generatePowerCount() {
    const c = character.value.powers.count
    if (c.locked) return
    const rolled = gen.rollPowerCount(character.value.basicInfo.physicalForm.value)
    c.current = rolled.current
    c.max = rolled.max
    touch()
  }

  function togglePowerCountLock() {
    character.value.powers.count.locked = !character.value.powers.count.locked
  }

  /** Manual entry ("#") for Number of Powers -- clamped to [0, max], since
   * unlike a rank number there's no sense in which "more powers than the
   * roll's own ceiling allows" is a valid typed value here. */
  function setPowerCountNumber(value: number) {
    const c = character.value.powers.count
    if (c.locked) return
    c.current = Math.min(c.max, Math.max(0, value))
    touch()
  }

  function generatePowerSlot(index: number) {
    const slot = character.value.powers.slots[index]
    if (!slot || slot.locked) return
    const rolled = gen.rollPower(slot.slot)
    slot.name = rolled.name
    slot.category = rolled.category
    slot.rank = rolled.rank
    slot.rankNumber = rolled.rankNumber
    touch()
  }

  function clearPowerSlot(index: number) {
    const slot = character.value.powers.slots[index]
    if (!slot || slot.locked) return
    slot.name = ''
    slot.category = ''
    slot.rank = ''
    slot.rankNumber = 0
    touch()
  }

  /** '*'/'**' powers cost 2/3 Power slots (see powerSlotCost), so the budget
   * -- the section's `count.current` -- can run out before every slot up to
   * count.current is filled. Once it does, the rest are cleared/inactive.
   *
   * Some races automatically start with specific Powers (see
   * physicalFormPowers.ts) -- those are placed into the leading unlocked
   * slots first, at their specified rank if the rules give one, before the
   * remaining budget is rolled at random. */
  function generateActivePowerSlots() {
    const budget = character.value.powers.count.current
    const slots = character.value.powers.slots
    const forced = gen.rollDefaultPowers(character.value.basicInfo.physicalForm.value)
    let forcedIndex = 0
    let remaining = budget
    for (let i = 0; i < slots.length; i++) {
      // Racially-guaranteed powers (e.g. Demon's Fire Generation + True
      // Invulnerability) always get placed, even once the random power-count
      // roll's budget is exhausted -- they're automatic per the rules, not
      // subject to that roll. Only once every forced grant has a slot does
      // running out of budget start clearing/skipping slots again.
      const hasPendingForcedGrant = forcedIndex < forced.length
      if (!hasPendingForcedGrant && (i >= budget || remaining <= 0)) {
        // Beyond the budget (or beyond MAX_POWER_SLOTS worth of prior rolls) --
        // clear it rather than leaving a stale, merely-dimmed-out power behind.
        clearPowerSlot(i)
        continue
      }
      const slot = slots[i]
      if (slot.locked) {
        remaining -= powerSlotCost(slot.name)
        continue
      }
      if (hasPendingForcedGrant) {
        const grant = forced[forcedIndex++]
        slot.name = grant.name
        slot.category = grant.category
        slot.rank = grant.rank
        slot.rankNumber = grant.rankNumber
        touch()
      } else {
        generatePowerSlot(i)
      }
      remaining -= powerSlotCost(slot.name)
    }
  }

  const activePowerSlotCount = computed(() => {
    const budget = character.value.powers.count.current
    // Mirrors generateActivePowerSlots' budget bypass for forced grants, so
    // a guaranteed racial power past the roll's budget (e.g. Demon's True
    // Invulnerability) shows as active rather than dimmed.
    const forcedCount = defaultPowerCount(character.value.basicInfo.physicalForm.value)
    let remaining = budget
    let n = 0
    for (const slot of character.value.powers.slots) {
      if (n >= forcedCount && (n >= budget || remaining <= 0)) break
      remaining -= powerSlotCost(slot.name)
      n++
    }
    return n
  })

  function setPowerName(index: number, name: string) {
    const slot = character.value.powers.slots[index]
    if (!slot) return
    const updated = gen.applyPowerName(slot, name)
    character.value.powers.slots[index] = updated
    touch()
  }

  function shiftPowerRank(index: number, delta: number) {
    const slot = character.value.powers.slots[index]
    if (!slot || slot.locked || !slot.rank) return
    const tier = shiftRank(slot.rank, delta)
    slot.rank = tier.name
    slot.rankNumber = tier.rankNumber
    touch()
  }

  /** Manual entry ("#") for a Power's rank -- see setPrimaryAbilityNumber.
   * Requires a Power to already be picked (a name), same as shiftPowerRank. */
  function setPowerRankNumber(index: number, value: number) {
    const slot = character.value.powers.slots[index]
    if (!slot || slot.locked || !slot.rank) return
    slot.rank = rankForNumber(value).name
    slot.rankNumber = value
    touch()
  }

  function togglePowerSlotLock(index: number) {
    const slot = character.value.powers.slots[index]
    if (slot) slot.locked = !slot.locked
  }

  // -- Talents ------------------------------------------------------------

  function generateTalentCount() {
    const c = character.value.talents.count
    if (c.locked) return
    const rolled = gen.rollTalentCount()
    c.current = rolled.current
    c.max = rolled.max
    touch()
  }

  function toggleTalentCountLock() {
    character.value.talents.count.locked = !character.value.talents.count.locked
  }

  function generateTalentSlot(index: number) {
    const slot = character.value.talents.slots[index]
    if (!slot || slot.locked) return
    const rolled = gen.rollTalent(slot.slot)
    slot.name = rolled.name
    touch()
  }

  function clearTalentSlot(index: number) {
    const slot = character.value.talents.slots[index]
    if (!slot || slot.locked) return
    slot.name = ''
    touch()
  }

  function generateActiveTalentSlots() {
    const activeCount = character.value.talents.count.current
    character.value.talents.slots.forEach((slot, i) => {
      if (i < activeCount) generateTalentSlot(i)
      else clearTalentSlot(i)
    })
  }

  function setTalentName(index: number, name: string) {
    const slot = character.value.talents.slots[index]
    if (!slot) return
    const updated = gen.applyTalentName(slot, name)
    character.value.talents.slots[index] = updated
    touch()
  }

  function toggleTalentSlotLock(index: number) {
    const slot = character.value.talents.slots[index]
    if (slot) slot.locked = !slot.locked
  }

  // -- Orchestration ------------------------------------------------------

  /** The book's 7-step order, plus Occupation/Talents which the screenshot
   * shows but rules.pdf doesn't formally cover as their own step.
   *
   * `skipIdentity` leaves Origin/Physical Form/Occupation untouched entirely
   * (not just when locked) -- used once, at boot, when a persisted identity
   * snapshot was just restored (see the persistence block above), so
   * reloading the page doesn't roll a fresh one over it. */
  function generateAll(options: { skipIdentity?: boolean } = {}) {
    if (!options.skipIdentity) {
      generatePhysicalForm()
      generateOrigin()
      generateOccupation()
    }
    generateAllPrimaryAbilities()
    recomputeHealthKarma()
    generateResources()
    generatePopularity()
    generateWeakness()
    generatePowerCount()
    generateActivePowerSlots()
    generateTalentCount()
    generateActiveTalentSlots()
    recordHistory()
    if (autoSaveEnabled.value) {
      saveCharacterToDb(character.value)
    }
  }

  function newCharacter() {
    character.value = gen.createDefaultCharacter()
    generateAll()
  }

  // -- History (back/forward through generated characters) -----------------
  //
  // Every full generateAll() -- the "Generate All" button/menu item, "New
  // Character", and the initial boot roll -- snapshots the resulting
  // character into a browser-back/forward-style stack, capped at 20 entries
  // and persisted to localStorage so it survives a reload.

  const HISTORY_KEY = 'faserip.characterHistory.v1'
  const MAX_HISTORY = 20

  function loadHistory(): Character[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((c) => c && typeof c === 'object' && c.schemaVersion === SCHEMA_VERSION)
    } catch {
      return []
    }
  }

  const history = ref<Character[]>(loadHistory())
  const historyPointer = ref(history.value.length - 1)

  function persistHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch {
      // Storage full or unavailable -- history still works in-memory for this session.
    }
  }

  function recordHistory() {
    // Generating while parked mid-history (after going back) drops the
    // abandoned "forward" branch, matching browser back/forward semantics.
    if (historyPointer.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyPointer.value + 1)
    }
    history.value.push(JSON.parse(JSON.stringify(character.value)))
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(history.value.length - MAX_HISTORY)
    }
    historyPointer.value = history.value.length - 1
    persistHistory()
  }

  const canGoBack = computed(() => historyPointer.value > 0)
  const canGoForward = computed(() => historyPointer.value < history.value.length - 1)

  function goBack() {
    if (!canGoBack.value) return
    historyPointer.value -= 1
    character.value = JSON.parse(JSON.stringify(history.value[historyPointer.value]))
  }

  function goForward() {
    if (!canGoForward.value) return
    historyPointer.value += 1
    character.value = JSON.parse(JSON.stringify(history.value[historyPointer.value]))
  }

  // -- Auto-save to database -------------------------------------------------
  //
  // When enabled (Options menu), every generateAll() also POSTs the result
  // to the Postgres-backed API (server/index.js). Off by default -- this
  // writes to a real external database, so it shouldn't start doing that
  // without the player opting in. The toggle persists across reloads.

  const AUTO_SAVE_KEY = 'faserip.autoSaveEnabled'
  const autoSaveEnabled = ref(localStorage.getItem(AUTO_SAVE_KEY) === 'true')

  function toggleAutoSave() {
    autoSaveEnabled.value = !autoSaveEnabled.value
    try {
      localStorage.setItem(AUTO_SAVE_KEY, String(autoSaveEnabled.value))
    } catch {
      // Storage full or unavailable -- the toggle still works for this session.
    }
  }

  // Boot with a fully generated character rather than a wall of blanks --
  // the store is created once per app load, so this runs exactly once.
  // Origin/Physical Form/Occupation are skipped here when a persisted
  // identity was restored above, so a reload doesn't clobber them.
  // (generateAll() records its own history entry and auto-saves if enabled.)
  generateAll({ skipIdentity: !!persistedIdentity })

  // -- Import / export ------------------------------------------------------

  function exportJSON(): string {
    return JSON.stringify(character.value, null, 2)
  }

  function importJSON(json: string) {
    const parsed = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Not a character file: expected a JSON object.')
    }
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(
        `Unsupported schemaVersion ${parsed.schemaVersion ?? '(missing)'} -- this app reads version ${SCHEMA_VERSION}.`,
      )
    }
    character.value = parsed as Character
    touch()
  }

  const healthKarmaLabel = computed(() => {
    const { health, karma } = character.value.secondaryAbilities
    return `${health.value} / ${karma.value}`
  })

  return {
    character,
    healthKarmaLabel,
    rankAbbreviation: (rankName: string) => rankTier(rankName).abbreviation,
    generatePhysicalForm,
    generateOrigin,
    generateOccupation,
    toggleBasicInfoLock,
    generatePrimaryAbility,
    generateAllPrimaryAbilities,
    shiftPrimaryAbility,
    setPrimaryAbilityNumber,
    togglePrimaryAbilityLock,
    recomputeHealthKarma,
    generateResources,
    generatePopularity,
    shiftSecondaryRank,
    setSecondaryRankNumber,
    toggleSecondaryLock,
    generateWeakness,
    toggleWeaknessLock,
    generatePowerCount,
    setPowerCountNumber,
    togglePowerCountLock,
    generatePowerSlot,
    generateActivePowerSlots,
    activePowerSlotCount,
    setPowerName,
    shiftPowerRank,
    setPowerRankNumber,
    togglePowerSlotLock,
    generateTalentCount,
    toggleTalentCountLock,
    generateTalentSlot,
    generateActiveTalentSlots,
    setTalentName,
    toggleTalentSlotLock,
    generateAll,
    newCharacter,
    exportJSON,
    importJSON,
    history,
    historyPointer,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    autoSaveEnabled,
    toggleAutoSave,
  }
})
