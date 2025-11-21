<script setup lang="ts">
/**
 * Layout principal de l'application
 *
 * Structure inspirée de GitHub avec :
 * - Sidebar navigation persistante
 * - Header avec user menu
 * - Content area responsive
 */
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard,
  History,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Github,
  ChevronDown
} from 'lucide-vue-next';
import Toast from './ui/Toast.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// État du sidebar pour mobile
const sidebarOpen = ref(false);
const userMenuOpen = ref(false);

// Navigation items
const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Créer un rapport'
  },
  {
    name: 'Historique',
    path: '/history',
    icon: History,
    description: 'Rapports envoyés'
  },
  {
    name: 'Profil',
    path: '/profile',
    icon: User,
    description: 'Vos statistiques'
  },
  {
    name: 'Paramètres',
    path: '/settings',
    icon: Settings,
    description: 'Configuration'
  }
];

// Current user
const user = computed(() => authStore.user);

// Check if current route is active
const isActiveRoute = (path: string) => {
  return route.path === path;
};

// Navigation
const navigateTo = (path: string) => {
  router.push(path);
  sidebarOpen.value = false;
};

// Toggle sidebar (mobile)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Toggle user menu
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

// Logout
const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="flex h-screen bg-zinc-950 overflow-hidden">
    <!-- Sidebar Overlay (Mobile) -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo & Brand -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Github :size="18" class="text-white" />
          </div>
          <span class="text-lg font-semibold text-white">Git Reporter</span>
        </div>
        <!-- Close button (mobile) -->
        <button
          @click="toggleSidebar"
          class="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X :size="20" class="text-zinc-400" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <div class="space-y-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActiveRoute(item.path)
                ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            ]"
          >
            <component
              :is="item.icon"
              :size="18"
              :class="[
                'flex-shrink-0',
                isActiveRoute(item.path) ? 'text-purple-400' : ''
              ]"
            />
            <div class="flex-1 text-left">
              <div>{{ item.name }}</div>
              <div
                v-if="isActiveRoute(item.path)"
                class="text-xs text-zinc-400 mt-0.5"
              >
                {{ item.description }}
              </div>
            </div>
          </button>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-zinc-800 p-3">
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="flex-1 text-left min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {{ user?.name || 'Utilisateur' }}
              </div>
              <div class="text-xs text-zinc-400 truncate">
                {{ user?.email || 'Email privé' }}
              </div>
            </div>
            <ChevronDown
              :size="16"
              :class="[
                'text-zinc-400 transition-transform',
                userMenuOpen ? 'rotate-180' : ''
              ]"
            />
          </button>

          <!-- User Dropdown Menu -->
          <div
            v-if="userMenuOpen"
            class="absolute bottom-full left-0 right-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
          >
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700/50 transition-colors"
            >
              <LogOut :size="16" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header (Mobile) -->
      <header class="lg:hidden flex items-center justify-between h-16 px-4 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800">
        <button
          @click="toggleSidebar"
          class="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu :size="20" class="text-zinc-400" />
        </button>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Github :size="14" class="text-white" />
          </div>
          <span class="text-sm font-semibold text-white">Git Reporter</span>
        </div>
        <div class="w-10"></div> <!-- Spacer for centering -->
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-zinc-950">
        <div class="h-full">
          <slot></slot>
        </div>
      </main>
    </div>
    
    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<style scoped>
/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 6px;
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
</style>
