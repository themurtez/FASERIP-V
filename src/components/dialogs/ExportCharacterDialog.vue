<script setup lang="ts">
// File -> "Export JSON...": lets the player name the downloaded file instead
// of silently saving under a name derived from the character's Name field
// (useCharacterIO's old behavior). Pre-fills with that same suggestion so
// the common case is still just "Export" with no typing.

import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useCharacterIO } from '@/composables/useCharacterIO'

const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ exported: [] }>()

const { exportToFile, suggestedFileName } = useCharacterIO()
const fileName = ref(suggestedFileName())

watch(visible, (isVisible) => {
  if (isVisible) fileName.value = suggestedFileName()
})

function confirmExport() {
  exportToFile(fileName.value)
  visible.value = false
  emit('exported')
}
</script>

<template>
  <Dialog v-model:visible="visible" header="Export Character" modal style="width: 24rem">
    <div class="export-dialog__field">
      <label for="export-file-name">File name</label>
      <div class="export-dialog__input-row">
        <InputText
          id="export-file-name"
          v-model="fileName"
          size="small"
          autofocus
          @keyup.enter="confirmExport"
        />
        <span class="export-dialog__extension">.faserip.json</span>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="visible = false" />
      <Button label="Export" icon="pi pi-download" :disabled="!fileName.trim()" @click="confirmExport" />
    </template>
  </Dialog>
</template>

<style scoped>
.export-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.export-dialog__field label {
  font-weight: 600;
  font-size: 0.85rem;
}

.export-dialog__input-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.export-dialog__input-row :deep(.p-inputtext) {
  flex: 1;
  min-width: 0;
}

.export-dialog__extension {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}
</style>
