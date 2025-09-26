FROM node:20-alpine

WORKDIR /app

# Habilitar pnpm
RUN corepack enable

# Copiamos manifests de la API
COPY package.json pnpm-lock.yaml* ./

# Instalar deps
RUN pnpm install --frozen-lockfile

# Copiar el resto del código de la API
COPY . .

EXPOSE 3000 9229

# Hot reload
CMD ["pnpm", "run", "start:dev"]
