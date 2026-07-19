<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import CountControl from '@/components/shared/CountControl.vue'
import PowerSlotRow from '@/components/shared/PowerSlotRow.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'

const store = useCharacterStore()

function regenerateSection() {
  store.generatePowerCount()
  store.generateActivePowerSlots()
}
</script>

<template>
  <Fieldset class="powers-panel">
    <template #legend>
      <SectionLegend label="Powers" @click="regenerateSection" />
    </template>
    <CountControl
      label="Number of Powers"
      :current="store.character.powers.count.current"
      :max="store.character.powers.count.max"
      :locked="store.character.powers.count.locked"
      @reroll="store.generatePowerCount()"
      @toggle-lock="store.togglePowerCountLock()"
    />

    <div class="powers-panel__list">
      <PowerSlotRow
        v-for="(slot, index) in store.character.powers.slots"
        :key="slot.slot"
        :slot="slot"
        :active="index < store.activePowerSlotCount"
        @update:name="(name) => store.setPowerName(index, name)"
        @shift="(delta) => store.shiftPowerRank(index, delta)"
        @reroll="store.generatePowerSlot(index)"
        @toggle-lock="store.togglePowerSlotLock(index)"
      />
    </div>
  </Fieldset>
</template>

<style scoped>
.powers-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.powers-panel :deep(.p-fieldset-content) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.powers-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow-y: auto;
}
</style>
