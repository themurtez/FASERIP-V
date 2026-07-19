<script setup lang="ts">
import Button from 'primevue/button'
import LockToggle from './LockToggle.vue'

defineProps<{
  label: string
  current: number
  max: number
  locked: boolean
}>()

const emit = defineEmits<{
  reroll: []
  'toggle-lock': []
}>()
</script>

<template>
  <div class="count-control" :class="{ 'count-control--locked': locked }">
    <span class="count-control__label">{{ label }}</span>
    <span class="count-control__value">{{ current }} / {{ max }}</span>
    <Button
      size="small"
      severity="secondary"
      text
      class="count-control__btn"
      :disabled="locked"
      v-tooltip.top="'Reroll count'"
      aria-label="Reroll count"
      @click="emit('reroll')"
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

.count-control__btn {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  font-weight: 700;
}
</style>
