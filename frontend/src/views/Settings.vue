<script setup lang="ts">
/**
 * Page Paramètres - Configuration de l'application
 *
 * Permet à l'utilisateur de configurer :
 * - Préférences d'affichage
 * - Paramètres d'envoi (Email, WhatsApp)
 * - Notifications
 * - Compte
 */
import { Save, Mail, MessageSquare, Bell, User, LogOut, Shield } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

// ============================================================================
// STATE
// ============================================================================

const isSaving = ref(false);
const saveMessage = ref('');

// Paramètres Email
const emailSettings = ref({
  defaultEmail: '',
  emailNotifications: true,
});

// Paramètres WhatsApp
const whatsappSettings = ref({
  defaultNumber: '',
  whatsappNotifications: true,
});

// Paramètres généraux
const generalSettings = ref({
  autoSave: true,
  darkMode: true,
  language: 'fr',
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Charge les paramètres depuis l'API
 */
async function loadSettings() {
  // TODO: Implémenter la récupération des paramètres depuis l'API
  // Pour l'instant, on utilise des valeurs par défaut
  emailSettings.value.defaultEmail = authStore.userEmail || '';
}

/**
 * Sauvegarde les paramètres
 */
async function saveSettings() {
  try {
    isSaving.value = true;
    saveMessage.value = '';

    // TODO: Implémenter la sauvegarde des paramètres via l'API
    // await apiService.updateSettings({ ... });

    // Simulation d'un délai
    await new Promise((resolve) => setTimeout(resolve, 1000));

    saveMessage.value = 'Paramètres sauvegardés avec succès !';

    // Effacer le message après 3 secondes
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    saveMessage.value = 'Erreur lors de la sauvegarde des paramètres';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Réinitialise les paramètres par défaut
 */
function resetSettings() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
    emailSettings.value = {
      defaultEmail: authStore.userEmail || '',
      emailNotifications: true,
    };
    whatsappSettings.value = {
      defaultNumber: '',
      whatsappNotifications: true,
    };
    generalSettings.value = {
      autoSave: true,
      darkMode: true,
      language: 'fr',
    };
    saveMessage.value = 'Paramètres réinitialisés';
  }
}

/**
 * Déconnexion
 */
async function handleLogout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    await authStore.logout();
    router.push({ name: 'Login' });
  }
}

/**
 * Retour au dashboard
 */
function goToDashboard() {
  router.push({ name: 'Dashboard' });
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <!-- Header -->
    <header class="bg-zinc-900/30 border-b border-zinc-800 px-6 py-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Paramètres</h1>
          <p class="text-sm text-zinc-400 mt-1">
            Gérez vos préférences et configurations
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
    <main class="max-w-4xl mx-auto px-6 py-8">
      <div class="space-y-6">
        <!-- Paramètres Email -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Mail :size="20" class="text-blue-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold">Paramètres Email</h2>
              <p class="text-sm text-zinc-400">
                Configuration de l'envoi par email
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                Email par défaut
              </label>
              <input
                v-model="emailSettings.defaultEmail"
                type="email"
                placeholder="votre.email@example.com"
                class="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="text-xs text-zinc-500 mt-2">
                Cet email sera utilisé comme destinataire par défaut
              </p>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Notifications par email</p>
                <p class="text-sm text-zinc-400">
                  Recevoir des notifications quand un rapport est envoyé
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="emailSettings.emailNotifications"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Paramètres WhatsApp -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <MessageSquare :size="20" class="text-green-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold">Paramètres WhatsApp</h2>
              <p class="text-sm text-zinc-400">
                Configuration de l'envoi par WhatsApp
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                Numéro WhatsApp par défaut
              </label>
              <input
                v-model="whatsappSettings.defaultNumber"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                class="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p class="text-xs text-zinc-500 mt-2">
                Format international avec indicatif pays (ex: +33 6 12 34 56 78)
              </p>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Notifications WhatsApp</p>
                <p class="text-sm text-zinc-400">
                  Recevoir des notifications quand un rapport est envoyé
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="whatsappSettings.whatsappNotifications"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Paramètres Généraux -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Shield :size="20" class="text-purple-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold">Paramètres Généraux</h2>
              <p class="text-sm text-zinc-400">
                Préférences d'affichage et comportement
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Sauvegarde automatique</p>
                <p class="text-sm text-zinc-400">
                  Sauvegarder automatiquement les brouillons de rapports
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="generalSettings.autoSave"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Mode sombre</p>
                <p class="text-sm text-zinc-400">
                  Activer le thème sombre (actuellement actif)
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="generalSettings.darkMode"
                  class="sr-only peer"
                  disabled
                />
                <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">
                Langue
              </label>
              <select
                v-model="generalSettings.language"
                class="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="saveSettings"
            :disabled="isSaving"
            class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save :size="20" :class="{ 'animate-pulse': isSaving }" />
            <span>
              {{ isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications' }}
            </span>
          </button>

          <button
            @click="resetSettings"
            class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Message de sauvegarde -->
        <div
          v-if="saveMessage"
          :class="[
            'rounded-lg p-4 text-center transition-all',
            saveMessage.includes('Erreur')
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-green-500/10 border border-green-500/30 text-green-400',
          ]"
        >
          {{ saveMessage }}
        </div>

        <!-- Zone de danger -->
        <div class="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-red-400 mb-4">Zone de danger</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Déconnexion</p>
                <p class="text-sm text-zinc-400">
                  Se déconnecter de l'application
                </p>
              </div>
              <button
                @click="handleLogout"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut :size="18" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Toggle switch personnalisé */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
