<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="section-legend"
    v-tooltip.top="`Regenerate ${label}`"
    @click="emit('click')"
  >
    <span>{{ label }}</span>
    <i class="pi pi-refresh section-legend__icon" />
  </button>
</template>

<style scoped>
.section-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: inherit;
  cursor: pointer;
}

.section-legend:hover {
  color: var(--p-primary-color);
}

.section-legend:hover .section-legend__icon {
  opacity: 1;
}

.section-legend__icon {
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.15s;
}
</style>
