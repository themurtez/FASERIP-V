<script setup lang="ts">
import AppMenuBar from '@/components/layout/AppMenuBar.vue'
</script>

<template>
  <div class="app-shell">
    <AppMenuBar />
    <router-view />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--p-content-background);
}
</style>
