<script setup lang="ts">
/**
 * Dashboard - Page principale pour créer des rapports de commits
 *
 * Fonctionnalités :
 * - Vue d'ensemble (Graphiques & Calendrier)
 * - Sélection des commits depuis GitHub
 * - Édition du contenu du rapport
 * - Envoi par Email ou WhatsApp
 */
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";
import type { Repository, Commit, UserStats } from "../types";
import {
  GitBranch,
  Mail,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Calendar,
  User as UserIcon,
  Hash,
  ChevronDown,
  Search,
  LayoutDashboard,
  PenTool,
  Eye,
  X,
  Users
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import DashboardCharts from "../components/dashboard/DashboardCharts.vue";
import ContributionCalendar from "../components/dashboard/ContributionCalendar.vue";
import { marked } from 'marked';

const router = useRouter();
const authStore = useAuthStore();

// État
const activeTab = ref<'overview' | 'create' | 'calendar'>('create');
const isLoadingRepos = ref(false);
const isLoadingCommits = ref(false);
const isLoadingStats = ref(false);
const isSendingReport = ref(false);
const allUserRepositories = ref<Repository[]>([]);
const repositories = ref<Repository[]>([]);
const selectedRepos = ref<Repository[]>([]);
const commits = ref<any[]>([]);
const reportContent = ref("");
const sendMethod = ref<"email" | "whatsapp">("email");
const recipient = ref("");
const statusMessage = ref("");
const statusType = ref<"success" | "error" | "">("");
const userStats = ref<UserStats | null>(null);
const currentRepoSelect = ref<Repository | null>(null);
const showPreview = ref(false);

// Teams
const userTeams = ref<any[]>([]);
const selectedTeamId = ref<string>("");
const showTeamSection = ref(false);

function addRepoFromSelect() {
  if (currentRepoSelect.value) {
    if (!selectedRepos.value.find(r => r.id === currentRepoSelect.value!.id)) {
      selectedRepos.value.push(currentRepoSelect.value);
    }
    currentRepoSelect.value = null;
  }
}

function removeRepo(repoId: number) {
  selectedRepos.value = selectedRepos.value.filter(r => r.id !== repoId);
}

// Search Mode
const isSearchMode = ref(false);
const repoSearchQuery = ref("");



async function loadTeams() {
    try {
        const response = await api.getTeams();
        if (response.success && response.data) {
            userTeams.value = response.data;
        }
    } catch (e) {
        console.error("Failed to load teams", e);
    }
}


// Computed
const selectedCommits = computed(() => {
  return commits.value.filter((c) => c.selected);
});

const selectedCommitsText = computed(() => {
  return selectedCommits.value
    .map((c) => `- ${c.message} (${c.sha.substring(0, 7)})`)
    .join("\n");
});

const canSendReport = computed(() => {
  return (
    reportContent.value.trim().length > 0 &&
    recipient.value.trim().length > 0 &&
    !isSendingReport.value
  );
});

const recipientPlaceholder = computed(() => {
  return sendMethod.value === "email" ? "exemple@email.com" : "+33612345678";
});

const previewHtml = computed(() => {
  if (!reportContent.value) return 'Aperçu vide';
  try {
    return marked.parse(reportContent.value);
  } catch (e) {
    return reportContent.value;
  }
});

// Fonctions
onMounted(async () => {
  await Promise.all([
    loadRepositories(),
    loadStats(),
    loadTeams()
  ]);
});

async function loadStats() {
  isLoadingStats.value = true;
  try {
    const response = await api.getUserStats();
    if (response.success && response.data) {
      userStats.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load stats:", error);
  } finally {
    isLoadingStats.value = false;
  }
}

// Watcher pour charger les commits quand la sélection change
watch(selectedRepos, async (newRepos) => {
  if (newRepos.length > 0) {
    await loadCommits(newRepos); 
  } else {
    commits.value = [];
  }
}, { deep: true });

// Watcher pour mettre à jour le destinataire par défaut quand la méthode change
watch(sendMethod, (newMethod) => {
  if (authStore.user?.settings) {
    if (newMethod === "email") {
      const defaultEmail = authStore.user.settings.email?.defaultRecipient || "";
      recipient.value = defaultEmail;
    } else {
      const defaultNumber = authStore.user.settings.whatsapp?.defaultNumber || "";
      recipient.value = defaultNumber;
    }
  }
});

async function loadRepositories() {
  isLoadingRepos.value = true;
  try {
    const response = await api.getUserRepositories();
    if (response.success && response.data) {
      const fullList = response.data.repositories;
      allUserRepositories.value = fullList;

      let filteredRepos = fullList;
      // Filtrer selon les préférences utilisateur
      if (authStore.user?.visibleRepos) {
        filteredRepos = filteredRepos.filter((repo) =>
          authStore.user?.visibleRepos?.includes(repo.name)
        );
      }
      repositories.value = filteredRepos;

      if (repositories.value.length > 0 && selectedRepos.value.length === 0) {
        // Auto-select first? Maybe not for multi-select. Let user choose.
        // Or select first one by default if empty?
        // Let's select none by default or restore from save if implemented. Ditch auto-select of first for now to avoid confusion.
         // Auto-fetch if enabled
        const autoFetch = authStore.user?.settings?.github?.autoFetchCommits;
        if (autoFetch && selectedRepos.value.length > 0) {
          await loadCommits(selectedRepos.value);
        }
      }
    }
  } catch (error) {
    statusType.value = "error";
    statusMessage.value = "Impossible de charger vos dépôts GitHub";
  } finally {
    isLoadingRepos.value = false;
  }
}

async function loadCommits(repos: Repository[]) {
  if (repos.length === 0) return;
  isLoadingCommits.value = true;
  commits.value = [];

  try {
    const maxCommits = authStore.user?.settings?.github?.maxCommits || 50;
    
    // Fetch from all repos
    const promises = repos.map(repo => api.getRepositoryCommits(
      repo.owner.login,
      repo.name,
      { perPage: maxCommits }
    ));

    const results = await Promise.all(promises);
    
    // Aggregate results
    let allCommits: any[] = [];
    results.forEach(response => {
       if (response.success && response.data) {
          allCommits = [...allCommits, ...response.data.commits];
       }
    });

    // Sort by date desc
    allCommits.sort((a, b) => new Date(b.author.date).getTime() - new Date(a.author.date).getTime());

    // Map to include selected property
    commits.value = allCommits.map((c: any) => ({
      ...c,
      selected: false,
    }));

  } catch (error) {
    statusType.value = "error";
    statusMessage.value = "Impossible de charger les commits";
  } finally {
    isLoadingCommits.value = false;
  }
}

function updateReportContent() {
  const repoNames = selectedRepos.value.length > 0
    ? selectedRepos.value.map(r => r.full_name).join(', ')
    : "Aucun dépôt";
  let content = `Rapport de commits - ${repoNames}\n\nCommits sélectionnés:\n${selectedCommitsText.value}\n\n---\n\nDétails du rapport:\n`;

  const signatureEnabled = authStore.user?.settings?.email?.signatureEnabled;
  if (sendMethod.value === "email" && signatureEnabled) {
    const signature = authStore.user?.settings?.email?.signature;
    content += `\n\n--\n${signature}`;
  }

  reportContent.value = content;
}

function toggleCommit(commit: any) {
  commit.selected = !commit.selected;
  updateReportContent();
}

function selectAllCommits() {
  const allSelected = commits.value.every((c) => c.selected);
  commits.value.forEach((c) => (c.selected = !allSelected));
  updateReportContent();
}

// Search Logic
const isValidRepo = computed(() => {
  if (!repoSearchQuery.value) return false;
  return allUserRepositories.value.some(
    (r) =>
      r.name.toLowerCase() === repoSearchQuery.value.toLowerCase() ||
      r.full_name.toLowerCase() === repoSearchQuery.value.toLowerCase()
  );
});

function toggleSearchMode() {
  isSearchMode.value = !isSearchMode.value;
  if (!isSearchMode.value) {
    repoSearchQuery.value = "";
  }
}

// Search Logic
// Adapted for multi-select: Search filters the list? Or search adds to selection?
// The current UI uses search to SET selectedRepo. 
// We should change it: Search finds a repo, user clicks to ADD it.
function handleRepoSearch() {
  if (!repoSearchQuery.value) return;
  const foundRepo = allUserRepositories.value.find(
    (r) =>
      r.name.toLowerCase() === repoSearchQuery.value.toLowerCase() ||
      r.full_name.toLowerCase() === repoSearchQuery.value.toLowerCase()
  );
  if (foundRepo) {
    if (!selectedRepos.value.find(r => r.id === foundRepo.id)) {
        selectedRepos.value.push(foundRepo);
    }
    repoSearchQuery.value = ""; // Clear search after adding
    isSearchMode.value = false;
  }
}

function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600)
    return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400)
    return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800)
    return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;

  const format =
    authStore.user?.settings?.appearance?.dateFormat || "DD/MM/YYYY";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  if (format === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  } else if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }
  return `${day}/${month}/${year}`;
}

async function sendReport() {
  if (!canSendReport.value || selectedRepos.value.length === 0) return;

  isSendingReport.value = true;
  statusMessage.value = "";
  statusType.value = "";

  try {
    let finalContent = reportContent.value;

    if (sendMethod.value === "whatsapp" && authStore.user?.settings?.whatsapp) {
      const waSettings = authStore.user.settings.whatsapp;
      if (waSettings.includeTimestamp) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = now.toLocaleDateString("fr-FR");
        finalContent = `📅 ${dateStr} ${timeStr}\n\n${finalContent}`;
      }
      if (waSettings.formatMarkdown) {
        finalContent = finalContent.trim();
      }
    }

    await api.createReport({
      repoName: "", // Legacy, required by type
      repoNames: selectedRepos.value.map(r => r.full_name),
      content: finalContent,
      method: sendMethod.value,
      sentTo: recipient.value,
      teamId: selectedTeamId.value || undefined,
    });

    statusType.value = "success";
    statusMessage.value = `✓ Rapport envoyé avec succès ${
      sendMethod.value === "email" ? "par email" : "via WhatsApp"
    } !`;
    
    // Refresh stats after sending
    loadStats();

    setTimeout(() => {
      reportContent.value = "";
      recipient.value = "";
      commits.value.forEach((c) => (c.selected = false));
      statusMessage.value = "";
    }, 3000);
  } catch (error: any) {
    statusType.value = "error";
    statusMessage.value = `✗ Erreur: ${
      error.response?.data?.error?.message || error.response?.data?.message || "Impossible d'envoyer le rapport"
    }`;
  } finally {
    isSendingReport.value = false;
  }
}
</script>

<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <!-- Tabs Navigation -->
      <div class="border-b border-zinc-800 bg-zinc-900 px-6">
        <div class="flex gap-6">
          <button
            @click="activeTab = 'create'"
            :class="[
              'py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'create'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            ]"
          >
            <PenTool :size="16" />
            Nouveau Rapport
          </button>
          <button
            @click="activeTab = 'overview'"
            :class="[
              'py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            ]"
          >
           <LayoutDashboard :size="16" />
            Vue d'ensemble
          </button>
          <button
            @click="activeTab = 'calendar'"
            :class="[
              'py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'calendar'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            ]"
          >
           <Calendar :size="16" />
            Calendrier
          </button>
        </div>
      </div>

      <!-- Tab Content: Overview -->
      <div v-if="activeTab === 'overview'" class="flex-1 overflow-y-auto p-6 bg-zinc-950 min-h-0">
         <div v-if="isLoadingStats" class="flex justify-center items-center h-64">
            <Loader2 :size="32" class="text-purple-500 animate-spin" />
         </div>
         <div v-else-if="userStats">
            <UserStatsOverview :stats="userStats" />
            <!-- Charts Section -->
            <DashboardCharts :stats="userStats" />
         </div>
      </div>

      <!-- Tab Content: Calendar -->
      <div v-if="activeTab === 'calendar'" class="flex-1 overflow-y-auto p-6 bg-zinc-950 min-h-0">
         <div v-if="isLoadingStats" class="flex justify-center items-center h-64">
            <Loader2 :size="32" class="text-purple-500 animate-spin" />
         </div>
         <div v-else-if="userStats">
            <ContributionCalendar :data="userStats.calendarStats" />
         </div>
      </div>

      <!-- Tab Content: Create Report (Previous Layout) -->
      <div v-if="activeTab === 'create'" class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-zinc-950">
          <!-- Section des commits (gauche) -->
          <div class="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col min-h-0">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
              <div class="flex flex-col gap-4 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <GitBranch :size="20" class="text-purple-400" />
                    </div>
                    <div>
                      <h2 class="text-lg font-semibold text-white">Commits</h2>
                      <p class="text-sm text-zinc-400">Sélectionnez un dépôt</p>
                    </div>
                  </div>

                  <button
                    @click="selectedRepos.length > 0 && loadCommits(selectedRepos)"
                    :disabled="isLoadingCommits || selectedRepos.length === 0"
                    class="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    title="Actualiser"
                  >
                    <RefreshCw :size="18" :class="['text-zinc-400', isLoadingCommits ? 'animate-spin' : '']" />
                  </button>
                </div>

                <!-- Repository Selector / Search -->
                <div class="space-y-4">
                  <!-- Selected Repos Tags -->
                  <div class="flex flex-wrap gap-2" v-if="selectedRepos.length > 0">
                    <div v-for="repo in selectedRepos" :key="repo.id" 
                         class="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                      <span>{{ repo.name }}</span>
                      <button @click="removeRepo(repo.id)" class="hover:text-white transition-colors"><X :size="12" /></button>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-zinc-300"> Ajouter des dépôts </label>
                    <button
                      @click="toggleSearchMode"
                      class="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <component :is="isSearchMode ? ChevronDown : Search" :size="14" />
                      <span>{{ isSearchMode ? "Sélectionner dans la liste" : "Rechercher par nom" }}</span>
                    </button>
                  </div>

                  <div v-if="isSearchMode" class="relative">
                    <div class="relative">
                      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        v-model="repoSearchQuery"
                        @keydown.enter.prevent="handleRepoSearch"
                        type="text"
                        placeholder="Rechercher un dépôt (ex: mon-projet)"
                        :class="[
                          'w-full pl-10 pr-4 py-3 bg-zinc-900 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all',
                          repoSearchQuery
                            ? isValidRepo
                              ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                              : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-zinc-800 focus:border-purple-500 focus:ring-purple-500/50',
                        ]"
                      />
                       <!-- Validation icons hidden for now or adapted -->
                    </div>
                  </div>
                  <div v-else class="relative">
                    <GitBranch :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select
                      v-model="currentRepoSelect"
                      @change="addRepoFromSelect"
                      class="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      :disabled="isLoadingRepos"
                    >
                      <option :value="null" disabled selected>
                        {{ isLoadingRepos ? "Chargement..." : "Ajouter un dépôt..." }}
                      </option>
                      <option v-for="repo in repositories" :key="repo.id" :value="repo">
                        {{ repo.full_name }}
                      </option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown :size="16" class="text-zinc-500" />
                    </div>
                  </div>

                  <!-- Team Selection (Optional) -->
                  <div class="space-y-3 pt-4 border-t border-zinc-800/50" v-if="userTeams.length > 0">
                      <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <Users :size="16" class="text-purple-400" />
                          Partager avec une équipe <span class="text-zinc-500 text-xs font-normal">(optionnel)</span>
                        </label>
                        <button
                          @click="showTeamSection = !showTeamSection"
                          class="p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                          :class="showTeamSection ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'"
                          :title="showTeamSection ? 'Masquer' : 'Afficher'"
                        >
                          <Eye :size="14" />
                          <span>{{ showTeamSection ? 'Masquer' : 'Afficher' }}</span>
                        </button>
                      </div>
                      <transition
                        enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-20"
                        leave-active-class="transition-all duration-200 ease-in"
                        leave-from-class="opacity-100 max-h-20"
                        leave-to-class="opacity-0 max-h-0"
                      >
                        <div v-if="showTeamSection" class="overflow-hidden">
                          <select
                              v-model="selectedTeamId"
                              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          >
                              <option value="">Aucune (Personnel)</option>
                              <option v-for="team in userTeams" :key="team.id" :value="team.id">
                                  {{ team.name }}
                              </option>
                          </select>
                        </div>
                      </transition>
                  </div>
                </div>
              </div>

               <div class="flex items-center justify-between" v-if="selectedRepos.length > 0">
                <span class="text-sm text-zinc-400">
                  {{ selectedCommits.length }} / {{ commits.length }} sélectionné(s)
                </span>
                <button
                  @click="selectAllCommits"
                  class="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  v-if="commits.length > 0"
                >
                  {{ commits.every((c) => c.selected) ? "Tout désélectionner" : "Tout sélectionner" }}
                </button>
              </div>
            </div>

            <!-- Liste des commits -->
            <div class="flex-1 overflow-y-auto">
              <!-- Loading state -->
              <div v-if="isLoadingCommits" class="p-8 flex flex-col items-center justify-center">
                <Loader2 :size="32" class="text-purple-400 animate-spin mb-3" />
                <p class="text-zinc-400 text-sm">Chargement des commits...</p>
              </div>

              <!-- Commits list -->
              <div v-else-if="commits.length > 0" class="p-4 space-y-2">
                <button
                  v-for="commit in commits"
                  :key="commit.sha"
                  @click="toggleCommit(commit)"
                  :class="[
                    'w-full text-left p-4 rounded-lg border transition-all duration-200',
                    commit.selected
                      ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700',
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                        commit.selected ? 'bg-purple-500 border-purple-500' : 'border-zinc-600',
                      ]"
                    >
                      <CheckCircle2 v-if="commit.selected" :size="14" class="text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-white mb-1 line-clamp-2">
                        {{ commit.message }}
                      </p>
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <div class="flex items-center gap-1.5">
                          <UserIcon :size="12" />
                          <span>{{ commit.author.name }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <Calendar :size="12" />
                          <span>{{ formatDate(commit.author.date) }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <Hash :size="12" />
                          <span class="font-mono">{{ commit.sha.substring(0, 7) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <!-- Empty state -->
              <div v-else class="p-8 text-center">
                <div class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch :size="24" class="text-zinc-600" />
                </div>
                <p class="text-zinc-400 text-sm">
                  {{ selectedRepos.length > 0 ? "Aucun commit trouvé" : "Sélectionnez au moins un dépôt pour voir les commits" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Section de l'éditeur (droite) -->
          <div class="lg:w-1/2 flex flex-col min-h-0 bg-zinc-950">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
              <div class="flex items-center justify-between">
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Send :size="20" class="text-blue-400" />
                    </div>
                    <div>
                      <h2 class="text-lg font-semibold text-white">Créer un rapport</h2>
                      <p class="text-sm text-zinc-400">Éditez et envoyez votre rapport</p>
                    </div>
                 </div>
                 
                 <!-- Preview Toggle -->
                 <button 
                    @click="showPreview = !showPreview"
                    class="p-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    :class="showPreview ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'"
                 >
                    <Eye :size="16" />
                    {{ showPreview ? 'Masquer aperçu' : 'Voir aperçu' }}
                 </button>
              </div>
            </div>

            <!-- Form -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              
              <!-- Content / Preview Split -->
              <div class="grid grid-cols-1 gap-6" :class="showPreview ? 'h-[500px]' : ''">
                  <!-- Textarea -->
                  <div :class="showPreview ? 'h-full flex flex-col' : ''">
                    <label class="block text-sm font-medium text-zinc-300 mb-2" v-if="!showPreview">
                      Contenu du rapport
                    </label>
                    <textarea
                      v-model="reportContent"
                      placeholder="Rédigez votre rapport ici... (Markdown supporté)"
                      class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none font-mono text-sm"
                      :class="showPreview ? 'h-1/2 mb-4' : 'h-64'"
                    ></textarea>
                    
                    <!-- Real-time Preview Pane -->
                    <div v-if="showPreview" class="h-1/2 flex flex-col">
                        <label class="block text-sm font-medium text-blue-400 mb-2">Aperçu en direct</label>
                        <div 
                           class="flex-1 bg-white rounded-lg p-4 overflow-y-auto text-slate-800 prose prose-sm max-w-none"
                           v-html="previewHtml"
                        ></div>
                    </div>

                    <p class="mt-2 text-xs text-zinc-500" v-if="!showPreview">
                      {{ reportContent.length }} caractères
                    </p>
                  </div>
              </div>


              <!-- Options (Method, Recipient) -->
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-3"> Méthode d'envoi </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="sendMethod = 'email'"
                    :class="[
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      sendMethod === 'email'
                        ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
                    ]"
                  >
                    <Mail :size="20" :class="sendMethod === 'email' ? 'text-purple-400' : 'text-zinc-400'" />
                    <div class="text-left">
                      <div :class="['text-sm font-medium', sendMethod === 'email' ? 'text-white' : 'text-zinc-400']">
                        Email
                      </div>
                    </div>
                  </button>
                  <button
                    @click="sendMethod = 'whatsapp'"
                    :class="[
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      sendMethod === 'whatsapp'
                        ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
                    ]"
                  >
                    <MessageCircle :size="20" :class="sendMethod === 'whatsapp' ? 'text-green-400' : 'text-zinc-400'" />
                    <div class="text-left">
                      <div :class="['text-sm font-medium', sendMethod === 'whatsapp' ? 'text-white' : 'text-zinc-400']">
                        WhatsApp
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2"> Destinataire </label>
                <input
                  v-model="recipient"
                  type="text"
                  :placeholder="recipientPlaceholder"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>

              <div
                v-if="statusMessage"
                :class="[
                  'p-4 rounded-lg border flex items-start gap-3',
                  statusType === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400',
                ]"
              >
                <component :is="statusType === 'success' ? CheckCircle2 : AlertCircle" :size="20" class="flex-shrink-0 mt-0.5" />
                <p class="text-sm">{{ statusMessage }}</p>
              </div>

              <button
                @click="sendReport"
                :disabled="!canSendReport"
                class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:shadow-none"
              >
                <Loader2 v-if="isSendingReport" :size="20" class="animate-spin" />
                <Send v-else :size="20" />
                <span>{{ isSendingReport ? "Envoi en cours..." : "Envoyer le rapport" }}</span>
              </button>
            </div>
          </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #52525b; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
