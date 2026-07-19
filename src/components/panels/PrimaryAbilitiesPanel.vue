<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import RankControl from '@/components/shared/RankControl.vue'
import NumericLockField from '@/components/shared/NumericLockField.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'
import { PRIMARY_ABILITY_KEYS, PRIMARY_ABILITY_LABELS } from '@/types/character'

const store = useCharacterStore()

function regenerateSection() {
  store.generateAllPrimaryAbilities()
  store.generateResources()
}
</script>

<template>
  <Fieldset class="primary-abilities-panel">
    <template #legend>
      <SectionLegend label="Primary Abilities" @click="regenerateSection" />
    </template>
    <div class="primary-abilities-panel__derived">
      <NumericLockField
        label="Health"
        v-model="store.character.secondaryAbilities.health.value"
        :locked="store.character.secondaryAbilities.health.locked"
        @toggle-lock="store.toggleSecondaryLock('health')"
      />
      <NumericLockField
        label="Karma"
        v-model="store.character.secondaryAbilities.karma.value"
        :locked="store.character.secondaryAbilities.karma.locked"
        @toggle-lock="store.toggleSecondaryLock('karma')"
      />
    </div>

    <div class="primary-abilities-panel__list">
      <RankControl
        v-for="key in PRIMARY_ABILITY_KEYS"
        :key="key"
        :label="`${PRIMARY_ABILITY_LABELS[key]}:`"
        :rank="store.character.primaryAbilities[key].rank"
        :rank-number="store.character.primaryAbilities[key].rankNumber"
        :locked="store.character.primaryAbilities[key].locked"
        @shift="(delta) => store.shiftPrimaryAbility(key, delta)"
        @reroll="store.generatePrimaryAbility(key)"
        @toggle-lock="store.togglePrimaryAbilityLock(key)"
      />
      <RankControl
        label="Resources:"
        :rank="store.character.secondaryAbilities.resources.rank"
        :rank-number="store.character.secondaryAbilities.resources.rankNumber"
        :locked="store.character.secondaryAbilities.resources.locked"
        @shift="(delta) => store.shiftSecondaryRank('resources', delta)"
        @reroll="store.generateResources()"
        @toggle-lock="store.toggleSecondaryLock('resources')"
      />
    </div>
  </Fieldset>
</template>

<style scoped>
.primary-abilities-panel__derived {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--p-content-border-color);
}

.primary-abilities-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
</style>
