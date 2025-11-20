# Structure Frontend - Git Reporter

Documentation complète de la structure et de l'organisation du frontend Vue 3 + TypeScript.

## 📁 Structure des Dossiers

```
frontend/
├── public/                      # Assets statiques
│   ├── logo.svg                # Logo de l'application
│   └── favicon.ico             # Favicon
│
├── src/
│   ├── assets/                 # Assets compilés (images, fonts)
│   │
│   ├── components/             # Composants réutilisables
│   │   └── AppLayout.vue       # Layout principal avec sidebar
│   │
│   ├── router/                 # Configuration Vue Router
│   │   └── index.ts            # Routes et guards
│   │
│   ├── services/               # Services et logique métier
│   │   └── api.ts              # Client API Axios
│   │
│   ├── stores/                 # Pinia stores (état global)
│   │   └── auth.store.ts       # Store d'authentification
│   │
│   ├── types/                  # Définitions TypeScript
│   │   └── index.ts            # Types partagés
│   │
│   ├── views/                  # Pages de l'application
│   │   ├── Login.vue           # Page de connexion
│   │   ├── AuthCallback.vue    # Callback OAuth GitHub
│   │   ├── Dashboard.vue       # Page principale - Création de rapports
│   │   ├── History.vue         # Historique des rapports
│   │   ├── Profile.vue         # Profil utilisateur
│   │   ├── Settings.vue        # Paramètres
│   │   └── NotFound.vue        # Page 404
│   │
│   ├── App.vue                 # Composant racine
│   ├── main.ts                 # Point d'entrée
│   └── style.css               # Styles globaux
│
├── DESIGN_SYSTEM.md            # Documentation du design system
├── STRUCTURE_FRONTEND.md       # Ce fichier
├── index.html                  # HTML principal
├── package.json                # Dépendances npm
├── tsconfig.json               # Configuration TypeScript
├── vite.config.ts              # Configuration Vite
└── tailwind.config.js          # Configuration Tailwind CSS
```

## 🎨 Architecture

### Layout Principal (AppLayout.vue)

Le composant `AppLayout` fournit la structure de base pour toutes les pages authentifiées :

**Caractéristiques :**
- Sidebar persistante avec navigation
- Header mobile responsive
- User menu avec déconnexion
- Gestion de l'état ouvert/fermé du sidebar
- Détection de la route active

**Utilisation :**
```vue
<template>
  <AppLayout>
    <!-- Contenu de votre page -->
  </AppLayout>
</template>
```

### Routing

**Routes publiques :**
- `/login` - Page de connexion OAuth GitHub
- `/auth/callback` - Callback OAuth

**Routes protégées :**
- `/dashboard` - Création de rapports (page par défaut)
- `/history` - Historique des rapports
- `/profile` - Profil utilisateur
- `/settings` - Paramètres

**Guards de navigation :**
- Vérification de l'authentification via token JWT
- Redirection automatique vers `/login` si non authentifié
- Redirection vers `/dashboard` si déjà authentifié et tentative d'accès à `/login`

## 📄 Pages

### 1. Dashboard (`/dashboard`)

**Fonctionnalités :**
- Affichage des commits récents (mock data)
- Sélection multiple de commits
- Éditeur de contenu de rapport
- Choix de la méthode d'envoi (Email/WhatsApp)
- Envoi du rapport

**Layout :**
- Split screen : commits à gauche, éditeur à droite
- Responsive : stack vertical sur mobile

### 2. History (`/history`)

**Fonctionnalités :**
- Liste des rapports envoyés
- Filtres par méthode (Email/WhatsApp)
- Recherche par contenu/destinataire
- Pagination
- Statistiques (total, email, whatsapp)
- Affichage détaillé en modal
- Suppression de rapport
- Téléchargement de rapport

**Layout :**
- Cards avec preview du rapport
- Actions au hover (voir, télécharger, supprimer)
- Modals pour détails et confirmation de suppression

### 3. Profile (`/profile`)

**Fonctionnalités :**
- Informations utilisateur GitHub
- Statistiques d'utilisation
- Graphiques de répartition
- Activité récente
- Badges et réalisations

**Layout :**
- Header avec informations utilisateur
- Grid de statistiques
- Timeline d'activité

### 4. Settings (`/settings`)

**Fonctionnalités :**
- Notifications (email, rapports, digest)
- Configuration Email (destinataire, signature)
- Configuration WhatsApp (numéro, format)
- Configuration GitHub (branche, commits max)
- Apparence (thème, langue, format date)
- Confidentialité (analytics, historique)

**Layout :**
- Sections organisées par catégorie
- Toggles et inputs intuitifs
- Sauvegarde avec feedback

## 🔐 Authentification

### Flux OAuth GitHub

1. Utilisateur clique sur "Se connecter avec GitHub" sur `/login`
2. Redirection vers GitHub pour autorisation
3. GitHub redirige vers `/auth/callback?code=...`
4. Backend échange le code contre un token
5. Frontend reçoit le JWT et l'utilisateur
6. Store et localStorage mis à jour
7. Redirection vers `/dashboard`

### Store d'authentification (auth.store.ts)

**État :**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean
}
```

**Actions :**
- `initiateLogin()` - Lance le flux OAuth
- `handleCallback(code)` - Traite le callback OAuth
- `logout()` - Déconnexion
- `checkAuth()` - Vérifie l'authentification

### Service API (api.ts)

**Intercepteurs :**
- Ajout automatique du token JWT
- Gestion des erreurs 401 (déconnexion)
- Logging en développement

**Méthodes principales :**
```typescript
// Auth
initiateGitHubLogin()
handleGitHubCallback(code)

// GitHub
getUserRepositories()
getRepositoryCommits(owner, repo)

// Reports
getReports(filters)
createReport(data)
deleteReport(id)

// User
getUserStats()
```

## 🎨 Design System

### Couleurs

**Backgrounds :**
- `bg-zinc-950` - Fond principal
- `bg-zinc-900` - Cartes
- `bg-zinc-800` - Bordures

**Accents :**
- Purple/Blue gradient - Actions principales
- Blue - Email
- Green - WhatsApp
- Red - Erreurs/Suppression

### Composants Réutilisables

**Buttons :**
- Primary : Gradient purple-blue avec shadow
- Secondary : Zinc-800 hover zinc-700
- Icon : Transparent hover zinc-800

**Cards :**
- Standard : bg-zinc-900/50 border zinc-800 rounded-xl
- Interactive : + hover states
- Gradient : bg-gradient avec accent colors

**Inputs :**
- Text/Textarea : bg-zinc-900 border zinc-800
- Focus : ring-2 ring-purple-500/50
- Checkbox : rounded bg-zinc-800

**Icons :**
- lucide-vue-next
- Tailles : 16, 18, 20, 24
- Containers avec bg colored/10

### Responsive

**Breakpoints :**
- `sm: 640px` - Mobile landscape
- `md: 768px` - Tablet
- `lg: 1024px` - Desktop
- `xl: 1280px` - Large desktop

**Mobile First :**
- Sidebar : transform translateX sur mobile
- Grids : stack vertical sur mobile
- Spacing réduit sur mobile

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Git Reporter
VITE_GITHUB_CLIENT_ID=your_client_id
```

### Vite Config

- Port : 5173 (dev)
- Proxy vers backend (optionnel)
- Build optimisé pour production

### Tailwind Config

- Zinc color palette
- Custom animations
- JIT mode activé
- Purge CSS en production

## 📦 Dépendances Principales

```json
{
  "vue": "^3.4.x",
  "vue-router": "^4.2.x",
  "pinia": "^2.1.x",
  "axios": "^1.6.x",
  "lucide-vue-next": "^0.x",
  "tailwindcss": "^3.4.x",
  "typescript": "^5.3.x",
  "vite": "^5.0.x"
}
```

## 🚀 Commandes

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📝 Conventions de Code

### Composants Vue

**Structure :**
```vue
<script setup lang="ts">
// Imports
// Refs/Reactive
// Computed
// Functions
// Lifecycle hooks
</script>

<template>
  <!-- HTML avec Tailwind classes -->
</template>

<style scoped>
/* Styles spécifiques si nécessaire */
</style>
```

### Naming

- **Components** : PascalCase (`AppLayout.vue`)
- **Views** : PascalCase (`Dashboard.vue`)
- **Files** : kebab-case (`auth.store.ts`)
- **Functions** : camelCase (`handleLogin()`)
- **Constants** : UPPER_SNAKE_CASE (`API_BASE_URL`)

### TypeScript

- Toujours typer les paramètres de fonction
- Utiliser les interfaces pour les objets
- Éviter `any`, préférer `unknown`
- Utiliser les types utilitaires (Partial, Pick, etc.)

## 🎯 Best Practices

### Performance

1. **Lazy loading des routes** - Chargement à la demande
2. **Computed vs Methods** - Utiliser computed pour valeurs calculées
3. **v-if vs v-show** - v-if pour conditions rares, v-show pour toggles fréquents
4. **Key dans v-for** - Toujours utiliser une key unique

### Accessibilité

1. **Semantic HTML** - Utiliser les balises appropriées
2. **ARIA labels** - Pour les actions sans texte
3. **Focus states** - Visible avec focus:ring
4. **Keyboard navigation** - Testée sur tous les composants

### SEO

1. **Meta tags** - Mis à jour par route
2. **Title dynamique** - Via router guard
3. **Semantic structure** - Headers hiérarchiques

## 🐛 Debugging

### Vue DevTools

- Installer l'extension browser
- Inspecter les composants
- Vérifier les stores Pinia
- Suivre les events

### Console Logs

Les logs sont actifs en développement :
- 🧭 Navigation
- 🔒 Auth guards
- 📡 API calls
- ⚠️ Erreurs

### Network Tab

Vérifier les appels API :
- Status codes
- Request/Response headers
- Payload
- Timing

## 📚 Ressources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Maintenu par :** Équipe Git Reporter
**Dernière mise à jour :** Janvier 2024
**Version :** 1.0.0
