#!/bin/bash

# ===========================================
# SCRIPT DE INSTALAÇÃO - JARVIS BRIDGE
# Ubuntu 20.04/22.04
# ===========================================

set -e

echo "🤖 Instalando Jarvis Bridge..."

# 1. Atualiza sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instala Node.js 20 LTS
echo "📥 Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Verifica versão
echo "✅ Verificando versões..."
node --version
npm --version

# 4. Instala PM2 globalmente
echo "📥 Instalando PM2..."
sudo npm install -g pm2

# 5. Cria diretórios de log
echo "📁 Criando diretórios..."
sudo mkdir -p /var/log/jarvis-bridge
sudo chown $USER:$USER /var/log/jarvis-bridge

# 6. Instala dependências do projeto
echo "📥 Instalando dependências..."
npm install

# 7. Compila TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# 8. Copia .env.example se .env não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Editeo arquivo .env com suas configurações"
    echo "📝 Execute: nano .env"
fi

# 9. Configura PM2 para iniciar no boot
echo "⚙️  Configurando PM2..."
pm2 startup
# Você precisará executar o comando sugerido pelo PM2

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env: nano .env"
echo "2. Teste em dev: npm run dev"
echo "3. Compile: npm run build"
echo "4. Inicie em produção: npm run start:prod"
echo "5. Salve configuração PM2: pm2 save"
echo ""
echo "🔍 Comandos úteis:"
echo "- pm2 logs jarvis-bridge  # Ver logs"
echo "- pm2 status              # Ver status"
echo "- pm2 restart jarvis-bridge  # Reiniciar"
echo "- pm2 monit               # Monitor em tempo real"
