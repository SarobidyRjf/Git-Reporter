# 🚀 Git Reporter

Une application web moderne pour générer et envoyer automatiquement des rapports de commits Git par Email ou WhatsApp.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 À propos

**Git Reporter** est une application fullstack moderne qui permet aux développeurs de :
- Se connecter avec leur compte GitHub via OAuth
- Sélectionner un dépôt Git
- Récupérer automatiquement les derniers commits
- Éditer le contenu du rapport dans une interface intuitive
- Envoyer le rapport par Email ou WhatsApp
- Consulter l'historique des rapports envoyés

Parfait pour les comptes rendus quotidiens, les revues de code, ou le suivi de projet !

## ✨ Fonctionnalités

### Authentification
- ✅ Connexion OAuth avec GitHub
- ✅ Authentification sécurisée par JWT
- ✅ Gestion des sessions utilisateur

### Gestion des Commits
- ✅ Récupération automatique des commits depuis GitHub
- ✅ Filtrage par date et dépôt
- ✅ Formatage intelligent des messages de commit
- ✅ Édition en temps réel du contenu

### Envoi de Rapports
- ✅ Envoi par Email (via Nodemailer)
- ✅ Envoi par WhatsApp (via Twilio)
- ✅ Templates HTML professionnels
- ✅ Historique complet des envois

### Interface Utilisateur
- ✅ Design moderne type GitHub
- ✅ Interface responsive (mobile-friendly)
- ✅ Mode sombre/clair
- ✅ Composants réutilisables avec shadcn/ui

## 🛠️ Stack Technique

### Frontend
- **Framework** : Vue 3 avec Composition API
- **Build Tool** : Vite
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **UI Components** : shadcn/ui (Vue)
- **State Management** : Pinia (à implémenter)
- **Routing** : Vue Router (à implémenter)
- **HTTP Client** : Axios

### Backend
- **Runtime** : Node.js (≥ 20)
- **Framework** : Express.js
- **Langage** : TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : OAuth GitHub + JWT
- **Logging** : Winston
- **Validation** : Zod (à implémenter)

### Services Externes
- **GitHub API** : Récupération des commits et dépôts
- **Nodemailer** : Envoi d'emails
- **Twilio** : Envoi de messages WhatsApp

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) version 20 ou supérieure
- [PostgreSQL](https://www.postgresql.org/) version 14 ou supérieure
- [Git](https://git-scm.com/)
- Un compte [GitHub](https://github.com) (pour OAuth)
- (Optionnel) Un compte [Twilio](https://www.twilio.com) pour WhatsApp
- (Optionnel) Un compte Gmail avec mot de passe d'application

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd git-reporter
```

### 2. Installation du Backend

```bash
cd backend
npm install
```

### 3. Installation du Frontend

```bash
cd ../frontend
npm install
```

### 4. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE git_reporter;

# Quitter
\q
```

### 5. Configuration des variables d'environnement

#### Backend

Créez un fichier `.env` dans le dossier `backend` :

```bash
cd backend
cp .env.example .env
```

Éditez le fichier `.env` et remplissez les valeurs :

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/git_reporter"

# Server
PORT=4000
NODE_ENV=development

# JWT (générez une clé sécurisée)
JWT_SECRET=your_super_secret_jwt_key

# Frontend
FRONTEND_URL=http://localhost:5173

# GitHub OAuth (voir section Configuration GitHub)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio WhatsApp (optionnel)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Logging
LOG_LEVEL=debug
```

### 6. Initialiser la base de données

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## ⚙️ Configuration

### Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez :
   - **Application name** : Git Reporter (Dev)
   - **Homepage URL** : `http://localhost:5173`
   - **Authorization callback URL** : `http://localhost:4000/api/auth/github/callback`
4. Cliquez sur "Register application"
5. Copiez le **Client ID** et générez un **Client Secret**
6. Ajoutez-les dans votre fichier `.env`

### Configuration Email (Gmail)

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez sur [Google Account Security](https://myaccount.google.com/security)
   - Cherchez "Mots de passe des applications"
   - Créez un nouveau mot de passe pour "Git Reporter"
3. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

### Configuration Twilio WhatsApp

1. Créez un compte sur [Twilio](https://www.twilio.com/try-twilio)
2. Accédez à la console Twilio
3. Activez WhatsApp (mode sandbox pour les tests)
4. Récupérez vos credentials :
   - **Account SID**
   - **Auth Token**
   - **WhatsApp Number** (généralement `whatsapp:+14155238886` en sandbox)
5. Ajoutez-les dans votre fichier `.env`

**Note** : En sandbox, vous devez envoyer le code d'activation à votre numéro WhatsApp.

## 🎮 Lancement

### Mode Développement

Lancez le backend et le frontend dans deux terminaux séparés :

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:4000`

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

### Mode Production

**Backend :**
```bash
cd backend
npm run build
npm start
```

**Frontend :**
```bash
cd frontend
npm run build
npm run preview
```

## 🏗️ Architecture

```
git-reporter/
├── backend/                    # API REST Express.js
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de base de données
│   │   └── migrations/        # Migrations Prisma
│   ├── src/
│   │   ├── config/            # Configuration (env, etc.)
│   │   ├── controllers/       # Contrôleurs (logique métier)
│   │   ├── middlewares/       # Middlewares Express
│   │   ├── services/          # Services (GitHub, Email, WhatsApp)
│   │   ├── routes/            # Routes Express
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Utilitaires (logger, etc.)
│   │   ├── db.ts              # Client Prisma
│   │   └── index.ts           # Point d'entrée
│   ├── .env                   # Variables d'environnement (ne pas commit)
│   ├── .env.example           # Exemple de .env
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                   # Application Vue 3
│   ├── public/                # Fichiers statiques
│   ├── src/
│   │   ├── assets/            # Images, styles globaux
│   │   ├── components/        # Composants Vue réutilisables
│   │   ├── views/             # Pages/Vues (à créer)
│   │   ├── stores/            # Stores Pinia (à créer)
│   │   ├── router/            # Configuration Vue Router (à créer)
│   │   ├── services/          # Services API (à créer)
│   │   ├── types/             # Types TypeScript (à créer)
│   │   ├── App.vue            # Composant racine
│   │   ├── main.ts            # Point d'entrée
│   │   └── style.css          # Styles Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── doc/                        # Documentation
│   └── details.md             # Détails du projet
│
└── README.md                   # Ce fichier
```

## 📚 Documentation

### Backend

Consultez le [README du Backend](./backend/README.md) pour :
- Documentation complète de l'API
- Guide de déploiement
- Architecture détaillée
- Exemples d'utilisation

### API Endpoints

#### Authentification
- `GET /api/auth/github/login` - Initier OAuth GitHub
- `GET /api/auth/github/callback` - Callback OAuth
- `GET /api/auth/me` - Infos utilisateur (protégé)
- `POST /api/auth/logout` - Déconnexion (protégé)

#### GitHub
- `GET /api/github/repos` - Liste des dépôts (protégé)
- `GET /api/github/commits/:owner/:repo` - Commits d'un dépôt (protégé)

#### Rapports
- `GET /api/reports` - Liste des rapports (protégé)
- `POST /api/reports` - Créer et envoyer un rapport (protégé)
- `GET /api/reports/:id` - Détails d'un rapport (protégé)
- `DELETE /api/reports/:id` - Supprimer un rapport (protégé)

#### Système
- `GET /health` - Health check
- `GET /` - Infos sur l'API

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

*Note : Les tests sont à implémenter*

## 📦 Déploiement

### Backend

**Options recommandées :**
- [Render](https://render.com) (Free tier disponible)
- [Railway](https://railway.app)
- [Fly.io](https://fly.io)
- [Heroku](https://heroku.com)

**Base de données PostgreSQL :**
- [Railway](https://railway.app) (recommandé)
- [Supabase](https://supabase.com)
- [AWS RDS](https://aws.amazon.com/rds/)

### Frontend

**Options recommandées :**
- [Vercel](https://vercel.com) (recommandé, optimisé pour Vite)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

### Guide de déploiement rapide (Render + Vercel)

1. **Backend sur Render**
   - Connectez votre repo GitHub
   - Build Command : `cd backend && npm install && npx prisma generate && npm run build`
   - Start Command : `cd backend && npm start`
   - Ajoutez les variables d'environnement

2. **Frontend sur Vercel**
   - Connectez votre repo GitHub
   - Framework : Vite
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Ajoutez la variable `VITE_API_URL` pointant vers votre backend Render

3. **Base de données sur Railway**
   - Créez un nouveau projet PostgreSQL
   - Copiez la `DATABASE_URL`
   - Ajoutez-la dans les variables d'environnement Render

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- **TypeScript** : Utilisez les types partout
- **ESLint** : Respectez les règles de linting
- **Prettier** : Formatez votre code avant de commit
- **Commits** : Utilisez des messages clairs et descriptifs
- **Documentation** : Documentez vos fonctions et composants

## 🐛 Bugs connus et TODO

### À implémenter

- [ ] Controllers complets (reports, commits)
- [ ] Routes Frontend (Dashboard, Historique, Paramètres)
- [ ] Store Pinia pour la gestion d'état
- [ ] Composants UI (CommitList, ReportForm, etc.)
- [ ] Tests unitaires et d'intégration
- [ ] Rate limiting sur l'API
- [ ] Validation avec Zod
- [ ] Documentation Swagger/OpenAPI
- [ ] Cache avec Redis
- [ ] Système de notifications
- [ ] Export des rapports en PDF
- [ ] Webhooks pour événements

### Améliorations futures

- [ ] Support de GitLab et Bitbucket
- [ ] Rapports programmés (cron)
- [ ] Statistiques et analytics
- [ ] Thèmes personnalisables
- [ ] Application mobile (React Native)
- [ ] Extension VS Code

## 📝 Changelog

### Version 1.0.0 (En cours)

**Backend :**
- ✅ Architecture complète avec TypeScript
- ✅ Authentification GitHub OAuth + JWT
- ✅ Services GitHub, Email, WhatsApp
- ✅ Logging avec Winston
- ✅ Gestion d'erreurs centralisée
- ✅ Configuration Prisma
- ⏳ Controllers à compléter

**Frontend :**
- ✅ Setup Vue 3 + Vite + TypeScript
- ✅ Configuration Tailwind CSS 4
- ⏳ Composants et pages à créer
- ⏳ Router et store à implémenter

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

**Git Reporter Team**
- Développé avec ❤️ pour apprendre le développement fullstack moderne

## 🙏 Remerciements

- [Vue.js](https://vuejs.org/) pour le framework frontend
- [Express.js](https://expressjs.com/) pour le framework backend
- [Prisma](https://www.prisma.io/) pour l'ORM moderne
- [Tailwind CSS](https://tailwindcss.com/) pour les styles
- [shadcn/ui](https://ui.shadcn.com/) pour les composants
- [GitHub](https://github.com) pour l'API et OAuth
- [Twilio](https://www.twilio.com) pour l'API WhatsApp

## 📞 Support

Pour toute question ou problème :
- 📧 Ouvrez une [issue](https://github.com/your-repo/issues) sur GitHub
- 📖 Consultez la [documentation](./doc/details.md)
- 💬 Rejoignez notre communauté (à venir)

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile sur GitHub !**

Made with 💻 and ☕ by developers, for developers.
