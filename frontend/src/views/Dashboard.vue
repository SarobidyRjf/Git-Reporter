<script setup lang="ts">
/**
 * Dashboard - Page principale pour créer des rapports de commits
 *
 * Fonctionnalités :
 * - Sélection des commits depuis GitHub
 * - Édition du contenu du rapport
 * - Envoi par Email ou WhatsApp
 */
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";
import type { Repository, Commit } from "../types";
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
  Search
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// État
const isLoadingRepos = ref(false);
const isLoadingCommits = ref(false);
const isSendingReport = ref(false);
const repositories = ref<Repository[]>([]);
const selectedRepo = ref<Repository | null>(null);
const commits = ref<any[]>([]);
const reportContent = ref("");
const sendMethod = ref<"email" | "whatsapp">("email");
const recipient = ref("");
const statusMessage = ref("");
const statusType = ref<"success" | "error" | "">("");

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

// Fonctions
onMounted(async () => {
  await loadRepositories();
});

// Watcher pour charger les commits quand un repo est sélectionné
watch(selectedRepo, (newRepo) => {
  if (newRepo) {
    loadCommits(newRepo);
  } else {
    commits.value = [];
  }
});

async function loadRepositories() {
  isLoadingRepos.value = true;
  try {
    const response = await api.getUserRepositories();
    if (response.success && response.data) {
      repositories.value = response.data.repositories;
      
      // Sélectionner le premier repo par défaut s'il y en a
      if (repositories.value.length > 0 && !selectedRepo.value) {
        selectedRepo.value = repositories.value[0] ?? null;
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des dépôts:", error);
    statusType.value = "error";
    statusMessage.value = "Impossible de charger vos dépôts GitHub";
  } finally {
    isLoadingRepos.value = false;
  }
}

async function loadCommits(repo: Repository) {
  if (!repo) return;
  
  isLoadingCommits.value = true;
  commits.value = [];
  
  try {
    const response = await api.getRepositoryCommits(repo.owner.login, repo.name);
    if (response.success && response.data) {
      // Ajouter la propriété selected aux commits
      commits.value = response.data.commits.map((c: any) => ({
        ...c,
        selected: false
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des commits:", error);
    statusType.value = "error";
    statusMessage.value = "Impossible de charger les commits";
  } finally {
    isLoadingCommits.value = false;
  }
}

function updateReportContent() {
  const repoName = selectedRepo.value ? selectedRepo.value.full_name : "Dépôt inconnu";
  reportContent.value = `Rapport de commits - ${repoName}\n\nCommits sélectionnés:\n${selectedCommitsText.value}\n\n---\n\nDétails du rapport:\n`;
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

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

async function sendReport() {
  if (!canSendReport.value || !selectedRepo.value) return;

  isSendingReport.value = true;
  statusMessage.value = "";
  statusType.value = "";

  try {
    await api.createReport({
      repoName: selectedRepo.value.full_name,
      content: reportContent.value,
      method: sendMethod.value,
      sentTo: recipient.value,
    });

    statusType.value = "success";
    statusMessage.value = `✓ Rapport envoyé avec succès ${sendMethod.value === "email" ? "par email" : "via WhatsApp"} !`;

    // Reset form
    setTimeout(() => {
      reportContent.value = "";
      recipient.value = "";
      commits.value.forEach((c) => (c.selected = false));
      statusMessage.value = "";
    }, 3000);
  } catch (error: any) {
    statusType.value = "error";
    statusMessage.value = `✗ Erreur: ${error.response?.data?.message || "Impossible d'envoyer le rapport"}`;
  } finally {
    isSendingReport.value = false;
  }
}
</script>

<template>
  <AppLayout>
    <div class="h-full flex flex-col lg:flex-row">
      <!-- Section des commits (gauche) -->
      <div
        class="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div class="flex flex-col gap-4 mb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
                >
                  <GitBranch :size="20" class="text-purple-400" />
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-white">
                    Commits
                  </h2>
                  <p class="text-sm text-zinc-400">Sélectionnez un dépôt</p>
                </div>
              </div>
              
              <button
                @click="selectedRepo && loadCommits(selectedRepo)"
                :disabled="isLoadingCommits || !selectedRepo"
                class="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw
                  :size="18"
                  :class="[
                    'text-zinc-400',
                    isLoadingCommits ? 'animate-spin' : '',
                  ]"
                />
              </button>
            </div>

            <!-- Repository Selector -->
            <div class="relative">
              <select
                v-model="selectedRepo"
                class="w-full appearance-none bg-zinc-800 border border-zinc-700 text-white py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 cursor-pointer"
                :disabled="isLoadingRepos"
              >
                <option :value="null" disabled>Choisir un dépôt...</option>
                <option v-for="repo in repositories" :key="repo.id" :value="repo">
                  {{ repo.full_name }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                <Loader2 v-if="isLoadingRepos" :size="16" class="animate-spin" />
                <ChevronDown v-else :size="16" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between" v-if="selectedRepo">
            <span class="text-sm text-zinc-400">
              {{ selectedCommits.length }} / {{ commits.length }} sélectionné(s)
            </span>
            <button
              @click="selectAllCommits"
              class="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              v-if="commits.length > 0"
            >
              {{
                commits.every((c) => c.selected)
                  ? "Tout désélectionner"
                  : "Tout sélectionner"
              }}
            </button>
          </div>
        </div>

        <!-- Liste des commits -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading state -->
          <div
            v-if="isLoadingCommits"
            class="p-8 flex flex-col items-center justify-center"
          >
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
                <!-- Checkbox indicator -->
                <div
                  :class="[
                    'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                    commit.selected
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-zinc-600',
                  ]"
                >
                  <CheckCircle2
                    v-if="commit.selected"
                    :size="14"
                    class="text-white"
                  />
                </div>

                <!-- Commit info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white mb-1 line-clamp-2">
                    {{ commit.message }}
                  </p>

                  <div
                    class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400"
                  >
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
                      <span class="font-mono">{{
                        commit.sha.substring(0, 7)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Empty state -->
          <div
            v-else
            class="p-8 text-center"
          >
            <div
              class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <GitBranch :size="24" class="text-zinc-600" />
            </div>
            <p class="text-zinc-400 text-sm">
              {{ selectedRepo ? "Aucun commit trouvé" : "Sélectionnez un dépôt pour voir les commits" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section de l'éditeur (droite) -->
      <div class="lg:w-1/2 flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
            >
              <Send :size="20" class="text-blue-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Créer un rapport</h2>
              <p class="text-sm text-zinc-400">
                Éditez et envoyez votre rapport
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Textarea -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Contenu du rapport
            </label>
            <textarea
              v-model="reportContent"
              placeholder="Rédigez votre rapport ici... (Markdown supporté)"
              class="w-full h-64 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none font-mono text-sm"
            ></textarea>
            <p class="mt-2 text-xs text-zinc-500">
              {{ reportContent.length }} caractères
            </p>
          </div>

          <!-- Méthode d'envoi -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-3">
              Méthode d'envoi
            </label>
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
                <Mail
                  :size="20"
                  :class="
                    sendMethod === 'email' ? 'text-purple-400' : 'text-zinc-400'
                  "
                />
                <div class="text-left">
                  <div
                    :class="[
                      'text-sm font-medium',
                      sendMethod === 'email' ? 'text-white' : 'text-zinc-400',
                    ]"
                  >
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
                <MessageCircle
                  :size="20"
                  :class="
                    sendMethod === 'whatsapp'
                      ? 'text-green-400'
                      : 'text-zinc-400'
                  "
                />
                <div class="text-left">
                  <div
                    :class="[
                      'text-sm font-medium',
                      sendMethod === 'whatsapp'
                        ? 'text-white'
                        : 'text-zinc-400',
                    ]"
                  >
                    WhatsApp
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Destinataire -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Destinataire
            </label>
            <input
              v-model="recipient"
              type="text"
              :placeholder="recipientPlaceholder"
              class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>

          <!-- Status Message -->
          <div
            v-if="statusMessage"
            :class="[
              'p-4 rounded-lg border flex items-start gap-3',
              statusType === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400',
            ]"
          >
            <component
              :is="statusType === 'success' ? CheckCircle2 : AlertCircle"
              :size="20"
              class="flex-shrink-0 mt-0.5"
            />
            <p class="text-sm">{{ statusMessage }}</p>
          </div>

          <!-- Submit Button -->
          <button
            @click="sendReport"
            :disabled="!canSendReport"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:shadow-none"
          >
            <Loader2 v-if="isSendingReport" :size="20" class="animate-spin" />
            <Send v-else :size="20" />
            <span>
              {{ isSendingReport ? "Envoi en cours..." : "Envoyer le rapport" }}
            </span>
          </button>
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

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
