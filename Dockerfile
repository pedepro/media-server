# Imagem base
FROM node:18

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar o código
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "index.js"]