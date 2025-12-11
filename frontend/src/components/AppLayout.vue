<script setup lang="ts">
/**
 * Layout principal de l'application
 *
 * Structure inspirée de GitHub avec :
 * - Sidebar navigation persistante
 * - Header avec user menu
 * - Content area responsive
 */
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import {
  LayoutDashboard,
  History,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Github,
  ChevronDown,
  FileText,
  Calendar,
  Users,
} from "lucide-vue-next";
import Toast from "./ui/Toast.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// État du sidebar pour mobile
const sidebarOpen = ref(false);
const userMenuOpen = ref(false);

// Navigation items
const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Créer un rapport",
  },
  {
    name: "Historique",
    path: "/history",
    icon: History,
    description: "Rapports envoyés",
  },
  {
    name: "Profil",
    path: "/profile",
    icon: User,
    description: "Vos statistiques",
  },
  {
    name: "Modèles",
    path: "/templates",
    icon: FileText,
    description: "Modèles de rapports",
  },
  {
    name: "Planification",
    path: "/schedules",
    icon: Calendar,
    description: "Rapports automatiques",
  },
  {
    name: "Équipes",
    path: "/teams",
    icon: Users,
    description: "Collaboration",
  },
  {
    name: "Paramètres",
    path: "/settings",
    icon: Settings,
    description: "Configuration",
  },
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
  router.push({ name: "login" });
};
</script>

<template>
  <div
    class="flex h-screen overflow-hidden"
    style="background-color: var(--bg-primary)"
  >
    <!-- Sidebar Overlay (Mobile) -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      style="
        background-color: var(--bg-secondary);
        border-right: 1px solid var(--border-primary);
      "
    >
      <!-- Logo & Brand -->
      <div
        class="flex items-center justify-between h-16 px-6"
        style="border-bottom: 1px solid var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <Github :size="18" class="text-white" />
          </div>
          <span class="text-lg font-semibold" style="color: var(--text-primary)"
            >Git Reporter</span
          >
        </div>
        <!-- Close button (mobile) -->
        <button
          @click="toggleSidebar"
          class="lg:hidden p-2 rounded-lg transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-800"
        >
          <X :size="20" style="color: var(--text-secondary)" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <div class="space-y-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            :data-tour="item.name === 'Historique' ? 'history' : item.name === 'Paramètres' ? 'settings' : undefined"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActiveRoute(item.path)
                ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30'
                : 'hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50',
            ]"
            :style="
              isActiveRoute(item.path)
                ? 'color: var(--text-primary)'
                : 'color: var(--text-secondary)'
            "
          >
            <component
              :is="item.icon"
              :size="18"
              :class="[
                'flex-shrink-0',
                isActiveRoute(item.path) ? 'text-red-400' : '',
              ]"
            />
            <div class="flex-1 text-left">
              <div>{{ item.name }}</div>
              <div
                v-if="isActiveRoute(item.path)"
                class="text-xs mt-0.5"
                style="color: var(--text-secondary)"
              >
                {{ item.description }}
              </div>
            </div>
          </button>
        </div>
      </nav>

      <!-- User Section -->
      <div class="p-3" style="border-top: 1px solid var(--border-primary)">
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ user?.name?.charAt(0).toUpperCase() || "U" }}
            </div>
            <div class="flex-1 text-left min-w-0">
              <div
                class="text-sm font-medium truncate"
                style="color: var(--text-primary)"
              >
                {{ user?.name || "Utilisateur" }}
              </div>
              <div
                class="text-xs truncate"
                style="color: var(--text-secondary)"
              >
                {{ user?.email || "Email privé" }}
              </div>
            </div>
            <ChevronDown
              :size="16"
              :class="[
                'transition-transform',
                userMenuOpen ? 'rotate-180' : '',
              ]"
              style="color: var(--text-secondary)"
            />
          </button>

          <!-- User Dropdown Menu -->
          <div
            v-if="userMenuOpen"
            class="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-2xl overflow-hidden"
            style="
              background-color: var(--bg-tertiary);
              border: 1px solid var(--border-secondary);
            "
          >
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-zinc-700/50 dark:hover:bg-zinc-700/50"
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
      <header
        class="lg:hidden flex items-center justify-between h-16 px-4 backdrop-blur-xl"
        style="
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        "
      >
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-800"
        >
          <Menu :size="20" style="color: var(--text-secondary)" />
        </button>
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <Github :size="14" class="text-white" />
          </div>
          <span class="text-sm font-semibold" style="color: var(--text-primary)"
            >Git Reporter</span
          >
        </div>
        <div class="w-10"></div>
        <!-- Spacer for centering -->
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 overflow-y-auto"
        style="background-color: var(--bg-primary)"
      >
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
