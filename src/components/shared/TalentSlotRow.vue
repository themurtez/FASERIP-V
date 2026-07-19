<script setup lang="ts">
import Select from 'primevue/select'
import Button from 'primevue/button'
import LockToggle from './LockToggle.vue'
import { TALENTS_GROUPED } from '@/data/talents'
import type { TalentSlot } from '@/types/character'

defineProps<{
  slot: TalentSlot
  active: boolean
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  reroll: []
  'toggle-lock': []
}>()
</script>

<template>
  <div class="talent-row" :class="{ 'talent-row--inactive': !active, 'talent-row--locked': slot.locked }">
    <span class="talent-row__index">{{ slot.slot }}</span>
    <Select
      :model-value="slot.name"
      :options="TALENTS_GROUPED"
      option-label="name"
      option-value="name"
      option-group-label="category"
      option-group-children="items"
      filter
      show-clear
      placeholder="—"
      :disabled="slot.locked"
      size="small"
      class="talent-row__select"
      @update:model-value="emit('update:name', $event ?? '')"
    />
    <Button
      size="small"
      severity="secondary"
      text
      class="talent-row__btn"
      :disabled="slot.locked"
      v-tooltip.top="'Reroll this talent'"
      aria-label="Reroll"
      @click="emit('reroll')"
      >#</Button
    >
    <LockToggle :locked="slot.locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.talent-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.3rem;
  border-radius: var(--p-border-radius-sm);
}

.talent-row--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
}

.talent-row--inactive {
  opacity: 0.55;
}

.talent-row__index {
  width: 1.3rem;
  flex-shrink: 0;
  text-align: right;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.talent-row__select {
  flex: 1;
  min-width: 0;
}

.talent-row__btn {
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
