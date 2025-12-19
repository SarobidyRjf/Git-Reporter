<script setup lang="ts">
/**
 * Landing Page - Style Resend
 * Design minimaliste et élégant pour développeurs
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Github, 
  ArrowRight, 
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

const router = useRouter();

// Carousel state
const currentSlide = ref(0);
const slides = [
  { src: '/app-dashboard.png', alt: 'Dashboard - Créer un rapport' },
  { src: '/app-schedules.png', alt: 'Planification - Rapports automatisés' },
  { src: '/app-analytics.png', alt: 'Analytics - Activité et statistiques' }
];
let carouselInterval: number | null = null;

onMounted(() => {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Start carousel auto-play
  startCarousel();
});

onUnmounted(() => {
  stopCarousel();
});

function startCarousel() {
  carouselInterval = window.setInterval(() => {
    nextSlide();
  }, 4000); // Change slide every 4 seconds
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
}

function goToSlide(index: number) {
  currentSlide.value = index;
  stopCarousel();
  startCarousel(); // Restart auto-play
}

const features = [
  { 
    icon: Github, 
    title: 'Connexion GitHub', 
    desc: 'Authentification OAuth sécurisée. Accédez à vos dépôts en toute sécurité.'
  },
  { 
    icon: FileText, 
    title: 'Génération automatique', 
    desc: 'Récupération intelligente des commits et formatage professionnel.'
  },
  { 
    icon: Mail, 
    title: 'Envoi Email', 
    desc: 'Templates HTML élégants envoyés via Nodemailer.'
  },
  { 
    icon: MessageSquare, 
    title: 'WhatsApp', 
    desc: 'Notifications instantanées via Twilio WhatsApp API.'
  },
  { 
    icon: Calendar, 
    title: 'Planification', 
    desc: 'Rapports automatiques programmés à votre rythme.'
  },
  { 
    icon: Clock, 
    title: 'Historique', 
    desc: 'Consultez tous vos rapports envoyés en un clin d\'œil.'
  }
];

function navigateToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="landing">
    <!-- Animated Background Effects -->
    <div class="beam-background"></div>
    <div class="radial-glow glow-top"></div>
    <div class="radial-glow glow-bottom"></div>
    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-container">
        <div class="logo">
          <Terminal :size="24" />
          <span>Git Reporter</span>
        </div>
        <div class="nav-links">
          <button @click="navigateToLogin" class="btn-ghost">Connexion</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title fade-in">
          Rapports Git pour<br>développeurs
        </h1>
        
        <p class="hero-desc fade-in">
          Générez et envoyez automatiquement vos rapports de commits.<br>
          Gagnez du temps, concentrez-vous sur le code.
        </p>
        
        <div class="hero-cta fade-in">
          <button @click="navigateToLogin" class="btn-primary large">
            <Github :size="20" />
            Commencer avec GitHub
          </button>
        </div>
      </div>
    </section>

    <!-- App Preview Section -->
    <section class="app-preview">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Interface simple et intuitive</h2>
          <p>Créez, personnalisez et envoyez vos rapports Git en quelques clics.</p>
        </div>

        <div class="carousel-wrapper fade-in">
          <div class="screenshot-glow"></div>
          
          <!-- Carousel Container -->
          <div class="carousel-container">
            <div 
              class="carousel-track"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <div 
                v-for="(slide, index) in slides" 
                :key="index"
                class="carousel-slide"
              >
                <div class="app-screenshot">
                  <img :src="slide.src" :alt="slide.alt" />
                </div>
              </div>
            </div>

            <!-- Navigation Arrows -->
            <button 
              @click="prevSlide" 
              class="carousel-btn carousel-btn-prev"
              aria-label="Image précédente"
            >
              <ChevronLeft :size="24" />
            </button>
            <button 
              @click="nextSlide" 
              class="carousel-btn carousel-btn-next"
              aria-label="Image suivante"
            >
              <ChevronRight :size="24" />
            </button>
          </div>

          <!-- Dots Indicator -->
          <div class="carousel-dots">
            <button
              v-for="(slide, index) in slides"
              :key="index"
              @click="goToSlide(index)"
              :class="['dot', { active: currentSlide === index }]"
              :aria-label="`Aller à l'image ${index + 1}`"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Des fonctionnalités pensées pour les équipes de développement modernes.</p>
        </div>

        <div class="features-grid">
          <div 
            v-for="(feature, idx) in features" 
            :key="idx"
            class="feature-card fade-in"
          >
            <div class="feature-icon">
              <component :is="feature.icon" :size="24" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Comment ça marche</h2>
          <p>Trois étapes simples pour automatiser vos rapports Git.</p>
        </div>

        <div class="steps">
          <div class="step fade-in">
            <div class="step-number">01</div>
            <div class="step-content">
              <h3>Connectez</h3>
              <p>Liez votre compte GitHub via OAuth. Sélectionnez vos dépôts en toute sécurité.</p>
            </div>
          </div>

          <div class="step fade-in">
            <div class="step-number">02</div>
            <div class="step-content">
              <h3>Configurez</h3>
              <p>Choisissez la période, les destinataires et le format de vos rapports.</p>
            </div>
          </div>

          <div class="step fade-in">
            <div class="step-number">03</div>
            <div class="step-content">
              <h3>Envoyez</h3>
              <p>Rapport généré et envoyé automatiquement par Email ou WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-card fade-in">
          <h2>Prêt à automatiser vos rapports ?</h2>
          <p>Rejoignez les équipes qui utilisent Git Reporter pour gagner du temps.</p>
          <button @click="navigateToLogin" class="btn-primary large">
            Commencer gratuitement
          </button>
          <div class="trust-badges">
            <span>
              <CheckCircle2 :size="16" />
              100% Gratuit et Open Source
            </span>
            <span>
              <CheckCircle2 :size="16" />
              Aucune carte bancaire requise
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <Terminal :size="20" />
            <span>Git Reporter</span>
          </div>
          <div class="footer-links">
            <a href="https://github.com" target="_blank">Documentation</a>
            <a href="https://github.com" target="_blank">GitHub</a>
            <a href="mailto:support@gitreporter.com">Support</a>
          </div>
          <div class="footer-copy">
            © 2024 Git Reporter. Fait avec ❤️ pour les développeurs.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* --- Variables --- */
.landing {
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
}

@media (prefers-color-scheme: dark) {
  .landing {
    --bg-primary: #0a0a0a;
    --bg-secondary: #171717;
    --text-primary: #ededed;
    --text-secondary: #a3a3a3;
    --border: #262626;
    --accent: #ffffff;
  }
}

/* --- Typography --- */
h1, h2, h3 {
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* --- Navigation --- */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
}

@media (prefers-color-scheme: dark) {
  .nav {
    background: rgba(10, 10, 10, 0.8);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
}

/* --- Buttons --- */
.btn-primary,
.btn-secondary,
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent);
  color: var(--bg-primary);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary.large {
  padding: 0.875rem 2rem;
  font-size: 1rem;
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  color: var(--text-primary);
}

/* --- Hero --- */
.hero {
  padding: 12rem 0 8rem;
  text-align: center;
  position: relative;
  z-index: 10;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 2rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.hero-desc {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* --- Animated Background --- */
.beam-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(59, 130, 246, 0.03) 50%,
    transparent 100%
  );
  background-size: 100% 200%;
  animation: beams 60s linear infinite;
  filter: blur(30px);
}

@keyframes beams {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}

.radial-glow {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.glow-top {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  top: -20%;
  left: -10%;
  animation: float 20s ease-in-out infinite;
}

.glow-bottom {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  bottom: -15%;
  right: -10%;
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* --- App Preview --- */
.app-preview {
  padding: 8rem 0;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.carousel-wrapper {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  overflow: hidden; /* Empêche de voir les autres slides */
  mask-image: radial-gradient(
    ellipse 100% 100% at 50% 50%,
    black 40%,
    transparent 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 100% 100% at 50% 50%,
    black 40%,
    transparent 100%
  );
}

.screenshot-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(59, 130, 246, 0.2) 0%,
    transparent 50%
  );
  filter: blur(60px);
  z-index: 0;
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.carousel-container {
  position: relative;
  z-index: 1;
  overflow: hidden; /* Important : cache les slides hors vue */
  border-radius: 1rem;
  width: 100%; /* Assure que le conteneur prend toute la largeur */
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%; /* Le track prend 100% de la largeur */
}

.carousel-slide {
  min-width: 100%; /* Chaque slide prend exactement 100% */
  max-width: 100%; /* Empêche le débordement */
  flex-shrink: 0;
  box-sizing: border-box; /* Inclut padding et border dans la largeur */
}

.app-screenshot {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.app-screenshot img {
  width: 100%;
  height: auto;
  display: block;
}

/* Carousel Navigation Buttons */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn-prev {
  left: 1rem;
}

.carousel-btn-next {
  right: 1rem;
}

/* Carousel Dots */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
  position: relative;
  z-index: 10;
}

.carousel-dots .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dots .dot:hover {
  background: var(--text-secondary);
  transform: scale(1.2);
}

.carousel-dots .dot.active {
  background: var(--accent);
  width: 32px;
  border-radius: 5px;
}

@media (prefers-color-scheme: dark) {
  .app-screenshot {
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 20px 25px -5px rgba(0, 0, 0, 0.5),
      0 10px 10px -5px rgba(0, 0, 0, 0.3);
  }
  
  .carousel-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .carousel-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-btn {
    width: 40px;
    height: 40px;
  }
  
  .carousel-btn-prev {
    left: 0.5rem;
  }
  
  .carousel-btn-next {
    right: 0.5rem;
  }
}

/* --- Integration --- */
.integration {
  padding: 8rem 0;
  background: var(--bg-secondary);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.code-demo {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.code-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.code-dots {
  display: flex;
  gap: 0.5rem;
}

.code-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border);
}

.code-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: 'Fira Code', monospace;
}

.code-body {
  padding: 2rem 1.5rem;
  overflow-x: auto;
}

.code-body pre {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 0.9375rem;
  line-height: 1.7;
}

.code-body code {
  color: var(--text-primary);
}

.code-keyword { color: #d946ef; font-weight: 600; }
.code-string { color: #22c55e; }
.code-function { color: #3b82f6; }
.code-property { color: #f59e0b; }
.code-comment { color: var(--text-secondary); font-style: italic; }

.code-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.link-button:hover {
  color: var(--text-primary);
}

/* --- Features --- */
.features {
  padding: 8rem 0;
  position: relative;
  z-index: 10;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  background: var(--bg-primary);
}

.feature-card:hover {
  border-color: var(--text-secondary);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .feature-card:hover {
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
  }
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--accent);
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* --- How it Works --- */
.how-it-works {
  padding: 8rem 0;
  background: var(--bg-secondary);
  position: relative;
  z-index: 10;
}

.steps {
  max-width: 800px;
  margin: 0 auto;
}

.step {
  display: flex;
  gap: 2rem;
  padding: 3rem 0;
  border-bottom: 1px solid var(--border);
}

.step:last-child {
  border-bottom: none;
}

.step-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-secondary);
  opacity: 0.3;
  line-height: 1;
}

.step-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 1.0625rem;
}

/* --- CTA --- */
.cta {
  padding: 8rem 0;
  position: relative;
  z-index: 10;
}

.cta-card {
  text-align: center;
  padding: 5rem 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 1rem;
}

.cta-card h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-card p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.trust-badges span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

/* --- Footer --- */
.footer {
  padding: 4rem 0;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--text-primary);
}

.footer-copy {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* --- Animations --- */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    display: none;
  }
  
  .hero {
    padding: 8rem 0 4rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
