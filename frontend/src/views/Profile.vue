<script setup lang="ts">
/**
 * Profile - Page de profil utilisateur
 *
 * Fonctionnalités :
 * - Informations du compte GitHub
 * - Statistiques d'utilisation
 * - Graphiques d'activité
 */
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import {
  User,
  Mail,
  Github,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Send,
  MessageCircle,
  BarChart3,
  GitBranch,
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// État
const isLoading = ref(false);
const stats = ref({
  totalReports: 42,
  reportsThisMonth: 12,
  emailsSent: 28,
  whatsappSent: 14,
  averagePerWeek: 10,
  longestStreak: 7,
  repositoriesTracked: 8,
  lastReportDate: new Date("2024-01-15T14:30:00Z"),
});

const recentActivity = ref([
  {
    id: 1,
    type: "report",
    description: "Rapport envoyé pour my-awesome-project",
    method: "email",
    date: new Date("2024-01-15T14:30:00Z"),
  },
  {
    id: 2,
    type: "report",
    description: "Rapport envoyé pour frontend-app",
    method: "whatsapp",
    date: new Date("2024-01-14T10:15:00Z"),
  },
  {
    id: 3,
    type: "report",
    description: "Rapport envoyé pour backend-api",
    method: "email",
    date: new Date("2024-01-13T16:45:00Z"),
  },
  {
    id: 4,
    type: "report",
    description: "Rapport envoyé pour mobile-app",
    method: "email",
    date: new Date("2024-01-12T09:20:00Z"),
  },
  {
    id: 5,
    type: "report",
    description: "Rapport envoyé pour data-pipeline",
    method: "whatsapp",
    date: new Date("2024-01-11T13:00:00Z"),
  },
]);

// Computed
const user = computed(() => authStore.user);

const memberSince = computed(() => {
  // Utiliser une date par défaut si createdAt n'existe pas
  const createdDate = new Date();
  createdDate.setMonth(createdDate.getMonth() - 3); // 3 mois par défaut
  const date = createdDate;
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
});

function formatDate(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600)
    return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400)
    return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800)
    return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

onMounted(() => {
  loadProfileData();
});

function loadProfileData() {
  isLoading.value = true;
  // Simuler le chargement des données
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
}
</script>

<template>
  <AppLayout>
    <div class="h-full overflow-y-auto">
      <div class="max-w-7xl mx-auto p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
          >
            <User :size="20" class="text-purple-400" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Profil</h1>
            <p class="text-sm text-zinc-400">
              Vos informations et statistiques
            </p>
          </div>
        </div>

        <!-- User Info Card -->
        <div
          class="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div
            class="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <!-- Avatar -->
            <div
              class="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30"
            >
              {{ user?.name?.charAt(0).toUpperCase() || "U" }}
            </div>

            <!-- Info -->
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-white mb-2">
                {{ user?.name || "Utilisateur" }}
              </h2>

              <div class="space-y-2">
                <div class="flex items-center gap-2 text-zinc-300">
                  <Mail :size="16" class="text-zinc-400" />
                  <span class="text-sm">{{
                    user?.email || "email@example.com"
                  }}</span>
                </div>

                <div class="flex items-center gap-2 text-zinc-300">
                  <Github :size="16" class="text-zinc-400" />
                  <span class="text-sm">{{
                    user?.githubId || user?.name || "github-user"
                  }}</span>
                </div>

                <div class="flex items-center gap-2 text-zinc-300">
                  <Calendar :size="16" class="text-zinc-400" />
                  <span class="text-sm">Membre depuis {{ memberSince }}</span>
                </div>
              </div>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
              <div
                class="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center gap-2"
              >
                <Award :size="16" class="text-purple-400" />
                <span class="text-sm font-medium text-purple-300">
                  Utilisateur actif
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Reports -->
          <div
            class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
              >
                <FileText :size="20" class="text-purple-400" />
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-white">
                  {{ stats.totalReports }}
                </p>
              </div>
            </div>
            <p class="text-sm text-zinc-400">Rapports totaux</p>
          </div>

          <!-- This Month -->
          <div
            class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
              >
                <TrendingUp :size="20" class="text-blue-400" />
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-white">
                  {{ stats.reportsThisMonth }}
                </p>
              </div>
            </div>
            <p class="text-sm text-zinc-400">Ce mois-ci</p>
          </div>

          <!-- Average per Week -->
          <div
            class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center"
              >
                <BarChart3 :size="20" class="text-green-400" />
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-white">
                  {{ stats.averagePerWeek }}
                </p>
              </div>
            </div>
            <p class="text-sm text-zinc-400">Moyenne / semaine</p>
          </div>

          <!-- Repositories -->
          <div
            class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center"
              >
                <GitBranch :size="20" class="text-orange-400" />
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-white">
                  {{ stats.repositoriesTracked }}
                </p>
              </div>
            </div>
            <p class="text-sm text-zinc-400">Dépôts suivis</p>
          </div>
        </div>

        <!-- Methods Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Email Stats -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
                >
                  <Mail :size="20" class="text-blue-400" />
                </div>
                <div>
                  <h3 class="font-semibold text-white">Emails envoyés</h3>
                  <p class="text-sm text-zinc-400">Via votre compte email</p>
                </div>
              </div>
              <p class="text-3xl font-bold text-blue-400">
                {{ stats.emailsSent }}
              </p>
            </div>
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-xs font-semibold inline-block text-blue-400"
                  >
                    {{
                      Math.round((stats.emailsSent / stats.totalReports) * 100)
                    }}%
                  </span>
                </div>
              </div>
              <div
                class="overflow-hidden h-2 text-xs flex rounded-full bg-zinc-800"
              >
                <div
                  :style="{
                    width: `${(stats.emailsSent / stats.totalReports) * 100}%`,
                  }"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600"
                ></div>
              </div>
            </div>
          </div>

          <!-- WhatsApp Stats -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center"
                >
                  <MessageCircle :size="20" class="text-green-400" />
                </div>
                <div>
                  <h3 class="font-semibold text-white">Messages WhatsApp</h3>
                  <p class="text-sm text-zinc-400">Via l'API Twilio</p>
                </div>
              </div>
              <p class="text-3xl font-bold text-green-400">
                {{ stats.whatsappSent }}
              </p>
            </div>
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-xs font-semibold inline-block text-green-400"
                  >
                    {{
                      Math.round(
                        (stats.whatsappSent / stats.totalReports) * 100,
                      )
                    }}%
                  </span>
                </div>
              </div>
              <div
                class="overflow-hidden h-2 text-xs flex rounded-full bg-zinc-800"
              >
                <div
                  :style="{
                    width: `${(stats.whatsappSent / stats.totalReports) * 100}%`,
                  }"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
            >
              <Activity :size="20" class="text-purple-400" />
            </div>
            <div>
              <h3 class="font-semibold text-white text-lg">Activité récente</h3>
              <p class="text-sm text-zinc-400">Vos derniers rapports envoyés</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
            >
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  activity.method === 'email'
                    ? 'bg-blue-500/10'
                    : 'bg-green-500/10',
                ]"
              >
                <Mail
                  v-if="activity.method === 'email'"
                  :size="18"
                  class="text-blue-400"
                />
                <MessageCircle v-else :size="18" class="text-green-400" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm text-white mb-1">
                  {{ activity.description }}
                </p>
                <div class="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock :size="12" />
                  <span>{{ formatDate(activity.date) }}</span>
                </div>
              </div>

              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  activity.method === 'email'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-green-500/10 text-green-400',
                ]"
              >
                {{ activity.method === "email" ? "Email" : "WhatsApp" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
              <Award :size="18" class="text-purple-400" />
              Réalisations
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-zinc-400">Plus longue série</span>
                <span class="text-sm font-medium text-white">
                  {{ stats.longestStreak }} jours
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-zinc-400">Dernier rapport</span>
                <span class="text-sm font-medium text-white">
                  {{ formatDate(stats.lastReportDate) }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
              <Send :size="18" class="text-blue-400" />
              Objectifs
            </h3>
            <div class="space-y-3">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-zinc-400">Rapports mensuels</span>
                  <span class="text-sm font-medium text-white">
                    {{ stats.reportsThisMonth }}/20
                  </span>
                </div>
                <div class="overflow-hidden h-2 rounded-full bg-zinc-800">
                  <div
                    :style="{
                      width: `${(stats.reportsThisMonth / 20) * 100}%`,
                    }"
                    class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
