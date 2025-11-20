<script setup lang="ts">
/**
 * Composant racine de l'application Vue 3
 *
 * Ce composant :
 * - Affiche le router-view pour les pages
 * - Gère le layout global
 * - Initialise l'application
 */
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

/**
 * Initialisation au montage du composant
 */
onMounted(() => {
  console.log("🎨 App mounted");
});
</script>

<template>
  <div id="app" class="min-h-screen bg-zinc-950 text-white">
    <!-- RouterView affiche les pages selon la route active -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
/* Transition fade pour le changement de page */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* Styles globaux pour l'application */
@import "tailwindcss";

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
