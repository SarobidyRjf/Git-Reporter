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
  Search,
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// État
const isLoadingRepos = ref(false);
const isLoadingCommits = ref(false);
const isSendingReport = ref(false);
const allUserRepositories = ref<Repository[]>([]); // Tous les dépôts (pour la recherche)
const repositories = ref<Repository[]>([]); // Dépôts filtrés (pour le select)
const selectedRepo = ref<Repository | null>(null);
const commits = ref<any[]>([]);
const reportContent = ref("");
const sendMethod = ref<"email" | "whatsapp">("email");
const recipient = ref("");
const statusMessage = ref("");
const statusType = ref<"success" | "error" | "">("");

// Search Mode
const isSearchMode = ref(false);
const repoSearchQuery = ref("");

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

// Watcher pour mettre à jour le destinataire par défaut quand la méthode change
watch(sendMethod, (newMethod) => {
  console.log("📧 Changement de méthode d'envoi:", newMethod);
  if (authStore.user?.settings) {
    if (newMethod === "email") {
      const defaultEmail =
        authStore.user.settings.email?.defaultRecipient || "";
      console.log("⚙️ Email Setting - defaultRecipient:", defaultEmail);
      recipient.value = defaultEmail;
    } else {
      const defaultNumber =
        authStore.user.settings.whatsapp?.defaultNumber || "";
      console.log("⚙️ WhatsApp Setting - defaultNumber:", defaultNumber);
      recipient.value = defaultNumber;
    }
  }
});

async function loadRepositories() {
  console.log("📦 Chargement des dépôts...");
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
          authStore.user!.visibleRepos!.includes(repo.name)
        );
      }

      repositories.value = filteredRepos;

      // Sélectionner le premier repo par défaut s'il y en a
      if (repositories.value.length > 0 && !selectedRepo.value) {
        selectedRepo.value = repositories.value[0] ?? null;

        // Auto-fetch commits si activé dans les paramètres
        const autoFetch = authStore.user?.settings?.github?.autoFetchCommits;
        console.log("⚙️ GitHub Setting - autoFetchCommits:", autoFetch);
        if (autoFetch && selectedRepo.value) {
          console.log("✅ Auto-fetch activé - Chargement des commits...");
          await loadCommits(selectedRepo.value);
        } else {
          console.log("❌ Auto-fetch désactivé");
        }
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

  console.log("📝 Chargement des commits pour:", repo.name);
  isLoadingCommits.value = true;
  commits.value = [];

  try {
    // Utiliser les paramètres GitHub de l'utilisateur
    const maxCommits = authStore.user?.settings?.github?.maxCommits || 50;
    console.log("⚙️ GitHub Setting - maxCommits:", maxCommits);

    const response = await api.getRepositoryCommits(
      repo.owner.login,
      repo.name,
      {
        perPage: maxCommits,
      }
    );

    if (response.success && response.data) {
      // Ajouter la propriété selected aux commits
      commits.value = response.data.commits.map((c: any) => ({
        ...c,
        selected: false,
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
  const repoName = selectedRepo.value
    ? selectedRepo.value.full_name
    : "Dépôt inconnu";
  let content = `Rapport de commits - ${repoName}\n\nCommits sélectionnés:\n${selectedCommitsText.value}\n\n---\n\nDétails du rapport:\n`;

  // Ajouter la signature si activée et méthode email
  const signatureEnabled = authStore.user?.settings?.email?.signatureEnabled;
  console.log("⚙️ Email Setting - signatureEnabled:", signatureEnabled);
  if (sendMethod.value === "email" && signatureEnabled) {
    const signature = authStore.user.settings.email.signature;
    console.log("✅ Ajout de la signature:", signature);
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
  } else if (selectedRepo.value) {
    repoSearchQuery.value = selectedRepo.value.name;
  }
}

function handleRepoSearch() {
  if (!repoSearchQuery.value) return;

  const foundRepo = allUserRepositories.value.find(
    (r) =>
      r.name.toLowerCase() === repoSearchQuery.value.toLowerCase() ||
      r.full_name.toLowerCase() === repoSearchQuery.value.toLowerCase()
  );

  if (foundRepo) {
    selectedRepo.value = foundRepo;
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

  // Utiliser le format préféré si disponible
  const format =
    authStore.user?.settings?.appearance?.dateFormat || "DD/MM/YYYY";
  console.log("⚙️ Appearance Setting - dateFormat:", format);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  if (format === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  } else if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }

  // Default DD/MM/YYYY
  return `${day}/${month}/${year}`;
}

async function sendReport() {
  if (!canSendReport.value || !selectedRepo.value) return;

  isSendingReport.value = true;
  statusMessage.value = "";
  statusType.value = "";

  try {
    // Préparer le contenu pour WhatsApp si nécessaire
    let finalContent = reportContent.value;

    if (sendMethod.value === "whatsapp" && authStore.user?.settings?.whatsapp) {
      const waSettings = authStore.user.settings.whatsapp;
      console.log("⚙️ WhatsApp Settings:", waSettings);

      // Ajouter timestamp si demandé
      if (waSettings.includeTimestamp) {
        console.log("✅ WhatsApp - Ajout du timestamp");
        const now = new Date();
        const timeStr = now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = now.toLocaleDateString("fr-FR");
        finalContent = `📅 ${dateStr} ${timeStr}\n\n${finalContent}`;
      }

      // Formater en Markdown si demandé
      if (waSettings.formatMarkdown) {
        console.log("✅ WhatsApp - Format Markdown activé");
        // WhatsApp supporte le Markdown basique: *gras*, _italique_, ~barré~, ```code```
        // Le contenu est déjà formaté, on s'assure juste qu'il est bien structuré
        finalContent = finalContent.trim();
      }
    }

    await api.createReport({
      repoName: selectedRepo.value.full_name,
      content: finalContent,
      method: sendMethod.value,
      sentTo: recipient.value,
    });

    statusType.value = "success";
    statusMessage.value = `✓ Rapport envoyé avec succès ${
      sendMethod.value === "email" ? "par email" : "via WhatsApp"
    } !`;

    // Reset form
    setTimeout(() => {
      reportContent.value = "";
      recipient.value = "";
      commits.value.forEach((c) => (c.selected = false));
      statusMessage.value = "";
    }, 3000);
  } catch (error: any) {
    statusType.value = "error";
    statusMessage.value = `✗ Erreur: ${
      error.response?.data?.message || "Impossible d'envoyer le rapport"
    }`;
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
                  <h2 class="text-lg font-semibold text-white">Commits</h2>
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

            <!-- Repository Selector / Search -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-zinc-300"> Dépôt </label>
                <button
                  @click="toggleSearchMode"
                  class="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <component
                    :is="isSearchMode ? ChevronDown : Search"
                    :size="14"
                  />
                  <span>{{
                    isSearchMode
                      ? "Sélectionner dans la liste"
                      : "Rechercher par nom"
                  }}</span>
                </button>
              </div>

              <div v-if="isSearchMode" class="relative">
                <div class="relative">
                  <Search
                    :size="18"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    v-model="repoSearchQuery"
                    @input="handleRepoSearch"
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
                  <div
                    v-if="repoSearchQuery"
                    class="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2
                      v-if="isValidRepo"
                      :size="18"
                      class="text-green-500"
                    />
                    <AlertCircle v-else :size="18" class="text-red-500" />
                  </div>
                </div>
                <div
                  v-if="repoSearchQuery && !isValidRepo"
                  class="mt-1 text-xs text-red-400"
                >
                  Dépôt non trouvé dans vos dépôts visibles
                </div>
              </div>

              <div v-else class="relative">
                <GitBranch
                  :size="18"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <select
                  v-model="selectedRepo"
                  class="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  :disabled="isLoadingRepos"
                >
                  <option :value="null" disabled>
                    {{
                      isLoadingRepos ? "Chargement..." : "Sélectionner un dépôt"
                    }}
                  </option>
                  <option
                    v-for="repo in repositories"
                    :key="repo.id"
                    :value="repo"
                  >
                    {{ repo.full_name }}
                  </option>
                </select>
                <div
                  class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <ChevronDown :size="16" class="text-zinc-500" />
                </div>
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
          <div v-else class="p-8 text-center">
            <div
              class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <GitBranch :size="24" class="text-zinc-600" />
            </div>
            <p class="text-zinc-400 text-sm">
              {{
                selectedRepo
                  ? "Aucun commit trouvé"
                  : "Sélectionnez un dépôt pour voir les commits"
              }}
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
