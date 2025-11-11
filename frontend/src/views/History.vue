<script setup lang="ts">
/**
 * Page Historique - Affiche tous les rapports envoyés
 *
 * Fonctionnalités :
 * - Liste paginée des rapports
 * - Filtres par dépôt et méthode
 * - Recherche
 * - Suppression de rapports
 * - Vue détaillée
 */
import {
  Calendar,
  Mail,
  MessageSquare,
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "../services/api";
import { useAuthStore } from "../stores/auth.store";
import type { Report, ReportFilters } from "../types";

const router = useRouter();

// ============================================================================
// STATE
// ============================================================================

const reports = ref<Report[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const selectedMethod = ref<"all" | "email" | "whatsapp">("all");
const currentPage = ref(1);
const totalPages = ref(1);
const totalReports = ref(0);
const limit = ref(10);

const selectedReport = ref<Report | null>(null);
const showDeleteConfirm = ref(false);
const reportToDelete = ref<string | null>(null);

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Rapports filtrés par recherche et méthode
 */
const filteredReports = computed(() => {
  let filtered = reports.value;

  // Filtre par méthode
  if (selectedMethod.value !== "all") {
    filtered = filtered.filter((r) => r.method === selectedMethod.value);
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.repoName.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query) ||
        r.sentTo?.toLowerCase().includes(query),
    );
  }

  return filtered;
});

/**
 * Statistiques rapides
 */
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

// ============================================================================
// METHODS
// ============================================================================

/**
 * Charge les rapports depuis l'API
 */
async function fetchReports() {
  try {
    isLoading.value = true;

    const filters: ReportFilters = {
      page: currentPage.value,
      limit: limit.value,
    };

    if (selectedMethod.value !== "all") {
      filters.method = selectedMethod.value;
    }

    const response = await apiService.getReports(filters);

    if (response.success && response.data) {
      const data = response.data as any;
      reports.value = data.reports || [];
      totalPages.value = data.pagination?.totalPages || 1;
      totalReports.value = data.pagination?.total || 0;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des rapports:", error);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Change de page
 */
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchReports();
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Ouvre la vue détaillée d'un rapport
 */
function viewReport(report: Report) {
  selectedReport.value = report;
}

/**
 * Ferme la vue détaillée
 */
function closeReportView() {
  selectedReport.value = null;
}

/**
 * Demande confirmation de suppression
 */
function confirmDelete(reportId: string) {
  reportToDelete.value = reportId;
  showDeleteConfirm.value = true;
}

/**
 * Supprime un rapport
 */
async function deleteReport() {
  if (!reportToDelete.value) return;

  try {
    const response = await apiService.deleteReport(reportToDelete.value);

    if (response.success) {
      // Retirer le rapport de la liste
      reports.value = reports.value.filter(
        (r) => r.id !== reportToDelete.value,
      );
      totalReports.value--;
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  } finally {
    showDeleteConfirm.value = false;
    reportToDelete.value = null;
  }
}

/**
 * Annule la suppression
 */
function cancelDelete() {
  showDeleteConfirm.value = false;
  reportToDelete.value = null;
}

/**
 * Navigation vers le dashboard
 */
function goToDashboard() {
  router.push({ name: "Dashboard" });
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  fetchReports();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <!-- Header -->
    <header class="bg-zinc-900/30 border-b border-zinc-800 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Historique</h1>
          <p class="text-sm text-zinc-400 mt-1">
            {{ totalReports }} rapport{{ totalReports > 1 ? "s" : "" }} envoyé{{
              totalReports > 1 ? "s" : ""
            }}
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
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-zinc-400">Total</p>
              <p class="text-3xl font-bold mt-1">{{ stats.total }}</p>
            </div>
            <div
              class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center"
            >
              <Calendar :size="24" class="text-purple-400" />
            </div>
          </div>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-zinc-400">Par Email</p>
              <p class="text-3xl font-bold mt-1">{{ stats.email }}</p>
            </div>
            <div
              class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center"
            >
              <Mail :size="24" class="text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-zinc-400">Par WhatsApp</p>
              <p class="text-3xl font-bold mt-1">{{ stats.whatsapp }}</p>
            </div>
            <div
              class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center"
            >
              <MessageSquare :size="24" class="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <Search
              :size="20"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par dépôt, contenu ou destinataire..."
              class="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Method Filter -->
          <div class="flex gap-2">
            <button
              @click="selectedMethod = 'all'"
              :class="[
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                selectedMethod === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
              ]"
            >
              Tous
            </button>
            <button
              @click="selectedMethod = 'email'"
              :class="[
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                selectedMethod === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
              ]"
            >
              <Mail :size="16" />
              Email
            </button>
            <button
              @click="selectedMethod = 'whatsapp'"
              :class="[
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                selectedMethod === 'whatsapp'
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
              ]"
            >
              <MessageSquare :size="16" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      <!-- Reports List -->
      <div
        class="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center p-12">
          <div
            class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          ></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredReports.length === 0" class="text-center p-12">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-4"
          >
            <Calendar :size="32" class="text-zinc-600" />
          </div>
          <h3 class="text-lg font-semibold mb-2">Aucun rapport trouvé</h3>
          <p class="text-zinc-400 text-sm mb-6">
            Commencez par créer votre premier rapport depuis le dashboard.
          </p>
          <button
            @click="goToDashboard"
            class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Créer un rapport
          </button>
        </div>

        <!-- Reports Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-zinc-900/80">
              <tr class="border-b border-zinc-800">
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase"
                >
                  Dépôt
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase"
                >
                  Méthode
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase"
                >
                  Destinataire
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase"
                >
                  Date
                </th>
                <th
                  class="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr
                v-for="report in filteredReports"
                :key="report.id"
                class="hover:bg-zinc-800/30 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-medium">
                  {{ report.repoName }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                      report.method === 'email'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-green-500/10 text-green-400',
                    ]"
                  >
                    <Mail v-if="report.method === 'email'" :size="14" />
                    <MessageSquare v-else :size="14" />
                    {{ report.method === "email" ? "Email" : "WhatsApp" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-zinc-400">
                  {{ report.sentTo }}
                </td>
                <td class="px-6 py-4 text-sm text-zinc-400">
                  {{ formatDate(report.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="viewReport(report)"
                      class="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Voir le rapport"
                    >
                      <Eye :size="18" />
                    </button>
                    <button
                      @click="confirmDelete(report.id)"
                      class="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between px-6 py-4 border-t border-zinc-800"
        >
          <p class="text-sm text-zinc-400">
            Page {{ currentPage }} sur {{ totalPages }}
          </p>
          <div class="flex gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft :size="20" />
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Report Detail Modal -->
    <div
      v-if="selectedReport"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeReportView"
    >
      <div
        class="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div
          class="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between"
        >
          <h3 class="text-lg font-semibold">Détails du rapport</h3>
          <button
            @click="closeReportView"
            class="text-zinc-400 hover:text-white transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm text-zinc-400">Dépôt</label>
            <p class="text-lg font-medium mt-1">
              {{ selectedReport.repoName }}
            </p>
          </div>

          <div>
            <label class="text-sm text-zinc-400">Méthode d'envoi</label>
            <div class="mt-1">
              <span
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                  selectedReport.method === 'email'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-green-500/10 text-green-400',
                ]"
              >
                <Mail v-if="selectedReport.method === 'email'" :size="14" />
                <MessageSquare v-else :size="14" />
                {{ selectedReport.method === "email" ? "Email" : "WhatsApp" }}
              </span>
            </div>
          </div>

          <div>
            <label class="text-sm text-zinc-400">Destinataire</label>
            <p class="mt-1">{{ selectedReport.sentTo }}</p>
          </div>

          <div>
            <label class="text-sm text-zinc-400">Date d'envoi</label>
            <p class="mt-1">{{ formatDate(selectedReport.createdAt) }}</p>
          </div>

          <div>
            <label class="text-sm text-zinc-400">Contenu</label>
            <div
              class="mt-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
            >
              <pre class="text-sm text-zinc-300 whitespace-pre-wrap">{{
                selectedReport.content
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="cancelDelete"
    >
      <div
        class="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6"
      >
        <h3 class="text-lg font-semibold mb-4">Confirmer la suppression</h3>
        <p class="text-zinc-400 mb-6">
          Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est
          irréversible.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="deleteReport"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
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

/* Scrollbar pour le modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #18181b;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
