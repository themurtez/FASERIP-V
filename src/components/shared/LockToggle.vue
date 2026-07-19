<script setup lang="ts">
defineProps<{
  locked: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="lock-toggle"
    :class="{ 'lock-toggle--locked': locked }"
    :aria-pressed="locked"
    v-tooltip.top="locked ? 'Locked — won\'t change when generated' : 'Click to lock this field'"
    @click="emit('toggle')"
  >
    <i :class="locked ? 'pi pi-lock' : 'pi pi-lock-open'" />
  </button>
</template>

<style scoped>
.lock-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-sm);
  background: var(--p-content-background);
  color: var(--p-text-muted-color);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;
  padding: 0;
  flex-shrink: 0;
}

.lock-toggle:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.lock-toggle--locked {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.lock-toggle--locked:hover {
  opacity: 0.85;
}

.lock-toggle i {
  font-size: 0.8rem;
}
</style>
