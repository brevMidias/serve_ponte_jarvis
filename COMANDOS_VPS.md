# 📒 GUIA DE COMANDOS - JARVIS BRIDGE VPS
**IP do Servidor:** `52.67.190.48`  
**Usuário:** `ubuntu`  
**Pasta do Projeto:** `~/serve_ponte_jarvis`

---

## 🔑 1. ACESSO AO SERVIDOR
Para entrar no terminal do VPS:
```powershell
ssh ubuntu@52.67.190.48
```

---

## 📊 2. LOGS E MONITORAMENTO (PM2)
Comandos para ver o que está acontecendo:

| Ação | Comando |
|------|---------|
| **Ver logs em tempo real** | `pm2 logs jarvis-bridge` |
| **Ver erro específico** | `pm2 logs jarvis-bridge --err` |
| **Monitor interativo** | `pm2 monit` |
| **Ver status do serviço** | `pm2 status` |
| **Detalhes do processo** | `pm2 show jarvis-bridge` |

---

## 🔄 3. ATUALIZAR O CÓDIGO (DEPLOY)
Quando você atualizar o código no GitHub e quiser passar para o VPS:

### **Opção A: Manual (Passo a Passo)**
```bash
# 1. Entrar na pasta
cd ~/serve_ponte_jarvis

# 2. Baixar atualizações
git pull

# 3. Instalar novas dependências (se houver)
npm install

# 4. Recompilar o projeto
npm run build

# 5. Reiniciar o servidor
pm2 restart jarvis-bridge

# 6. Salvar estado (para voltar no boot)
pm2 save
```

### **Opção B: Comando Único (Se criar script)**
Você pode criar um alias para fazer tudo de uma vez:
```bash
# Adicione no final do ~/.bashrc
# alias update-jarvis='cd ~/serve_ponte_jarvis && git pull && npm install && npm run build && pm2 restart jarvis-bridge'
```

---

## ⚙️ 4. GERENCIAMENTO DO SERVIDOR

| Ação | Comando |
|------|---------|
| **Reiniciar Jarvis** | `pm2 restart jarvis-bridge` |
| **Parar Jarvis** | `pm2 stop jarvis-bridge` |
| **Iniciar Jarvis** | `pm2 start jarvis-bridge` |
| **Deletar Processo** | `pm2 delete jarvis-bridge` |

---

## 🔧 5. CONFIGURAÇÃO (Variáveis de Ambiente)
Para mudar senhas, chaves de API ou timeouts:

```bash
# 1. Entrar na pasta
cd ~/serve_ponte_jarvis

# 2. Editar arquivo (Use as setas para mover)
nano .env

# --- DENTRO DO NANO ---
# Salvar: Ctrl + O, depois Enter
# Sair: Ctrl + X
# ----------------------

# 3. Reiniciar para aplicar mudanças
pm2 restart jarvis-bridge
```

---

## 🛡️ 6. MANUTENÇÃO DO SISTEMA

| Ação | Comando |
|------|---------|
| **Ver uso de Memória** | `free -h` |
| **Ver uso de Disco** | `df -h` |
| **Atualizar Ubuntu** | `sudo apt update && sudo apt upgrade -y` |
| **Verificar Firewall** | `sudo ufw status` |
| **Verificar Porta 3000** | `sudo lsof -i :3000` |

---

## 🆘 7. SOLUÇÃO DE PROBLEMAS

**O servidor parou?**
1. Veja o status: `pm2 status`
2. Veja o erro: `pm2 logs jarvis-bridge --err --lines 50`

**Não consigo acessar pelo navegador/curl?**
1. Verifique se o Jarvis está rodando (passo acima).
2. Verifique se a porta 3000 está liberada no AWS Security Group.
3. Teste localmente dentro do VPS: `curl http://localhost:3000/health`

**Erro de "Permissão Negada" no Git?**
1. Verifique se sua chave SSH está correta ou se o token expirou.

---

## 🚀 ENDPOINTS PARA USO
**URL Base:** `http://52.67.190.48:3000`

- `GET /health` - Ver se está online
- `POST /comando` - Enviar comando p/ IA
  - **Header:** `x-api-key: SUA_CHAVE`
  - **Body:** `{"comando": "texto..."}`
