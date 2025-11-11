<script setup lang="ts">
/**
 * Page 404 - Page non trouvée
 *
 * Affiche un message convivial lorsque l'utilisateur accède
 * à une route qui n'existe pas.
 */
import { Home, Search, ArrowLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

/**
 * Retour à la page d'accueil
 */
function goHome() {
  router.push({ name: "Dashboard" });
}

/**
 * Retour à la page précédente
 */
function goBack() {
  router.back();
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- 404 Content -->
    <div class="relative w-full max-w-2xl text-center">
      <!-- 404 Number -->
      <div class="mb-8">
        <h1
          class="text-9xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          404
        </h1>
      </div>

      <!-- Message -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">Page non trouvée</h2>
        <p class="text-zinc-400 text-lg mb-2">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <p class="text-zinc-500 text-sm">
          Vous pouvez retourner à la page d'accueil ou utiliser la navigation
          pour trouver ce que vous cherchez.
        </p>
      </div>

      <!-- Illustration -->
      <div class="mb-8 flex justify-center">
        <div class="relative">
          <div
            class="w-48 h-48 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl flex items-center justify-center"
          >
            <Search :size="64" class="text-zinc-600" />
          </div>
          <div
            class="absolute -top-4 -right-4 w-16 h-16 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center"
          >
            <span class="text-2xl">❌</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goHome"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40"
        >
          <Home :size="20" />
          <span>Retour à l'accueil</span>
        </button>

        <button
          @click="goBack"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft :size="20" />
          <span>Page précédente</span>
        </button>
      </div>

      <!-- Links -->
      <div
        class="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-500"
      >
        <a href="/" class="hover:text-purple-400 transition-colors">
          Accueil
        </a>
        <span>•</span>
        <a href="/historique" class="hover:text-purple-400 transition-colors">
          Historique
        </a>
        <span>•</span>
        <a href="/parametres" class="hover:text-purple-400 transition-colors">
          Paramètres
        </a>
      </div>

      <!-- Error Code -->
      <div class="mt-8 text-xs text-zinc-600">
        <p>Code d'erreur: 404 - Ressource introuvable</p>
        <p class="mt-1">
          Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gradient text animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

h1 {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Hover effect on illustration */
.w-48:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
</style>
