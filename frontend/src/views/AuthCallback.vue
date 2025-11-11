<script setup lang="ts">
/**
 * Page de callback OAuth GitHub
 *
 * Cette page :
 * - Récupère le token JWT depuis l'URL
 * - Finalise la connexion avec le store auth
 * - Redirige vers le dashboard ou gère les erreurs
 */
import { Loader2, AlertCircle } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isProcessing = ref(true);
const error = ref<string | null>(null);
const status = ref('Connexion en cours...');

/**
 * Traite le callback OAuth au montage du composant
 */
onMounted(async () => {
  try {
    // Extraire le token ou l'erreur depuis l'URL
    const token = route.query.token as string;
    const errorParam = route.query.error as string;

    if (errorParam) {
      // Erreur reçue depuis le backend
      throw new Error(decodeURIComponent(errorParam));
    }

    if (!token) {
      throw new Error('Token manquant dans l\'URL de callback');
    }

    // Finaliser la connexion avec le token
    status.value = 'Finalisation de la connexion...';
    await authStore.completeLogin(token);

    // Vérifier s'il y a une URL de redirection sauvegardée
    const redirectUrl = route.query.redirect as string;

    // Succès : rediriger vers le dashboard ou l'URL sauvegardée
    status.value = 'Redirection...';
    setTimeout(() => {
      router.push(redirectUrl || { name: 'Dashboard' });
    }, 500);

  } catch (err) {
    console.error('Erreur lors du callback OAuth:', err);
    error.value = err instanceof Error ? err.message : 'Erreur lors de la connexion';
    isProcessing.value = false;

    // Rediriger vers la page de login après 3 secondes
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  }
});
</script>

<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Callback Card -->
    <div class="relative w-full max-w-md">
      <div class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div class="text-center">
          <!-- Loading State -->
          <div v-if="isProcessing && !error" class="space-y-6">
            <!-- Spinner -->
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/30">
              <Loader2 :size="32" class="text-white animate-spin" />
            </div>

            <!-- Status Message -->
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">
                {{ status }}
              </h2>
              <p class="text-zinc-400 text-sm">
                Veuillez patienter pendant que nous finalisons votre connexion.
              </p>
            </div>

            <!-- Progress Animation -->
            <div class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-progress"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="space-y-6">
            <!-- Error Icon -->
            <div class="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-2xl border-2 border-red-500/30">
              <AlertCircle :size="32" class="text-red-400" />
            </div>

            <!-- Error Message -->
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">
                Erreur de connexion
              </h2>
              <p class="text-red-400 text-sm mb-4">
                {{ error }}
              </p>
              <p class="text-zinc-500 text-xs">
                Redirection vers la page de connexion dans quelques secondes...
              </p>
            </div>

            <!-- Retry Button -->
            <button
              @click="router.push({ name: 'Login' })"
              class="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <span>Retour à la connexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour le spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Animation pour la barre de progression */
@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
}
</style>
