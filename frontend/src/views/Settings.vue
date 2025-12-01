<script setup lang="ts">
/**
 * Settings - Page de configuration
 *
 * Fonctionnalités :
 * - Paramètres de notification
 * - Préférences d'envoi
 * - Configuration GitHub
 * - Paramètres de compte
 */
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import {
  Settings as SettingsIcon,
  Mail,
  MessageCircle,
  Github,
  Bell,
  Lock,
  User,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Plus,
  X,
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

import apiService from "../services/api";
import { GitBranch } from "lucide-vue-next";
import { useToast } from "../composables/useToast";

const router = useRouter();
const authStore = useAuthStore();

// État
// État
const isSaving = ref(false);

// Toast
const { success, error } = useToast();

// Repositories
const repos = ref<any[]>([]);
const selectedRepos = ref<string[]>([]);
const isLoadingRepos = ref(false);
const searchQuery = ref("");

// Computed for Dual List
const availableRepos = computed(() => {
  return repos.value
    .filter((r) => !selectedRepos.value.includes(r.name))
    .filter((r) =>
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const selectedReposList = computed(() => {
  return repos.value.filter((r) => selectedRepos.value.includes(r.name));
});

// Settings
const settings = ref({
  notifications: {
    emailReports: true,
    reportSent: true,
    reportFailed: true,
    weeklyDigest: false,
  },
  email: {
    defaultRecipient: "",
    ccMyself: true,
    signatureEnabled: true,
    signature: "Envoyé depuis Git Reporter",
  },
  whatsapp: {
    defaultNumber: "",
    includeTimestamp: true,
    formatMarkdown: true,
  },
  github: {
    autoFetchCommits: true,
    defaultBranch: "main",
    includeAuthorInfo: true,
    maxCommits: 50,
  },
  appearance: {
    theme: "dark",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
  },
  privacy: {
    shareAnalytics: false,
    saveHistory: true,
    autoDeleteAfter: 90,
  },
});

// Fonctions
onMounted(async () => {
  loadSettings();
  await loadRepos();
});

async function loadRepos() {
  try {
    isLoadingRepos.value = true;
    const response = await apiService.getUserRepositories();
    if (response.success && response.data) {
      // Correction: Accéder à response.data.repositories
      repos.value = response.data.repositories || [];

      // Initialiser les repos sélectionnés
      if (
        authStore.user?.visibleRepos &&
        Array.isArray(authStore.user.visibleRepos)
      ) {
        selectedRepos.value = [...authStore.user.visibleRepos];
      } else {
        // Par défaut, tout sélectionner si aucune préférence
        selectedRepos.value = repos.value.map((r) => r.name);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des dépôts:", error);
  } finally {
    isLoadingRepos.value = false;
  }
}

function addRepo(repoName: string) {
  if (!selectedRepos.value.includes(repoName)) {
    selectedRepos.value.push(repoName);
  }
}

function removeRepo(repoName: string) {
  selectedRepos.value = selectedRepos.value.filter((name) => name !== repoName);
}

function addAllFiltered() {
  const newRepos = availableRepos.value.map((r) => r.name);
  selectedRepos.value = [...selectedRepos.value, ...newRepos];
}

function removeAll() {
  selectedRepos.value = [];
}

function loadSettings() {
  // Charger les paramètres depuis le store utilisateur (backend) ou localStorage en fallback
  if (authStore.user?.settings) {
    try {
      // Si settings est une string (JSON), on parse, sinon on utilise direct
      const userSettings =
        typeof authStore.user.settings === "string"
          ? JSON.parse(authStore.user.settings)
          : authStore.user.settings;

      settings.value = { ...settings.value, ...userSettings };
      return;
    } catch (e) {
      console.error("Erreur lors du parsing des settings utilisateur:", e);
    }
  }

  const savedSettings = localStorage.getItem("git-reporter-settings");
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      settings.value = { ...settings.value, ...parsed };
    } catch (e) {
      console.error("Erreur lors du chargement des paramètres:", e);
    }
  }
}

async function saveSettings() {
  isSaving.value = true;

  try {
    // 1. Sauvegarder les paramètres locaux (backup)
    localStorage.setItem(
      "git-reporter-settings",
      JSON.stringify(settings.value)
    );

    // 2. Sauvegarder sur le serveur
    const reposToSave = Array.isArray(selectedRepos.value)
      ? [...selectedRepos.value]
      : [];

    const response = await apiService.updateUserSettings({
      visibleRepos: reposToSave,
      settings: settings.value, // Envoi de tous les settings
    });

    if (!response.success) {
      throw new Error(response.error?.message || "Erreur serveur");
    }

    // Mettre à jour le store localement
    if (authStore.user) {
      authStore.user.visibleRepos = selectedRepos.value;
      authStore.user.settings = settings.value;
    }

    // Simuler un délai réseau pour le feedback visuel
    await new Promise((resolve) => setTimeout(resolve, 500));

    success("Paramètres sauvegardés avec succès !");
  } catch (err: any) {
    console.error("Erreur sauvegarde:", err);
    error("Erreur lors de la sauvegarde des paramètres");
  } finally {
    isSaving.value = false;
  }
}

async function resetSettings() {
  if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
    try {
      isSaving.value = true;

      // 1. Nettoyer le localStorage
      localStorage.removeItem("git-reporter-settings");

      // 2. Réinitialiser l'état local
      settings.value = {
        notifications: {
          emailReports: true,
          reportSent: true,
          reportFailed: true,
          weeklyDigest: false,
        },
        email: {
          defaultRecipient: "",
          ccMyself: true,
          signatureEnabled: true,
          signature: "Envoyé depuis Git Reporter",
        },
        whatsapp: {
          defaultNumber: "",
          includeTimestamp: true,
          formatMarkdown: true,
        },
        github: {
          autoFetchCommits: true,
          defaultBranch: "main",
          includeAuthorInfo: true,
          maxCommits: 50,
        },
        appearance: {
          theme: "dark",
          language: "fr",
          dateFormat: "DD/MM/YYYY",
        },
        privacy: {
          shareAnalytics: false,
          saveHistory: true,
          autoDeleteAfter: 90,
        },
      };

      // Réinitialiser les repos (tout sélectionner par défaut)
      selectedRepos.value = repos.value.map((r) => r.name);

      // 3. Sauvegarder l'état réinitialisé sur le serveur
      await apiService.updateUserSettings({
        visibleRepos: selectedRepos.value,
        settings: settings.value,
      });

      // Mettre à jour le store
      if (authStore.user) {
        authStore.user.visibleRepos = selectedRepos.value;
        authStore.user.settings = settings.value;
      }

      success("Paramètres réinitialisés avec succès");
    } catch (err) {
      console.error("Erreur lors de la réinitialisation:", err);
      error("Erreur lors de la réinitialisation des paramètres");
    } finally {
      isSaving.value = false;
    }
  }
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto p-6 space-y-6 pb-24">
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
              >
                <SettingsIcon :size="20" class="text-blue-400" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white">Paramètres</h1>
                <p class="text-sm text-zinc-400">
                  Configurez votre expérience Git Reporter
                </p>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"
              >
                <Bell :size="20" class="text-purple-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">Notifications</h2>
                <p class="text-sm text-zinc-400">
                  Gérez vos préférences de notification
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Notifications par email
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Recevoir des emails de notification
                  </div>
                </div>
                <input
                  v-model="settings.notifications.emailReports"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Rapport envoyé avec succès
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Confirmation d'envoi de rapport
                  </div>
                </div>
                <input
                  v-model="settings.notifications.reportSent"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Échec d'envoi
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Alertes en cas d'erreur d'envoi
                  </div>
                </div>
                <input
                  v-model="settings.notifications.reportFailed"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Résumé hebdomadaire
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Recevoir un résumé chaque semaine
                  </div>
                </div>
                <input
                  v-model="settings.notifications.weeklyDigest"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>
            </div>
          </div>

          <!-- Email Settings -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"
              >
                <Mail :size="20" class="text-blue-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">
                  Configuration Email
                </h2>
                <p class="text-sm text-zinc-400">
                  Paramètres d'envoi par email
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Destinataire par défaut
                </label>
                <input
                  v-model="settings.email.defaultRecipient"
                  type="email"
                  placeholder="exemple@email.com"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    M'envoyer une copie
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Recevoir une copie de chaque rapport
                  </div>
                </div>
                <input
                  v-model="settings.email.ccMyself"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Signature automatique
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Ajouter une signature aux emails
                  </div>
                </div>
                <input
                  v-model="settings.email.signatureEnabled"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <div v-if="settings.email.signatureEnabled">
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Signature
                </label>
                <textarea
                  v-model="settings.email.signature"
                  rows="3"
                  placeholder="Votre signature..."
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- WhatsApp Settings -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center"
              >
                <MessageCircle :size="20" class="text-green-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">
                  Configuration WhatsApp
                </h2>
                <p class="text-sm text-zinc-400">
                  Paramètres d'envoi via WhatsApp
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Numéro par défaut
                </label>
                <input
                  v-model="settings.whatsapp.defaultNumber"
                  type="tel"
                  placeholder="+33612345678"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Inclure l'horodatage
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Ajouter la date et l'heure aux messages
                  </div>
                </div>
                <input
                  v-model="settings.whatsapp.includeTimestamp"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Format Markdown
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Formater le texte avec Markdown
                  </div>
                </div>
                <input
                  v-model="settings.whatsapp.formatMarkdown"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>
            </div>
          </div>

          <!-- Repository Management (Dual List) -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center"
              >
                <GitBranch :size="20" class="text-orange-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">
                  Gestion des dépôts
                </h2>
                <p class="text-sm text-zinc-400">
                  Sélectionnez les dépôts à afficher dans le Dashboard
                </p>
              </div>
            </div>

            <div v-if="isLoadingRepos" class="flex justify-center py-8">
              <Loader2 :size="32" class="animate-spin text-purple-500" />
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Available Repos -->
              <div
                class="flex flex-col h-[400px] bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden"
              >
                <div class="p-3 border-b border-zinc-800 bg-zinc-900/50">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-zinc-300"
                      >Disponibles ({{ availableRepos.length }})</span
                    >
                    <button
                      @click="addAllFiltered"
                      class="text-xs text-purple-400 hover:text-purple-300"
                      v-if="availableRepos.length > 0"
                    >
                      Tout ajouter
                    </button>
                  </div>
                  <div class="relative">
                    <Search
                      :size="14"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Rechercher..."
                      class="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 pl-9 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div
                  class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
                >
                  <div
                    v-for="repo in availableRepos"
                    :key="repo.id"
                    class="flex items-center justify-between p-2 rounded hover:bg-zinc-800/50 group transition-colors"
                  >
                    <div class="min-w-0">
                      <div class="text-sm text-zinc-200 truncate">
                        {{ repo.name }}
                      </div>
                      <div
                        class="text-[10px] text-zinc-500 truncate"
                        v-if="repo.description"
                      >
                        {{ repo.description }}
                      </div>
                    </div>
                    <button
                      @click="addRepo(repo.name)"
                      class="p-1.5 rounded bg-zinc-800 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Plus :size="14" />
                    </button>
                  </div>

                  <div
                    v-if="availableRepos.length === 0"
                    class="text-center py-8 text-zinc-500 text-sm"
                  >
                    {{
                      searchQuery
                        ? "Aucun résultat"
                        : "Tous les dépôts sont sélectionnés"
                    }}
                  </div>
                </div>
              </div>

              <!-- Selected Repos -->
              <div
                class="flex flex-col h-[400px] bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden"
              >
                <div
                  class="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between h-[69px]"
                >
                  <span class="text-sm font-medium text-zinc-300"
                    >Sélectionnés ({{ selectedRepos.length }})</span
                  >
                  <button
                    @click="removeAll"
                    class="text-xs text-red-400 hover:text-red-300"
                    v-if="selectedRepos.length > 0"
                  >
                    Tout retirer
                  </button>
                </div>

                <div
                  class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
                >
                  <div
                    v-for="repo in selectedReposList"
                    :key="repo.id"
                    class="flex items-center justify-between p-2 rounded bg-purple-500/5 border border-purple-500/10 group transition-colors"
                  >
                    <div class="min-w-0">
                      <div class="text-sm text-zinc-200 truncate">
                        {{ repo.name }}
                      </div>
                    </div>
                    <button
                      @click="removeRepo(repo.name)"
                      class="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X :size="14" />
                    </button>
                  </div>

                  <div
                    v-if="selectedRepos.length === 0"
                    class="text-center py-8 text-zinc-500 text-sm"
                  >
                    Aucun dépôt sélectionné
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- GitHub Settings (Configuration) -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center"
              >
                <Github :size="20" class="text-orange-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">
                  Configuration GitHub
                </h2>
                <p class="text-sm text-zinc-400">
                  Paramètres de connexion GitHub
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Récupération automatique
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Charger les commits automatiquement
                  </div>
                </div>
                <input
                  v-model="settings.github.autoFetchCommits"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Branche par défaut
                </label>
                <input
                  v-model="settings.github.defaultBranch"
                  type="text"
                  placeholder="main"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Inclure les informations auteur
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Afficher nom et email de l'auteur
                  </div>
                </div>
                <input
                  v-model="settings.github.includeAuthorInfo"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Nombre maximum de commits
                </label>
                <input
                  v-model.number="settings.github.maxCommits"
                  type="number"
                  min="10"
                  max="100"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <!-- Appearance -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center"
              >
                <Palette :size="20" class="text-pink-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">Apparence</h2>
                <p class="text-sm text-zinc-400">Personnalisez l'interface</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Thème
                </label>
                <select
                  v-model="settings.appearance.theme"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                >
                  <option value="dark">Sombre</option>
                  <option value="light">Clair</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Langue
                </label>
                <select
                  v-model="settings.appearance.language"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Format de date
                </label>
                <select
                  v-model="settings.appearance.dateFormat"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Privacy -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center"
              >
                <Lock :size="20" class="text-red-400" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">
                  Confidentialité
                </h2>
                <p class="text-sm text-zinc-400">
                  Gérez vos données personnelles
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Partager les analyses
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Aider à améliorer l'application
                  </div>
                </div>
                <input
                  v-model="settings.privacy.shareAnalytics"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label
                class="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-white">
                    Sauvegarder l'historique
                  </div>
                  <div class="text-xs text-zinc-400 mt-1">
                    Conserver l'historique des rapports
                  </div>
                </div>
                <input
                  v-model="settings.privacy.saveHistory"
                  type="checkbox"
                  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <div v-if="settings.privacy.saveHistory">
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Suppression automatique après (jours)
                </label>
                <input
                  v-model.number="settings.privacy.autoDeleteAfter"
                  type="number"
                  min="30"
                  max="365"
                  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-between z-10"
        >
          <button
            @click="resetSettings"
            class="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Réinitialiser
          </button>

          <div class="flex items-center gap-4">
            <button
              @click="saveSettings"
              :disabled="isSaving"
              class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSaving" :size="18" class="animate-spin" />
              <Save v-else :size="18" />
              <span>{{ isSaving ? "Sauvegarde..." : "Sauvegarder" }}</span>
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

/* Custom checkbox and select styles */
input[type="checkbox"] {
  cursor: pointer;
}

select {
  cursor: pointer;
}
</style>
