<script setup lang="ts">
/**
 * Page de connexion OAuth GitHub
 *
 * Permet aux utilisateurs de se connecter avec leur compte GitHub
 * via le flux OAuth2.
 */
import { Loader2, Github, Shield, Zap, Lock } from 'lucide-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

/**
 * Initie la connexion GitHub OAuth
 */
async function handleGitHubLogin() {
  try {
    isLoading.value = true;
    error.value = null;
    await authStore.initiateLogin();
  } catch (err) {
    console.error('Erreur de connexion:', err);
    error.value = 'Impossible de se connecter. Veuillez réessayer.';
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md">
      <div class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Git Reporter</h1>
          <p class="text-zinc-400 text-sm">
            Générez et envoyez vos rapports de commits Git
          </p>
        </div>

        <!-- Features -->
        <div class="space-y-3 mb-8">
          <div class="flex items-center gap-3 text-sm text-zinc-300">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Shield :size="16" class="text-purple-400" />
            </div>
            <span>Authentification sécurisée via GitHub</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-zinc-300">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Zap :size="16" class="text-blue-400" />
            </div>
            <span>Récupération automatique des commits</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-zinc-300">
            <div class="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Lock :size="16" class="text-green-400" />
            </div>
            <span>Envoi sécurisé par Email ou WhatsApp</span>
          </div>
        </div>

        <!-- Login Button -->
        <button
          @click="handleGitHubLogin"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:shadow-none group"
        >
          <Loader2
            v-if="isLoading"
            :size="20"
            class="animate-spin"
          />
          <Github
            v-else
            :size="20"
            class="group-hover:scale-110 transition-transform"
          />
          <span>
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter avec GitHub' }}
          </span>
        </button>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm text-center"
        >
          {{ error }}
        </div>

        <!-- Info -->
        <p class="mt-6 text-center text-xs text-zinc-500">
          En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-zinc-500 text-sm">
          Vous n'avez pas de compte GitHub ?
          <a
            href="https://github.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            class="text-purple-400 hover:text-purple-300 transition-colors ml-1"
          >
            Créer un compte
          </a>
        </p>
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
</style>
