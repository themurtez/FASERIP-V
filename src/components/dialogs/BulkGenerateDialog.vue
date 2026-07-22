<script setup lang="ts">
// Generate/menu -> "Bulk Generate & Save...": mints N characters (N can be
// very large) with a caller-chosen origin/physical form/occupation -- or
// "Random" to roll each independently, same as the single-character flow --
// and saves them straight to the database in chunked batches. Deliberately
// bypasses the character store entirely (see rollNewCharacter's doc comment)
// so a bulk run of thousands doesn't touch the live sheet, its undo history,
// or localStorage.

import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'
import * as gen from '@/generators/generateCharacter'
import { saveCharactersBulk } from '@/services/characterDb'
import { ORIGINS } from '@/data/origins'
import { PHYSICAL_FORMS } from '@/data/physicalForms'
import { OCCUPATIONS } from '@/data/occupations'

const RANDOM = 'Random'
const ORIGIN_OPTIONS = [RANDOM, ...ORIGINS.map((o) => o.name)]
const FORM_OPTIONS = [RANDOM, ...PHYSICAL_FORMS.map((f) => f.name)]
const OCCUPATION_OPTIONS = [RANDOM, ...OCCUPATIONS]

// Characters generated and POSTed per batch -- small enough to keep the
// progress bar moving and the UI thread responsive, large enough to keep
// per-request overhead low for a run of many thousands.
const BATCH_SIZE = 500

const visible = defineModel<boolean>('visible', { required: true })
const toast = useToast()

const count = ref(100)
const origin = ref(RANDOM)
const physicalForm = ref(RANDOM)
const occupation = ref(RANDOM)

const isRunning = ref(false)
const cancelRequested = ref(false)
const savedCount = ref(0)
const totalCount = ref(0)
const errorMessage = ref('')

const progressPercent = computed(() =>
  totalCount.value > 0 ? Math.round((savedCount.value / totalCount.value) * 100) : 0,
)

function reset() {
  isRunning.value = false
  cancelRequested.value = false
  savedCount.value = 0
  totalCount.value = 0
  errorMessage.value = ''
}

async function runBulkGenerate() {
  if (isRunning.value || count.value < 1) return

  isRunning.value = true
  cancelRequested.value = false
  savedCount.value = 0
  totalCount.value = Math.floor(count.value)
  errorMessage.value = ''

  const overrides: gen.CharacterOverrides = {
    origin: origin.value === RANDOM ? undefined : origin.value,
    physicalForm: physicalForm.value === RANDOM ? undefined : physicalForm.value,
    occupation: occupation.value === RANDOM ? undefined : occupation.value,
  }

  try {
    let remaining = totalCount.value
    while (remaining > 0 && !cancelRequested.value) {
      const batchSize = Math.min(BATCH_SIZE, remaining)
      const batch = Array.from({ length: batchSize }, () => gen.rollNewCharacter(overrides))
      const inserted = await saveCharactersBulk(batch)
      savedCount.value += inserted
      remaining -= batchSize
      // Yield to the event loop between batches so the progress bar/cancel
      // button stay responsive through a very large run.
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    if (cancelRequested.value) {
      toast.add({
        severity: 'info',
        summary: 'Bulk generate cancelled',
        detail: `Saved ${savedCount.value} of ${totalCount.value} characters before stopping.`,
        life: 4000,
      })
    } else {
      toast.add({
        severity: 'success',
        summary: 'Bulk generate complete',
        detail: `Saved ${savedCount.value} characters to the database.`,
        life: 3500,
      })
      visible.value = false
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
    toast.add({
      severity: 'error',
      summary: 'Bulk generate failed',
      detail: `${errorMessage.value} (${savedCount.value} of ${totalCount.value} saved before the error.)`,
      life: 8000,
    })
  } finally {
    isRunning.value = false
  }
}

function cancel() {
  cancelRequested.value = true
}

function onHide() {
  if (!isRunning.value) reset()
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Bulk Generate & Save to Database"
    modal
    :closable="!isRunning"
    :close-on-escape="!isRunning"
    style="width: 28rem"
    @hide="onHide"
  >
    <div class="bulk-generate">
      <div class="bulk-generate__field">
        <label for="bulk-generate-count">Number of characters</label>
        <InputNumber
          id="bulk-generate-count"
          v-model="count"
          :min="1"
          :max="10000000"
          :disabled="isRunning"
          show-buttons
          size="small"
        />
      </div>

      <div class="bulk-generate__field">
        <label for="bulk-generate-origin">Origin of Power</label>
        <Select
          id="bulk-generate-origin"
          v-model="origin"
          :options="ORIGIN_OPTIONS"
          :disabled="isRunning"
          filter
          size="small"
        />
      </div>

      <div class="bulk-generate__field">
        <label for="bulk-generate-form">Physical Form</label>
        <Select
          id="bulk-generate-form"
          v-model="physicalForm"
          :options="FORM_OPTIONS"
          :disabled="isRunning"
          filter
          size="small"
        />
      </div>

      <div class="bulk-generate__field">
        <label for="bulk-generate-occupation">Occupation</label>
        <Select
          id="bulk-generate-occupation"
          v-model="occupation"
          :options="OCCUPATION_OPTIONS"
          :disabled="isRunning"
          filter
          size="small"
        />
      </div>

      <p class="bulk-generate__hint">
        Fields left on "Random" are rolled independently for every character, same as normal generation.
      </p>

      <div v-if="isRunning || savedCount > 0" class="bulk-generate__progress">
        <ProgressBar :value="progressPercent" />
        <span class="bulk-generate__progress-label">{{ savedCount }} / {{ totalCount }} saved</span>
      </div>
    </div>

    <template #footer>
      <Button
        v-if="isRunning"
        label="Cancel"
        severity="danger"
        text
        :disabled="cancelRequested"
        @click="cancel"
      />
      <Button v-else label="Close" severity="secondary" text @click="visible = false" />
      <Button
        label="Generate & Save"
        icon="pi pi-database"
        :loading="isRunning"
        :disabled="isRunning || count < 1"
        @click="runBulkGenerate"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.bulk-generate {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bulk-generate__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.bulk-generate__field label {
  font-weight: 600;
  font-size: 0.85rem;
}

.bulk-generate__field :deep(.p-select),
.bulk-generate__field :deep(.p-inputnumber) {
  width: 100%;
}

.bulk-generate__hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--p-text-muted-color);
}

.bulk-generate__progress {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.bulk-generate__progress-label {
  font-size: 0.78rem;
  text-align: right;
  color: var(--p-text-muted-color);
  font-variant-numeric: tabular-nums;
}
</style>
