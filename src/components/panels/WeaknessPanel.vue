<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import LockableSelect from '@/components/shared/LockableSelect.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'
import { WEAKNESS_STIMULUS, WEAKNESS_EFFECT, WEAKNESS_DURATION } from '@/data/weaknesses'

const store = useCharacterStore()

const stimulusNames = WEAKNESS_STIMULUS.map((s) => s.name)
const effectNames = WEAKNESS_EFFECT.map((e) => e.name)
const durationNames = WEAKNESS_DURATION.map((d) => d.name)
</script>

<template>
  <Fieldset class="weakness-panel">
    <template #legend>
      <SectionLegend label="Weakness" @click="store.generateWeakness()" />
    </template>
    <div class="weakness-panel__fields">
      <LockableSelect
        label="Stimulus:"
        v-model="store.character.weakness.stimulus.value"
        :options="stimulusNames"
        :locked="store.character.weakness.stimulus.locked"
        @toggle-lock="store.toggleWeaknessLock('stimulus')"
      />
      <LockableSelect
        label="Effect:"
        v-model="store.character.weakness.effect.value"
        :options="effectNames"
        :locked="store.character.weakness.effect.locked"
        @toggle-lock="store.toggleWeaknessLock('effect')"
      />
      <LockableSelect
        label="Duration:"
        v-model="store.character.weakness.duration.value"
        :options="durationNames"
        :locked="store.character.weakness.duration.locked"
        @toggle-lock="store.toggleWeaknessLock('duration')"
      />
    </div>
  </Fieldset>
</template>

<style scoped>
.weakness-panel__fields {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
</style>
