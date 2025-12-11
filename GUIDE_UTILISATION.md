# 📚 Guide d'utilisation - Git Reporter

## 🚀 Démarrage rapide

### 1. Prérequis

- ✅ Backend démarré sur `http://localhost:4000`
- ✅ Frontend démarré sur `http://localhost:5173`
- ✅ Base de données PostgreSQL configurée
- ✅ OAuth GitHub configuré

### 2. Première connexion

1. **Ouvrir l'application**

   - Naviguer vers `http://localhost:5173`
   - Cliquer sur "Se connecter avec GitHub"

2. **Autoriser l'application**
   - Vous serez redirigé vers GitHub
   - Autoriser Git Reporter à accéder à vos dépôts
   - Vous serez redirigé vers le Dashboard

---

## 📋 Fonctionnalités principales

### 1. Dashboard - Créer un rapport manuel

**Objectif**: Générer et envoyer un rapport de commits immédiatement

**Étapes**:

1. Sélectionner un dépôt dans la liste déroulante
2. Choisir la période (aujourd'hui, cette semaine, ce mois, personnalisé)
3. Les commits s'affichent automatiquement
4. Éditer le contenu du rapport si nécessaire
5. Choisir la méthode d'envoi:
   - 📧 **Email**: Entrer l'adresse email
   - 💬 **WhatsApp**: Entrer le numéro (format: +33612345678)
6. Cliquer sur "Envoyer le rapport"

**Résultat**: Le rapport est envoyé et sauvegardé dans l'historique

---

### 2. Historique - Consulter les rapports envoyés

**Objectif**: Voir tous les rapports précédemment envoyés

**Fonctionnalités**:

- 📊 Liste de tous les rapports avec date, dépôt, méthode
- 🔍 Filtrer par dépôt, méthode, ou date
- 👁️ Voir le contenu complet d'un rapport
- 🗑️ Supprimer un rapport de l'historique

---

### 3. Templates - Gérer les modèles de rapports

**Objectif**: Créer des formats de rapports réutilisables

#### Templates par défaut

L'application fournit 3 templates prêts à l'emploi:

1. **Daily Standup** 📅

   - Rapport quotidien des commits
   - Format: Liste simple avec date

2. **Weekly Review** 📊

   - Résumé hebdomadaire
   - Inclut: Statistiques, nombre de contributeurs

3. **Release Notes** 🚀
   - Notes de version
   - Groupé par type: Features, Fixes, Documentation

#### Créer un template personnalisé

1. Cliquer sur "Nouveau template"
2. Remplir le formulaire:

   - **Nom**: Ex: "Rapport hebdomadaire équipe"
   - **Description**: Ex: "Résumé pour le manager"
   - **Catégorie**: Quotidien, Hebdomadaire, Release, ou Personnalisé
   - **Contenu**: Utiliser les variables disponibles

3. **Variables disponibles**:

   ```
   {{repoName}}        - Nom du dépôt
   {{commits}}         - Liste des commits
   {{commitCount}}     - Nombre de commits
   {{date}}            - Date du jour
   {{dateRange}}       - Plage de dates
   {{contributorCount}}- Nombre de contributeurs
   ```

4. **Exemple de template**:

   ```markdown
   # Rapport - {{repoName}}

   Date: {{date}}
   Commits: {{commitCount}}

   ## Détails

   {{commits}}

   ---

   Généré automatiquement
   ```

5. Cliquer sur "Sauvegarder"

#### Utiliser un template

- **Dans le Dashboard**: Sélectionner le template avant de générer le rapport
- **Dans les Schedules**: Choisir le template pour les rapports automatiques

---

### 4. Planification - Rapports automatiques

**Objectif**: Programmer l'envoi automatique de rapports

#### Créer un schedule

1. Cliquer sur "Nouveau schedule"
2. Remplir le formulaire:

   **a. Dépôt**

   - Sélectionner le dépôt à surveiller

   **b. Template (optionnel)**

   - Choisir un template ou laisser "Format par défaut"

   **c. Fréquence**

   - Choisir un preset:
     - ⏰ Tous les jours à 17h
     - 📅 Tous les jours ouvrables à 17h (Lun-Ven)
     - 📆 Tous les lundis à 9h
     - 🎉 Tous les vendredis à 17h
     - ⏱️ Toutes les heures
     - ✏️ Personnalisé (saisir expression cron)

   **d. Expression cron** (si personnalisé)

   - Format: `minute heure jour mois jour-semaine`
   - Exemples:
     ```
     0 17 * * *      → Tous les jours à 17h
     0 9 * * 1       → Tous les lundis à 9h
     0 17 * * 1-5    → Jours ouvrables à 17h
     0 */2 * * *     → Toutes les 2 heures
     ```

   **e. Méthode d'envoi**

   - 📧 Email ou 💬 WhatsApp

   **f. Destinataire**

   - Email: `email@example.com`
   - WhatsApp: `+33612345678`

3. Cliquer sur "Sauvegarder"

#### Gérer les schedules

**Schedules actifs**:

- ▶️ **Exécuter**: Lancer manuellement immédiatement
- 🔄 **Désactiver**: Mettre en pause sans supprimer
- ✏️ **Éditer**: Modifier les paramètres
- 🗑️ **Supprimer**: Retirer définitivement

**Schedules inactifs**:

- 🔄 **Activer**: Réactiver le schedule
- ✏️ **Éditer**: Modifier avant réactivation
- 🗑️ **Supprimer**: Retirer définitivement

**Informations affichées**:

- 📦 Dépôt surveillé
- ⏰ Fréquence d'exécution
- 📧/💬 Méthode et destinataire
- 📝 Template utilisé (si applicable)
- 🕐 Prochaine exécution
- 🕑 Dernière exécution

---

### 5. Profil - Vos statistiques

**Objectif**: Voir vos statistiques d'utilisation

**Informations affichées**:

- 📊 Nombre total de rapports envoyés
- 📈 Graphiques d'activité
- 🏆 Dépôts les plus actifs
- 📅 Historique d'utilisation

---

### 6. Paramètres - Configuration

**Objectif**: Personnaliser l'application

**Options disponibles**:

- 🎨 **Apparence**: Mode sombre/clair/auto
- 📧 **Email par défaut**: Email prérempli
- 💬 **WhatsApp par défaut**: Numéro prérempli
- 📦 **Dépôts visibles**: Filtrer les dépôts affichés
- 🔔 **Notifications**: Activer/désactiver les alertes

---

## 🎯 Cas d'usage typiques

### Cas 1: Rapport quotidien pour le manager

**Besoin**: Envoyer chaque jour à 17h un résumé des commits

**Solution**:

1. Aller dans **Templates**
2. Utiliser ou personnaliser "Daily Standup"
3. Aller dans **Planification**
4. Créer un schedule:
   - Dépôt: Votre projet
   - Template: Daily Standup
   - Fréquence: Tous les jours ouvrables à 17h
   - Méthode: Email
   - Destinataire: manager@company.com

**Résultat**: Rapport automatique envoyé chaque soir

---

### Cas 2: Notes de version hebdomadaires

**Besoin**: Générer les release notes chaque vendredi

**Solution**:

1. Aller dans **Templates**
2. Utiliser "Release Notes"
3. Aller dans **Planification**
4. Créer un schedule:
   - Dépôt: Votre projet
   - Template: Release Notes
   - Fréquence: Tous les vendredis à 17h
   - Méthode: Email
   - Destinataire: team@company.com

---

### Cas 3: Rapport immédiat pour une démo

**Besoin**: Envoyer rapidement un rapport des derniers commits

**Solution**:

1. Aller dans **Dashboard**
2. Sélectionner le dépôt
3. Choisir "Aujourd'hui" ou "Cette semaine"
4. Vérifier les commits
5. Envoyer par Email ou WhatsApp

---

## 🔧 Dépannage

### Problème: "Failed to load resource: 404"

**Cause**: Backend non démarré ou routes non accessibles

**Solution**:

```bash
# Vérifier que le backend tourne
cd backend
npm run dev

# Vérifier le health check
curl http://localhost:4000/health
```

---

### Problème: "Impossible de charger les templates"

**Cause**: Pas encore connecté ou templates non initialisés

**Solution**:

1. Se connecter avec GitHub
2. Les templates par défaut se créent automatiquement
3. Si problème persiste, vérifier la base de données

---

### Problème: "Schedule non exécuté"

**Cause**: Schedule inactif ou backend arrêté

**Solution**:

1. Vérifier que le schedule est **actif** (badge vert)
2. Vérifier que le backend tourne en continu
3. Vérifier la "Prochaine exécution" dans la liste

---

### Problème: "Email/WhatsApp non reçu"

**Cause**: Configuration incorrecte

**Solution**:

**Pour Email**:

- Vérifier `.env` backend:
  ```env
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=votre_email@gmail.com
  EMAIL_PASSWORD=votre_mot_de_passe_app
  ```
- Utiliser un mot de passe d'application Gmail

**Pour WhatsApp**:

- Vérifier `.env` backend:
  ```env
  TWILIO_ACCOUNT_SID=ACxxxxx
  TWILIO_AUTH_TOKEN=xxxxx
  TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
  ```
- En mode sandbox, envoyer le code d'activation à votre numéro

---

## 💡 Astuces

### Astuce 1: Tester un schedule avant activation

1. Créer le schedule
2. Le laisser **inactif**
3. Cliquer sur "Exécuter" pour tester
4. Vérifier dans l'historique que ça fonctionne
5. Activer le schedule

---

### Astuce 2: Créer des templates pour différentes audiences

- **Template "Manager"**: Résumé court, focus sur les features
- **Template "Équipe"**: Détails techniques, tous les commits
- **Template "Client"**: Langage business, pas de jargon technique

---

### Astuce 3: Utiliser les expressions cron avancées

```bash
# Tous les jours à 9h et 17h
0 9,17 * * *

# Tous les lundis et vendredis à 10h
0 10 * * 1,5

# Toutes les 30 minutes pendant les heures de bureau
*/30 9-17 * * 1-5

# Le 1er de chaque mois à 9h
0 9 1 * *
```

---

## 📞 Support

### Logs backend

```bash
cd backend
npm run dev
# Les logs s'affichent dans le terminal
```

### Logs frontend

- Ouvrir la console du navigateur (F12)
- Onglet "Console" pour voir les erreurs
- Onglet "Network" pour voir les requêtes API

### Base de données

```bash
cd backend
npx prisma studio
# Interface graphique pour voir les données
```

---

## 🎉 Vous êtes prêt !

L'application est maintenant configurée et prête à l'emploi. Commencez par:

1. ✅ Vous connecter avec GitHub
2. ✅ Explorer les templates par défaut
3. ✅ Créer votre premier rapport manuel
4. ✅ Configurer un schedule automatique

**Bon reporting ! 🚀**
