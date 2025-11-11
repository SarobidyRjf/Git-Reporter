@echo off
chcp 65001 >nul
echo ============================================
echo    Git Reporter - Vérification Setup
echo ============================================
echo.

REM Vérifier Node.js
echo [1/7] Vérification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    echo    Téléchargez-le depuis: https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo ✅ Node.js installé
echo.

REM Vérifier npm
echo [2/7] Vérification de npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé
    pause
    exit /b 1
)
npm -v
echo ✅ npm installé
echo.

REM Vérifier PostgreSQL
echo [3/7] Vérification de PostgreSQL...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL n'est pas dans le PATH
    echo    Vous pouvez utiliser SQLite à la place
    echo.
    set USE_SQLITE=1
) else (
    echo ✅ PostgreSQL trouvé
    echo.
    set USE_SQLITE=0
)

REM Vérifier backend/.env
echo [4/7] Vérification du fichier .env...
if not exist "backend\.env" (
    echo ⚠️  Fichier backend/.env manquant
    echo    Création depuis .env.example...
    copy backend\.env.example backend\.env >nul
    echo ✅ Fichier .env créé
    echo.
    echo ⚠️  ACTION REQUISE:
    echo    1. Allez sur https://github.com/settings/developers
    echo    2. Créez une OAuth App
    echo    3. Ajoutez CLIENT_ID et CLIENT_SECRET dans backend/.env
    echo.
) else (
    echo ✅ Fichier .env existe
    echo.
)

REM Vérifier node_modules backend
echo [5/7] Vérification des dépendances backend...
if not exist "backend\node_modules" (
    echo ⚠️  Dépendances backend non installées
    echo    Installation en cours...
    cd backend
    call npm install
    cd ..
    echo ✅ Dépendances backend installées
) else (
    echo ✅ Dépendances backend OK
)
echo.

REM Vérifier node_modules frontend
echo [6/7] Vérification des dépendances frontend...
if not exist "frontend\node_modules" (
    echo ⚠️  Dépendances frontend non installées
    echo    Installation en cours...
    cd frontend
    call npm install
    cd ..
    echo ✅ Dépendances frontend installées
) else (
    echo ✅ Dépendances frontend OK
)
echo.

REM Vérifier Prisma
echo [7/7] Vérification de Prisma...
if not exist "backend\src\generated" (
    echo ⚠️  Client Prisma non généré
    echo    Génération en cours...
    cd backend
    call npx prisma generate
    cd ..
    echo ✅ Client Prisma généré
) else (
    echo ✅ Client Prisma OK
)
echo.

echo ============================================
echo    Vérification Terminée!
echo ============================================
echo.

if %USE_SQLITE%==1 (
    echo ⚠️  RECOMMANDATION: Utiliser SQLite
    echo.
    echo    Éditez backend/prisma/schema.prisma:
    echo    Changez:  provider = "postgresql"
    echo    En:       provider = "sqlite"
    echo    Et:       url = "file:./dev.db"
    echo.
    echo    Puis lancez: cd backend ^&^& npx prisma migrate dev --name init
    echo.
)

echo 📋 Prochaines étapes:
echo.
echo    1. Configurez GitHub OAuth dans backend/.env
echo    2. Terminal 1: cd backend ^&^& npm run dev
echo    3. Terminal 2: cd frontend ^&^& npm run dev
echo    4. Ouvrez http://localhost:5173
echo.

pause
