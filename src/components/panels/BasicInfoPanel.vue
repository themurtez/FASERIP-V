<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import LockableSelect from '@/components/shared/LockableSelect.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'
import { PHYSICAL_FORMS } from '@/data/physicalForms'
import { ORIGINS } from '@/data/origins'
import { OCCUPATIONS } from '@/data/occupations'

const store = useCharacterStore()

function regenerateSection() {
  store.generatePhysicalForm()
  store.generateOrigin()
  store.generateOccupation()
}

const physicalFormNames = PHYSICAL_FORMS.map((f) => f.name)
const originNames = ORIGINS.map((o) => o.name)

type BasicInfoTextField = 'player' | 'hair' | 'eyes' | 'name' | 'weight' | 'height' | 'identity' | 'skin' | 'age' | 'group' | 'base'

const textFields: { key: BasicInfoTextField; label: string }[] = [
  { key: 'player', label: 'Player' },
  { key: 'hair', label: 'Hair' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'name', label: 'Name' },
  { key: 'weight', label: 'Weight' },
  { key: 'height', label: 'Height' },
  { key: 'identity', label: 'Identity' },
  { key: 'skin', label: 'Skin' },
  { key: 'age', label: 'Age' },
  { key: 'group', label: 'Group' },
  { key: 'base', label: 'Base' },
]
</script>

<template>
  <Fieldset class="basic-info-panel">
    <template #legend>
      <SectionLegend label="Basic Info" @click="regenerateSection" />
    </template>
    <div class="basic-info-panel__grid">
      <label v-for="field in textFields" :key="field.key" class="basic-info-panel__field">
        <span>{{ field.label }}:</span>
        <InputText v-model="store.character.basicInfo[field.key]" size="small" />
      </label>
    </div>

    <div class="basic-info-panel__selects">
      <LockableSelect
        label="Origin:"
        v-model="store.character.basicInfo.origin.value"
        :options="originNames"
        :locked="store.character.basicInfo.origin.locked"
        filter
        @toggle-lock="store.toggleBasicInfoLock('origin')"
      />
      <LockableSelect
        label="Form:"
        v-model="store.character.basicInfo.physicalForm.value"
        :options="physicalFormNames"
        :locked="store.character.basicInfo.physicalForm.locked"
        filter
        @toggle-lock="store.toggleBasicInfoLock('physicalForm')"
      />
      <LockableSelect
        label="Occupation:"
        v-model="store.character.basicInfo.occupation.value"
        :options="OCCUPATIONS"
        :locked="store.character.basicInfo.occupation.locked"
        filter
        @toggle-lock="store.toggleBasicInfoLock('occupation')"
      />
    </div>

    <Textarea
      v-model="store.character.basicInfo.notes"
      placeholder="Notes (e.g. special modifiers from Physical Form -- see the Form dropdown's rules for what applies)"
      rows="3"
      class="basic-info-panel__notes"
    />
  </Fieldset>
</template>

<style scoped>
.basic-info-panel {
  height: 100%;
}

.basic-info-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem 0.75rem;
  margin-bottom: 0.75rem;
}

.basic-info-panel__field {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.basic-info-panel__field span {
  min-width: 3.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.basic-info-panel__field :deep(input) {
  width: 100%;
  min-width: 0;
}

.basic-info-panel__selects {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.basic-info-panel__notes {
  width: 100%;
  resize: vertical;
  font-size: 0.85rem;
}
</style>
