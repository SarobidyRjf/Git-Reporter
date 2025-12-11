<script setup lang="ts">
/**
 * Templates - Page de gestion des templates de rapports
 *
 * Fonctionnalités :
 * - Liste des templates (par défaut + personnalisés)
 * - Création de nouveaux templates
 * - Édition de templates existants
 * - Suppression de templates
 * - Prévisualisation en temps réel
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from '../composables/useToast';
import api from '../services/api';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Copy,
} from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import TemplatePreview from '../components/TemplatePreview.vue';

const router = useRouter();
const authStore = useAuthStore();
const { success, error: showError } = useToast();

// État
const isLoading = ref(false);
const templates = ref<any[]>([]);
const selectedTemplate = ref<any | null>(null);
const showEditor = ref(false);
const showPreview = ref(false);
const previewTemplateId = ref<string>('');
const isSaving = ref(false);
const isDeleting = ref(false);

// Form data
const formData = ref({
  name: '',
  description: '',
  content: '',
  category: 'custom' as 'daily' | 'weekly' | 'release' | 'custom',
});

// Computed
const defaultTemplates = computed(() =>
  templates.value.filter((t) => t.isDefault)
);

const customTemplates = computed(() =>
  templates.value.filter((t) => !t.isDefault)
);

const isEditMode = computed(() => selectedTemplate.value !== null);

const canSave = computed(() => {
  return (
    formData.value.name.trim().length > 0 &&
    formData.value.content.trim().length > 0 &&
    !isSaving.value
  );
});

// Fonctions
onMounted(async () => {
  await loadTemplates();
});

async function loadTemplates() {
  console.log('📋 Chargement des templates...');
  isLoading.value = true;
  try {
    const response = await api.getTemplates();
    if (response.success && response.data) {
      templates.value = response.data;
      console.log(`✅ ${templates.value.length} templates chargés`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des templates:', error);
    showError('Impossible de charger les templates');
  } finally {
    isLoading.value = false;
  }
}

function openEditor(template: any | null = null) {
  if (template) {
    // Mode édition
    selectedTemplate.value = template;
    formData.value = {
      name: template.name,
      description: template.description || '',
      content: template.content,
      category: template.category || 'custom',
    };
  } else {
    // Mode création
    selectedTemplate.value = null;
    formData.value = {
      name: '',
      description: '',
      content: '',
      category: 'custom',
    };
  }
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  selectedTemplate.value = null;
  formData.value = {
    name: '',
    description: '',
    content: '',
    category: 'custom',
  };
}

async function saveTemplate() {
  if (!canSave.value) return;

  console.log(isEditMode.value ? '💾 Mise à jour du template...' : '➕ Création du template...');
  isSaving.value = true;

  try {
    let response;
    if (isEditMode.value) {
      response = await api.updateTemplate(selectedTemplate.value.id, formData.value);
    } else {
      response = await api.createTemplate(formData.value);
    }

    if (response.success) {
      success(isEditMode.value ? 'Template mis à jour avec succès !' : 'Template créé avec succès !');
      await loadTemplates();
      closeEditor();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    showError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
  } finally {
    isSaving.value = false;
  }
}

async function deleteTemplate(template: any) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${template.name}" ?`)) {
    return;
  }

  console.log('🗑️ Suppression du template:', template.id);
  isDeleting.value = true;

  try {
    const response = await api.deleteTemplate(template.id);
    if (response.success) {
      success('Template supprimé avec succès !');
      await loadTemplates();
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression:', error);
    showError(error.response?.data?.message || 'Erreur lors de la suppression');
  } finally {
    isDeleting.value = false;
  }
}

async function duplicateTemplate(template: any) {
  console.log('📋 Duplication du template:', template.id);
  
  formData.value = {
    name: `${template.name} (Copie)`,
    description: template.description || '',
    content: template.content,
    category: 'custom',
  };
  selectedTemplate.value = null;
  showEditor.value = true;
}

function openPreview(template: any) {
  previewTemplateId.value = template.id;
  showPreview.value = true;
}

function closePreview() {
  showPreview.value = false;
  previewTemplateId.value = '';
}
</script>

<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <FileText :size="20" class="text-purple-400" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Templates</h2>
              <p class="text-sm text-zinc-400">Modèles de rapports</p>
            </div>
          </div>

          <button
            @click="openEditor()"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30"
          >
            <Plus :size="18" />
            <span>Nouveau template</span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading state -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-12"
        >
          <Loader2 :size="32" class="text-purple-400 animate-spin mb-3" />
          <p class="text-zinc-400 text-sm">Chargement des templates...</p>
        </div>

        <!-- Templates list -->
        <div v-else class="space-y-8">
          <!-- Default Templates -->
          <div>
            <h3 class="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
              Templates par défaut ({{ defaultTemplates.length }})
            </h3>

            <div v-if="defaultTemplates.length === 0" class="text-center py-8">
              <FileText :size="48" class="text-zinc-600 mx-auto mb-4" />
              <p class="text-zinc-400 text-sm">Aucun template par défaut</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="template in defaultTemplates"
                :key="template.id"
                class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-white font-medium mb-1">{{ template.name }}</h4>
                    <p class="text-sm text-zinc-400 line-clamp-2">
                      {{ template.description || 'Aucune description' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="openPreview(template)"
                    class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Eye :size="14" />
                    <span>Aperçu</span>
                  </button>
                  <button
                    @click="duplicateTemplate(template)"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Copy :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Templates -->
          <div>
            <h3 class="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
              Mes templates ({{ customTemplates.length }})
            </h3>

            <div v-if="customTemplates.length === 0" class="text-center py-8">
              <FileText :size="48" class="text-zinc-600 mx-auto mb-4" />
              <p class="text-zinc-400 text-sm mb-4">
                Aucun template personnalisé
              </p>
              <button
                @click="openEditor()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus :size="16" />
                <span>Créer mon premier template</span>
              </button>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="template in customTemplates"
                :key="template.id"
                class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-white font-medium mb-1">{{ template.name }}</h4>
                    <p class="text-sm text-zinc-400 line-clamp-2">
                      {{ template.description || 'Aucune description' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="openPreview(template)"
                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Eye :size="14" />
                  </button>
                  <button
                    @click="openEditor(template)"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    @click="duplicateTemplate(template)"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Copy :size="14" />
                  </button>
                  <button
                    @click="deleteTemplate(template)"
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
      <div class="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            {{ isEditMode ? 'Éditer le template' : 'Nouveau template' }}
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
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Nom *
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Ex: Rapport hebdomadaire"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <input
              v-model="formData.description"
              type="text"
              placeholder="Ex: Résumé des commits de la semaine"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Catégorie
            </label>
            <select
              v-model="formData.category"
              class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="release">Release</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">
              Contenu du template *
            </label>
            <textarea
              v-model="formData.content"
              placeholder="Utilisez des variables: {{repoName}}, {{commits}}, {{date}}, etc."
              class="w-full h-64 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none font-mono text-sm"
            ></textarea>
            <p class="mt-2 text-xs text-zinc-500">
              Variables disponibles: <span v-text="'{{repoName}}'"></span>, <span v-text="'{{commits}}'"></span>, <span v-text="'{{commitCount}}'"></span>, <span v-text="'{{date}}'"></span>, <span v-text="'{{dateRange}}'"></span><br>
              Stats: <span v-text="'{{linesAdded}}'"></span>, <span v-text="'{{linesRemoved}}'"></span>, <span v-text="'{{contributorCount}}'"></span><br>
              Groupes: <span v-text="'{{featCommits}}'"></span>, <span v-text="'{{fixCommits}}'"></span>, <span v-text="'{{docsCommits}}'"></span>, <span v-text="'{{othersCommits}}'"></span>, <span v-text="'{{version}}'"></span>
            </p>
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
            @click="saveTemplate"
            :disabled="!canSave"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30 disabled:shadow-none"
          >
            <Loader2 v-if="isSaving" :size="18" class="animate-spin" />
            <Save v-else :size="18" />
            <span>{{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <TemplatePreview
      :show="showPreview"
      :template-id="previewTemplateId"
      @close="closePreview"
    />
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

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
