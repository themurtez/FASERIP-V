import { createRouter, createWebHistory } from 'vue-router'
import CharacterSheet from '@/components/layout/CharacterSheet.vue'
import AbilityModifierRollerPage from '@/components/pages/AbilityModifierRollerPage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'generator', component: CharacterSheet },
    { path: '/ability-modifier-roller', name: 'ability-modifier-roller', component: AbilityModifierRollerPage },
  ],
})
