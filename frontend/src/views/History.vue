<script setup lang="ts">
/**
 * History - Page d'historique des rapports
 *
 * Fonctionnalités :
 * - Liste des rapports envoyés
 * - Filtres et recherche
 * - Pagination
 * - Statistiques
 */
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";
import {
  Mail,
  MessageCircle,
  Search,
  Filter,
  Calendar,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// État
const reports = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const selectedMethod = ref<"all" | "email" | "whatsapp">("all");
const currentPage = ref(1);
const totalPages = ref(1);
const totalReports = ref(0);
const itemsPerPage = 10;

// Modal
const selectedReport = ref<any>(null);
const showDeleteModal = ref(false);
const reportToDelete = ref<any>(null);

// Stats
const stats = computed(() => {
  const emailCount = reports.value.filter((r) => r.method === "email").length;
  const whatsappCount = reports.value.filter(
    (r) => r.method === "whatsapp",
  ).length;

  return {
    total: reports.value.length,
    email: emailCount,
    whatsapp: whatsappCount,
  };
});

// Filtered reports
const filteredReports = computed(() => {
  let filtered = [...reports.value];

  // Filter by method
  if (selectedMethod.value !== "all") {
    filtered = filtered.filter((r) => r.method === selectedMethod.value);
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.repoName?.toLowerCase().includes(query) ||
        r.content?.toLowerCase().includes(query) ||
        r.sentTo?.toLowerCase().includes(query),
    );
  }

  return filtered;
});

// Paginated reports
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredReports.value.slice(start, end);
});

// Update total pages when filtered reports change
const updatePagination = () => {
  totalPages.value = Math.ceil(filteredReports.value.length / itemsPerPage);
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
};

// Fonctions
onMounted(() => {
  loadReports();
});

function loadReports() {
  isLoading.value = true;
  setTimeout(() => {
    reports.value = [
      {
        id: "1",
        repoName: "my-awesome-project",
        content:
          "Rapport hebdomadaire des commits\n- feat: Ajout authentification\n- fix: Correction bugs",
        method: "email",
        sentTo: "manager@company.com",
        createdAt: new Date("2024-01-15T14:30:00Z"),
        status: "sent",
      },
      {
        id: "2",
        repoName: "frontend-app",
        content:
          "Mise à jour du design system\n- style: Nouveaux composants\n- docs: Documentation",
        method: "whatsapp",
        sentTo: "+33612345678",
        createdAt: new Date("2024-01-14T10:15:00Z"),
        status: "sent",
      },
      {
        id: "3",
        repoName: "backend-api",
        content:
          "Corrections de sécurité\n- fix: Vulnérabilités corrigées\n- refactor: Code optimisé",
        method: "email",
        sentTo: "team@company.com",
        createdAt: new Date("2024-01-13T16:45:00Z"),
        status: "sent",
      },
      {
        id: "4",
        repoName: "mobile-app",
        content:
          "Release v2.0\n- feat: Nouvelle interface\n- perf: Améliorations",
        method: "email",
        sentTo: "stakeholders@company.com",
        createdAt: new Date("2024-01-12T09:20:00Z"),
        status: "sent",
      },
      {
        id: "5",
        repoName: "data-pipeline",
        content:
          "Optimisation des requêtes\n- perf: Indexation\n- fix: Gestion erreurs",
        method: "whatsapp",
        sentTo: "+33687654321",
        createdAt: new Date("2024-01-11T13:00:00Z"),
        status: "sent",
      },
    ];
    totalReports.value = reports.value.length;
    updatePagination();
    isLoading.value = false;
  }, 800);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(date: Date) {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function viewReport(report: any) {
  selectedReport.value = report;
}

function closeReportView() {
  selectedReport.value = null;
}

function confirmDelete(report: any) {
  reportToDelete.value = report;
  showDeleteModal.value = true;
}

async function deleteReport() {
  if (!reportToDelete.value) return;

  try {
    // await api.delete(`/api/reports/${reportToDelete.value.id}`);
    reports.value = reports.value.filter(
      (r) => r.id !== reportToDelete.value.id,
    );
    updatePagination();
    showDeleteModal.value = false;
    reportToDelete.value = null;
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
}

function cancelDelete() {
  showDeleteModal.value = false;
  reportToDelete.value = null;
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function downloadReport(report: any) {
  const blob = new Blob([report.content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport-${report.repoName}-${new Date(report.createdAt).toISOString().split("T")[0]}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
}
</script>

<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <!-- Header avec stats -->
      <div class="px-6 py-6 border-b border-zinc-800 bg-zinc-900/50">
        <div class="max-w-7xl mx-auto">
          <!-- Titre -->
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
            >
              <Clock :size="20" class="text-blue-400" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">Historique</h1>
              <p class="text-sm text-zinc-400">
                {{ totalReports }} rapport(s) envoyé(s)
              </p>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-zinc-400 mb-1">Total</p>
                  <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
                </div>
                <div
                  class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center"
                >
                  <BarChart3 :size="24" class="text-purple-400" />
                </div>
              </div>
            </div>

            <div
              class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-zinc-400 mb-1">Email</p>
                  <p class="text-2xl font-bold text-white">{{ stats.email }}</p>
                </div>
                <div
                  class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center"
                >
                  <Mail :size="24" class="text-blue-400" />
                </div>
              </div>
            </div>

            <div
              class="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-zinc-400 mb-1">WhatsApp</p>
                  <p class="text-2xl font-bold text-white">
                    {{ stats.whatsapp }}
                  </p>
                </div>
                <div
                  class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center"
                >
                  <MessageCircle :size="24" class="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
              <Search
                :size="18"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un rapport..."
                class="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                @input="updatePagination"
              />
            </div>

            <!-- Filter by method -->
            <div class="flex gap-2">
              <button
                @click="
                  selectedMethod = 'all';
                  updatePagination();
                "
                :class="[
                  'px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
                  selectedMethod === 'all'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800',
                ]"
              >
                Tous
              </button>
              <button
                @click="
                  selectedMethod = 'email';
                  updatePagination();
                "
                :class="[
                  'px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2',
                  selectedMethod === 'email'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800',
                ]"
              >
                <Mail :size="16" />
                <span class="hidden sm:inline">Email</span>
              </button>
              <button
                @click="
                  selectedMethod = 'whatsapp';
                  updatePagination();
                "
                :class="[
                  'px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2',
                  selectedMethod === 'whatsapp'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800',
                ]"
              >
                <MessageCircle :size="16" />
                <span class="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports List -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto p-6">
          <!-- Loading -->
          <div
            v-if="isLoading"
            class="flex flex-col items-center justify-center py-16"
          >
            <Loader2 :size="40" class="text-purple-400 animate-spin mb-4" />
            <p class="text-zinc-400">Chargement des rapports...</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="paginatedReports.length === 0"
            class="flex flex-col items-center justify-center py-16"
          >
            <div
              class="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4"
            >
              <Clock :size="32" class="text-zinc-600" />
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">
              Aucun rapport trouvé
            </h3>
            <p class="text-zinc-400 text-sm mb-6">
              {{
                searchQuery
                  ? "Essayez avec d'autres critères de recherche"
                  : "Créez votre premier rapport depuis le dashboard"
              }}
            </p>
            <button
              @click="router.push('/dashboard')"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30"
            >
              Créer un rapport
            </button>
          </div>

          <!-- Reports Grid -->
          <div v-else class="space-y-3">
            <div
              v-for="report in paginatedReports"
              :key="report.id"
              class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all group"
            >
              <div class="flex items-start justify-between gap-4">
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        report.method === 'email'
                          ? 'bg-blue-500/10'
                          : 'bg-green-500/10',
                      ]"
                    >
                      <Mail
                        v-if="report.method === 'email'"
                        :size="16"
                        class="text-blue-400"
                      />
                      <MessageCircle v-else :size="16" class="text-green-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-semibold text-white truncate">
                        {{ report.repoName }}
                      </h3>
                      <p class="text-sm text-zinc-400">
                        Envoyé à {{ report.sentTo }}
                      </p>
                    </div>
                  </div>

                  <p class="text-sm text-zinc-400 line-clamp-2 mb-3">
                    {{ report.content }}
                  </p>

                  <div class="flex items-center gap-4 text-xs text-zinc-500">
                    <div class="flex items-center gap-1.5">
                      <Calendar :size="12" />
                      <span>{{ formatDateShort(report.createdAt) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <CheckCircle2 :size="12" class="text-green-400" />
                      <span class="text-green-400">Envoyé</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div
                  class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="viewReport(report)"
                    class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye :size="18" class="text-zinc-400 hover:text-white" />
                  </button>
                  <button
                    @click="downloadReport(report)"
                    class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download
                      :size="18"
                      class="text-zinc-400 hover:text-white"
                    />
                  </button>
                  <button
                    @click="confirmDelete(report)"
                    class="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2
                      :size="18"
                      class="text-zinc-400 hover:text-red-400"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800"
          >
            <p class="text-sm text-zinc-400">
              Page {{ currentPage }} sur {{ totalPages }}
            </p>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft :size="18" class="text-zinc-400" />
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'w-10 h-10 rounded-lg font-medium text-sm transition-all',
                    page === currentPage
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800',
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight :size="18" class="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal - View Report -->
    <div
      v-if="selectedReport"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeReportView"
    >
      <div
        class="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-zinc-800"
        >
          <div>
            <h2 class="text-xl font-semibold text-white">
              {{ selectedReport.repoName }}
            </h2>
            <p class="text-sm text-zinc-400 mt-1">
              {{ formatDate(selectedReport.createdAt) }}
            </p>
          </div>
          <button
            @click="closeReportView"
            class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X :size="20" class="text-zinc-400" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">
                Méthode d'envoi
              </label>
              <div class="flex items-center gap-2">
                <component
                  :is="selectedReport.method === 'email' ? Mail : MessageCircle"
                  :size="16"
                  :class="
                    selectedReport.method === 'email'
                      ? 'text-blue-400'
                      : 'text-green-400'
                  "
                />
                <span class="text-white capitalize">{{
                  selectedReport.method
                }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">
                Destinataire
              </label>
              <p class="text-white">{{ selectedReport.sentTo }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">
                Contenu du rapport
              </label>
              <div
                class="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono"
              >
                {{ selectedReport.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800"
        >
          <button
            @click="downloadReport(selectedReport)"
            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download :size="16" />
            <span>Télécharger</span>
          </button>
          <button
            @click="closeReportView"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal - Delete Confirmation -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="cancelDelete"
    >
      <div
        class="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div class="p-6">
          <div
            class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4"
          >
            <AlertCircle :size="24" class="text-red-400" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">
            Supprimer ce rapport ?
          </h3>
          <p class="text-zinc-400 text-sm mb-6">
            Cette action est irréversible. Le rapport sera définitivement
            supprimé.
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="cancelDelete"
              class="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              @click="deleteReport"
              class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Animation */
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

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
