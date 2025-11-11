# Git Reporter - Backend API

API REST moderne pour la génération et l'envoi de rapports de commits Git via Email et WhatsApp.

## 🚀 Stack Technique

- **Runtime**: Node.js (≥ 20)
- **Framework**: Express.js avec TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: OAuth GitHub + JWT
- **Logging**: Winston
- **Services externes**:
  - GitHub API (récupération des commits)
  - Nodemailer (envoi d'emails)
  - Twilio (envoi WhatsApp)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 20 ou supérieure)
- [PostgreSQL](https://www.postgresql.org/) (version 14 ou supérieure)
- [Git](https://git-scm.com/)

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd git-reporter/backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de la base de données

#### Créer une base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE git_reporter;

# Quitter psql
\q
```

#### Configurer les variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend` en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos propres valeurs :

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/git_reporter"

# Server
PORT=4000
NODE_ENV=development

# JWT (générez une clé aléatoire sécurisée)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# GitHub OAuth (voir section Configuration GitHub OAuth)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# Email (voir section Configuration Email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio WhatsApp (voir section Configuration Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Logging
LOG_LEVEL=debug
```

### 4. Initialiser la base de données avec Prisma

```bash
# Génère le client Prisma
npx prisma generate

# Crée les tables dans la base de données
npx prisma migrate dev --name init
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:4000`

## 🔧 Configuration des Services Externes

### Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez les informations :
   - **Application name**: Git Reporter (Dev)
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:4000/auth/github/callback`
4. Cliquez sur "Register application"
5. Copiez le **Client ID** et générez un **Client Secret**
6. Ajoutez-les dans votre fichier `.env`

### Configuration Email (Gmail)

Pour utiliser Gmail comme serveur SMTP :

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez sur [Google Account Security](https://myaccount.google.com/security)
   - Cherchez "Mots de passe des applications"
   - Créez un nouveau mot de passe pour "Git Reporter"
3. Utilisez ce mot de passe dans `EMAIL_PASSWORD` (pas votre mot de passe Gmail)

**Exemple de configuration Gmail :**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Mot de passe d'application
```

### Configuration Twilio WhatsApp

1. Créez un compte sur [Twilio](https://www.twilio.com/try-twilio)
2. Accédez à la console Twilio
3. Activez WhatsApp dans votre projet :
   - Allez dans "Messaging" > "Try it out" > "Send a WhatsApp message"
   - Suivez les instructions pour configurer le sandbox WhatsApp
4. Récupérez vos credentials :
   - **Account SID** : dans le dashboard Twilio
   - **Auth Token** : dans le dashboard Twilio
   - **WhatsApp Number** : `whatsapp:+14155238886` (sandbox)
5. Ajoutez-les dans votre fichier `.env`

**Note** : En mode sandbox, vous devez envoyer un message à votre numéro Twilio WhatsApp avec le code fourni pour activer votre numéro.

## 📚 Scripts Disponibles

```bash
# Développement avec auto-reload
npm run dev

# Build pour la production
npm run build

# Lancer en production
npm start

# Générer le client Prisma
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name <nom_de_la_migration>

# Voir la base de données dans Prisma Studio
npx prisma studio

# Reset de la base de données (ATTENTION: supprime toutes les données)
npx prisma migrate reset
```

## 🏗️ Architecture du Projet

```
backend/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données
│   └── migrations/            # Migrations Prisma
├── src/
│   ├── config/
│   │   └── env.ts             # Configuration des variables d'environnement
│   ├── controllers/
│   │   └── auth.controller.ts # Contrôleurs (logique métier)
│   ├── middlewares/
│   │   ├── auth.middleware.ts # Middleware d'authentification JWT
│   │   ├── error.middleware.ts# Gestion centralisée des erreurs
│   │   └── logger.middleware.ts# Logging des requêtes HTTP
│   ├── services/
│   │   ├── github.service.ts  # Service GitHub API
│   │   ├── email.service.ts   # Service d'envoi d'emails
│   │   └── whatsapp.service.ts# Service WhatsApp (Twilio)
│   ├── routes/                # Routes Express (à créer)
│   ├── types/
│   │   └── index.ts           # Types TypeScript
│   ├── utils/
│   │   └── logger.ts          # Configuration Winston
│   ├── db.ts                  # Instance Prisma Client
│   ├── index.ts               # Point d'entrée de l'application
│   └── generated/             # Client Prisma généré
├── .env                       # Variables d'environnement (ne pas commiter)
├── .env.example               # Exemple de variables d'environnement
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentification

| Méthode | Endpoint                    | Description                      | Auth |
|---------|----------------------------|----------------------------------|------|
| GET     | `/api/auth/github/login`   | Initie le flux OAuth GitHub      | Non  |
| GET     | `/api/auth/github/callback`| Callback OAuth GitHub            | Non  |
| GET     | `/api/auth/me`             | Infos utilisateur connecté       | Oui  |
| POST    | `/api/auth/logout`         | Déconnexion                      | Oui  |

### GitHub

| Méthode | Endpoint                          | Description                  | Auth |
|---------|----------------------------------|------------------------------|------|
| GET     | `/api/github/repos`              | Liste des dépôts utilisateur | Oui  |
| GET     | `/api/github/commits/:owner/:repo`| Commits d'un dépôt          | Oui  |

### Rapports

| Méthode | Endpoint              | Description                    | Auth |
|---------|-----------------------|--------------------------------|------|
| GET     | `/api/reports`        | Liste des rapports             | Oui  |
| POST    | `/api/reports`        | Créer et envoyer un rapport    | Oui  |
| GET     | `/api/reports/:id`    | Détails d'un rapport           | Oui  |
| DELETE  | `/api/reports/:id`    | Supprimer un rapport           | Oui  |

### Système

| Méthode | Endpoint   | Description                 | Auth |
|---------|-----------|----------------------------|------|
| GET     | `/health` | Health check de l'API      | Non  |
| GET     | `/`       | Infos sur l'API            | Non  |

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Flux d'authentification

1. **Login** : L'utilisateur clique sur "Se connecter avec GitHub"
2. **Redirection** : L'utilisateur est redirigé vers GitHub pour autoriser l'application
3. **Callback** : GitHub renvoie un code d'autorisation
4. **Token** : Le backend échange ce code contre un token d'accès GitHub, crée/met à jour l'utilisateur, et génère un JWT
5. **Utilisation** : Le frontend stocke le JWT et l'envoie dans le header `Authorization: Bearer <token>`

### Exemple de requête authentifiée

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:4000/api/auth/me
```

## 🗃️ Modèles de Données

### User

```prisma
model User {
  id        String   @id @default(cuid())
  githubId  String   @unique
  name      String?
  email     String?
  avatarUrl String?
  reports   Report[]
}
```

### Report

```prisma
model Report {
  id        String   @id @default(cuid())
  userId    String
  repoName  String
  content   String
  sentTo    String?
  method    String   // "email" ou "whatsapp"
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

## 📊 Logging

L'application utilise Winston pour un logging structuré.

### Niveaux de logs

- **error** : Erreurs critiques nécessitant une attention
- **warn** : Avertissements sur des situations anormales
- **info** : Informations générales sur le fonctionnement
- **debug** : Informations détaillées pour le débogage

### Configuration des logs

Modifiez `LOG_LEVEL` dans `.env` :

```env
LOG_LEVEL=debug  # Développement
LOG_LEVEL=info   # Production
```

## 🧪 Tests

```bash
# Lancer les tests (à implémenter)
npm test

# Tests avec coverage
npm run test:coverage
```

## 🚀 Déploiement

### Prérequis pour la production

1. Base de données PostgreSQL (Railway, Supabase, AWS RDS)
2. Serveur Node.js (Render, Fly.io, Railway, Heroku)
3. Variables d'environnement configurées

### Étapes de déploiement

1. **Build l'application**

```bash
npm run build
```

2. **Configurer les variables d'environnement**

Assurez-vous que toutes les variables sont définies en production avec des valeurs sécurisées.

3. **Exécuter les migrations**

```bash
npx prisma migrate deploy
```

4. **Démarrer l'application**

```bash
npm start
```

### Déploiement sur Render

1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau "Web Service"
3. Connectez votre repository GitHub
4. Configurez :
   - **Build Command** : `npm install && npx prisma generate && npm run build`
   - **Start Command** : `npm start`
5. Ajoutez les variables d'environnement
6. Déployez !

## 🔒 Sécurité

### Bonnes pratiques implémentées

- ✅ Validation CSRF pour OAuth
- ✅ JWT avec expiration
- ✅ Sanitization des entrées utilisateur
- ✅ CORS configuré
- ✅ Rate limiting (à implémenter)
- ✅ Gestion sécurisée des secrets
- ✅ Logs structurés (pas de données sensibles)

### À ne JAMAIS faire

- ❌ Commiter le fichier `.env`
- ❌ Exposer les tokens d'accès en clair
- ❌ Utiliser des secrets faibles en production
- ❌ Désactiver HTTPS en production

## 🐛 Debugging

### Vérifier la connexion à la base de données

```bash
npx prisma studio
```

### Tester l'API

```bash
# Health check
curl http://localhost:4000/health

# Infos sur l'API
curl http://localhost:4000/
```

### Logs détaillés

Activez le mode debug :

```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📝 TODO

- [ ] Implémenter les controllers manquants
- [ ] Ajouter la validation des données avec Zod
- [ ] Implémenter le rate limiting
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Documenter l'API avec Swagger/OpenAPI
- [ ] Ajouter la pagination pour les listes
- [ ] Implémenter le cache avec Redis
- [ ] Ajouter des webhooks pour les notifications

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

## 👥 Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Consultez la documentation officielle des dépendances
- Vérifiez les logs de l'application

---

**Développé avec ❤️ par l'équipe Git Reporter**
