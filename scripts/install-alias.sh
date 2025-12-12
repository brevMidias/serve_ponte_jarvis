#!/bin/bash

# ========================================
# 📦 INSTALADOR DE ATALHO
# Cria comando 'update-jarvis' global
# ========================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📦 Criando atalho 'update-jarvis'..."

# Adicionar alias ao .bashrc
if ! grep -q "alias update-jarvis" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Jarvis Bridge - Atalho de atualização" >> ~/.bashrc
    echo "alias update-jarvis='cd $PROJECT_DIR && bash scripts/update-server.sh'" >> ~/.bashrc
    echo "✅ Atalho adicionado ao ~/.bashrc"
else
    echo "ℹ️  Atalho já existe no ~/.bashrc"
fi

# Recarregar bashrc
source ~/.bashrc 2>/dev/null || true

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "Agora você pode atualizar o servidor de qualquer lugar com:"
echo "  update-jarvis"
echo ""
echo "Para ativar agora, execute:"
echo "  source ~/.bashrc"
echo ""
