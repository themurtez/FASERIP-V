// The character store: single source of truth for the sheet being edited.
// This is the one place that checks `locked` before overwriting a field --
// every "Generate" menu action and every per-row "#" button routes through
// here, so lock semantics can't drift between call sites.

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Character, PrimaryAbilityKey } from '@/types/character'
import { PRIMARY_ABILITY_KEYS, SCHEMA_VERSION } from '@/types/character'
import { rankTier, shiftRank } from '@/data/ranks'
import { powerSlotCost } from '@/data/powers'
import { pickUniform } from '@/generators/dice'
import * as gen from '@/generators/generateCharacter'

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

  /** After the deterministic per-ability racial bonuses (applied inside
   * generatePrimaryAbility), some races grant a free "raise any one Primary
   * Ability +NCS" pick -- resolved once, here, across the whole set. */
  function applyAnyOneRacialBonus() {
    const bonus = gen.racialAnyOneAbilityBonus(character.value.basicInfo.physicalForm.value)
    if (!bonus) return
    const eligible = PRIMARY_ABILITY_KEYS.filter((key) => !character.value.primaryAbilities[key].locked)
    if (!eligible.length) return
    const a = character.value.primaryAbilities[pickUniform(eligible)]
    const tier = shiftRank(a.rank, bonus)
    a.rank = tier.name
    a.rankNumber = tier.rankNumber
    recomputeHealthKarma()
    touch()
  }

  function generateAllPrimaryAbilities() {
    for (const key of PRIMARY_ABILITY_KEYS) generatePrimaryAbility(key)
    applyAnyOneRacialBonus()
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
    const rolled = gen.rollAbilityRank(currentColumn())
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
      if (i >= budget || remaining <= 0) {
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
      if (forcedIndex < forced.length) {
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
    let remaining = budget
    let n = 0
    for (const slot of character.value.powers.slots) {
      if (n >= budget || remaining <= 0) break
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

  function generateActiveTalentSlots() {
    const activeCount = character.value.talents.count.current
    character.value.talents.slots.forEach((slot, i) => {
      if (i < activeCount) generateTalentSlot(i)
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
   * shows but rules.pdf doesn't formally cover as their own step. */
  function generateAll() {
    generatePhysicalForm()
    generateOrigin()
    generateOccupation()
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

  // Boot with a fully generated character rather than a wall of blanks --
  // the store is created once per app load, so this runs exactly once.
  // (generateAll() records its own history entry.)
  generateAll()

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
    togglePrimaryAbilityLock,
    recomputeHealthKarma,
    generateResources,
    generatePopularity,
    shiftSecondaryRank,
    toggleSecondaryLock,
    generateWeakness,
    toggleWeaknessLock,
    generatePowerCount,
    togglePowerCountLock,
    generatePowerSlot,
    generateActivePowerSlots,
    activePowerSlotCount,
    setPowerName,
    shiftPowerRank,
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
  }
})
