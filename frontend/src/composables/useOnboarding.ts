/**
 * Composable pour gérer le tour d'onboarding
 * 
 * Utilise driver.js pour créer un tour guidé interactif
 * pour les nouveaux utilisateurs.
 */
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { ref, onMounted } from 'vue';

const ONBOARDING_STORAGE_KEY = 'git-reporter-onboarding-completed';

export function useOnboarding() {
  const driverInstance = ref<Driver | null>(null);
  const isOnboardingCompleted = ref(false);

  /**
   * Vérifie si l'onboarding a déjà été complété
   */
  function checkOnboardingStatus(): boolean {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    isOnboardingCompleted.value = completed === 'true';
    return isOnboardingCompleted.value;
  }

  /**
   * Marque l'onboarding comme complété
   */
  function markOnboardingCompleted() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    isOnboardingCompleted.value = true;
    console.log('✅ Onboarding marqué comme complété');
  }

  /**
   * Réinitialise le statut d'onboarding (pour les tests)
   */
  function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    isOnboardingCompleted.value = false;
    console.log('🔄 Onboarding réinitialisé');
  }

  /**
   * Définit les étapes du tour pour le Dashboard
   */
  const dashboardSteps: DriveStep[] = [
    {
      element: '[data-tour="welcome"]',
      popover: {
        title: '👋 Bienvenue sur Git Reporter !',
        description: 'Laissez-nous vous guider pour créer votre premier rapport de commits Git.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="repo-selector"]',
      popover: {
        title: '📁 Sélectionnez un dépôt',
        description: 'Commencez par choisir le dépôt GitHub dont vous voulez générer le rapport. Tous vos dépôts accessibles sont listés ici.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="date-range"]',
      popover: {
        title: '📅 Choisissez la période',
        description: 'Sélectionnez la plage de dates pour filtrer les commits. Vous pouvez choisir aujourd\'hui, cette semaine, ou une période personnalisée.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-button"]',
      popover: {
        title: '⚡ Générez votre rapport',
        description: 'Cliquez ici pour récupérer les commits et générer votre rapport. Vous pourrez ensuite l\'éditer avant de l\'envoyer.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '[data-tour="history"]',
      popover: {
        title: '📊 Consultez l\'historique',
        description: 'Retrouvez tous vos rapports envoyés dans l\'historique. Vous pouvez les consulter, les rechercher et les filtrer.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="settings"]',
      popover: {
        title: '⚙️ Configurez vos préférences',
        description: 'Dans les paramètres, configurez vos informations d\'envoi (email, WhatsApp) et personnalisez l\'application.',
        side: 'right',
        align: 'start',
      },
    },
    {
      popover: {
        title: '🎉 Vous êtes prêt !',
        description: 'Vous savez maintenant comment utiliser Git Reporter. Créez votre premier rapport et gagnez du temps !',
      },
    },
  ];

  /**
   * Initialise le driver avec la configuration personnalisée
   */
  function initializeDriver() {
    if (driverInstance.value) {
      return driverInstance.value;
    }

    driverInstance.value = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: dashboardSteps,
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer ✓',
      progressText: '{{current}} sur {{total}}',
      onDestroyed: () => {
        markOnboardingCompleted();
      },
      onDestroyStarted: () => {
        // L'utilisateur a fermé le tour
        if (driverInstance.value && !driverInstance.value.isLastStep()) {
          // Si ce n'est pas la dernière étape, on considère que c'est un skip
          markOnboardingCompleted();
        }
      },
      popoverClass: 'git-reporter-tour-popover',
      // Styling personnalisé
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      smoothScroll: true,
    });

    return driverInstance.value;
  }

  /**
   * Démarre le tour d'onboarding
   */
  function startTour() {
    const driverObj = initializeDriver();
    
    // Petit délai pour s'assurer que tous les éléments sont montés
    setTimeout(() => {
      driverObj.drive();
      console.log('🚀 Tour d\'onboarding démarré');
    }, 500);
  }

  /**
   * Démarre le tour automatiquement si c'est la première visite
   */
  function startTourIfFirstTime() {
    const isCompleted = checkOnboardingStatus();
    
    if (!isCompleted) {
      console.log('👋 Première visite détectée - Démarrage du tour');
      startTour();
    } else {
      console.log('✅ Utilisateur déjà onboardé - Pas de tour');
    }
  }

  /**
   * Détruit l'instance du driver
   */
  function destroyDriver() {
    if (driverInstance.value) {
      driverInstance.value.destroy();
      driverInstance.value = null;
    }
  }

  return {
    // State
    isOnboardingCompleted,
    
    // Methods
    startTour,
    startTourIfFirstTime,
    checkOnboardingStatus,
    markOnboardingCompleted,
    resetOnboarding,
    destroyDriver,
  };
}
