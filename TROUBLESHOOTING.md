# 🔧 Guide de Dépannage - Git Reporter

**Problèmes courants et leurs solutions**

---

## 🗄️ Problème : Erreur PostgreSQL "Authentication failed"

### Symptôme

```
Error: P1000: Authentication failed against database server,
the provided database credentials for `postgres` are not valid.
```

### Solutions

#### Solution 1 : Vérifier et corriger le mot de passe PostgreSQL

1. **Ouvrez le fichier** `backend/.env`

2. **Modifiez la ligne `DATABASE_URL`** avec le bon mot de passe :

```env
DATABASE_URL="postgresql://postgres:VOTRE_VRAI_MOT_DE_PASSE@localhost:5432/git_reporter"
```

**Remplacez `VOTRE_VRAI_MOT_DE_PASSE` par votre mot de passe PostgreSQL**

> 💡 **Astuce** : Le mot de passe par défaut est souvent celui que vous avez défini lors de l'installation de PostgreSQL

#### Solution 2 : Vérifier que PostgreSQL est démarré

**Sur Windows :**

```bash
# Démarrer PostgreSQL
net start postgresql-x64-14

# Ou avec un autre nom de service
net start postgresql-x64-15

# Vérifier le statut
sc query postgresql-x64-14
```

**Sur macOS :**

```bash
# Démarrer PostgreSQL
brew services start postgresql@14

# Ou
pg_ctl -D /usr/local/var/postgres start
```

**Sur Linux :**

```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql

# Vérifier le statut
sudo systemctl status postgresql
```

#### Solution 3 : Créer la base de données manuellement

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Entrez votre mot de passe quand demandé
```

Dans l'invite psql :

```sql
-- Créer la base de données
CREATE DATABASE git_reporter;

-- Vérifier qu'elle existe
\l

-- Quitter
\q
```

#### Solution 4 : Réinitialiser le mot de passe PostgreSQL

**Sur Windows :**

1. Trouvez le fichier `pg_hba.conf` (généralement dans `C:\Program Files\PostgreSQL\14\data\`)
2. Ouvrez-le en tant qu'administrateur
3. Changez la ligne :
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   en :
   ```
   host    all             all             127.0.0.1/32            trust
   ```
4. Redémarrez PostgreSQL
5. Connectez-vous sans mot de passe :
   ```bash
   psql -U postgres
   ```
6. Changez le mot de passe :
   ```sql
   ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
   \q
   ```
7. Restaurez `scram-sha-256` dans `pg_hba.conf`
8. Redémarrez PostgreSQL

---

## 🔄 Solution Alternative : Utiliser SQLite (Plus Simple)

Si PostgreSQL continue de poser problème, utilisez SQLite temporairement :

### Étape 1 : Modifier le schéma Prisma

Éditez `backend/prisma/schema.prisma` et changez :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

en :

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Étape 2 : Commentez la ligne DATABASE_URL

Dans `backend/.env`, commentez :

```env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/git_reporter"
```

### Étape 3 : Régénérez Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

✅ SQLite créera automatiquement un fichier `dev.db` sans configuration supplémentaire !

---

## 🚫 Problème : Port 4000 déjà utilisé

### Symptôme

```
Error: listen EADDRINUSE: address already in use :::4000
```

### Solution

**Option A : Tuer le processus sur le port 4000**

**Windows :**

```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**macOS/Linux :**

```bash
lsof -ti:4000 | xargs kill -9
```

**Option B : Changer le port dans `.env`**

```env
PORT=5000
```

---

## 🔑 Problème : "GitHub OAuth not configured"

### Symptôme

```
⚠️  GitHub OAuth not configured - authentication will not work
```

### Solution

1. **Allez sur** https://github.com/settings/developers

2. **Cliquez sur "New OAuth App"**

3. **Remplissez** :
   - **Application name** : `Git Reporter Dev`
   - **Homepage URL** : `http://localhost:5173`
   - **Authorization callback URL** : `http://localhost:4000/api/auth/github/callback`

4. **Cliquez sur "Register application"**

5. **Copiez le Client ID**

6. **Cliquez sur "Generate a new client secret"** et copiez-le

7. **Éditez `backend/.env`** et ajoutez :

```env
GITHUB_CLIENT_ID=votre_client_id_ici
GITHUB_CLIENT_SECRET=votre_client_secret_ici
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

8. **Redémarrez le backend**

---

## 📦 Problème : Module introuvable (Cannot find module)

### Symptôme

```
Error: Cannot find module 'express'
```

### Solution

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Problème : Écran blanc sur le frontend

### Solution

1. **Ouvrez la console du navigateur** (F12)

2. **Vérifiez les erreurs** dans l'onglet Console

3. **Vérifiez que le backend tourne** : http://localhost:4000/health

4. **Videz le cache du navigateur** :
   - Windows/Linux : `Ctrl + Shift + R`
   - macOS : `Cmd + Shift + R`

5. **Vérifiez la configuration Vite** :
   - Le fichier `frontend/.env` doit contenir :
     ```env
     VITE_API_URL=http://localhost:4000
     ```

6. **Rebuild le frontend** :
   ```bash
   cd frontend
   npm run build
   npm run dev
   ```

---

## 🔒 Problème : Token expiré ou invalide

### Symptôme

```
Token expiré
Authentication failed: Invalid token
```

### Solution

1. **Ouvrez la console du navigateur** (F12)

2. **Allez dans l'onglet "Application" > "Local Storage"**

3. **Supprimez la clé `auth_token`**

4. **Rechargez la page** (F5)

5. **Reconnectez-vous** avec GitHub

---

## 📝 Problème : Prisma migration échoue

### Symptôme

```
Error: P3006: Migration ... failed to apply cleanly to the shadow database
```

### Solution

**⚠️ ATTENTION : Ceci supprime toutes les données !**

```bash
cd backend
npx prisma migrate reset --force
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🌐 Problème : CORS Error

### Symptôme

```
Access to fetch at 'http://localhost:4000/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

### Solution

1. **Vérifiez que le backend est démarré**

2. **Vérifiez `backend/src/index.ts`** :
   ```typescript
   app.use(cors({
     origin: config.frontendUrl,  // Doit être http://localhost:5173
     credentials: true,
   }));
   ```

3. **Vérifiez `backend/.env`** :
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

4. **Redémarrez le backend**

---

## 🔧 Commandes Utiles de Dépannage

### Vérifier les ports utilisés

**Windows :**
```bash
netstat -ano | findstr :4000
netstat -ano | findstr :5173
```

**macOS/Linux :**
```bash
lsof -i :4000
lsof -i :5173
```

### Nettoyer et réinstaller

```bash
# Backend
cd backend
rm -rf node_modules dist package-lock.json
npm install
npm run build

# Frontend
cd frontend
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Vérifier la version de Node.js

```bash
node -v   # Doit être >= 20.0.0
npm -v
```

### Tester la connexion à la base de données

```bash
cd backend
npx prisma studio
```

Ouvre http://localhost:5555 - Si ça fonctionne, la DB est OK !

---

## 📊 Checklist de Diagnostic

Utilisez cette checklist pour diagnostiquer les problèmes :

- [ ] Node.js version >= 20 installée (`node -v`)
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `git_reporter` créée
- [ ] Fichier `backend/.env` existe avec toutes les variables
- [ ] GitHub OAuth configuré (CLIENT_ID et CLIENT_SECRET dans `.env`)
- [ ] `npm install` exécuté dans backend et frontend
- [ ] `npx prisma generate` exécuté sans erreur
- [ ] `npx prisma migrate dev --name init` exécuté sans erreur
- [ ] Backend démarre sur port 4000
- [ ] Frontend démarre sur port 5173
- [ ] http://localhost:4000/health retourne `healthy`
- [ ] http://localhost:5173 affiche la page de login
- [ ] Aucune erreur dans la console du navigateur (F12)

---

## 🆘 Si Rien ne Fonctionne : Configuration Minimale

Utilisez cette configuration minimale pour tester rapidement :

### 1. Utilisez SQLite au lieu de PostgreSQL

Éditez `backend/prisma/schema.prisma` :

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Créez un fichier `backend/.env` minimal

```env
# Minimum requis
JWT_SECRET=test_secret_key_123
FRONTEND_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
LOG_LEVEL=debug

# GitHub OAuth (OBLIGATOIRE pour se connecter)
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

### 3. Régénérez Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Lancez l'application

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 5. Testez

- Ouvrez http://localhost:5173
- Connectez-vous avec GitHub
- Si ça fonctionne, l'app est opérationnelle ! 🎉

---

## 📞 Support Supplémentaire

Si vous avez toujours des problèmes :

1. **Vérifiez les logs** dans les deux terminaux
2. **Consultez la console du navigateur** (F12)
3. **Testez le health check** : http://localhost:4000/health
4. **Vérifiez que tous les fichiers `.env` sont corrects**

### Logs importants à vérifier

**Backend :**
- ✅ `🚀 Git Reporter API started successfully`
- ✅ `📡 Server running at http://localhost:4000`
- ✅ `Database connected successfully`

**Frontend :**
- ✅ `VITE v7.x.x  ready in xxx ms`
- ✅ `➜  Local:   http://localhost:5173/`

---

**Bonne chance ! 🚀**
