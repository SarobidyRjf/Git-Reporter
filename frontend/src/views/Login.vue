<script setup lang="ts">
/**
 * Login Page - Theme "Velocity"
 * Harmonized with Landing Page (Dark, Glassmorphism, Glows).
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { Loader2, Github, ArrowRight, Terminal } from 'lucide-vue-next';

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
    error.value = 'Connection failed. Please try again.';
    isLoading.value = false;
  }
}

function handleBackToHome() {
  router.push('/');
}
</script>

<template>
  <div class="login-page">
    <div class="noise-overlay"></div>
    
    <!-- Ambient Background Glows -->
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <div class="login-container" :class="{ 'visible': isVisible }">
      
      <!-- Brand Header -->
      <div class="brand-header" @click="handleBackToHome">
        <Terminal class="logo-icon" />
        <span class="logo-text">Git Reporter<span class="dot">.</span></span>
      </div>

      <!-- Login Card -->
      <div class="login-card glass-panel">
        <div class="card-glow"></div>
        
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-desc">Sign in to access your automated reporting dashboard.</p>

        <button 
          @click="handleGitHubLogin" 
          :disabled="isLoading" 
          class="btn-primary full-width"
        >
          <Loader2 v-if="isLoading" class="animate-spin" />
          <Github v-else class="icon" />
          <span>{{ isLoading ? 'Connecting...' : 'Continue with GitHub' }}</span>
          <ArrowRight v-if="!isLoading" class="icon-arrow" />
        </button>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <div class="divider">
          <span>Secured by GitHub OAuth</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- Tokens & Base --- */
.login-page {
  --bg-dark: #030712;
  --bg-card: rgba(17, 24, 39, 0.7);
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --glass-border: rgba(255, 255, 255, 0.08);
  
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Ambient Effects (Shared with Landing) --- */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.07;
  pointer-events: none;
  z-index: 0;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.4;
  animation: breathe 8s infinite alternate;
}

.glow-1 {
  width: 600px;
  height: 600px;
  background: var(--primary);
  top: -20%;
  left: -10%;
}

.glow-2 {
  width: 500px;
  height: 500px;
  background: var(--secondary);
  bottom: -10%;
  right: -10%;
  animation-delay: 2s;
}

@keyframes breathe {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.5; transform: scale(1.1); }
}

/* --- Layout --- */
.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.login-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.brand-header:hover { opacity: 0.8; }
.dot { color: var(--primary); }

/* --- Card --- */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.5;
}

.login-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: white;
}

.login-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  line-height: 1.5;
}

/* --- Buttons --- */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  font-size: 1rem;
  background: linear-gradient(135deg, var(--primary), #2563eb);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.icon-arrow {
  transition: transform 0.3s ease;
}

.btn-primary:hover .icon-arrow {
  transform: translateX(4px);
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
  color: #475569;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.divider span {
  padding: 0 1rem;
}

.error-msg {
  margin-top: 1.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  font-size: 0.875rem;
}
</style>
