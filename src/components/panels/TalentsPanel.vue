<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import CountControl from '@/components/shared/CountControl.vue'
import TalentSlotRow from '@/components/shared/TalentSlotRow.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'

const store = useCharacterStore()

function regenerateSection() {
  store.generateTalentCount()
  store.generateActiveTalentSlots()
}
</script>

<template>
  <Fieldset class="talents-panel">
    <template #legend>
      <SectionLegend label="Talents" @click="regenerateSection" />
    </template>
    <CountControl
      label="Number of Talents"
      :current="store.character.talents.count.current"
      :max="store.character.talents.count.max"
      :locked="store.character.talents.count.locked"
      @reroll="store.generateTalentCount()"
      @toggle-lock="store.toggleTalentCountLock()"
    />

    <div class="talents-panel__list">
      <TalentSlotRow
        v-for="(slot, index) in store.character.talents.slots"
        :key="slot.slot"
        :slot="slot"
        :active="index < store.character.talents.count.current"
        @update:name="(name) => store.setTalentName(index, name)"
        @reroll="store.generateTalentSlot(index)"
        @toggle-lock="store.toggleTalentSlotLock(index)"
      />
    </div>
  </Fieldset>
</template>

<style scoped>
.talents-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-top: 0.5rem;
}
</style>
