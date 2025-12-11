<script setup lang="ts">
import { computed } from 'vue';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps<{
  data: { date: string; count: number }[];
}>();

// Generate last 365 days dates
const today = new Date();
const startDate = subDays(today, 365);
const days = eachDayOfInterval({ start: startDate, end: today });

// Map data for easier access
const dataMap = computed(() => {
  const map = new Map();
  props.data.forEach(item => {
    map.set(item.date, item.count);
  });
  return map;
});

// Helper to get color intensity
const getColorClass = (count: number) => {
  if (count === 0) return 'bg-zinc-800'; // Dark empty cell
  if (count <= 2) return 'bg-green-900/40 border border-green-900'; // Low
  if (count <= 5) return 'bg-green-600'; // Medium
  return 'bg-green-400'; // High (brighter in dark mode)
};

// Tooltip text
const getTooltip = (date: Date, count: number) => {
  const dateStr = format(date, 'd MMMM yyyy', { locale: fr });
  if (count === 0) return `Pas de rapport le ${dateStr}`;
  const s = count > 1 ? 's' : '';
  return `${count} rapport${s} le ${dateStr}`;
};

// Group days by weeks for the grid
const weeks = computed(() => {
  const weeksArray = [];
  let currentWeek = [];
  
  // Align start date to Sunday/Monday
  // Simple approach: Just push days, let CSS grid handle the flow (column-major)
  // For SVG-like calendar, we need columns (weeks).
  
  // Let's use a simpler flex wrap approach or CSS grid
  // Standard GitHub calendar is columns=weeks, rows=days (7).
  
  // We'll organize strictly by weeks for column rendering
  let currentWeekData: { date: Date; count: number }[] = [];
  
  // Pad the start if first day is not Sunday (0)
  // But actually GitHub calendar usually starts naturally and fills.
  
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = dataMap.value.get(dateStr) || 0;
    
    currentWeekData.push({ date: day, count });
    
    if (currentWeekData.length === 7) {
      weeksArray.push(currentWeekData);
      currentWeekData = [];
    }
  });
  
  // Push remaining
  if (currentWeekData.length > 0) {
    weeksArray.push(currentWeekData);
  }
  
  return weeksArray;
});

const months = computed(() => {
  // Generate month labels roughly aligned
  const labels: string[] = [];
  let lastMonth = -1;
  
  days.forEach((day, index) => {
     // Every ~30 days or start of week check
     // This is tricky for perfect alignment. Simplified:
     if (index % 28 === 0) { // Rough approximation
        labels.push(format(day, 'MMM', { locale: fr }));
     }
  });
  return labels;
});

</script>

<template>
  <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8 overflow-x-auto">
    <h3 class="text-lg font-semibold text-white mb-4">Calendrier de contribution</h3>
    
    <div class="min-w-[800px]">
      <div class="flex text-xs text-zinc-500 mb-2 gap-8 pl-8">
         <span v-for="(m, i) in months" :key="i">{{ m }}</span>
      </div>
      
      <div class="flex gap-1">
        <!-- Day labels column -->
        <div class="flex flex-col gap-1 text-[10px] text-zinc-500 mr-2 pt-6">
          <span class="h-3">Lun</span>
          <span class="h-3"></span>
          <span class="h-3">Mer</span>
          <span class="h-3"></span>
          <span class="h-3">Ven</span>
        </div>
        
        <!-- Weeks columns -->
        <div v-for="(week, wIndex) in weeks" :key="wIndex" class="flex flex-col gap-1">
          <div 
            v-for="(day, dIndex) in week" 
            :key="dIndex"
            class="w-3 h-3 rounded-[2px] transition-colors duration-200 relative group cursor-pointer"
            :class="getColorClass(day.count)"
          >
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity border border-zinc-600 shadow-xl">
              {{ getTooltip(day.date, day.count) }}
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex items-center justify-end text-xs text-zinc-500 gap-2">
        <span>Moins</span>
        <div class="flex gap-1">
          <div class="w-3 h-3 bg-zinc-800 rounded-[2px]"></div>
          <div class="w-3 h-3 bg-green-900/40 rounded-[2px]"></div>
          <div class="w-3 h-3 bg-green-600 rounded-[2px]"></div>
          <div class="w-3 h-3 bg-green-400 rounded-[2px]"></div>
        </div>
        <span>Plus</span>
      </div>
    </div>
  </div>
</template>
