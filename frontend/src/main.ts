/**
 * Point d'entrée principal de l'application Vue 3
 *
 * Configure et monte l'application avec :
 * - Vue Router pour la navigation
 * - Pinia pour la gestion d'état
 * - Styles globaux Tailwind CSS
 *
 * @module main
 */

import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth.store";
import "./style.css";

/**
 * Créer l'instance de l'application Vue
 */
const app = createApp(App);

/**
 * Créer l'instance Pinia pour la gestion d'état
 */
const pinia = createPinia();

/**
 * Installer les plugins
 */
app.use(pinia); // Doit être installé avant le router pour les stores
app.use(router);

/**
 * Initialiser l'authentification au démarrage de l'application
 */
const authStore = useAuthStore();
authStore.initialize().then(() => {
  console.log("✅ Application initialisée");
});

/**
 * Monter l'application sur le DOM
 */
app.mount("#app");

/**
 * Afficher les informations de démarrage en mode développement
 */
if (import.meta.env.DEV) {
  console.log("🚀 Git Reporter - Mode Développement");
  console.log(
    "📡 API URL:",
    import.meta.env.VITE_API_URL || "http://localhost:4000",
  );
  console.log("🎨 Environnement:", import.meta.env.MODE);
}

/**
 * Gestion des erreurs non capturées
 */
window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Unhandled Promise Rejection:", event.reason);
  // Vous pouvez afficher une notification toast ici
});

/**
 * Gestion des erreurs globales
 */
app.config.errorHandler = (err, instance, info) => {
  console.error("❌ Global Error:", err);
  console.error("📍 Component:", instance);
  console.error("ℹ️ Info:", info);
  // Vous pouvez afficher une notification toast ici
};

/**
 * Configuration des performances (uniquement en développement)
 */
if (import.meta.env.DEV) {
  app.config.performance = true;
}
