<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { UserStats } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps<{
  stats: UserStats;
}>();

// --- Daily Reports Chart (Line) ---
const dailyReportsOptions = computed(() => {
  const categories = props.stats.dailyStats.map((d: any) => format(new Date(d.date), 'dd/MM', { locale: fr }));

  return {
    chart: {
      id: 'daily-reports',
      type: 'area' as const,
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent'
    },
    colors: ['#a855f7'], // Purple-500
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: categories,
      labels: { style: { colors: '#a1a1aa' } }, // zinc-400
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#a1a1aa' } }, // zinc-400
      min: 0
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#27272a', strokeDashArray: 4 }, // zinc-800
    theme: { mode: 'dark' as const }
  };
});

const dailyReportsSeries = computed(() => [{
  name: 'Rapports envoyés',
  data: props.stats.dailyStats.map((d: any) => d.count)
}]);

// --- Reports by Method (Pie) ---
const methodChartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    fontFamily: 'inherit',
    background: 'transparent'
  },
  labels: ['Email', 'WhatsApp'],
  colors: ['#a855f7', '#22c55e'], // Purple, Green
  plotOptions: {
    pie: {
      donut: {
        size: '50%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: '#e4e4e7', // zinc-200
          },
          value: { color: '#e4e4e7' }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  legend: { 
    position: 'bottom' as const,
    labels: { colors: '#a1a1aa' }
  },
  stroke: { show: false },
  theme: { mode: 'dark' as const }
}));

const methodChartSeries = computed(() => [
  props.stats.reportsByMethod.email,
  props.stats.reportsByMethod.whatsapp
]);

// --- Top Repositories (Bar) ---
const repoChartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    fontFamily: 'inherit',
    toolbar: { show: false },
    background: 'transparent'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
      barHeight: '50%',
    }
  },
  colors: ['#6366f1'], // Indigo
  xaxis: {
    categories: props.stats.topRepositories.map((r: any) => r.repoName),
    labels: { style: { colors: '#a1a1aa' } }
  },
  yaxis: {
    labels: { style: { colors: '#e4e4e7', fontSize: '13px' } }
  },
  grid: { show: false },
  dataLabels: { enabled: false },
  theme: { mode: 'dark' as const }
}));

const repoChartSeries = computed(() => [{
  name: 'Rapports',
  data: props.stats.topRepositories.map((r: any) => r.count)
}]);

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <!-- Daily Activity -->
    <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 col-span-1 lg:col-span-2">
      <h3 class="text-lg font-semibold text-white mb-4">Activité (30 derniers jours)</h3>
      <div class="h-64">
        <VueApexCharts
          type="area"
          height="100%"
          :options="dailyReportsOptions"
          :series="dailyReportsSeries"
        />
      </div>
    </div>

    <!-- Distribution & Top Repos in a column -->
    <div class="flex flex-col gap-6">
      
      <!-- Methods Distribution -->
      <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex-1">
        <h3 class="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Moyen d'envoi</h3>
        <div class="h-48 flex items-center justify-center">
            <VueApexCharts
              type="donut"
              width="100%"
              height="200"
              :options="methodChartOptions"
              :series="methodChartSeries"
            />
        </div>
      </div>

      <!-- Top Repos -->
      <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex-1">
         <h3 class="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Top Dépôts</h3>
         <div class="h-48">
            <VueApexCharts
              type="bar"
              height="100%"
              :options="repoChartOptions"
              :series="repoChartSeries"
            />
         </div>
      </div>

    </div>
  </div>
</template>
