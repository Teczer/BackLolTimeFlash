# Build the backend
FROM node:20.9.0-alpine

# Assurez-vous que le chemin est correct
WORKDIR /usr/app
RUN npm install --global pnpm

# Copiez les fichiers backend dans le conteneur
COPY ./ /usr/app

# Install dependencies
RUN pnpm install

# Démarrer l'application backend
CMD ["pnpm", "start"]
