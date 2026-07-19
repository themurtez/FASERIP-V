<script setup lang="ts">
import { ref } from 'vue'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useCharacterStore } from '@/stores/character'
import { useCharacterIO } from '@/composables/useCharacterIO'
import { PRIMARY_ABILITY_KEYS, PRIMARY_ABILITY_LABELS } from '@/types/character'

const store = useCharacterStore()
const { exportToFile, importFromFile } = useCharacterIO()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

async function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    await importFromFile(file)
    toast.add({ severity: 'success', summary: 'Character imported', life: 2500 })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Import failed',
      detail: err instanceof Error ? err.message : String(err),
      life: 6000,
    })
  }
}

function handleExport() {
  exportToFile()
  toast.add({ severity: 'success', summary: 'Character exported', life: 2000 })
}

function handleNew() {
  store.newCharacter()
  toast.add({ severity: 'info', summary: 'New character generated', life: 2000 })
}

function handleGenerateAll() {
  store.generateAll()
}

function generatePrimaryAbilitiesAndDerived() {
  store.generateAllPrimaryAbilities()
  store.recomputeHealthKarma()
}

function generateSecondary() {
  store.generateResources()
  store.generatePopularity()
}

function generatePowersSection() {
  store.generatePowerCount()
  store.generateActivePowerSlots()
}

function generateTalentsSection() {
  store.generateTalentCount()
  store.generateActiveTalentSlots()
}

const isDark = ref(false)
function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('app-dark', isDark.value)
}

function notImplemented(feature: string) {
  toast.add({ severity: 'info', summary: feature, detail: 'Not built yet — stubbed for now.', life: 3000 })
}

const menuItems = [
  {
    label: 'File',
    items: [
      { label: 'New Character', icon: 'pi pi-file', command: handleNew },
      { separator: true },
      { label: 'Import JSON…', icon: 'pi pi-upload', command: triggerImport },
      { label: 'Export JSON', icon: 'pi pi-download', command: handleExport },
    ],
  },
  {
    label: 'Generate',
    items: [
      { label: 'Generate All (7-step)', icon: 'pi pi-sparkles', command: handleGenerateAll },
      { separator: true },
      { label: 'Physical Form', command: () => store.generatePhysicalForm() },
      { label: 'Origin of Power', command: () => store.generateOrigin() },
      { label: 'Occupation', command: () => store.generateOccupation() },
      {
        label: 'Primary Abilities',
        items: [
          { label: 'All Seven', command: generatePrimaryAbilitiesAndDerived },
          { separator: true },
          ...PRIMARY_ABILITY_KEYS.map((key) => ({
            label: PRIMARY_ABILITY_LABELS[key],
            command: () => {
              store.generatePrimaryAbility(key)
            },
          })),
        ],
      },
      { label: 'Secondary Abilities (Resources/Popularity)', command: generateSecondary },
      { label: 'Weakness', command: () => store.generateWeakness() },
      { label: 'Powers', command: generatePowersSection },
      { label: 'Talents', command: generateTalentsSection },
    ],
  },
  {
    label: 'Options',
    items: [
      {
        label: 'Toggle Dark Mode',
        icon: 'pi pi-moon',
        command: toggleDarkMode,
      },
      { separator: true },
      { label: 'Contacts & Background (page 2)', icon: 'pi pi-id-card', command: () => notImplemented('Contacts & Background') },
      { label: 'About', icon: 'pi pi-info-circle', command: () => notImplemented('About') },
    ],
  },
]
</script>

<template>
  <Toast />
  <input ref="fileInput" type="file" accept="application/json,.json" class="sr-only" @change="onFileChosen" />
  <Menubar :model="menuItems" class="app-menubar">
    <template #start>
      <span class="app-menubar__title">FASERIP Character Generator</span>
    </template>
    <template #end>
      <div class="app-menubar__history">
        <Button
          icon="pi pi-angle-left"
          size="small"
          severity="secondary"
          text
          :disabled="!store.canGoBack"
          v-tooltip.bottom="'Previous generated character'"
          aria-label="Previous generated character"
          @click="store.goBack()"
        />
        <span v-if="store.history.length" class="app-menubar__history-count">
          {{ store.historyPointer + 1 }} / {{ store.history.length }}
        </span>
        <Button
          icon="pi pi-angle-right"
          size="small"
          severity="secondary"
          text
          :disabled="!store.canGoForward"
          v-tooltip.bottom="'Next generated character'"
          aria-label="Next generated character"
          @click="store.goForward()"
        />
      </div>
      <Button
        label="Generate All"
        icon="pi pi-sparkles"
        size="small"
        v-tooltip.bottom="'Regenerate everything except locked fields'"
        @click="handleGenerateAll"
      />
    </template>
  </Menubar>
</template>

<style scoped>
.app-menubar {
  border-radius: 0;
  border-width: 0 0 1px 0;
}

.app-menubar__title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-right: 1.25rem;
  white-space: nowrap;
}

.app-menubar__history {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-right: 0.5rem;
}

.app-menubar__history-count {
  min-width: 3rem;
  text-align: center;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  color: var(--p-text-muted-color);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
