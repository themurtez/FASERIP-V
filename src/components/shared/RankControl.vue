<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import LockToggle from './LockToggle.vue'
import { rankTier } from '@/data/ranks'

const props = defineProps<{
  label?: string
  rank: string
  rankNumber: number
  locked: boolean
  /** narrower layout for the 16 power-slot rows */
  compact?: boolean
  /** suppress the built-in LockToggle when a parent row already shows one lock for the whole row */
  hideLock?: boolean
}>()

const emit = defineEmits<{
  shift: [delta: number]
  reroll: []
  'toggle-lock': []
}>()

const badge = computed(() => {
  if (!props.rank) return '—'
  try {
    return `${rankTier(props.rank).abbreviation}(${props.rankNumber})`
  } catch {
    return `${props.rank}(${props.rankNumber})`
  }
})
</script>

<template>
  <div class="rank-control" :class="{ 'rank-control--compact': compact, 'rank-control--locked': locked }">
    <span v-if="label" class="rank-control__label">{{ label }}</span>
    <span class="rank-control__badge">{{ badge }}</span>
    <Button
      size="small"
      severity="secondary"
      text
      class="rank-control__btn"
      :disabled="locked"
      aria-label="Shift rank up"
      @click="emit('shift', 1)"
    >
      +
    </Button>
    <Button
      size="small"
      severity="secondary"
      text
      class="rank-control__btn"
      :disabled="locked"
      aria-label="Shift rank down"
      @click="emit('shift', -1)"
    >
      −
    </Button>
    <Button
      size="small"
      severity="secondary"
      text
      class="rank-control__btn"
      :disabled="locked"
      aria-label="Reroll this field"
      v-tooltip.top="'Reroll'"
      @click="emit('reroll')"
    >
      #
    </Button>
    <LockToggle v-if="!hideLock" :locked="locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.rank-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.35rem;
  border-radius: var(--p-border-radius-sm);
  transition: background-color 0.15s;
}

.rank-control--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
}

.rank-control__label {
  min-width: 5.5rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.rank-control__badge {
  min-width: 4.5rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-sm);
  background: var(--p-content-background);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: center;
  font-size: 0.85rem;
}

.rank-control--compact .rank-control__badge {
  min-width: 3.75rem;
  font-size: 0.8rem;
}

.rank-control__btn {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  font-weight: 700;
}
</style>
