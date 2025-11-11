#!/bin/bash

# ==============================================================================
# Git Reporter - Script d'Installation Automatique
# ==============================================================================
# Ce script automatise l'installation complète de Git Reporter
# Pour Windows, utilisez Git Bash ou WSL
# ==============================================================================

set -e  # Arrête le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC}  $1"
}

print_success() {
    echo -e "${GREEN}✓${NC}  $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🚀 Git Reporter - Installation Automatique        ║
║                                                           ║
║    Génération et envoi de rapports de commits Git        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérification des prérequis
print_step "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    echo "   Installez Node.js depuis: https://nodejs.org/ (version 20+)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ requis (version actuelle: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi
print_success "npm $(npm -v) détecté"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL n'est pas installé"
    echo "   Installez PostgreSQL depuis: https://www.postgresql.org/"
    echo "   Ou continuez sans PostgreSQL et configurez-le manuellement plus tard."
    read -p "   Continuer sans PostgreSQL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_DB_SETUP=true
else
    print_success "PostgreSQL détecté"
    SKIP_DB_SETUP=false
fi

echo ""

# Installation du backend
print_step "Installation du backend..."
cd backend

if [ ! -f "package.json" ]; then
    print_error "package.json introuvable dans le dossier backend"
    exit 1
fi

print_info "Installation des dépendances npm..."
npm install --silent

print_success "Dépendances backend installées"

# Configuration du .env
if [ ! -f ".env" ]; then
    print_info "Création du fichier .env..."

    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
    else
        print_error ".env.example introuvable"
        exit 1
    fi

    echo ""
    print_info "Configuration du fichier .env..."
    echo ""

    # Génération d'un JWT secret aléatoire
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

    # Mise à jour du JWT_SECRET dans .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi

    print_success "JWT_SECRET généré automatiquement"

    # Configuration GitHub OAuth
    echo ""
    echo -e "${YELLOW}Configuration GitHub OAuth requise:${NC}"
    echo "1. Allez sur: https://github.com/settings/developers"
    echo "2. Cliquez sur 'New OAuth App'"
    echo "3. Remplissez:"
    echo "   - Application name: Git Reporter Dev"
    echo "   - Homepage URL: http://localhost:5173"
    echo "   - Authorization callback URL: http://localhost:4000/api/auth/github/callback"
    echo ""

    read -p "Entrez votre GitHub Client ID: " GITHUB_CLIENT_ID
    read -p "Entrez votre GitHub Client Secret: " GITHUB_CLIENT_SECRET

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/GITHUB_CLIENT_ID=.*/GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID/" .env
        sed -i '' "s/GITHUB_CLIENT_SECRET=.*/GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET/" .env
    else
        sed -i "s/GITHUB_CLIENT_ID=.*/GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID/" .env
        sed -i "s/GITHUB_CLIENT_SECRET=.*/GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET/" .env
    fi

    print_success "Configuration GitHub OAuth enregistrée"

else
    print_info "Fichier .env existant trouvé"
fi

# Configuration de la base de données
if [ "$SKIP_DB_SETUP" = false ]; then
    echo ""
    print_step "Configuration de la base de données..."

    # Demander les credentials PostgreSQL
    echo ""
    read -p "Nom d'utilisateur PostgreSQL (postgres): " PG_USER
    PG_USER=${PG_USER:-postgres}

    read -sp "Mot de passe PostgreSQL: " PG_PASSWORD
    echo ""

    read -p "Nom de la base de données (git_reporter): " DB_NAME
    DB_NAME=${DB_NAME:-git_reporter}

    # Créer la base de données si elle n'existe pas
    print_info "Création de la base de données '$DB_NAME'..."

    PGPASSWORD=$PG_PASSWORD psql -U $PG_USER -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$PG_PASSWORD psql -U $PG_USER -h localhost -c "CREATE DATABASE $DB_NAME"

    if [ $? -eq 0 ]; then
        print_success "Base de données '$DB_NAME' prête"
    else
        print_error "Erreur lors de la création de la base de données"
        print_info "Créez-la manuellement: CREATE DATABASE $DB_NAME;"
    fi

    # Mettre à jour DATABASE_URL dans .env
    DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@localhost:5432/$DB_NAME"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
    else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
    fi

    print_success "DATABASE_URL configurée"

    # Générer le client Prisma
    echo ""
    print_info "Génération du client Prisma..."
    npx prisma generate --silent
    print_success "Client Prisma généré"

    # Exécuter les migrations
    print_info "Exécution des migrations..."
    npx prisma migrate dev --name init --skip-generate
    print_success "Migrations exécutées"
fi

# Build du backend
echo ""
print_info "Compilation du backend TypeScript..."
npm run build
print_success "Backend compilé avec succès"

cd ..

# Installation du frontend
print_step "Installation du frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    print_error "package.json introuvable dans le dossier frontend"
    exit 1
fi

print_info "Installation des dépendances npm..."
npm install --silent

print_success "Dépendances frontend installées"

cd ..

# Résumé de l'installation
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║        ✓ Installation terminée avec succès ! 🎉          ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

print_success "Backend installé et configuré"
print_success "Frontend installé"
if [ "$SKIP_DB_SETUP" = false ]; then
    print_success "Base de données configurée"
fi

echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo ""
echo "1. Démarrer le backend:"
echo -e "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "2. Dans un autre terminal, démarrer le frontend:"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Ouvrir votre navigateur sur:"
echo -e "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "4. Tester l'API backend:"
echo -e "   ${YELLOW}http://localhost:4000/health${NC}"
echo ""
echo -e "${BLUE}Pour visualiser la base de données:${NC}"
echo -e "   ${YELLOW}cd backend && npx prisma studio${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   - README.md (vue d'ensemble)"
echo "   - QUICK_START.md (guide rapide)"
echo "   - backend/README.md (documentation API)"
echo ""
echo -e "${GREEN}Bon développement ! 💻✨${NC}"
echo ""

# Demander si l'utilisateur veut démarrer automatiquement
read -p "Voulez-vous démarrer le backend maintenant? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    cd backend
    print_info "Démarrage du backend..."
    npm run dev
fi
