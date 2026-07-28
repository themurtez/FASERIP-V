<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import LockToggle from './LockToggle.vue'

const props = defineProps<{
  label: string
  current: number
  max: number
  locked: boolean
  /** Powers has a manual-number affordance; Talents doesn't (see TalentsPanel). */
  allowManualEdit?: boolean
}>()

const emit = defineEmits<{
  reroll: []
  'set-current': [value: number]
  'toggle-lock': []
}>()

const isEditing = ref(false)
const draftCurrent = ref(props.current)

function startEdit() {
  if (props.locked) return
  draftCurrent.value = props.current
  isEditing.value = true
}

function commitEdit() {
  if (!isEditing.value) return
  isEditing.value = false
  emit('set-current', draftCurrent.value ?? props.current)
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div class="count-control" :class="{ 'count-control--locked': locked }">
    <span class="count-control__label">{{ label }}</span>
    <span v-if="!isEditing" class="count-control__value">{{ current }} / {{ max }}</span>
    <InputNumber
      v-else
      v-model="draftCurrent"
      size="small"
      :min="0"
      :max="max"
      autofocus
      class="count-control__input"
      @keyup.enter="commitEdit"
      @keyup.esc="cancelEdit"
      @blur="commitEdit"
    />
    <Button
      size="small"
      severity="secondary"
      text
      class="count-control__btn"
      :disabled="locked"
      v-tooltip.top="'Reroll count'"
      aria-label="Reroll count"
      @click="emit('reroll')"
      >🎲</Button
    >
    <Button
      v-if="allowManualEdit"
      size="small"
      severity="secondary"
      text
      class="count-control__btn"
      :disabled="locked"
      v-tooltip.top="'Type an exact count'"
      aria-label="Type an exact count"
      @click="startEdit"
      >#</Button
    >
    <LockToggle :locked="locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.count-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.count-control--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
  border-radius: var(--p-border-radius-sm);
}

.count-control__label {
  font-weight: 600;
  font-size: 0.85rem;
}

.count-control__value {
  min-width: 3rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-sm);
  background: var(--p-content-background);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: center;
  font-size: 0.85rem;
}

.count-control__input {
  width: 3.75rem;
}

.count-control__input :deep(input) {
  width: 100%;
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
  text-align: center;
}

.count-control__btn {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  font-weight: 700;
}
</style>
