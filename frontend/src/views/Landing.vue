<script setup lang="ts">
/**
 * Landing Page - Style Reflect.app
 * Lune centrée en bas, lignes animées, design minimaliste élégant
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Github, 
  Mail, 
  MessageSquare, 
  Zap, 
  Shield, 
  Clock, 
  BarChart3,
  FileText,
  ArrowRight,
  Check
} from 'lucide-vue-next';

const router = useRouter();
const heroVisible = ref(false);
const featuresVisible = ref(false);
const ctaVisible = ref(false);

onMounted(() => {
  // Hero animation
  setTimeout(() => {
    heroVisible.value = true;
  }, 100);

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('features')) {
          featuresVisible.value = true;
        }
        if (entry.target.classList.contains('cta')) {
          ctaVisible.value = true;
        }
      }
    });
  }, observerOptions);

  // Observe sections
  setTimeout(() => {
    const featuresSection = document.querySelector('.features');
    const ctaSection = document.querySelector('.cta');
    if (featuresSection) observer.observe(featuresSection);
    if (ctaSection) observer.observe(ctaSection);
  }, 500);
});

const features = [
  { icon: Github, title: 'Connexion GitHub OAuth', description: 'Authentification sécurisée en un clic' },
  { icon: Zap, title: 'Génération instantanée', description: 'Récupérez vos commits en quelques secondes' },
  { icon: Mail, title: 'Envoi par Email', description: 'Templates HTML professionnels' },
  { icon: MessageSquare, title: 'WhatsApp intégré', description: 'Communication directe avec votre équipe' },
  { icon: FileText, title: 'Templates personnalisables', description: 'Créez vos propres formats' },
  { icon: Clock, title: 'Rapports programmés', description: 'Automatisation complète' },
  { icon: BarChart3, title: 'Historique complet', description: 'Recherche et filtres avancés' },
  { icon: Shield, title: 'Sécurité maximale', description: 'Protection JWT et chiffrement' }
];

function navigateToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="landing">
    <!-- Animated Grid Background -->
    <div class="grid-bg">
      <div class="grid-lines"></div>
    </div>

    <!-- Centered Moon at Bottom with Curved Paths -->
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

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-content">
        <div class="nav-brand">
          <FileText :size="24" />
          <span>Git Reporter</span>
        </div>
        <button @click="navigateToLogin" class="nav-btn">
          Se connecter
          <ArrowRight :size="16" />
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content" :class="{ visible: heroVisible }">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Automatisation intelligente
        </div>
        
        <h1 class="hero-title">
          Transformez vos commits<br />
          en rapports élégants
        </h1>
        
        <p class="hero-subtitle">
          Générez et envoyez automatiquement vos rapports Git.<br />
          Simple. Rapide. Professionnel.
        </p>

        <div class="hero-actions">
          <button @click="navigateToLogin" class="btn-primary">
            <Github :size="20" />
            Commencer gratuitement
            <ArrowRight :size="18" class="arrow" />
          </button>
        </div>

        <div class="hero-meta">
          <div class="meta-item">
            <Check :size="16" />
            <span>Gratuit</span>
          </div>
          <div class="meta-item">
            <Check :size="16" />
            <span>Sans engagement</span>
          </div>
          <div class="meta-item">
            <Check :size="16" />
            <span>2 minutes de setup</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" :class="{ 'section-visible': featuresVisible }">
      <div class="features-content">
        <h2 class="features-title">Fonctionnalités</h2>
        
        <div class="features-list">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="feature-item"
          >
            <div class="feature-icon">
              <component :is="feature.icon" :size="20" />
            </div>
            <div class="feature-text">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" :class="{ 'section-visible': ctaVisible }">
      <div class="cta-content">
        <h2 class="cta-title">Prêt à commencer ?</h2>
        <p class="cta-subtitle">
          Rejoignez les développeurs qui automatisent leurs rapports
        </p>
        <button @click="navigateToLogin" class="btn-cta">
          <Github :size="20" />
          Se connecter avec GitHub
          <ArrowRight :size="18" class="arrow" />
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <FileText :size="20" />
          <span>Git Reporter</span>
        </div>
        <div class="footer-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#">Documentation</a>
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Git Reporter. Crafted with precision.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Parisienne&family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');

/* Base */
.landing {
  min-height: 100vh;
  background: #0a0a0f;
  color: #ffffff;
  font-family: 'Cormorant Garamond', 'Inter', serif;
  position: relative;
  overflow-x: hidden;
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

/* Centered Moon at Bottom - 50vh */
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


/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  color: white;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Hero Section */
.hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rem 2rem 4rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 100px;
  font-size: 0.875rem;
  color: #fca5a5;
  margin-bottom: 2rem;
  font-weight: 500;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #dc2626;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: clamp(3rem, 7vw, 6.5rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(180deg, #ffffff 0%, #fca5a5 60%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(220, 38, 38, 0.3);
}

.hero-subtitle {
  font-size: 1.375rem;
  color: #d4d4d8;
  line-height: 1.7;
  margin-bottom: 3rem;
  font-weight: 400;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.01em;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 100px;
  font-size: 0.875rem;
  color: #fca5a5;
  margin-bottom: 2rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.hero-actions {
  margin-bottom: 3rem;
}

.btn-primary, .btn-cta {
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

.btn-primary:hover, .btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(220, 38, 38, 0.4);
}

.arrow {
  transition: transform 0.3s ease;
}

.btn-primary:hover .arrow,
.btn-cta:hover .arrow {
  transform: translateX(4px);
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #71717a;
  font-size: 0.9375rem;
}

.meta-item svg {
  color: #dc2626;
}

/* Features Section with Scroll Animation */
.features {
  position: relative;
  z-index: 1;
  padding: 6rem 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.features.section-visible {
  opacity: 1;
  transform: translateY(0);
}

.features-content {
  max-width: 900px;
  margin: 0 auto;
}

.features-title {
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
  letter-spacing: -0.02em;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(135deg, #ffffff 0%, #fca5a5 50%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.feature-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-item:hover {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-color: rgba(220, 38, 38, 0.4);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
}

.feature-item:hover::before {
  opacity: 1;
}

.feature-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05));
  border-radius: 0.75rem;
  color: #fca5a5;
  transition: all 0.3s;
}

.feature-item:hover .feature-icon {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(220, 38, 38, 0.1));
  color: #dc2626;
  transform: scale(1.1) rotate(5deg);
}

.feature-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
  font-family: 'Playfair Display', serif;
  letter-spacing: 0.01em;
}

.feature-text p {
  font-size: 1rem;
  color: #d4d4d8;
  line-height: 1.6;
  font-family: 'Cormorant Garamond', serif;
}

/* CTA Section with Scroll Animation */
.cta {
  position: relative;
  z-index: 1;
  padding: 8rem 2rem;
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta.section-visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 4rem 3rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
}

.cta-content::before {
  content: '';
  position: absolute;
  inset: -100%;
  background: conic-gradient(from 0deg, transparent, rgba(220, 38, 38, 0.1), transparent 30%);
  animation: rotate 8s linear infinite;
}

.cta-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(135deg, #ffffff 0%, #fca5a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-subtitle {
  font-size: 1.375rem;
  color: #d4d4d8;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.01em;
}

.btn-cta {
  position: relative;
  z-index: 1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Footer */
.footer {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: white;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #dc2626;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #71717a;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 6rem 1.5rem 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .moon-container {
    width: 400px;
    height: 400px;
    bottom: -150px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .btn-primary, .btn-cta {
    width: 100%;
    justify-content: center;
  }

  .nav-content {
    padding: 1rem 1.5rem;
  }

  .nav-brand span {
    display: none;
  }
}
</style>
