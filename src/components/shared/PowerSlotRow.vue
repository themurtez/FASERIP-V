<script setup lang="ts">
import Select from 'primevue/select'
import Button from 'primevue/button'
import LockToggle from './LockToggle.vue'
import { POWERS_GROUPED } from '@/data/powers'
import { rankTier } from '@/data/ranks'
import type { PowerSlot } from '@/types/character'

const props = defineProps<{
  slot: PowerSlot
  active: boolean
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  shift: [delta: number]
  reroll: []
  'toggle-lock': []
}>()

function badge() {
  if (!props.slot.rank) return '—'
  try {
    return `${rankTier(props.slot.rank).abbreviation}(${props.slot.rankNumber})`
  } catch {
    return `${props.slot.rank}(${props.slot.rankNumber})`
  }
}
</script>

<template>
  <div class="power-row" :class="{ 'power-row--inactive': !active, 'power-row--locked': slot.locked }">
    <span class="power-row__index">{{ slot.slot }}</span>
    <Select
      :model-value="slot.name"
      :options="POWERS_GROUPED"
      option-label="label"
      option-value="name"
      option-group-label="category"
      option-group-children="items"
      filter
      show-clear
      placeholder="—"
      :disabled="slot.locked"
      size="small"
      class="power-row__select"
      @update:model-value="emit('update:name', $event ?? '')"
    />
    <span class="power-row__badge">{{ badge() }}</span>
    <Button
      size="small"
      severity="secondary"
      text
      class="power-row__btn"
      :disabled="slot.locked"
      aria-label="Shift rank up"
      @click="emit('shift', 1)"
      >+</Button
    >
    <Button
      size="small"
      severity="secondary"
      text
      class="power-row__btn"
      :disabled="slot.locked"
      aria-label="Shift rank down"
      @click="emit('shift', -1)"
      >−</Button
    >
    <Button
      size="small"
      severity="secondary"
      text
      class="power-row__btn"
      :disabled="slot.locked"
      v-tooltip.top="'Reroll this power'"
      aria-label="Reroll"
      @click="emit('reroll')"
      >#</Button
    >
    <LockToggle :locked="slot.locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.power-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.3rem;
  border-radius: var(--p-border-radius-sm);
}

.power-row--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
}

.power-row--inactive {
  opacity: 0.55;
}

.power-row__index {
  width: 1.3rem;
  flex-shrink: 0;
  text-align: right;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.power-row__select {
  flex: 1;
  min-width: 0;
}

.power-row__badge {
  min-width: 3.75rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-sm);
  background: var(--p-content-background);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: center;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.power-row__btn {
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
