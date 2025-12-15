# Utiliser une image Node.js Debian-based plus robuste pour le réseau/DNS
FROM node:20-slim

# Installer OpenSSL (requis pour Prisma et certaines connexions SSL)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Créer le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (nécessaire pour le build TypeScript)
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Exposer le port (Render utilise souvent 10000 ou celui défini par PORT)
ENV PORT=3000
EXPOSE 3000

# Commande de démarrage
CMD npx prisma db push --accept-data-loss && npm start
