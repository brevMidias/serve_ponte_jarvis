#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY/ATUALIZAÇÃO
# Jarvis Bridge - Ubuntu 22.04
# ===========================================

set -e

echo "🚀 Atualizando Jarvis Bridge..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Parar servidor
echo -e "${YELLOW}📛 Parando servidor...${NC}"
pm2 stop jarvis-bridge || true

# 2. Fazer backup do .env
echo -e "${YELLOW}💾 Backup do .env...${NC}"
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ Backup criado: .env.backup"
fi

# 3. Puxar atualizações do Git
echo -e "${YELLOW}📥 Baixando atualizações...${NC}"
git fetch origin
git pull origin main

# 4. Verificar se há mudanças no package.json
if git diff HEAD@{1} HEAD -- package.json | grep -q .; then
    echo -e "${YELLOW}📦 package.json mudou, reinstalando dependências...${NC}"
    npm install
else
    echo "✅ Sem mudanças em dependências"
fi

# 5. Recompilar TypeScript
echo -e "${YELLOW}🔨 Recompilando...${NC}"
npm run build

# 6. Restaurar .env se foi sobrescrito
if [ -f .env.backup ]; then
    if ! cmp -s .env .env.backup; then
        echo -e "${RED}⚠️  .env mudou! Restaurando backup...${NC}"
        cp .env.backup .env
    fi
    rm .env.backup
fi

# 7. Reiniciar servidor
echo -e "${YELLOW}🔄 Reiniciando servidor...${NC}"
pm2 restart jarvis-bridge

# 8. Verificar status
sleep 2
if pm2 list | grep -q "jarvis-bridge.*online"; then
    echo -e "${GREEN}✅ Servidor atualizado e rodando!${NC}"
    echo ""
    echo "📊 Status:"
    pm2 status jarvis-bridge
    echo ""
    echo "📝 Ver logs: pm2 logs jarvis-bridge"
else
    echo -e "${RED}❌ Erro ao reiniciar!${NC}"
    echo "Ver logs: pm2 logs jarvis-bridge --err"
    exit 1
fi

# 9. Salvar configuração PM2
pm2 save

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
