#!/bin/bash

# ================================================
# 🚀 GUIA DE INICIALIZAÇÃO - SERVIDOR UBUNTU
# ================================================

echo "🚀 Iniciando Jarvis Bridge no Ubuntu..."

# 1. Criar diretório de logs (se não existir)
echo "📁 Criando diretório de logs..."
sudo mkdir -p /var/log/jarvis-bridge
sudo chown -R $USER:$USER /var/log/jarvis-bridge

# 2. Verificar se o build foi feito
if [ ! -d "dist" ]; then
    echo "❌ Diretório 'dist' não encontrado!"
    echo "Executando build..."
    npm run build
fi

# 3. Verificar se o .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "Por favor, copie o .env.example e configure:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# 4. Iniciar com PM2
echo "🔄 Iniciando PM2..."
pm2 start ecosystem.config.cjs

# 5. Salvar configuração do PM2
echo "💾 Salvando configuração do PM2..."
pm2 save

# 6. Configurar PM2 para iniciar no boot
echo "🔧 Configurando PM2 para iniciar automaticamente..."
pm2 startup

# 7. Mostrar status
echo ""
echo "✅ Servidor iniciado!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📋 Comandos úteis:"
echo "  pm2 logs jarvis-bridge     # Ver logs em tempo real"
echo "  pm2 restart jarvis-bridge  # Reiniciar"
echo "  pm2 stop jarvis-bridge     # Parar"
echo "  pm2 status                 # Ver status"
echo ""
