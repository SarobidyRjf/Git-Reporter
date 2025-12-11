<script setup lang="ts">
/**
 * PeriodSelector - Composant pour sélectionner une période de temps
 */
import { ref, computed, watch } from 'vue';
import { Calendar, ChevronDown } from 'lucide-vue-next';
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  modelValue?: 'today' | 'week' | 'month' | 'custom';
}

interface Emits {
  (e: 'update:modelValue', value: 'today' | 'week' | 'month' | 'custom'): void;
  (e: 'change', dateRange: { since: string; until: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'week',
});

const emit = defineEmits<Emits>();

const period = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const customStartDate = ref('');
const customEndDate = ref('');

const periodOptions = [
  { label: "Aujourd'hui", value: 'today' as const },
  { label: 'Cette semaine', value: 'week' as const },
  { label: 'Ce mois', value: 'month' as const },
  { label: 'Personnalisé', value: 'custom' as const },
];

const selectedLabel = computed(() => {
  const option = periodOptions.find(o => o.value === period.value);
  return option?.label || 'Sélectionner';
});

function getDateRange() {
  const now = new Date();
  let since: Date;
  const until = now;

  switch (period.value) {
    case 'today':
      since = startOfDay(now);
      break;
    case 'week':
      since = startOfWeek(now, { weekStartsOn: 1 }); // Lundi
      break;
    case 'month':
      since = startOfMonth(now);
      break;
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        return {
          since: customStartDate.value,
          until: customEndDate.value,
        };
      }
      // Fallback: derniers 7 jours
      since = subDays(now, 7);
      break;
    default:
      since = startOfWeek(now, { weekStartsOn: 1 });
  }

  return {
    since: since.toISOString(),
    until: until.toISOString(),
  };
}

// Émettre le changement quand la période change
watch([period, customStartDate, customEndDate], () => {
  const dateRange = getDateRange();
  emit('change', dateRange);
}, { immediate: true });

// Initialiser les dates personnalisées avec des valeurs par défaut
const initCustomDates = () => {
  const now = new Date();
  customEndDate.value = format(now, 'yyyy-MM-dd');
  customStartDate.value = format(subDays(now, 7), 'yyyy-MM-dd');
};

// Initialiser au montage
initCustomDates();
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="block text-sm font-medium text-zinc-300 mb-2">
        Période
      </label>
      <div class="relative">
        <Calendar
          :size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <select
          v-model="period"
          class="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 cursor-pointer"
        >
          <option
            v-for="option in periodOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <div
          class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <ChevronDown :size="16" class="text-zinc-500" />
        </div>
      </div>
    </div>

    <!-- Custom date range -->
    <div v-if="period === 'custom'" class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-zinc-400 mb-1.5">
          Date de début
        </label>
        <input
          v-model="customStartDate"
          type="date"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-zinc-400 mb-1.5">
          Date de fin
        </label>
        <input
          v-model="customEndDate"
          type="date"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        />
      </div>
    </div>

    <!-- Info text -->
    <p class="text-xs text-zinc-500">
      <template v-if="period === 'today'">
        Commits d'aujourd'hui
      </template>
      <template v-else-if="period === 'week'">
        Commits depuis lundi
      </template>
      <template v-else-if="period === 'month'">
        Commits depuis le début du mois
      </template>
      <template v-else-if="period === 'custom' && customStartDate && customEndDate">
        Du {{ format(new Date(customStartDate), 'dd MMM', { locale: fr }) }} au {{ format(new Date(customEndDate), 'dd MMM yyyy', { locale: fr }) }}
      </template>
    </p>
  </div>
</template>
