<script setup lang="ts">
import Select from 'primevue/select'
import LockToggle from './LockToggle.vue'

defineProps<{
  label?: string
  modelValue: string
  options: string[]
  locked: boolean
  filter?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'toggle-lock': []
}>()
</script>

<template>
  <div class="lockable-select" :class="{ 'lockable-select--locked': locked }">
    <label v-if="label" class="lockable-select__label">{{ label }}</label>
    <Select
      :model-value="modelValue"
      :options="options"
      :disabled="locked"
      :filter="filter"
      class="lockable-select__input"
      size="small"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <LockToggle :locked="locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.lockable-select {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.lockable-select--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
  border-radius: var(--p-border-radius-sm);
}

.lockable-select__label {
  min-width: 4.5rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.lockable-select__input {
  flex: 1;
  min-width: 0;
}
</style>
