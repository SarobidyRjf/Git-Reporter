<script setup lang="ts">
/**
 * Login Page - Style Resend
 * Design minimaliste harmonisé avec la Landing Page
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { Loader2, Github, Terminal } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);
const isVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});

async function handleGitHubLogin() {
  try {
    isLoading.value = true;
    error.value = null;
    await authStore.initiateLogin();
  } catch (err) {
    console.error('Login Error:', err);
    error.value = 'Échec de la connexion. Veuillez réessayer.';
    isLoading.value = false;
  }
}

function handleBackToHome() {
  router.push('/');
}
</script>

<template>
  <div class="login-page">
    <div class="login-container" :class="{ 'visible': isVisible }">
      
      <!-- Brand Header -->
      <div class="brand-header" @click="handleBackToHome">
        <Terminal :size="28" />
        <span class="logo-text">Git Reporter</span>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <h1 class="login-title">Bienvenue</h1>
        <p class="login-desc">Connectez-vous pour accéder à votre tableau de bord de rapports automatisés.</p>

        <button 
          @click="handleGitHubLogin" 
          :disabled="isLoading" 
          class="btn-primary"
        >
          <Loader2 v-if="isLoading" class="animate-spin" :size="20" />
          <Github v-else :size="20" />
          <span>{{ isLoading ? 'Connexion...' : 'Continuer avec GitHub' }}</span>
        </button>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <div class="divider">
          <span>Sécurisé par GitHub OAuth</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- Variables --- */
.login-page {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #171717;
  --text-secondary: #737373;
  --border: #e5e5e5;
  --accent: #000000;
  
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

@media (prefers-color-scheme: dark) {
  .login-page {
    --bg-primary: #0a0a0a;
    --bg-secondary: #171717;
    --text-primary: #ededed;
    --text-secondary: #a3a3a3;
    --border: #262626;
    --accent: #ffffff;
  }
}

/* --- Layout --- */
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.login-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  color: var(--text-primary);
}

.brand-header:hover { 
  opacity: 0.7; 
}

/* --- Card --- */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 1rem;
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.login-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

/* --- Button --- */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- Divider --- */
.divider {
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider span {
  padding: 0 1rem;
}

/* --- Error Message --- */
.error-msg {
  margin-top: 1.5rem;
  padding: 0.875rem;
  border-radius: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
}

@media (prefers-color-scheme: dark) {
  .error-msg {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
    color: #f87171;
  }
}

/* --- Responsive --- */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
}
</style>
