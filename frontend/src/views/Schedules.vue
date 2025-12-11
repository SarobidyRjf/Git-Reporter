<script setup lang="ts">
/**
 * Schedules - Page de gestion des rapports planifiés
 *
 * Fonctionnalités :
 * - Liste des schedules actifs et inactifs
 * - Création de nouveaux schedules
 * - Édition de schedules existants
 * - Suppression de schedules
 * - Toggle activation/désactivation
 * - Exécution manuelle
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import api from '../services/api';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Play,
  Power,
  Clock,
  Mail,
  MessageSquare,
  FileText,
} from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

// État
const isLoading = ref(false);
const schedules = ref<any[]>([]);
const templates = ref<any[]>([]);
const repositories = ref<any[]>([]);
const selectedSchedule = ref<any | null>(null);
const showEditor = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isRunning = ref<string | null>(null);
const statusMessage = ref('');
const statusType = ref<'success' | 'error' | ''>('');

// Form data
const formData = ref({
  templateId: '',
  repoName: '',
  cronExpression: '0 17 * * 1-5', // Par défaut: tous les jours à 17h en semaine
  method: 'email' as 'email' | 'whatsapp',
  recipient: '',
});

// Presets de cron expressions
const cronPresets = [
  { label: 'Tous les jours à 17h', value: '0 17 * * *' },
  { label: 'Tous les jours ouvrables à 17h', value: '0 17 * * 1-5' },
  { label: 'Tous les lundis à 9h', value: '0 9 * * 1' },
  { label: 'Tous les vendredis à 17h', value: '0 17 * * 5' },
  { label: 'Toutes les heures', value: '0 * * * *' },
  { label: 'Personnalisé', value: 'custom' },
];

const selectedPreset = ref('0 17 * * 1-5');

// Computed
const activeSchedules = computed(() =>
  schedules.value.filter((s) => s.isActive)
);

const inactiveSchedules = computed(() =>
  schedules.value.filter((s) => !s.isActive)
);

const isEditMode = computed(() => selectedSchedule.value !== null);

const canSave = computed(() => {
  return (
    formData.value.repoName.trim().length > 0 &&
    formData.value.cronExpression.trim().length > 0 &&
    formData.value.recipient.trim().length > 0 &&
    !isSaving.value
  );
});

// Fonctions
onMounted(async () => {
  await Promise.all([loadSchedules(), loadTemplates(), loadRepositories()]);
});

async function loadSchedules() {
  console.log('📋 Chargement des schedules...');
  isLoading.value = true;
  try {
    const response = await api.getSchedules();
    if (response.success && response.data) {
      schedules.value = response.data;
      console.log(`✅ ${schedules.value.length} schedules chargés`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des schedules:', error);
    showStatus('error', 'Impossible de charger les schedules');
  } finally {
    isLoading.value = false;
  }
}

async function loadTemplates() {
  try {
    const response = await api.getTemplates();
    if (response.success && response.data) {
      templates.value = response.data;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des templates:', error);
  }
}

async function loadRepositories() {
  try {
    const response = await api.getUserRepositories();
    if (response.success && response.data) {
      repositories.value = response.data.repositories;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des repos:', error);
  }
}

function openEditor(schedule: any | null = null) {
  if (schedule) {
    // Mode édition
    selectedSchedule.value = schedule;
    formData.value = {
      templateId: schedule.templateId || '',
      repoName: schedule.repoName,
      cronExpression: schedule.cronExpression,
      method: schedule.method,
      recipient: schedule.recipient,
    };
    selectedPreset.value = cronPresets.find(p => p.value === schedule.cronExpression)?.value || 'custom';
  } else {
    // Mode création
    selectedSchedule.value = null;
    formData.value = {
      templateId: '',
      repoName: '',
      cronExpression: '0 17 * * 1-5',
      method: 'email',
      recipient: authStore.user?.email || '',
    };
    selectedPreset.value = '0 17 * * 1-5';
  }
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  selectedSchedule.value = null;
  formData.value = {
    templateId: '',
    repoName: '',
    cronExpression: '0 17 * * 1-5',
    method: 'email',
    recipient: '',
  };
}

function onPresetChange() {
  if (selectedPreset.value !== 'custom') {
    formData.value.cronExpression = selectedPreset.value;
  }
}

async function saveSchedule() {
  if (!canSave.value) return;

  console.log(isEditMode.value ? '💾 Mise à jour du schedule...' : '➕ Création du schedule...');
  isSaving.value = true;

  try {
    let response;
    if (isEditMode.value) {
      response = await api.updateSchedule(selectedSchedule.value.id, formData.value);
    } else {
      response = await api.createSchedule(formData.value);
    }

    if (response.success) {
      showStatus('success', isEditMode.value ? 'Schedule mis à jour !' : 'Schedule créé !');
      await loadSchedules();
      closeEditor();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    showStatus('error', error.response?.data?.message || 'Erreur lors de la sauvegarde');
  } finally {
    isSaving.value = false;
  }
}

async function deleteSchedule(schedule: any) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce schedule ?`)) {
    return;
  }

  console.log('🗑️ Suppression du schedule:', schedule.id);
  isDeleting.value = true;

  try {
    const response = await api.deleteSchedule(schedule.id);
    if (response.success) {
      showStatus('success', 'Schedule supprimé !');
      await loadSchedules();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression:', error);
    showStatus('error', error.response?.data?.message || 'Erreur lors de la suppression');
  } finally {
    isDeleting.value = false;
  }
}

async function toggleSchedule(schedule: any) {
  console.log('🔄 Toggle schedule:', schedule.id);

  try {
    const response = await api.toggleSchedule(schedule.id);
    if (response.success) {
      showStatus('success', response.data.isActive ? 'Schedule activé !' : 'Schedule désactivé !');
      await loadSchedules();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors du toggle:', error);
    showStatus('error', error.response?.data?.message || 'Erreur lors du toggle');
  }
}

async function runSchedule(schedule: any) {
  console.log('▶️ Exécution manuelle du schedule:', schedule.id);
  isRunning.value = schedule.id;

  try {
    const response = await api.runSchedule(schedule.id);
    if (response.success) {
      showStatus('success', 'Schedule exécuté avec succès !');
      await loadSchedules();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'exécution:', error);
    showStatus('error', error.response?.data?.message || 'Erreur lors de l\'exécution');
  } finally {
    isRunning.value = null;
  }
}

function showStatus(type: 'success' | 'error', message: string) {
  statusType.value = type;
  statusMessage.value = message;
  setTimeout(() => {
    statusMessage.value = '';
    statusType.value = '';
  }, 3000);
}

function formatNextRun(date: string | null) {
  if (!date) return 'Non planifié';
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCronExpression(cron: string) {
  const preset = cronPresets.find(p => p.value === cron);
  return preset ? preset.label : cron;
}
</script>

<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Calendar :size="20" class="text-blue-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Planification</h2>
              <p class="text-sm text-zinc-400">Rapports automatiques</p>
            </div>
          </div>

          <button
            @click="openEditor()"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            <Plus :size="18" />
            <span>Nouveau schedule</span>
          </button>
        </div>
      </div>

      <!-- Status Message -->
      <div
        v-if="statusMessage"
        :class="[
          'mx-6 mt-4 p-4 rounded-lg border flex items-start gap-3',
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

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading state -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-12"
        >
          <Loader2 :size="32" class="text-blue-400 animate-spin mb-3" />
          <p class="text-zinc-400 text-sm">Chargement des schedules...</p>
        </div>

        <!-- Schedules list -->
        <div v-else class="space-y-8">
          <!-- Active Schedules -->
          <div>
            <h3 class="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
              Schedules actifs ({{ activeSchedules.length }})
            </h3>

            <div v-if="activeSchedules.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar :size="24" class="text-zinc-600" />
              </div>
              <p class="text-zinc-400 text-sm mb-4">
                Aucun schedule actif
              </p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="schedule in activeSchedules"
                :key="schedule.id"
                class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="text-white font-medium">{{ schedule.repoName }}</h4>
                      <span class="text-xs px-2 py-1 rounded border bg-green-500/10 text-green-400 border-green-500/30">
                        Actif
                      </span>
                    </div>
                    <div class="space-y-1 text-sm text-zinc-400">
                      <div class="flex items-center gap-2">
                        <Clock :size="14" />
                        <span>{{ formatCronExpression(schedule.cronExpression) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <component :is="schedule.method === 'email' ? Mail : MessageSquare" :size="14" />
                        <span>{{ schedule.recipient }}</span>
                      </div>
                      <div v-if="schedule.template" class="flex items-center gap-2">
                        <FileText :size="14" />
                        <span>{{ schedule.template.name }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs">
                        <span>Prochaine exécution: {{ formatNextRun(schedule.nextRun) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="runSchedule(schedule)"
                    :disabled="isRunning === schedule.id"
                    class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Loader2 v-if="isRunning === schedule.id" :size="14" class="animate-spin" />
                    <Play v-else :size="14" />
                    <span>Exécuter</span>
                  </button>
                  <button
                    @click="toggleSchedule(schedule)"
                    class="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                  >
                    <Power :size="14" />
                    <span>Désactiver</span>
                  </button>
                  <button
                    @click="openEditor(schedule)"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    @click="deleteSchedule(schedule)"
                    :disabled="isDeleting"
                    class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Inactive Schedules -->
          <div v-if="inactiveSchedules.length > 0">
            <h3 class="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
              Schedules inactifs ({{ inactiveSchedules.length }})
            </h3>

            <div class="space-y-3">
              <div
                v-for="schedule in inactiveSchedules"
                :key="schedule.id"
                class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 opacity-60 hover:opacity-100 hover:border-zinc-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="text-white font-medium">{{ schedule.repoName }}</h4>
                      <span class="text-xs px-2 py-1 rounded border bg-zinc-500/10 text-zinc-400 border-zinc-500/30">
                        Inactif
                      </span>
                    </div>
                    <div class="space-y-1 text-sm text-zinc-400">
                      <div class="flex items-center gap-2">
                        <Clock :size="14" />
                        <span>{{ formatCronExpression(schedule.cronExpression) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <component :is="schedule.method === 'email' ? Mail : MessageSquare" :size="14" />
                        <span>{{ schedule.recipient }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="toggleSchedule(schedule)"
                    class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Power :size="14" />
                    <span>Activer</span>
                  </button>
                  <button
                    @click="openEditor(schedule)"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    @click="deleteSchedule(schedule)"
                    :disabled="isDeleting"
                    class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <div
      v-if="showEditor"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeEditor"
    >
      <div class="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            {{ isEditMode ? 'Éditer le schedule' : 'Nouveau schedule' }}
          </h3>
          <button
            @click="closeEditor"
            class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X :size="20" class="text-zinc-400" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Repository -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Dépôt *
            </label>
            <select
              v-model="formData.repoName"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="">Sélectionner un dépôt</option>
              <option v-for="repo in repositories" :key="repo.full_name" :value="repo.full_name">
                {{ repo.full_name }}
              </option>
            </select>
          </div>

          <!-- Template -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Template (optionnel)
            </label>
            <select
              v-model="formData.templateId"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="">Format par défaut</option>
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <!-- Cron Preset -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Fréquence
            </label>
            <select
              v-model="selectedPreset"
              @change="onPresetChange"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option v-for="preset in cronPresets" :key="preset.value" :value="preset.value">
                {{ preset.label }}
              </option>
            </select>
          </div>

          <!-- Cron Expression -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Expression cron *
            </label>
            <input
              v-model="formData.cronExpression"
              type="text"
              placeholder="0 17 * * 1-5"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono"
            />
            <p class="mt-2 text-xs text-zinc-500">
              Format: minute heure jour mois jour-semaine
            </p>
          </div>

          <!-- Method -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Méthode d'envoi *
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="formData.method = 'email'"
                :class="[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all',
                  formData.method === 'email'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600',
                ]"
              >
                <Mail :size="18" />
                <span>Email</span>
              </button>
              <button
                @click="formData.method = 'whatsapp'"
                :class="[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all',
                  formData.method === 'whatsapp'
                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600',
                ]"
              >
                <MessageSquare :size="18" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Recipient -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              {{ formData.method === 'email' ? 'Email' : 'Numéro WhatsApp' }} *
            </label>
            <input
              v-model="formData.recipient"
              :type="formData.method === 'email' ? 'email' : 'tel'"
              :placeholder="formData.method === 'email' ? 'email@example.com' : '+33612345678'"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            @click="closeEditor"
            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveSchedule"
            :disabled="!canSave"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none"
          >
            <Loader2 v-if="isSaving" :size="18" class="animate-spin" />
            <Save v-else :size="18" />
            <span>{{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}</span>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
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
</style>
