<script setup lang="ts">
/**
 * Page de connexion OAuth GitHub - Style harmonisé avec Landing
 */
import { Loader2, Github, ArrowRight } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);
const contentVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    contentVisible.value = true;
  }, 100);
});

/**
 * Initie la connexion GitHub OAuth
 */
async function handleGitHubLogin() {
  try {
    isLoading.value = true;
    error.value = null;
    await authStore.initiateLogin();
  } catch (err) {
    console.error('Erreur de connexion:', err);
    error.value = 'Impossible de se connecter. Veuillez réessayer.';
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Animated Grid Background -->
    <div class="grid-bg">
      <div class="grid-lines"></div>
    </div>

    <!-- Centered Moon at Bottom -->
    <div class="moon-container">
      <!-- SVG Curved Paths for Commits -->
      <svg class="moon-curves" viewBox="0 0 1400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(220,38,38,0.3);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgba(220,38,38,0.6);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(220,38,38,0.3);stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Curved path 1 -->
        <path id="curve1" d="M 0,150 Q 350,100 700,120 T 1400,150" 
              stroke="url(#curveGradient)" stroke-width="1" fill="none" opacity="0.4"/>
        <!-- Curved path 2 -->
        <path id="curve2" d="M 0,200 Q 350,160 700,180 T 1400,200" 
              stroke="url(#curveGradient)" stroke-width="1" fill="none" opacity="0.3"/>
        <!-- Curved path 3 -->
        <path id="curve3" d="M 0,250 Q 350,210 700,230 T 1400,250" 
              stroke="url(#curveGradient)" stroke-width="1" fill="none" opacity="0.2"/>
      </svg>
      
      <div class="moon-glow">
        <!-- Animated Commit Particles on Curves -->
        <div class="commit-particle commit-curve-1"></div>
        <div class="commit-particle commit-curve-2"></div>
        <div class="commit-particle commit-curve-3"></div>
        <div class="commit-particle commit-curve-4"></div>
        <div class="commit-particle commit-curve-5"></div>
        <div class="commit-particle commit-curve-6"></div>
      </div>
    </div>

    <!-- Login Content -->
    <div class="login-content" :class="{ visible: contentVisible }">
      <div class="login-header">
        <h1 class="login-title">
          <!-- Bienvenue sur<br />
          Git Reporter -->
        </h1>
        <p class="login-subtitle">
          Connectez-vous pour commencer à générer vos rapports
        </p>
      </div>

      <!-- Login Button -->
      <button
        @click="handleGitHubLogin"
        :disabled="isLoading"
        class="btn-login"
      >
        <Loader2
          v-if="isLoading"
          :size="20"
          class="animate-spin"
        />
        <Github
          v-else
          :size="20"
        />
        <span>
          {{ isLoading ? 'Connexion en cours...' : 'Se connecter avec GitHub' }}
        </span>
        <ArrowRight v-if="!isLoading" :size="18" class="arrow" />
      </button>

      <!-- Error Message -->
      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Parisienne&family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');

/* Base */
.login-page {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
  font-family: 'Cormorant Garamond', 'Inter', serif;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Animated Grid Background */
.grid-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

/* Centered Moon at Bottom */
.moon-container {
  position: fixed;
  bottom: -15vh;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  height: 50vh;
  z-index: 0;
  pointer-events: none;
}

.moon-curves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.moon-glow {
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse 140% 100% at center bottom,
    rgba(220, 38, 38, 0.9) 0%,
    rgba(220, 38, 38, 0.7) 20%,
    rgba(220, 38, 38, 0.5) 40%,
    rgba(220, 38, 38, 0.3) 60%,
    rgba(220, 38, 38, 0.15) 80%,
    transparent 100%
  );
  border-radius: 50%;
  animation: moonPulse 5s ease-in-out infinite;
  position: relative;
  filter: blur(1px);
}

@keyframes moonPulse {
  0%, 100% { 
    opacity: 0.85;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.01);
  }
}

/* Commit Particles Following Curves */
.commit-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #fff 0%, #fca5a5 40%, #dc2626 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.8),
    0 0 40px rgba(220, 38, 38, 0.9),
    0 0 60px rgba(220, 38, 38, 0.6);
  filter: blur(0.5px);
}

.commit-curve-1 {
  animation: followCurve1 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.commit-curve-2 {
  animation: followCurve2 15s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 2s;
}

.commit-curve-3 {
  animation: followCurve3 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 4s;
}

.commit-curve-4 {
  animation: followCurve1 13s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 1s;
}

.commit-curve-5 {
  animation: followCurve2 14s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 5s;
}

.commit-curve-6 {
  animation: followCurve3 11s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 3s;
}

/* Curved Path Animations */
@keyframes followCurve1 {
  0% {
    left: -5%;
    top: 37.5%;
    opacity: 0;
    transform: scale(0.5);
  }
  5% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    top: 25%;
  }
  50% {
    top: 30%;
  }
  75% {
    top: 25%;
  }
  95% {
    opacity: 1;
  }
  100% {
    left: 105%;
    top: 37.5%;
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes followCurve2 {
  0% {
    left: -5%;
    top: 50%;
    opacity: 0;
    transform: scale(0.5);
  }
  5% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    top: 40%;
  }
  50% {
    top: 45%;
  }
  75% {
    top: 40%;
  }
  95% {
    opacity: 1;
  }
  100% {
    left: 105%;
    top: 50%;
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes followCurve3 {
  0% {
    left: -5%;
    top: 62.5%;
    opacity: 0;
    transform: scale(0.5);
  }
  5% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    top: 52.5%;
  }
  50% {
    top: 57.5%;
  }
  75% {
    top: 52.5%;
  }
  95% {
    opacity: 1;
  }
  100% {
    left: 105%;
    top: 62.5%;
    opacity: 0;
    transform: scale(0.5);
  }
}

/* Login Content */
.login-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.login-header {
  margin-bottom: 3rem;
}

.login-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(180deg, #ffffff 0%, #fca5a5 60%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(220, 38, 38, 0.3);
}

.login-subtitle {
  font-size: 1.25rem;
  color: #d4d4d8;
  line-height: 1.7;
  font-weight: 400;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.01em;
}

/* Login Button */
.btn-login {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.125rem 2.5rem;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
  font-family: 'Inter', sans-serif;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(220, 38, 38, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow {
  transition: transform 0.3s ease;
}

.btn-login:hover .arrow {
  transform: translateX(4px);
}

/* Animation pour le spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Error Message */
.error-message {
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.9375rem;
  font-family: 'Inter', sans-serif;
}

/* Responsive */
@media (max-width: 768px) {
  .login-title {
    font-size: 2.5rem;
  }
  
  .login-subtitle {
    font-size: 1.125rem;
  }
  
  .btn-login {
    padding: 1rem 2rem;
    font-size: 0.9375rem;
  }
}
</style>
