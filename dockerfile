# Utilise une image officielle de Node.js avec la version souhaitée
FROM node:14

# Crée et définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie le fichier package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installe les dépendances
RUN npm install



# Copie tout le contenu du répertoire actuel dans le répertoire de travail du conteneur
COPY . .

# Installez wait-on globalement
RUN npm install -g wait-on


# Expose le port sur lequel l'application Node.js va écouter
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
