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
import { ref, onMounted } from "vue";
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
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const authStore = useAuthStore();

// État
const isSaving = ref(false);
const saveMessage = ref("");
const saveStatus = ref<"success" | "error" | "">("");

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
onMounted(() => {
  loadSettings();
});

function loadSettings() {
  // Charger les paramètres depuis l'API ou localStorage
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
  saveMessage.value = "";
  saveStatus.value = "";

  try {
    // Sauvegarder dans localStorage (ou envoyer à l'API)
    localStorage.setItem(
      "git-reporter-settings",
      JSON.stringify(settings.value),
    );

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1000));

    saveStatus.value = "success";
    saveMessage.value = "✓ Paramètres sauvegardés avec succès !";

    setTimeout(() => {
      saveMessage.value = "";
      saveStatus.value = "";
    }, 3000);
  } catch (error) {
    saveStatus.value = "error";
    saveMessage.value = "✗ Erreur lors de la sauvegarde des paramètres";
  } finally {
    isSaving.value = false;
  }
}

function resetSettings() {
  if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
    localStorage.removeItem("git-reporter-settings");
    loadSettings();
    saveMessage.value = "Paramètres réinitialisés";
    saveStatus.value = "success";
  }
}
</script>

<template>
  <AppLayout>
    <div class="h-full overflow-y-auto">
      <div class="max-w-4xl mx-auto p-6 space-y-6">
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
                <div class="text-sm font-medium text-white">Échec d'envoi</div>
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
              <p class="text-sm text-zinc-400">Paramètres d'envoi par email</p>
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

        <!-- GitHub Settings -->
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
              <h2 class="text-lg font-semibold text-white">Confidentialité</h2>
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

        <!-- Status Message -->
        <div
          v-if="saveMessage"
          :class="[
            'p-4 rounded-lg border flex items-start gap-3',
            saveStatus === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400',
          ]"
        >
          <component
            :is="saveStatus === 'success' ? CheckCircle2 : AlertCircle"
            :size="20"
            class="flex-shrink-0 mt-0.5"
          />
          <p class="text-sm">{{ saveMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between gap-4 pt-4">
          <button
            @click="resetSettings"
            class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
          <button
            @click="saveSettings"
            :disabled="isSaving"
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:shadow-none"
          >
            <Loader2 v-if="isSaving" :size="20" class="animate-spin" />
            <Save v-else :size="20" />
            <span>
              {{ isSaving ? "Sauvegarde..." : "Sauvegarder les paramètres" }}
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
