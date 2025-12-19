<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  to?: string; // If provided, renders as RouterLink
  href?: string; // If provided, renders as <a>
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
});

const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-95";

const variants = {
  primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:bg-primary/90 border border-transparent",
  secondary: "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:bg-secondary/80 border border-transparent",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  glass: "glass hover:bg-white/10 text-white border-white/10 hover:border-white/20",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20",
  glow: "bg-zinc-900 border border-primary/50 text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:border-primary hover:bg-primary/5",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10",
};

const classes = computed(() => {
  return [
    baseClasses,
    variants[props.variant],
    sizes[props.size],
    props.block ? 'w-full flex' : '',
    props.loading ? 'cursor-wait opacity-80' : '',
  ].join(" ");
});
</script>

<template>
  <component
    :is="to ? 'RouterLink' : href ? 'a' : 'button'"
    :to="to"
    :href="href"
    :class="classes"
    :disabled="disabled || loading"
  >
    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    <slot name="prefix"></slot>
    <span :class="{ 'ml-2': $slots.prefix, 'mr-2': $slots.suffix }">
        <slot />
    </span>
    <slot name="suffix"></slot>
  </component>
</template>
