# Design System - Git Reporter

Documentation du système de design de Git Reporter, inspiré de GitHub avec une approche moderne et fluide.

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
/* Background */
--zinc-950: #09090b  /* Arrière-plan principal */
--zinc-900: #18181b  /* Cartes et conteneurs */
--zinc-800: #27272a  /* Bordures et dividers */

/* Text */
--white: #ffffff      /* Texte principal */
--zinc-400: #a1a1aa  /* Texte secondaire */
--zinc-500: #71717a  /* Texte désactivé */

/* Accents */
--purple-500: #a855f7  /* Primaire */
--purple-600: #9333ea  /* Primaire hover */
--blue-500: #3b82f6    /* Secondaire */
--blue-600: #2563eb    /* Secondaire hover */

/* Status */
--green-500: #22c55e   /* Succès */
--red-500: #ef4444     /* Erreur */
--orange-500: #f97316  /* Alerte */
```

### Gradients

```css
/* Gradient Principal */
bg-gradient-to-r from-purple-600 to-blue-600

/* Gradient Hover */
bg-gradient-to-r from-purple-700 to-blue-700

/* Gradient Backgrounds */
bg-gradient-to-br from-purple-500/10 to-blue-500/10
```

## 📐 Spacing & Layout

### Container Spacing
- **Page padding**: `p-6` (24px)
- **Section spacing**: `space-y-6` (24px vertical)
- **Card padding**: `p-6` ou `p-5` (20-24px)
- **Compact padding**: `p-4` (16px)

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Max Widths
```css
max-w-4xl  /* Forms & Settings (896px) */
max-w-7xl  /* Content pages (1280px) */
```

## 🧩 Composants

### Sidebar

```vue
<!-- Structure -->
<aside class="fixed lg:static w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800">
  <!-- Logo & Brand -->
  <div class="h-16 px-6 border-b border-zinc-800">
    <!-- Logo content -->
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-3 py-4">
    <!-- Nav items -->
  </nav>

  <!-- User Section -->
  <div class="border-t border-zinc-800 p-3">
    <!-- User info -->
  </div>
</aside>
```

**Navigation Item States:**
- **Active**: `bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30`
- **Hover**: `hover:bg-zinc-800/50 hover:text-white`
- **Default**: `text-zinc-400`

### Cards

```vue
<!-- Card Standard -->
<div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
  <!-- Card content -->
</div>

<!-- Card Interactive (Hover) -->
<div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all">
  <!-- Card content -->
</div>

<!-- Card avec Gradient -->
<div class="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
  <!-- Card content -->
</div>
```

### Buttons

```vue
<!-- Primary Button -->
<button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30">
  Text
</button>

<!-- Secondary Button -->
<button class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
  Text
</button>

<!-- Icon Button -->
<button class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
  <Icon :size="18" class="text-zinc-400" />
</button>

<!-- Disabled State -->
<button disabled class="disabled:opacity-50 disabled:cursor-not-allowed">
  Text
</button>
```

### Inputs

```vue
<!-- Text Input -->
<input
  type="text"
  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
  placeholder="Placeholder..."
/>

<!-- Textarea -->
<textarea
  class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
  rows="4"
></textarea>

<!-- Select -->
<select class="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500">
  <option>Option 1</option>
</select>

<!-- Checkbox -->
<input
  type="checkbox"
  class="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
/>
```

### Badges & Status

```vue
<!-- Email Badge -->
<span class="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium">
  Email
</span>

<!-- WhatsApp Badge -->
<span class="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
  WhatsApp
</span>

<!-- Success Status -->
<div class="flex items-center gap-2 text-green-400">
  <CheckCircle2 :size="16" />
  <span>Envoyé</span>
</div>
```

### Icon Containers

```vue
<!-- Standard Icon Container -->
<div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
  <Icon :size="20" class="text-purple-400" />
</div>

<!-- Large Icon Container -->
<div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
  <Icon :size="24" class="text-purple-400" />
</div>
```

### Modals

```vue
<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <!-- Modal Content -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
      <h2 class="text-xl font-semibold text-white">Titre</h2>
      <button class="p-2 hover:bg-zinc-800 rounded-lg">
        <X :size="20" />
      </button>
    </div>

    <!-- Modal Body -->
    <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
      <!-- Content -->
    </div>

    <!-- Modal Footer -->
    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
      <!-- Actions -->
    </div>
  </div>
</div>
```

## 🎭 Animations

### Transitions CSS

```vue
<style scoped>
/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Spin (Loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
```

### Transitions Tailwind

```vue
<!-- Hover Transitions -->
<div class="transition-all duration-200 hover:scale-105">
  <!-- Content -->
</div>

<button class="transition-colors hover:bg-zinc-700">
  <!-- Button -->
</button>

<!-- Transform Transitions -->
<div class="transform transition-transform hover:translate-y-[-2px]">
  <!-- Content -->
</div>
```

## 📱 Responsive Design

### Mobile First Approach

```vue
<!-- Sidebar Mobile -->
<aside :class="[
  'fixed lg:static',
  'w-64',
  'transform transition-transform',
  sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
]">
  <!-- Content -->
</aside>

<!-- Grid Responsive -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Items -->
</div>

<!-- Flex Responsive -->
<div class="flex flex-col lg:flex-row gap-6">
  <!-- Items -->
</div>
```

### Hidden/Visible Classes

```vue
<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">Mobile only</div>

<!-- Responsive text -->
<span class="text-sm lg:text-base">Responsive text</span>
```

## 🔤 Typography

### Font Sizes

```css
text-xs    /* 12px */
text-sm    /* 14px */
text-base  /* 16px */
text-lg    /* 18px */
text-xl    /* 20px */
text-2xl   /* 24px */
text-3xl   /* 30px */
```

### Font Weights

```css
font-normal   /* 400 */
font-medium   /* 500 */
font-semibold /* 600 */
font-bold     /* 700 */
```

### Text Colors

```vue
<!-- Primary Text -->
<p class="text-white">Primary text</p>

<!-- Secondary Text -->
<p class="text-zinc-400">Secondary text</p>

<!-- Muted Text -->
<p class="text-zinc-500">Muted text</p>

<!-- Colored Text -->
<p class="text-purple-400">Accent text</p>
```

## 🎯 Best Practices

### 1. Consistent Spacing
Utilisez toujours le système d'espacement de Tailwind (4px increments)
```vue
<!-- ✅ Good -->
<div class="p-4 gap-4 space-y-4">

<!-- ❌ Avoid -->
<div style="padding: 13px; gap: 17px;">
```

### 2. Border Radius
Utilisez des valeurs cohérentes pour les border-radius
```vue
rounded-lg   /* 8px - Buttons, inputs */
rounded-xl   /* 12px - Cards */
rounded-2xl  /* 16px - Modals, featured cards */
rounded-full /* Badges, avatars */
```

### 3. Shadows
Utilisez des ombres subtiles avec des couleurs d'accent
```vue
shadow-lg shadow-purple-500/30  /* Primary actions */
shadow-lg shadow-blue-500/20    /* Secondary elements */
```

### 4. Hover States
Toujours ajouter des états hover pour les éléments interactifs
```vue
<button class="bg-zinc-800 hover:bg-zinc-700 transition-colors">
  Button
</button>
```

### 5. Loading States
Utilisez des loaders cohérents
```vue
<Loader2 :size="20" class="animate-spin" />
```

### 6. Icons
Utilisez lucide-vue-next avec des tailles cohérentes
```vue
:size="16"  /* Small icons */
:size="18"  /* Regular icons */
:size="20"  /* Medium icons */
:size="24"  /* Large icons */
```

## 🌙 Dark Mode

Le design system est optimisé pour le mode sombre avec :
- Backgrounds semi-transparents avec backdrop-blur
- Bordures subtiles (zinc-800)
- Contrastes appropriés pour la lisibilité
- Ombres colorées pour les accents

## 🎨 Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
```

## 📦 Composants Réutilisables

### AppLayout
Wrapper principal avec sidebar et navigation
```vue
<AppLayout>
  <!-- Page content -->
</AppLayout>
```

### Stat Card
```vue
<div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
  <div class="flex items-center justify-between mb-3">
    <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
      <Icon :size="20" class="text-purple-400" />
    </div>
    <p class="text-2xl font-bold text-white">{{ value }}</p>
  </div>
  <p class="text-sm text-zinc-400">{{ label }}</p>
</div>
```

---

**Maintenu par:** Équipe Git Reporter
**Dernière mise à jour:** Janvier 2024
**Version:** 1.0.0
