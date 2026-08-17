<script setup lang="ts">
// Standalone tool (Tools menu -> "Ability Modifier Roller"): rolls 7 d100
// against the Ability Modifier Table (data/abilityModifierTable.ts) and
// keeps a running history, independent of the character sheet/store. Each
// "Roll" produces one row of 7 results; history is capped at 50 rows and
// persisted to localStorage so it survives a reload, same pattern as the
// character store's own history (stores/character.ts).

import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { rollPercentile, pickFromRanges } from '@/generators/dice'
import { rollPowerCount } from '@/generators/generateCharacter'
import { ABILITY_MODIFIER_TABLE } from '@/data/abilityModifierTable'
import { PRIMARY_ABILITY_KEYS, PRIMARY_ABILITY_LABELS } from '@/types/character'

// One die per FASERIP primary ability, in book order -- Fighting, Agility,
// Strength, Endurance, Reason, Intuition, Psyche.
const FASERIP_LETTERS = PRIMARY_ABILITY_KEYS.map((key) => PRIMARY_ABILITY_LABELS[key][0])
const FASERIP_TOOLTIPS = PRIMARY_ABILITY_KEYS.map((key) => PRIMARY_ABILITY_LABELS[key])

interface RolledDie {
  roll: number
  rangeLabel: string
  delta: number
}

interface PowerCountRoll {
  current: number
  max: number
}

interface RollSession {
  id: string
  timestamp: string
  dice: RolledDie[]
  powerCount?: PowerCountRoll
}

const DICE_PER_ROLL = 7
const MAX_HISTORY = 50
const HISTORY_KEY = 'faserip.abilityModifierRollHistory.v1'

function rollDie(): RolledDie {
  const roll = rollPercentile()
  const hit = pickFromRanges(ABILITY_MODIFIER_TABLE, roll)
  return { roll, rangeLabel: hit.name, delta: hit.delta }
}

function isRolledDie(value: unknown): value is RolledDie {
  const d = value as RolledDie
  return !!d && typeof d.roll === 'number' && typeof d.rangeLabel === 'string' && typeof d.delta === 'number'
}

function loadHistory(): RollSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof s.id === 'string' &&
        typeof s.timestamp === 'string' &&
        Array.isArray(s.dice) &&
        s.dice.every(isRolledDie),
    )
  } catch {
    return []
  }
}

const history = ref<RollSession[]>(loadHistory())
const hideRolls = ref(false)
const includePowerCount = ref(true)
const powerFilter = ref('')

/** Safety valve for the "keep rolling until it matches" loop. The rarest
 * power count in the table ("14/18", rolled only on a natural 00) is a 1%
 * result, so this cap is far beyond any realistic wait while still guarding
 * against impossible filter values (e.g. "14/17"). */
const MAX_FILTER_ATTEMPTS = 10000

interface PowerFilter {
  current?: number
  max?: number
}

function persist() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  } catch {
    // Storage full or unavailable -- history still works in-memory for this session.
  }
}

/** Parses the powers filter text. "14/18" means current = 14 and max = 18;
 * "14" means current = 14 with any max. Returns null for empty or
 * non-numeric input. */
function parsePowerFilter(input: string): PowerFilter | null {
  const text = input.trim()
  if (!text) return null
  const parts = text.split('/').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0 || parts.length > 2) return null
  const values = parts.map(Number)
  if (values.some((n) => !Number.isInteger(n) || n < 0)) return null
  return parts.length === 1 ? { current: values[0] } : { current: values[0], max: values[1] }
}

function powerCountMatches(count: PowerCountRoll, filter: PowerFilter): boolean {
  if (filter.current !== undefined && count.current !== filter.current) return false
  if (filter.max !== undefined && count.max !== filter.max) return false
  return true
}

function buildSession(needPowerCount: boolean): RollSession {
  const session: RollSession = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    dice: Array.from({ length: DICE_PER_ROLL }, rollDie),
  }
  if (needPowerCount) {
    // "Normal Human" carries no racial power-count bonus, so this is the
    // same base count roll used by the normal character generator.
    session.powerCount = rollPowerCount('Normal Human')
  }
  return session
}

function roll() {
  const filter = parsePowerFilter(powerFilter.value)
  // A filter can only be satisfied by rolling a power count, so filtering
  // implicitly rolls the power count even when the toggle is off.
  const needPowerCount = includePowerCount.value || !!filter

  let session: RollSession
  if (filter) {
    let match: RollSession | null = null
    for (let attempt = 0; attempt < MAX_FILTER_ATTEMPTS; attempt++) {
      const candidate = buildSession(needPowerCount)
      if (candidate.powerCount && powerCountMatches(candidate.powerCount, filter)) {
        match = candidate
        break
      }
    }
    if (!match) {
      toast.add({
        severity: 'error',
        summary: 'No matching roll',
        detail: `Could not roll a number of powers matching "${powerFilter.value}" after ${MAX_FILTER_ATTEMPTS} attempts. Check the filter value.`,
        life: 4000,
      })
      return
    }
    session = match
  } else {
    session = buildSession(needPowerCount)
  }

  history.value = [session, ...history.value].slice(0, MAX_HISTORY)
  persist()
}

function clearHistory() {
  history.value = []
  persist()
}

const latest = computed(() => history.value[0] ?? null)
const past = computed(() => history.value.slice(1))

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}CS`
  if (delta < 0) return `${delta}CS`
  return '0CS'
}

function deltaClass(delta: number): string {
  if (delta > 0) return 'die__delta--positive'
  if (delta < 0) return 'die__delta--negative'
  return 'die__delta--neutral'
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString()
}

const toast = useToast()

/** Copies a roll's 7 deltas plus, when present, the rolled number of powers
 * as a plain comma-separated list, e.g. "0, 0, 4, 4, 2, 0, 0, 9/12" -- raw
 * signed integers, not the "+2CS" display format, for pasting into other tools. */
async function copyDeltas(dice: RolledDie[], powerCount?: PowerCountRoll) {
  const parts = dice.map((d) => String(d.delta))
  if (powerCount) parts.push(`${powerCount.current}/${powerCount.max}`)
  const text = parts.join(', ')
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ severity: 'success', summary: 'Copied to clipboard', detail: text, life: 2000 })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Copy failed',
      detail: err instanceof Error ? err.message : String(err),
      life: 4000,
    })
  }
}
</script>

<template>
  <main class="ability-roller">
    <Fieldset class="ability-roller__panel">
      <template #legend>
        <span class="ability-roller__legend">Ability Modifier Table Roller</span>
      </template>

      <div class="ability-roller__actions">
        <Button label="Roll 7 Dice" icon="pi pi-refresh" @click="roll" />
        <Button
          label="Clear History"
          icon="pi pi-trash"
          severity="danger"
          text
          :disabled="!history.length"
          @click="clearHistory"
        />
        <div class="ability-roller__hide-toggle">
          <ToggleSwitch v-model="hideRolls" inputId="hide-rolls" />
          <label for="hide-rolls">Hide rolls</label>
        </div>
        <div class="ability-roller__hide-toggle">
          <ToggleSwitch v-model="includePowerCount" inputId="include-power-count" />
          <label for="include-power-count">Roll number of powers</label>
        </div>
        <div class="ability-roller__filter">
          <label for="power-filter">Powers filter</label>
          <InputText
            id="power-filter"
            v-model="powerFilter"
            size="small"
            placeholder="e.g. 14/18"
            aria-label="Filter by powers"
            v-tooltip.top="'Only keep rolls whose number of powers matches, e.g. 14/18 (current/max) or 14 (current)'"
          />
        </div>
      </div>

      <div v-if="latest" class="ability-roller__current">
        <span class="ability-roller__current-label">Latest roll — {{ formatTimestamp(latest.timestamp) }}</span>
        <div class="dice-row">
          <div
            v-for="(die, i) in latest.dice"
            :key="i"
            class="die"
            v-tooltip.top="FASERIP_TOOLTIPS[i]"
          >
            <span class="die__label">{{ FASERIP_LETTERS[i] }}</span>
            <template v-if="!hideRolls">
              <span class="die__roll">{{ die.roll }}</span>
              <span class="die__range">{{ die.rangeLabel }}</span>
            </template>
            <span class="die__delta" :class="deltaClass(die.delta)">{{ deltaLabel(die.delta) }}</span>
          </div>
          <div
            v-if="latest.powerCount"
            class="die power-count-die"
            v-tooltip.top="'Number of Powers'"
          >
            <span class="die__label">PWR</span>
            <span class="die__roll">{{ latest.powerCount.current }}</span>
            <span class="die__range">of {{ latest.powerCount.max }}</span>
          </div>
          <Button
            icon="pi pi-copy"
            size="small"
            severity="secondary"
            text
            aria-label="Copy deltas"
            v-tooltip.top="'Copy as 0, 0, 4, 4, 2, 0, 0, 9/12'"
            @click="copyDeltas(latest.dice, latest.powerCount)"
          />
        </div>
      </div>
      <p v-else class="ability-roller__empty">No rolls yet — click "Roll 7 Dice" to get started.</p>

      <div v-if="past.length" class="ability-roller__history">
        <span class="ability-roller__history-title">History ({{ history.length }} / {{ MAX_HISTORY }})</span>
        <div v-for="session in past" :key="session.id" class="history-row">
          <span class="history-row__timestamp">{{ formatTimestamp(session.timestamp) }}</span>
          <div class="dice-row dice-row--compact">
            <div
              v-for="(die, i) in session.dice"
              :key="i"
              class="die die--compact"
              v-tooltip.top="FASERIP_TOOLTIPS[i]"
            >
              <span class="die__label">{{ FASERIP_LETTERS[i] }}</span>
              <span v-if="!hideRolls" class="die__roll">{{ die.roll }}</span>
              <span class="die__delta" :class="deltaClass(die.delta)">{{ deltaLabel(die.delta) }}</span>
            </div>
            <div
              v-if="session.powerCount"
              class="die die--compact power-count-die"
              v-tooltip.top="'Number of Powers'"
            >
              <span class="die__label">PWR</span>
              <span class="die__roll">{{ session.powerCount.current }}/{{ session.powerCount.max }}</span>
            </div>
            <Button
              icon="pi pi-copy"
              size="small"
              severity="secondary"
              text
              aria-label="Copy deltas"
              v-tooltip.top="'Copy as 0, 0, 4, 4, 2, 0, 0, 9/12'"
              @click="copyDeltas(session.dice, session.powerCount)"
            />
          </div>
        </div>
      </div>
    </Fieldset>
  </main>
</template>

<style scoped>
.ability-roller {
  flex: 1;
  padding: 0.75rem;
}

.ability-roller__panel {
  max-width: 900px;
  margin: 0 auto;
}

.ability-roller__legend {
  font-weight: 700;
}

.ability-roller__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.ability-roller__hide-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.ability-roller__hide-toggle label {
  cursor: pointer;
}

.ability-roller__filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.ability-roller__filter label {
  cursor: pointer;
}

.ability-roller__filter :deep(.p-inputtext) {
  width: 6.5rem;
}

.ability-roller__current {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ability-roller__current-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}

.ability-roller__empty {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.ability-roller__history {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--p-content-border-color);
}

.ability-roller__history-title {
  font-size: 0.8rem;
  font-weight: 700;
}

.dice-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.history-row__timestamp {
  min-width: 9rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-variant-numeric: tabular-nums;
}

.die {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 4.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-sm);
  background: var(--p-content-background);
}

.die--compact {
  min-width: 3.25rem;
  padding: 0.3rem 0.45rem;
}

.die__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--p-primary-color);
}

.die--compact .die__label {
  font-size: 0.65rem;
}

.die__roll {
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.die--compact .die__roll {
  font-size: 0.85rem;
}

.die__range {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
}

.die__delta {
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.die--compact .die__delta {
  font-size: 0.75rem;
}

.die__delta--positive {
  color: var(--p-green-500, #22c55e);
}

.die__delta--negative {
  color: var(--p-red-500, #ef4444);
}

.die__delta--neutral {
  color: var(--p-text-muted-color);
}
</style>
