<script setup lang="ts">
/**
 * Page Dashboard - Vue principale de l'application
 *
 * Affiche :
 * - Sidebar avec navigation
 * - Dépôt connecté
 * - Liste des derniers commits
 * - Éditeur de compte rendu
 * - Formulaire d'envoi (Email/WhatsApp)
 *
 * Design basé sur la maquette fournie avec thème sombre
 */
import {
  Clock,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Send,
  Settings,
  User,
  X,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "../services/api";
import { useAuthStore } from "../stores/auth.store";
import type { Commit } from "../types";

const router = useRouter();
const authStore = useAuthStore();

// ============================================================================
// STATE
// ============================================================================

const sidebarOpen = ref(true);
const isLoadingCommits = ref(false);
const isSendingReport = ref(false);

// Dépôt connecté (mock data pour la démo)
const connectedRepo = ref("my-project");

// Commits récents (mock data basé sur la maquette)
const commits = ref<(Commit & { selected: boolean })[]>([
  {
    sha: "abc123",
    message: "First commit",
    author: {
      name: authStore.displayName || "User",
      email: authStore.userEmail || "user@example.com",
      date: new Date().toISOString(),
    },
    url: "#",
    selected: true,
  },
  {
    sha: "def456",
    message: "Added login form",
    author: {
      name: authStore.displayName || "User",
      email: authStore.userEmail || "user@example.com",
      date: new Date(Date.now() - 3600000).toISOString(),
    },
    url: "#",
    selected: true,
  },
  {
    sha: "ghi789",
    message: "Fixed auth bug",
    author: {
      name: authStore.displayName || "User",
      email: authStore.userEmail || "user@example.com",
      date: new Date(Date.now() - 7200000).toISOString(),
    },
    url: "#",
    selected: true,
  },
]);

// Contenu du rapport (éditable)
const reportContent = ref<string>("");

// Méthode d'envoi sélectionnée
const sendMethod = ref<"email" | "whatsapp">("email");

// Destinataire
const recipient = ref("");

// Message de succès/erreur
const statusMessage = ref("");
const statusType = ref<"success" | "error" | null>(null);

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Commits sélectionnés
 */
const selectedCommits = computed(() => {
  return commits.value.filter((c) => c.selected);
});

/**
 * Texte des commits sélectionnés
 */
const selectedCommitsText = computed(() => {
  return selectedCommits.value.map((c) => c.message).join("\n");
});

/**
 * Validation du formulaire
 */
const canSendReport = computed(() => {
  return (
    reportContent.value.trim().length > 0 && recipient.value.trim().length > 0
  );
});

/**
 * Placeholder pour le destinataire selon la méthode
 */
const recipientPlaceholder = computed(() => {
  return sendMethod.value === "email"
    ? "johndoe@gmail.com"
    : "+33 6 00 00 00 00";
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Initialisation des données
 */
onMounted(() => {
  // Générer le contenu initial du rapport avec les commits sélectionnés
  updateReportContent();
});

/**
 * Met à jour le contenu du rapport avec les commits sélectionnés
 */
function updateReportContent() {
  reportContent.value = selectedCommitsText.value;
}

/**
 * Toggle la sélection d'un commit
 */
function toggleCommit(index: number) {
  const commit = commits.value[index];
  if (commit) {
    commit.selected = !commit.selected;
    updateReportContent();
  }
}

/**
 * Bascule la sidebar
 */
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

/**
 * Navigation vers une page
 */
function navigateTo(routeName: string) {
  router.push({ name: routeName });
}

/**
 * Envoie le rapport
 */
async function sendReport() {
  if (!canSendReport.value) return;

  try {
    isSendingReport.value = true;
    statusMessage.value = "";
    statusType.value = null;

    // Appeler l'API pour envoyer le rapport
    const response = await apiService.createReport({
      repoName: connectedRepo.value,
      content: reportContent.value,
      method: sendMethod.value,
      sentTo: recipient.value,
    });

    if (response.success) {
      statusMessage.value = `Compte rendu envoyé avec succès via ${sendMethod.value}!`;
      statusType.value = "success";

      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        reportContent.value = "";
        recipient.value = "";
        statusMessage.value = "";
        statusType.value = null;
      }, 2000);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    statusMessage.value = "Erreur lors de l'envoi du rapport";
    statusType.value = "error";
  } finally {
    isSendingReport.value = false;
  }
}

/**
 * Déconnexion
 */
async function handleLogout() {
  await authStore.logout();
  router.push({ name: "Login" });
}
</script>

<template>
  <div class="flex h-screen bg-zinc-950 text-white overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900/50 border-r border-zinc-800 transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Header Sidebar -->
      <div
        class="flex items-center justify-between p-4 border-b border-zinc-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center"
          >
            <LayoutDashboard :size="18" />
          </div>
          <span class="text-lg font-semibold">Compte rendu Git Commit</span>
        </div>
        <button
          @click="toggleSidebar"
          class="lg:hidden text-zinc-400 hover:text-white"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <button
          @click="navigateTo('Dashboard')"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800 text-white transition-colors"
        >
          <Clock :size="20" />
          <span>Dashboard</span>
        </button>

        <button
          @click="navigateTo('Historique')"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <History :size="20" />
          <span>Historique</span>
        </button>

        <button
          @click="navigateTo('Parametres')"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <Settings :size="20" />
          <span>Paramètres</span>
        </button>

        <button
          @click="navigateTo('Profil')"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <User :size="20" />
          <span>Profil</span>
        </button>
      </nav>
    </aside>

    <!-- Overlay pour mobile -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-zinc-900/30 border-b border-zinc-800 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="toggleSidebar"
              class="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu :size="24" />
            </button>
            <div>
              <h1 class="text-xl font-semibold">Dashboard</h1>
              <p class="text-sm text-zinc-400 mt-1">Historique</p>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-zinc-400">{{
              authStore.displayName
            }}</span>
            <button
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <User :size="18" />
              <span class="text-sm">{{
                authStore.displayName || "jean.dupont"
              }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Dépôt connecté -->
          <div class="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
            <div class="flex items-center gap-2 text-zinc-400">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span class="text-sm">Dépôt connecté :</span>
              <span class="text-white font-medium">{{ connectedRepo }}</span>
            </div>
          </div>

          <!-- Derniers commits -->
          <div class="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h2 class="text-lg font-semibold mb-4">Derniers commits :</h2>
            <div class="space-y-2">
              <div
                v-for="(commit, index) in commits"
                :key="commit.sha"
                @click="toggleCommit(index)"
                class="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <div
                  :class="[
                    'w-5 h-5 rounded flex items-center justify-center border-2 transition-colors',
                    commit.selected
                      ? 'bg-green-500 border-green-500'
                      : 'border-zinc-600',
                  ]"
                >
                  <svg
                    v-if="commit.selected"
                    class="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span class="text-sm">{{ commit.message }}</span>
              </div>
            </div>
          </div>

          <!-- Compte rendu (éditable) -->
          <div class="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h2 class="text-lg font-semibold mb-2">Compte rendu (éditable)</h2>
            <textarea
              v-model="reportContent"
              class="w-full h-32 bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Modifiez le contenu du rapport ici..."
            ></textarea>
          </div>

          <!-- Formulaire d'envoi -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Choix mode d'envoi -->
            <div class="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
              <div class="flex items-center gap-2 mb-4">
                <h3 class="text-base font-medium">Choisir mode d'envoi</h3>
                <button class="text-zinc-400 hover:text-white">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <!-- Radio buttons -->
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    v-model="sendMethod"
                    value="email"
                    class="w-5 h-5 text-purple-500 bg-zinc-800 border-zinc-600 focus:ring-purple-500"
                  />
                  <Mail :size="18" class="text-zinc-400" />
                  <span>Email</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    v-model="sendMethod"
                    value="whatsapp"
                    class="w-5 h-5 text-purple-500 bg-zinc-800 border-zinc-600 focus:ring-purple-500"
                  />
                  <MessageSquare :size="18" class="text-zinc-400" />
                  <span>WhatsApp</span>
                </label>
              </div>

              <!-- Email du destinataire -->
              <div class="mt-6">
                <label class="block text-sm font-medium mb-2">
                  {{
                    sendMethod === "email"
                      ? "Email du destinataire :"
                      : "Numéro WhatsApp"
                  }}
                </label>
                <input
                  v-model="recipient"
                  type="text"
                  :placeholder="recipientPlaceholder"
                  class="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Numéro WhatsApp (si WhatsApp sélectionné) -->
            <div
              v-if="sendMethod === 'whatsapp'"
              class="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6 flex items-center justify-center"
            >
              <div class="text-center">
                <MessageSquare :size="48" class="mx-auto mb-4 text-green-500" />
                <p class="text-zinc-400 text-sm">
                  Le rapport sera envoyé sur WhatsApp
                </p>
              </div>
            </div>

            <!-- Bouton d'envoi (prend toute la largeur si email) -->
            <div
              :class="[
                'bg-zinc-900/50 rounded-lg border border-zinc-800 p-6 flex items-center justify-center',
                sendMethod === 'email' ? '' : 'lg:col-span-2',
              ]"
            >
              <button
                @click="sendReport"
                :disabled="!canSendReport || isSendingReport"
                :class="[
                  'w-full max-w-md px-6 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2',
                  canSendReport && !isSendingReport
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
                ]"
              >
                <Send
                  :size="20"
                  :class="{ 'animate-pulse': isSendingReport }"
                />
                <span>
                  {{
                    isSendingReport
                      ? "Envoi en cours..."
                      : "Envoyer le compte rendu"
                  }}
                </span>
              </button>
            </div>
          </div>

          <!-- Message de statut -->
          <div
            v-if="statusMessage"
            :class="[
              'rounded-lg p-4 text-center transition-all',
              statusType === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400',
            ]"
          >
            {{ statusMessage }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Animations personnalisées */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Amélioration des inputs */
input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #52525b;
  border-radius: 50%;
  background-color: #27272a;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

input[type="radio"]:checked {
  border-color: #8b5cf6;
  background-color: #8b5cf6;
}

input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: white;
}

input[type="radio"]:hover {
  border-color: #a78bfa;
}

/* Scrollbar personnalisée pour textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #27272a;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #52525b;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}
</style>
