<script setup lang="ts">
import { useToast } from '../../composables/useToast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const { toasts, removeToast } = useToast();
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300"
        :class="[
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-100' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-100' :
          'bg-blue-500/10 border-blue-500/20 text-blue-100'
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" :size="20" class="text-green-400" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" class="text-red-400" />
          <Info v-else :size="20" class="text-blue-400" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-5">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button 
          @click="removeToast(toast.id)"
          class="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X :size="16" class="opacity-60 hover:opacity-100" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
