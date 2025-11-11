/**
 * Store Pinia pour l'authentification
 *
 * Gère l'état de l'authentification de l'application :
 * - Utilisateur connecté
 * - Token JWT
 * - État de chargement
 * - Actions de connexion/déconnexion
 *
 * @module stores/auth
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import apiService from '../services/api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  // ============================================================================
  // STATE
  // ============================================================================

  /**
   * Utilisateur connecté
   */
  const user = ref<User | null>(null);

  /**
   * État de chargement
   */
  const isLoading = ref(false);

  /**
   * Erreur éventuelle
   */
  const error = ref<string | null>(null);

  /**
   * Indique si l'utilisateur est authentifié
   */
  const isAuthenticated = ref(false);

  // ============================================================================
  // GETTERS (Computed)
  // ============================================================================

  /**
   * Retourne le nom d'affichage de l'utilisateur
   */
  const displayName = computed(() => {
    if (!user.value) return null;
    return user.value.name || user.value.email || 'Utilisateur';
  });

  /**
   * Retourne l'avatar de l'utilisateur
   */
  const userAvatar = computed(() => {
    return user.value?.avatarUrl || null;
  });

  /**
   * Retourne l'email de l'utilisateur
   */
  const userEmail = computed(() => {
    return user.value?.email || null;
  });

  /**
   * Vérifie si un token existe
   */
  const hasToken = computed(() => {
    return apiService.hasToken();
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Initialise l'authentification au démarrage de l'application
   * Vérifie si un token existe et charge les informations utilisateur
   */
  async function initialize() {
    console.log('🔐 Initialisation de l\'authentification...');

    if (!hasToken.value) {
      console.log('❌ Aucun token trouvé');
      isAuthenticated.value = false;
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Vérifier la validité du token
      const verifyResponse = await apiService.verifyToken();

      if (verifyResponse.success && verifyResponse.data?.valid) {
        console.log('✅ Token valide - Chargement des informations utilisateur');
        await fetchCurrentUser();
      } else {
        console.warn('⚠️ Token invalide - Nettoyage');
        await logout();
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'initialisation:', err);
      error.value = 'Erreur lors de la vérification de l\'authentification';
      await logout();
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  async function fetchCurrentUser() {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await apiService.getCurrentUser();

      if (response.success && response.data) {
        user.value = response.data;
        isAuthenticated.value = true;
        console.log('✅ Utilisateur chargé:', user.value);
      } else {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', err);
      error.value = 'Impossible de récupérer vos informations';
      isAuthenticated.value = false;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Initie le flux de connexion GitHub OAuth
   */
  async function initiateLogin() {
    try {
      isLoading.value = true;
      error.value = null;

      console.log('🚀 Initiation de la connexion GitHub...');

      const response = await apiService.initiateGitHubLogin();

      if (response.success && response.data?.authUrl) {
        console.log('🔗 Redirection vers GitHub:', response.data.authUrl);
        // Rediriger vers GitHub OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Impossible d\'obtenir l\'URL d\'authentification');
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'initiation de la connexion:', err);
      error.value = 'Impossible d\'initier la connexion avec GitHub';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Finalise la connexion après le callback OAuth
   * @param token - Token JWT reçu du backend
   */
  async function completeLogin(token: string) {
    try {
      isLoading.value = true;
      error.value = null;

      console.log('✅ Token reçu - Finalisation de la connexion...');

      // Stocker le token
      apiService.setToken(token);

      // Charger les informations utilisateur
      await fetchCurrentUser();

      console.log('🎉 Connexion réussie !');
    } catch (err) {
      console.error('❌ Erreur lors de la finalisation de la connexion:', err);
      error.value = 'Impossible de finaliser la connexion';
      await logout();
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async function logout() {
    try {
      isLoading.value = true;
      error.value = null;

      console.log('👋 Déconnexion en cours...');

      // Appeler l'API de déconnexion (optionnel si JWT stateless)
      try {
        await apiService.logout();
      } catch (err) {
        console.warn('⚠️ Erreur lors de la déconnexion API:', err);
        // Continuer la déconnexion locale même si l'API échoue
      }

      // Nettoyer l'état local
      user.value = null;
      isAuthenticated.value = false;
      apiService.removeToken();

      console.log('✅ Déconnexion réussie');
    } catch (err) {
      console.error('❌ Erreur lors de la déconnexion:', err);
      error.value = 'Erreur lors de la déconnexion';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Réinitialise l'erreur
   */
  function clearError() {
    error.value = null;
  }

  /**
   * Met à jour les informations utilisateur (après modification du profil)
   */
  function updateUser(updatedUser: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      console.log('✅ Utilisateur mis à jour:', user.value);
    }
  }

  // ============================================================================
  // RETURN (expose public API)
  // ============================================================================

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,

    // Getters
    displayName,
    userAvatar,
    userEmail,
    hasToken,

    // Actions
    initialize,
    fetchCurrentUser,
    initiateLogin,
    completeLogin,
    logout,
    clearError,
    updateUser,
  };
});
