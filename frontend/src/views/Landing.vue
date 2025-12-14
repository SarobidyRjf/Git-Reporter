<script setup lang="ts">
/**
 * Landing Page - Theme "Velocity"
 * High-end SaaS Aesthetic: Deep space, glowing orbs, glassmorphism, bento-grid.
 */
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Github, 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  Code2, 
  Terminal 
} from 'lucide-vue-next';

const router = useRouter();
const isLoaded = ref(false);

onMounted(() => {
  // Trigger entry animations
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);

  // Intersection Observer for scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
});

// Mouse interact for Hero 3D Tilt
const heroVisual = ref<HTMLElement | null>(null);
const codeWindow = ref<HTMLElement | null>(null);

function handleMouseMove(e: MouseEvent) {
  if (!heroVisual.value || !codeWindow.value) return;
  
  const rect = heroVisual.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Normalize -1 to 1
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
  const rotateY = ((x - centerX) / centerX) * 10;
  
  codeWindow.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
}

function handleMouseLeave() {
  if (!codeWindow.value) return;
  codeWindow.value.style.transform = `perspective(1000px) rotateX(10deg) rotateY(0deg) scale(0.95)`;
}

const features = [
  { 
    icon: Zap, 
    title: 'Lightning Fast', 
    desc: 'Generate comprehensive reports in milliseconds. Engine optimized for large repositories.',
    class: 'col-span-12 md:col-span-8',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    icon: Shield, 
    title: 'Enterprise Grade', 
    desc: 'Bank-level encryption with OAuth 2.0. Your data never leaves your secure context.',
    class: 'col-span-12 md:col-span-4',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  { 
    icon: Clock, 
    title: 'Auto-Pilot', 
    desc: 'Set it and forget it. Scheduled reporting via Cron-like precision without the headache.',
    class: 'col-span-12 md:col-span-4',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  { 
    icon: BarChart3, 
    title: 'Deep Analytics', 
    desc: 'Visualize team velocity, impact, and code churn with stunning interactive charts.',
    class: 'col-span-12 md:col-span-8',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  }
];

const steps = [
  { num: '01', title: 'Connect', desc: 'Link your GitHub repositories securely.' },
  { num: '02', title: 'Configure', desc: 'Select templates and schedule frequency.' },
  { num: '03', title: 'Deploy', desc: 'Receive automated insights instantly.' }
];

function navigateToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="landing-page">
    <div class="noise-overlay"></div>
    
    <!-- Ambient Background Glows -->
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <!-- Navigation -->
    <nav class="nav glass-panel">
      <div class="nav-container">
        <div class="logo">
          <Terminal class="logo-icon" />
          <span class="logo-text">Git Reporter<span class="dot">.</span></span>
        </div>
        <div class="nav-actions">
          <button @click="navigateToLogin" class="btn-ghost">Sign In</button>
          <button @click="navigateToLogin" class="btn-primary small">
            Get Started
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="status-pill slide-up-1">
          <div class="status-dot"></div>
          <span>v2.0 Now Available</span>
        </div>
        
        <h1 class="hero-title slide-up-2">
          Stop Writing Reports.<br>
          <span class="text-gradient">Start Shipping Code.</span>
        </h1>
        
        <p class="hero-desc slide-up-3">
          The autonomous reporting engine for high-performance engineering teams. 
          Turn commits into stunning insights, automatically.
        </p>
        
        <div class="hero-cta slide-up-4">
          <button @click="navigateToLogin" class="btn-primary magnetic">
            <Github class="icon" />
            <span>Connect with GitHub</span>
          </button>
          <button @click="navigateToLogin" class="btn-secondary">
            View Live Demo
            <ArrowRight class="icon-arrow" />
          </button>
        </div>

        <!-- UI Mockup / abstract viz -->
        <div 
          class="hero-visual slide-up-5" 
          ref="heroVisual"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <div class="code-window glass-panel" ref="codeWindow">
            <div class="window-header">
              <div class="dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="bar">git-reporter — generate</div>
            </div>
            <div class="window-body">
              <div class="code-line"><span class="blue">➜</span> <span class="purple">git-reporter</span> init</div>
              <div class="code-line"><span class="green">✔</span> Analyzing complete history...</div>
              <div class="code-line"><span class="green">✔</span> Generating team velocity chart...</div>
              <div class="code-line"><span class="green">✔</span> Report sent to <span class="underline">team@company.com</span></div>
              <div class="code-line typing">_</div>
            </div>
            <div class="visual-glow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="features">
      <div class="section-header scroll-reveal">
        <h2>Engineered for Scale</h2>
        <p>Everything you need to track progress without the micromanagement.</p>
      </div>
      
      <div class="bento-grid">
        <div 
          v-for="(feature, idx) in features" 
          :key="idx"
          class="bento-card glass-panel scroll-reveal"
          :class="feature.class"
        >
          <div class="card-bg" :class="`bg-gradient-to-br ${feature.gradient}`"></div>
          <div class="card-content">
            <div class="icon-box">
              <component :is="feature.icon" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="steps">
      <div class="steps-container">
        <div v-for="(step, i) in steps" :key="i" class="step-item scroll-reveal">
          <div class="step-line" v-if="i !== steps.length - 1"></div>
          <div class="step-num">{{ step.num }}</div>
          <h4>{{ step.title }}</h4>
          <p>{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bottom-cta">
      <div class="cta-card glass-panel scroll-reveal">
        <div class="glow-effect"></div>
        <h2>Ready to upgrade your workflow?</h2>
        <p>Join elite teams using Git Reporter today.</p>
        <button @click="navigateToLogin" class="btn-primary large">
          Start for Free
        </button>
        <div class="trust-badges">
          <span><CheckCircle2 :size="14"/> No credit card required</span>
          <span><CheckCircle2 :size="14"/> 14-day Pro trial included</span>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <Terminal size="20" />
          <span>Git Reporter</span>
        </div>
        <div class="footer-links">
          <span>© 2024 Git Reporter Inc.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* --- Tokens & Base --- */
.landing-page {
  --bg-dark: #030712;
  --bg-card: rgba(17, 24, 39, 0.7);
  --primary: #3b82f6;
  --primary-glow: rgba(59, 130, 246, 0.5);
  --secondary: #8b5cf6;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --glass-border: rgba(255, 255, 255, 0.08);
  
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  selection-background-color: var(--primary);
  selection-color: white;
}

h1, h2, h3, h4 {
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.02em;
}

/* --- Ambient Effects --- */
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
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -10%;
  left: -10%;
}

.glow-2 {
  width: 400px;
  height: 400px;
  background: var(--secondary);
  bottom: 20%;
  right: -5%;
  animation-delay: 2s;
}

@keyframes breathe {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.5; transform: scale(1.1); }
}

/* --- Glassmorphism --- */
.glass-panel {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* --- Navigation --- */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  border-bottom: 1px solid var(--glass-border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  font-family: 'Outfit', sans-serif;
}

.dot { color: var(--primary); }

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* --- Buttons --- */
.btn-primary, .btn-secondary, .btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), #2563eb);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4), 0 8px 24px rgba(59, 130, 246, 0.5);
}

.btn-primary.small { padding: 0.5rem 1rem; font-size: 0.875rem; }
.btn-primary.large { padding: 1rem 2.5rem; font-size: 1.1rem; }

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: none;
  padding: 0.5rem 1rem;
}

.btn-ghost:hover { color: var(--text-main); }

/* --- Hero Section --- */
.hero {
  position: relative;
  padding: 180px 1.5rem 100px;
  text-align: center;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.text-gradient {
  background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.text-gradient::after {
  content: 'Start Shipping Code.';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.5;
  filter: blur(20px);
  z-index: -1;
}

.hero-desc {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 5rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 2rem;
  font-size: 0.875rem;
  color: #60a5fa;
  margin-bottom: 2rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #60a5fa;
  border-radius: 50%;
  box-shadow: 0 0 10px #60a5fa;
}

/* --- Hero Visual --- */
.hero-visual {
  max-width: 800px;
  margin: 0 auto;
  perspective: 1000px;
}

.code-window {
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  transform: perspective(1000px) rotateX(10deg) scale(0.95);
  transition: transform 0.2s ease-out; /* Faster for mouse move */
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.hero-visual:hover .code-window {
  transform: rotateX(0) scale(1);
}

.window-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.red { background: #ef4444; }
.yellow { background: #eab308; }
.green { background: #22c55e; }

.bar {
  margin-left: 1rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: #64748b;
}

.window-body {
  padding: 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  color: #e2e8f0;
  line-height: 1.6;
}

.code-line { margin-bottom: 0.5rem; }
.blue { color: #60a5fa; }
.purple { color: #c084fc; font-weight: bold; }
.green { color: #4ade80; }
.underline { text-decoration: underline; text-decoration-color: #475569; }

.typing {
  animation: blink 1s step-end infinite;
}

/* --- Features --- */
.features {
  padding: 6rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.bento-card {
  border-radius: 1.5rem;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  min-height: 280px;
}

.bento-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.card-bg {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.bento-card:hover .card-bg { opacity: 1; }

.card-content {
  position: relative;
  z-index: 1;
}

.icon-box {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.bento-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.bento-card p {
  color: var(--text-muted);
  line-height: 1.6;
}

/* --- Steps --- */
.steps {
  padding: 6rem 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: center;
}

.step-item { position: relative; }

.step-num {
  font-family: 'Outfit', sans-serif;
  font-size: 4rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.03);
  position: absolute;
  top: -2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
}

.step-item h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  color: var(--primary);
}

.step-item p {
  color: var(--text-muted);
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

/* --- Bottom CTA --- */
.bottom-cta {
  padding: 6rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.cta-card {
  padding: 5rem 2rem;
  text-align: center;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
}

.glow-effect {
  position: absolute;
  top: -50%;
  left: 50%;
  width: 100%;
  height: 200%;
  background: conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(59, 130, 246, 0.1) 180deg, transparent 360deg);
  transform: translateX(-50%);
  animation: rotate 10s linear infinite;
  pointer-events: none;
}

.cta-card h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-card p {
  color: var(--text-muted);
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.trust-badges {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.trust-badges span { display: flex; align-items: center; gap: 6px; }

/* --- Footer --- */
.footer {
  border-top: 1px solid var(--glass-border);
  padding: 2rem 0;
  background: rgba(3, 7, 18, 0.8);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 0.9rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
}

/* --- Animations --- */
@keyframes blink { 50% { opacity: 0; } }
@keyframes rotate { from { transform: translateX(-50%) rotate(0deg); } to { transform: translateX(-50%) rotate(360deg); } }

.slide-up-1 { opacity: 0; transform: translateY(20px); animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.1s; }
.slide-up-2 { opacity: 0; transform: translateY(20px); animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.2s; }
.slide-up-3 { opacity: 0; transform: translateY(20px); animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.3s; }
.slide-up-4 { opacity: 0; transform: translateY(20px); animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.4s; }
.slide-up-5 { opacity: 0; transform: translateY(40px); animation: slideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.5s; }

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Mobile Tweaks */
@media (max-width: 768px) {
  .hero-title { font-size: 3rem; }
  .bento-grid { grid-template-columns: 1fr; }
  .col-span-12, .col-span-8, .col-span-4 { grid-column: span 1 / -1; }
  .steps-container { grid-template-columns: 1fr; gap: 3rem; }
  .hero-cta { flex-direction: column; }
}
</style>
