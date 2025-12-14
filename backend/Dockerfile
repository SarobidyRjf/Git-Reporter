# Utiliser une image Node.js légère
FROM node:20-alpine

# Créer le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances (production seulement)
RUN npm ci --only=production

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
CMD ["npm", "start"]
