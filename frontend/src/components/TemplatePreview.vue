<script setup lang="ts">
/**
 * TemplatePreview - Modal de prévisualisation des templates
 */
import { ref, watch } from 'vue';
import { X, Eye, Loader2, AlertCircle } from 'lucide-vue-next';
import api from '../services/api';

interface Props {
  templateId?: string;
  templateContent?: string;
  show: boolean;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isLoading = ref(false);
const renderedContent = ref('');
const error = ref('');

// Données d'exemple pour la prévisualisation
const sampleData = {
  repoName: 'exemple/mon-projet',
  commits: [
    '- feat: Ajout de la fonctionnalité X (a1b2c3d)',
    '- fix: Correction du bug Y (e4f5g6h)',
    '- docs: Mise à jour de la documentation (i7j8k9l)',
  ].join('\n'),
  commitCount: 3,
  date: new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
  dateRange: `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')} - ${new Date().toLocaleDateString('fr-FR')}`,
  contributorCount: 2,
  linesAdded: 156,
  linesRemoved: 42,
};

watch(() => props.show, async (newValue) => {
  if (newValue) {
    await loadPreview();
  }
});

async function loadPreview() {
  if (!props.templateId && !props.templateContent) {
    error.value = 'Aucun template à prévisualiser';
    return;
  }

  isLoading.value = true;
  error.value = '';
  renderedContent.value = '';

  try {
    if (props.templateId) {
      // Utiliser l'endpoint de preview du backend
      const response = await api.previewTemplate(props.templateId, sampleData);
      if (response.success && response.data) {
        renderedContent.value = response.data.rendered;
      }
    } else if (props.templateContent) {
      // Rendu local simple (remplacer les variables)
      let content = props.templateContent;
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        content = content.replace(regex, String(value));
      });
      renderedContent.value = content;
    }
  } catch (err: any) {
    console.error('Erreur lors de la prévisualisation:', err);
    error.value = err.response?.data?.message || 'Impossible de générer la prévisualisation';
  } finally {
    isLoading.value = false;
  }
}

function close() {
  emit('close');
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Eye :size="20" class="text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Prévisualisation</h3>
            <p class="text-sm text-zinc-400">Aperçu du template avec des données d'exemple</p>
          </div>
        </div>
        <button
          @click="close"
          class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X :size="20" class="text-zinc-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-12"
        >
          <Loader2 :size="32" class="text-blue-400 animate-spin mb-3" />
          <p class="text-zinc-400 text-sm">Génération de la prévisualisation...</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 flex items-start gap-3"
        >
          <AlertCircle :size="20" class="flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium mb-1">Erreur</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Preview -->
        <div v-else-if="renderedContent" class="space-y-4">
          <!-- Info banner -->
          <div class="p-4 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-400">
            <p class="text-sm">
              📝 Ceci est un aperçu avec des données d'exemple. Le rapport réel contiendra vos commits.
            </p>
          </div>

          <!-- Rendered content -->
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
            <pre class="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{{ renderedContent }}</pre>
          </div>

          <!-- Sample data used -->
          <details class="group">
            <summary class="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
              Voir les données d'exemple utilisées
            </summary>
            <div class="mt-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
              <pre class="text-xs text-zinc-400 font-mono">{{ JSON.stringify(sampleData, null, 2) }}</pre>
            </div>
          </details>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <Eye :size="48" class="text-zinc-600 mx-auto mb-4" />
          <p class="text-zinc-400">Aucune prévisualisation disponible</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
        <button
          @click="close"
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
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
