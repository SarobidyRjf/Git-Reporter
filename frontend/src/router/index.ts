/**
 * Configuration Vue Router
 *
 * Définit toutes les routes de l'application avec :
 * - Guards de navigation pour l'authentification
 * - Routes publiques et privées
 * - Gestion des redirections
 * - Meta-données pour chaque route
 *
 * @module router
 */

import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import apiService from "../services/api";

/**
 * Définition des routes de l'application
 */
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: {
      requiresAuth: false,
      title: "Connexion",
    },
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("../views/AuthCallback.vue"),
    meta: {
      requiresAuth: false,
      title: "Connexion en cours...",
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      requiresAuth: true,
      title: "Dashboard",
    },
  },
  {
    path: "/history",
    name: "History",
    component: () => import("../views/History.vue"),
    meta: {
      requiresAuth: true,
      title: "Historique",
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/Settings.vue"),
    meta: {
      requiresAuth: true,
      title: "Paramètres",
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/Profile.vue"),
    meta: {
      requiresAuth: true,
      title: "Profil",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: {
      requiresAuth: false,
      title: "Page non trouvée",
    },
  },
];

/**
 * Création de l'instance du router
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Retourne à la position sauvegardée si elle existe (bouton retour)
    if (savedPosition) {
      return savedPosition;
    }
    // Sinon, scroll en haut de la page
    return { top: 0 };
  },
});

/**
 * Guard de navigation global pour l'authentification
 *
 * Vérifie si l'utilisateur est authentifié avant d'accéder aux routes protégées
 */
router.beforeEach(async (to, from, next) => {
  // Vérifier si la route nécessite une authentification
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Vérifier si l'utilisateur a un token
  const hasToken = apiService.hasToken();

  // Mettre à jour le titre de la page
  const baseTitle = import.meta.env.VITE_APP_NAME || "Git Reporter";
  document.title = to.meta.title
    ? `${to.meta.title} - ${baseTitle}`
    : baseTitle;

  if (requiresAuth) {
    if (!hasToken) {
      // Pas de token : rediriger vers la page de connexion
      console.warn("🔒 Route protégée - Redirection vers login");
      next({
        name: "Login",
        query: { redirect: to.fullPath }, // Sauvegarder l'URL de destination
      });
    } else {
      // Token présent : autoriser l'accès
      next();
    }
  } else {
    // Route publique
    if (hasToken && to.name === "Login") {
      // Si connecté et tentative d'accès à la page de login, rediriger vers le dashboard
      console.log("✅ Déjà connecté - Redirection vers dashboard");
      next({ name: "Dashboard" });
    } else {
      next();
    }
  }
});

/**
 * Guard après navigation pour le logging en développement
 */
router.afterEach((to, from) => {
  if (import.meta.env.DEV) {
    console.log("🧭 Navigation:", {
      from: from.name || from.path,
      to: to.name || to.path,
      requiresAuth: to.meta.requiresAuth,
    });
  }
});

export default router;
