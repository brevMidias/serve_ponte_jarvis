FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código compilado
COPY dist/ ./dist/

# Copia .env (em produção, use secrets ou variáveis de ambiente)
# COPY .env ./

# Expõe porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Inicia aplicação
CMD ["node", "dist/index.js"]
