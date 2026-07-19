<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import LockToggle from './LockToggle.vue'

defineProps<{
  label: string
  modelValue: number
  locked: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'toggle-lock': []
}>()
</script>

<template>
  <div class="numeric-lock-field" :class="{ 'numeric-lock-field--locked': locked }">
    <span class="numeric-lock-field__label">{{ label }}</span>
    <InputNumber
      :model-value="modelValue"
      :disabled="!locked"
      size="small"
      class="numeric-lock-field__input"
      v-tooltip.top="locked ? 'Manual value' : 'Auto-computed from abilities — lock to override'"
      @update:model-value="emit('update:modelValue', $event ?? 0)"
    />
    <LockToggle :locked="locked" @toggle="emit('toggle-lock')" />
  </div>
</template>

<style scoped>
.numeric-lock-field {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.numeric-lock-field--locked {
  background: var(--p-primary-50, rgba(99, 102, 241, 0.08));
  border-radius: var(--p-border-radius-sm);
}

.numeric-lock-field__label {
  min-width: 3.5rem;
  font-weight: 700;
  font-size: 0.85rem;
}

.numeric-lock-field__input {
  width: 5rem;
}

.numeric-lock-field__input :deep(input) {
  width: 100%;
  font-weight: 600;
  text-align: center;
}
</style>
