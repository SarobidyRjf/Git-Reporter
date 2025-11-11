# 🚀 Guide de Démarrage Rapide - Git Reporter

Ce guide vous permet de lancer Git Reporter en **moins de 10 minutes** !

## ✅ Checklist Rapide

- [ ] Node.js 20+ installé
- [ ] PostgreSQL installé et démarré
- [ ] Compte GitHub (pour OAuth)
- [ ] 10 minutes de votre temps ⏱️

## 📦 Installation Express (5 minutes)

### 1. Clone et Installation

```bash
# Cloner le projet
git clone <repository-url>
cd git-reporter

# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

### 2. Base de Données (1 minute)

```bash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE git_reporter;"

# Ou si vous préférez l'interface graphique PostgreSQL (pgAdmin), créez une DB nommée "git_reporter"
```

### 3. Configuration Backend (2 minutes)

```bash
cd backend

# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs minimales :
# - DATABASE_URL (déjà configuré pour PostgreSQL local)
# - JWT_SECRET (générez une clé aléatoire)
# - GITHUB_CLIENT_ID et GITHUB_CLIENT_SECRET (voir étape 4)
```

**Valeurs minimales pour démarrer :**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/git_reporter"
JWT_SECRET="votre_cle_secrete_aleatoire_ici"
FRONTEND_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
LOG_LEVEL=debug

# Ces trois lignes sont OBLIGATOIRES pour l'authentification GitHub
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# Email et WhatsApp sont OPTIONNELS pour commencer
EMAIL_USER=
EMAIL_PASSWORD=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### 4. Configuration GitHub OAuth (2 minutes)

1. Allez sur https://github.com/settings/developers
2. Cliquez sur **"New OAuth App"**
3. Remplissez :
   - **Application name** : `Git Reporter Dev`
   - **Homepage URL** : `http://localhost:5173`
   - **Authorization callback URL** : `http://localhost:4000/api/auth/github/callback`
4. Cliquez sur **"Register application"**
5. Copiez le **Client ID**
6. Cliquez sur **"Generate a new client secret"** et copiez-le
7. Collez les deux valeurs dans votre fichier `backend/.env`

### 5. Initialiser Prisma

```bash
# Toujours dans le dossier backend
npx prisma generate
npx prisma migrate dev --name init
```

## 🎮 Lancement (30 secondes)

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

✅ Vous devriez voir :
```
🚀 Git Reporter API started successfully
📡 Server running at http://localhost:4000
🏥 Health check: http://localhost:4000/health
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Vous devriez voir :
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🎉 C'est Prêt !

Ouvrez votre navigateur sur **http://localhost:5173**

### Tester que tout fonctionne :

1. **Health Check Backend** : http://localhost:4000/health
   - Devrait retourner `{"success": true, "data": {"status": "healthy"}}`

2. **API Info** : http://localhost:4000/
   - Devrait afficher les informations de l'API

3. **Frontend** : http://localhost:5173/
   - Devrait afficher l'application Vue

## 🔧 Configuration Optionnelle (pour plus tard)

### Email (Gmail)

Pour envoyer des rapports par email :

1. Activez la validation en 2 étapes sur Google
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Ajoutez dans `.env` :
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx
   ```

### WhatsApp (Twilio)

Pour envoyer des rapports par WhatsApp :

1. Créez un compte Twilio : https://www.twilio.com/try-twilio
2. Allez dans "Messaging" > "Try it out" > "Send a WhatsApp message"
3. Suivez les instructions pour le sandbox WhatsApp
4. Ajoutez dans `.env` :
   ```env
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

## 🐛 Problèmes Courants

### ❌ Erreur : "Cannot connect to database"

**Solution :**
```bash
# Vérifiez que PostgreSQL est démarré
# Windows :
net start postgresql-x64-14

# macOS :
brew services start postgresql

# Linux :
sudo systemctl start postgresql
```

### ❌ Erreur : "Port 4000 already in use"

**Solution :**
```bash
# Changez le port dans backend/.env
PORT=5000

# Ou tuez le processus sur le port 4000 :
# Windows :
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux :
lsof -ti:4000 | xargs kill -9
```

### ❌ Erreur : "GitHub OAuth not configured"

**Solution :** Vérifiez que vous avez bien rempli `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` dans `backend/.env`

### ❌ Erreur Prisma : "Schema not found"

**Solution :**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### ❌ Frontend : Écran blanc

**Solution :**
1. Vérifiez la console du navigateur (F12)
2. Vérifiez que le backend tourne sur http://localhost:4000
3. Essayez de vider le cache : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (macOS)

## 🎓 Prochaines Étapes

Maintenant que tout fonctionne :

1. **Testez l'authentification** :
   - Cliquez sur "Se connecter avec GitHub"
   - Autorisez l'application
   - Vous devriez être redirigé vers le dashboard

2. **Explorez la base de données** :
   ```bash
   cd backend
   npx prisma studio
   ```
   Ouvrez http://localhost:5555 pour voir vos données

3. **Consultez les logs** :
   - Les logs du backend s'affichent dans le terminal
   - Niveau de détail : `LOG_LEVEL=debug` dans `.env`

4. **Lisez la documentation complète** :
   - [README Principal](./README.md)
   - [Backend README](./backend/README.md)
   - [Documentation du projet](./doc/details.md)

## 📝 Commandes Utiles

```bash
# Backend
cd backend
npm run dev          # Mode développement avec auto-reload
npm run build        # Build pour production
npm start            # Lancer la version buildée
npx prisma studio    # Interface graphique pour la DB

# Frontend
cd frontend
npm run dev          # Mode développement
npm run build        # Build pour production
npm run preview      # Preview du build

# Base de données
npx prisma migrate dev --name <nom>   # Nouvelle migration
npx prisma migrate reset              # Reset la DB (ATTENTION!)
npx prisma generate                   # Régénère le client Prisma
```

## 💡 Conseils

- **Gardez les deux terminaux ouverts** pendant le développement
- **Consultez les logs** en cas de problème
- **Utilisez Prisma Studio** pour visualiser/modifier la base de données
- **Testez le health check** régulièrement : http://localhost:4000/health
- **Activez LOG_LEVEL=debug** pour plus d'informations

## 🆘 Besoin d'Aide ?

1. **Vérifiez les logs** dans les deux terminaux
2. **Consultez le README** pour plus de détails
3. **Ouvrez une issue** sur GitHub si le problème persiste

## ✅ Checklist Finale

Avant de commencer à développer, vérifiez que :

- [ ] Backend répond sur http://localhost:4000/health
- [ ] Frontend s'affiche sur http://localhost:5173
- [ ] Authentification GitHub fonctionne
- [ ] Base de données est connectée (visible dans les logs)
- [ ] Prisma Studio fonctionne (http://localhost:5555)

---

**🎉 Félicitations ! Vous êtes prêt à développer avec Git Reporter !**

Pour continuer, consultez :
- [README Principal](./README.md) - Vue d'ensemble complète
- [Backend README](./backend/README.md) - Documentation API
- [Documentation Détaillée](./doc/details.md) - Roadmap et architecture

**Happy Coding! 💻✨**
