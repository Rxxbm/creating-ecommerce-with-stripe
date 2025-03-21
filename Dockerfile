# Etapa 1: Construção da imagem (usando uma imagem com Node.js e TypeScript)
FROM node:20-alpine AS build

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /home/node/app

# Copiar os arquivos de dependências (package.json e package-lock.json)
COPY package*.json ./

# Instalar as dependências, incluindo as de desenvolvimento
RUN npm install

# Copiar o código-fonte do projeto
COPY . .

# Rodar o build do TypeScript
RUN npm run build

# Etapa 2: Imagem de Produção (imagem mais enxuta)
FROM node:20-alpine AS production

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /home/node/app

# Copiar o package.json e o package-lock.json para a imagem de produção
COPY package*.json ./

# Instalar apenas as dependências de produção
RUN npm install --only=production

# Copiar os arquivos compilados do build (da etapa anterior)
COPY --from=build /home/node/app/dist ./dist

# Definir o comando para rodar a aplicação em produção
CMD [ "npm", "run", "start" ]
