<script setup lang="ts">
interface Props {
  variant?: 'default' | 'glass' | 'glass-strong' | 'outline' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
});

const variantClasses = {
  default: "bg-card text-card-foreground border border-border shadow-sm",
  glass: "glass text-foreground",
  "glass-strong": "glass-strong text-foreground",
  outline: "border border-border bg-transparent text-foreground",
  flat: "bg-zinc-900/50 border-none text-foreground",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};
</script>

<template>
  <div
    class="rounded-xl transition-all duration-300 relative overflow-hidden"
    :class="[
      variantClasses[variant],
      paddingClasses[padding],
      hover ? 'hover:scale-[1.01] hover:shadow-lg hover:border-primary/20 cursor-pointer' : '',
    ]"
  >
    <!-- Optional glow effect container -->
    <div v-if="variant === 'glass' || variant === 'glass-strong'" class="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
