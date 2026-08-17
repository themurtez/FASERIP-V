<script setup lang="ts">
import Fieldset from 'primevue/fieldset'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import CountControl from '@/components/shared/CountControl.vue'
import RankControl from '@/components/shared/RankControl.vue'
import SectionLegend from '@/components/shared/SectionLegend.vue'
import { useCharacterStore } from '@/stores/character'

const store = useCharacterStore()
</script>

<template>
  <div class="page-two">
    <Fieldset class="page-two__popularity">
      <template #legend>
        <SectionLegend label="Popularity" @click="store.generatePopularity()" />
      </template>
      <p class="page-two__hint">
        Not shown in the reference screenshot, but it's a real Secondary Ability (rules.pdf) -- parked here
        rather than dropped.
      </p>
      <RankControl
        label="Popularity:"
        :rank="store.character.secondaryAbilities.popularity.rank"
        :rank-number="store.character.secondaryAbilities.popularity.rankNumber"
        :locked="store.character.secondaryAbilities.popularity.locked"
        @shift="(delta) => store.shiftSecondaryRank('popularity', delta)"
        @reroll="store.generatePopularity()"
        @set-number="(value) => store.setSecondaryRankNumber('popularity', value)"
        @toggle-lock="store.toggleSecondaryLock('popularity')"
      />
    </Fieldset>

    <Fieldset legend="Contacts" class="page-two__contacts">
      <CountControl
        label="Number of Contacts"
        :current="store.character.contacts.count.current"
        :max="store.character.contacts.count.max"
        :locked="store.character.contacts.count.locked"
        @reroll="store.generateContactCount()"
        @toggle-lock="store.toggleContactCountLock()"
      />
      <Message severity="secondary" :closable="false">
        Contact names aren't auto-generated yet -- only the starting count (from the Powers/Talents/Contacts
        table) is rolled here.
      </Message>
    </Fieldset>

    <Fieldset legend="Give Your Character Life (Background)" class="page-two__background">
      <Textarea
        v-model="store.character.background"
        placeholder="Free-form background/history. No generator for this step -- it's the book's 7th step and is meant to be written, not rolled."
        rows="8"
        class="page-two__background-textarea"
      />
    </Fieldset>
  </div>
</template>

<style scoped>
.page-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  gap: 0.75rem;
}

.page-two :deep(.p-fieldset-legend) {
  font-weight: 700;
}

.page-two__popularity,
.page-two__contacts {
  grid-column: span 1;
}

.page-two__background {
  grid-column: span 2;
}

.page-two__hint {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.6rem;
}

.page-two__background-textarea {
  width: 100%;
  resize: vertical;
}
</style>
