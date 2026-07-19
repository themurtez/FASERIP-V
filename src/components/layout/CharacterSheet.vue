<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import AppMenuBar from './AppMenuBar.vue'
import BasicInfoPanel from '@/components/panels/BasicInfoPanel.vue'
import WeaknessPanel from '@/components/panels/WeaknessPanel.vue'
import PrimaryAbilitiesPanel from '@/components/panels/PrimaryAbilitiesPanel.vue'
import PowersPanel from '@/components/panels/PowersPanel.vue'
import TalentsPanel from '@/components/panels/TalentsPanel.vue'
import ContactsBackgroundPanel from '@/components/panels/ContactsBackgroundPanel.vue'

const PAGE_COUNT = 2
const page = ref(1)

function prevPage() {
  page.value = page.value === 1 ? PAGE_COUNT : page.value - 1
}
function nextPage() {
  page.value = page.value === PAGE_COUNT ? 1 : page.value + 1
}
</script>

<template>
  <div class="app-shell">
    <AppMenuBar />

    <div class="app-shell__body">
      <Button
        class="app-shell__nav app-shell__nav--prev"
        severity="secondary"
        text
        rounded
        aria-label="Previous page"
        v-tooltip.right="'Previous page'"
        @click="prevPage"
      >
        <i class="pi pi-chevron-left" />
      </Button>

      <main class="app-shell__page">
        <div v-if="page === 1" class="sheet-page">
          <BasicInfoPanel class="sheet-page__basic-info" />
          <WeaknessPanel class="sheet-page__weakness" />
          <PowersPanel class="sheet-page__powers" />
          <PrimaryAbilitiesPanel class="sheet-page__primary-abilities" />
          <TalentsPanel class="sheet-page__talents" />
        </div>
        <div v-else class="sheet-page sheet-page--two">
          <ContactsBackgroundPanel />
        </div>

        <div class="app-shell__page-indicator">Page {{ page }} / {{ PAGE_COUNT }}</div>
      </main>

      <Button
        class="app-shell__nav app-shell__nav--next"
        severity="secondary"
        text
        rounded
        aria-label="Next page"
        v-tooltip.left="'Next page'"
        @click="nextPage"
      >
        <i class="pi pi-chevron-right" />
      </Button>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--p-content-background);
}

.app-shell__body {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.75rem;
}

.app-shell__nav {
  align-self: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
}

.app-shell__page {
  flex: 1;
  min-width: 0;
  position: relative;
}

.app-shell__page-indicator {
  position: absolute;
  bottom: -0.25rem;
  right: 0.25rem;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
}

.sheet-page {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(340px, 1.3fr) minmax(260px, 1fr);
  grid-template-rows: auto 1fr;
  gap: 0.75rem;
  align-items: start;
}

.sheet-page--two {
  grid-template-columns: 1fr;
  min-height: 480px;
}

.sheet-page__basic-info {
  grid-column: 1;
  grid-row: 1;
}

.sheet-page__primary-abilities {
  grid-column: 1;
  grid-row: 2;
}

.sheet-page__powers {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.sheet-page__weakness {
  grid-column: 3;
  grid-row: 1;
}

.sheet-page__talents {
  grid-column: 3;
  grid-row: 2;
}

@media (max-width: 1100px) {
  .sheet-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .sheet-page__basic-info,
  .sheet-page__primary-abilities,
  .sheet-page__weakness,
  .sheet-page__talents,
  .sheet-page__powers {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
