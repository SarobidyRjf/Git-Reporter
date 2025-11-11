<script setup lang="ts">
/**
 * Page Profil - Informations de l'utilisateur
 *
 * Affiche et permet de modifier :
 * - Informations personnelles
 * - Avatar GitHub
 * - Statistiques d'utilisation
 * - Historique d'activité
 */
import {
  User,
  Mail,
  Github,
  Calendar,
  TrendingUp,
  FileText,
  LogOut,
} from "lucide-vue-next";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "../services/api";
import { useAuthStore } from "../stores/auth.store";
import type { UserStats } from "../types";

const router = useRouter();
const authStore = useAuthStore();

// ============================================================================
// STATE
// ============================================================================

const stats = ref<UserStats | null>(null);
const isLoadingStats = ref(false);

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Nombre total de rapports
 */
const totalReports = computed(() => stats.value?.totalReports || 0);

/**
 * Pourcentage d'utilisation Email vs WhatsApp
 */
const emailPercentage = computed(() => {
  if (!stats.value || stats.value.totalReports === 0) return 0;
  return Math.round(
    (stats.value.reportsByMethod.email / stats.value.totalReports) * 100,
  );
});

const whatsappPercentage = computed(() => {
  if (!stats.value || stats.value.totalReports === 0) return 0;
  return Math.round(
    (stats.value.reportsByMethod.whatsapp / stats.value.totalReports) * 100,
  );
});

/**
 * Date de création du compte (simulation)
 */
const accountCreatedDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() - 2); // Simule un compte créé il y a 2 mois
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Charge les statistiques utilisateur
 */
async function loadStats() {
  try {
    isLoadingStats.value = true;
    const response = await apiService.getUserStats();

    if (response.success && response.data) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  } finally {
    isLoadingStats.value = false;
  }
}

/**
 * Formate une date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Navigation
 */
function goToDashboard() {
  router.push({ name: "Dashboard" });
}

function goToHistory() {
  router.push({ name: "Historique" });
}

function goToSettings() {
  router.push({ name: "Parametres" });
}

/**
 * Déconnexion
 */
async function handleLogout() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    await authStore.logout();
    router.push({ name: "Login" });
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <!-- Header -->
    <header class="bg-zinc-900/30 border-b border-zinc-800 px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Profil</h1>
          <p class="text-sm text-zinc-400 mt-1">
            Gérez vos informations personnelles et consultez vos statistiques
          </p>
        </div>

        <button
          @click="goToDashboard"
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
        >
          Retour au Dashboard
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne de gauche - Informations utilisateur -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Carte utilisateur -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div class="text-center">
              <!-- Avatar -->
              <div class="inline-block relative mb-4">
                <div
                  v-if="authStore.userAvatar"
                  class="w-24 h-24 rounded-full border-4 border-zinc-800 overflow-hidden"
                >
                  <img
                    :src="authStore.userAvatar"
                    :alt="authStore.displayName || 'Avatar'"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  class="w-24 h-24 rounded-full border-4 border-zinc-800 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                >
                  <User :size="40" class="text-white" />
                </div>
                <div
                  class="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900"
                ></div>
              </div>

              <!-- Nom -->
              <h2 class="text-xl font-bold mb-1">
                {{ authStore.displayName || "Utilisateur" }}
              </h2>

              <!-- Email -->
              <div
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 mb-4"
              >
                <Mail :size="16" />
                <span>{{ authStore.userEmail || "email@example.com" }}</span>
              </div>

              <!-- Lien GitHub -->
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
              >
                <Github :size="16" />
                <span>Voir sur GitHub</span>
              </a>
            </div>

            <!-- Informations supplémentaires -->
            <div class="mt-6 pt-6 border-t border-zinc-800 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-zinc-400">Compte créé le</span>
                <span class="font-medium">{{ accountCreatedDate }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-zinc-400">Rapports créés</span>
                <span class="font-medium">{{ totalReports }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-zinc-400">Statut</span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs"
                >
                  <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                  Actif
                </span>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 class="text-sm font-semibold mb-4">Actions rapides</h3>
            <div class="space-y-2">
              <button
                @click="goToSettings"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-left"
              >
                <User :size="18" />
                <span>Modifier le profil</span>
              </button>
              <button
                @click="goToHistory"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-left"
              >
                <FileText :size="18" />
                <span>Voir l'historique</span>
              </button>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut :size="18" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Colonne de droite - Statistiques et activité -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Statistiques générales -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
              >
                <TrendingUp :size="20" class="text-purple-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold">Statistiques</h2>
                <p class="text-sm text-zinc-400">Aperçu de votre activité</p>
              </div>
            </div>

            <!-- Chargement -->
            <div
              v-if="isLoadingStats"
              class="flex items-center justify-center py-12"
            >
              <div
                class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              ></div>
            </div>

            <!-- Statistiques -->
            <div
              v-else-if="stats"
              class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div class="bg-zinc-800/50 rounded-lg p-4">
                <p class="text-sm text-zinc-400 mb-1">Total rapports</p>
                <p class="text-3xl font-bold">{{ stats.totalReports }}</p>
              </div>
              <div class="bg-zinc-800/50 rounded-lg p-4">
                <p class="text-sm text-zinc-400 mb-1">Par Email</p>
                <div class="flex items-end gap-2">
                  <p class="text-3xl font-bold">
                    {{ stats.reportsByMethod.email }}
                  </p>
                  <p class="text-sm text-blue-400 mb-1">
                    {{ emailPercentage }}%
                  </p>
                </div>
              </div>
              <div class="bg-zinc-800/50 rounded-lg p-4">
                <p class="text-sm text-zinc-400 mb-1">Par WhatsApp</p>
                <div class="flex items-end gap-2">
                  <p class="text-3xl font-bold">
                    {{ stats.reportsByMethod.whatsapp }}
                  </p>
                  <p class="text-sm text-green-400 mb-1">
                    {{ whatsappPercentage }}%
                  </p>
                </div>
              </div>
            </div>

            <!-- Aucune statistique -->
            <div v-else class="text-center py-12">
              <p class="text-zinc-400">Aucune statistique disponible</p>
            </div>
          </div>

          <!-- Répartition des méthodes d'envoi -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 class="text-sm font-semibold mb-4">Répartition des envois</h3>
            <div class="space-y-4">
              <!-- Barre Email -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Mail :size="16" class="text-blue-400" />
                    <span class="text-sm">Email</span>
                  </div>
                  <span class="text-sm font-medium"
                    >{{ emailPercentage }}%</span
                  >
                </div>
                <div
                  class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden"
                >
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all duration-500"
                    :style="{ width: `${emailPercentage}%` }"
                  ></div>
                </div>
              </div>

              <!-- Barre WhatsApp -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <MessageSquare :size="16" class="text-green-400" />
                    <span class="text-sm">WhatsApp</span>
                  </div>
                  <span class="text-sm font-medium"
                    >{{ whatsappPercentage }}%</span
                  >
                </div>
                <div
                  class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden"
                >
                  <div
                    class="h-full bg-green-500 rounded-full transition-all duration-500"
                    :style="{ width: `${whatsappPercentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dépôt le plus utilisé -->
          <div
            v-if="stats?.mostUsedRepo"
            class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6"
          >
            <h3 class="text-sm font-semibold mb-4">Dépôt le plus utilisé</h3>
            <div class="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
              <div
                class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center"
              >
                <Github :size="24" class="text-white" />
              </div>
              <div>
                <p class="font-medium">{{ stats.mostUsedRepo }}</p>
                <p class="text-sm text-zinc-400">
                  Le plus fréquemment utilisé pour les rapports
                </p>
              </div>
            </div>
          </div>

          <!-- Activité récente -->
          <div
            v-if="stats?.recentReports && stats.recentReports.length > 0"
            class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold">Activité récente</h3>
              <button
                @click="goToHistory"
                class="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Voir tout
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="report in stats.recentReports"
                :key="report.id"
                class="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center"
                >
                  <Mail
                    v-if="report.method === 'email'"
                    :size="16"
                    class="text-blue-400"
                  />
                  <MessageSquare v-else :size="16" class="text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">
                    {{ report.repoName }}
                  </p>
                  <p class="text-xs text-zinc-400">
                    Envoyé à {{ report.sentTo }} ·
                    {{ formatDate(report.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
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
