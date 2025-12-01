<script setup lang="ts">
/**
 * App.vue - Composant racine de l'application
 *
 * Ce composant gère :
 * - Le routage principal
 * - Le système de thème (dark/light/auto)
 * - L'initialisation globale
 */
import { watch, onMounted, computed } from "vue";
import { useAuthStore } from "./stores/auth.store";

const authStore = useAuthStore();

// Fonction pour appliquer le thème
function applyTheme(theme: string) {
  console.log("🎨 Application du thème:", theme);
  const root = document.documentElement;

  if (theme === "auto") {
    // Détecter la préférence système
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    console.log(
      "⚙️ Appearance Setting - theme: auto (système préfère:",
      prefersDark ? "dark" : "light",
      ")"
    );
    root.classList.toggle("dark", prefersDark);
    root.classList.toggle("light", !prefersDark);
  } else {
    console.log("⚙️ Appearance Setting - theme:", theme);
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }

  console.log("✅ Thème appliqué - Classes:", root.classList.toString());
}

// Classes CSS pour le thème
const themeClasses = computed(() => {
  const theme = authStore.user?.settings?.appearance?.theme || "dark";

  // Pour le mode auto, on détecte la préférence système
  if (theme === "auto") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900";
  }

  if (theme === "light") {
    return "bg-zinc-50 text-zinc-900";
  }

  return "bg-zinc-950 text-white";
});

// Watcher pour le thème
watch(
  () => authStore.user?.settings?.appearance?.theme,
  (newTheme) => {
    console.log("👀 Détection changement de thème:", newTheme);
    if (newTheme) {
      applyTheme(newTheme);
    }
  },
  { immediate: true }
);

/**
 * Initialisation au montage du composant
 */
onMounted(() => {
  console.log("🎨 App mounted");

  // Écouter les changements de préférence système si mode auto
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  console.log("🔊 Écoute des changements de préférence système activée");

  mediaQuery.addEventListener("change", () => {
    const currentTheme = authStore.user?.settings?.appearance?.theme;
    console.log("🔄 Préférence système changée - Thème actuel:", currentTheme);
    if (currentTheme === "auto") {
      applyTheme("auto");
    }
  });

  // Appliquer le thème initial
  const initialTheme = authStore.user?.settings?.appearance?.theme || "dark";
  console.log("🚀 Application du thème initial:", initialTheme);
  applyTheme(initialTheme);
});
</script>

<template>
  <div
    id="app"
    :class="['min-h-screen transition-colors duration-300', themeClasses]"
  >
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
</style>
