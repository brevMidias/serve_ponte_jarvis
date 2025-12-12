#!/bin/bash

# ========================================
# 🚀 SCRIPT DE ATUALIZAÇÃO AUTOMÁTICA
# Jarvis Bridge Server - Ubuntu
# ========================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo ""
echo "=========================================="
echo "🚀 ATUALIZAÇÃO AUTOMÁTICA - JARVIS BRIDGE"
echo "=========================================="
echo ""

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Erro: package.json não encontrado!"
    log_error "Execute este script no diretório raiz do projeto."
    exit 1
fi

log_info "Diretório: $(pwd)"

# 2. Git Pull
log_info "Puxando atualizações do GitHub..."
git fetch origin
UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")

if [ "$LOCAL" = "$REMOTE" ]; then
    log_warning "Nenhuma atualização disponível."
else
    log_info "Atualizações encontradas, fazendo pull..."
    git pull origin main || {
        log_error "Erro ao fazer git pull!"
        exit 1
    }
    log_success "Código atualizado com sucesso!"
fi

# 3. Verificar se package.json foi modificado
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
    log_info "package.json foi modificado, executando npm install..."
    npm install || {
        log_error "Erro ao instalar dependências!"
        exit 1
    }
    log_success "Dependências atualizadas!"
else
    log_info "package.json não mudou, pulando npm install..."
fi

# 4. Verificar e atualizar .env
if [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado!"
    log_info "Criando .env a partir do .env.example..."
    cp .env.example .env
    log_warning "ATENÇÃO: Configure o arquivo .env com suas credenciais!"
    log_warning "Execute: nano .env"
    exit 1
fi

# Verificar se há novas variáveis no .env.example
NEW_VARS=$(grep -oP '^\w+(?==)' .env.example | while read var; do
    if ! grep -q "^$var=" .env; then
        echo "$var"
    fi
done)

if [ ! -z "$NEW_VARS" ]; then
    log_warning "Novas variáveis detectadas no .env.example:"
    echo "$NEW_VARS" | while read var; do
        echo "  - $var"
    done
    log_warning "Por favor, atualize seu .env manualmente!"
fi

# 5. Build do TypeScript
log_info "Compilando TypeScript..."
npm run build || {
    log_error "Erro ao compilar o projeto!"
    exit 1
}
log_success "Build concluído com sucesso!"

# 6. Criar diretório de logs (se não existir)
log_info "Verificando diretório de logs..."
sudo mkdir -p /var/log/jarvis-bridge 2>/dev/null || true
sudo chown -R $USER:$USER /var/log/jarvis-bridge 2>/dev/null || true
log_success "Diretório de logs OK!"

# 7. Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 não está instalado!"
    log_info "Instalando PM2 globalmente..."
    sudo npm install -g pm2
    log_success "PM2 instalado!"
fi

# 8. Verificar se o processo já existe no PM2
if pm2 describe jarvis-bridge &> /dev/null; then
    log_info "Processo encontrado no PM2, reiniciando..."
    pm2 reload ecosystem.config.cjs --update-env || {
        log_error "Erro ao recarregar com PM2!"
        exit 1
    }
    log_success "Servidor reiniciado com novas variáveis de ambiente!"
else
    log_info "Processo não encontrado, iniciando pela primeira vez..."
    pm2 start ecosystem.config.cjs || {
        log_error "Erro ao iniciar com PM2!"
        exit 1
    }
    log_success "Servidor iniciado!"
    
    # Salvar configuração do PM2
    pm2 save
    
    # Configurar startup (pedir ao usuário executar o comando mostrado)
    log_info "Configurando PM2 para iniciar no boot..."
    pm2 startup
fi

# 9. Mostrar status
echo ""
log_success "=========================================="
log_success "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
log_success "=========================================="
echo ""

log_info "Status do servidor:"
pm2 status jarvis-bridge

echo ""
log_info "📊 Logs em tempo real:"
echo "  pm2 logs jarvis-bridge"
echo ""
log_info "📋 Outros comandos úteis:"
echo "  pm2 restart jarvis-bridge  # Reiniciar"
echo "  pm2 stop jarvis-bridge     # Parar"
echo "  pm2 delete jarvis-bridge   # Remover do PM2"
echo "  pm2 monit                  # Monitor em tempo real"
echo ""

# 10. Verificar se o servidor está respondendo
log_info "Aguardando servidor iniciar..."
sleep 3

PORT=$(grep -oP 'PORT=\K\d+' .env 2>/dev/null || echo "3000")
log_info "Verificando servidor na porta $PORT..."

if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    log_success "Servidor está respondendo! ✅"
else
    log_warning "Servidor pode não estar respondendo ainda."
    log_info "Verifique os logs: pm2 logs jarvis-bridge"
fi

echo ""
log_success "🎉 Processo concluído!"
echo ""
