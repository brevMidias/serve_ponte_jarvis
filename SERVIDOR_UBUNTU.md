# 🚀 COMANDOS PARA EXECUTAR NO SERVIDOR UBUNTU

## ⚡ Primeira Configuração

Execute estes comandos **uma vez** no seu servidor:

```bash
# 1. Ir para o diretório
cd ~/serve_ponte_jarvis

# 2. Atualizar do GitHub (pegar novos scripts)
git pull origin main

# 3. Dar permissão de execução aos scripts
chmod +x scripts/update-server.sh
chmod +x scripts/install-alias.sh

# 4. Instalar o atalho global 'update-jarvis' (RECOMENDADO)
bash scripts/install-alias.sh

# 5. Ativar o atalho
source ~/.bashrc

# 6. Configurar o arquivo .env (se ainda não fez)
nano .env
```

### No arquivo `.env`, adicione:

```bash
# Seletor de API
AI_PROVIDER=mistral

# Mistral API
MISTRAL_API_KEY=QPuCPLluM9zL5Rz95qXpzN3uxnqnXvUZ
MISTRAL_BASE_URL=https://api.mistral.ai/v1
MISTRAL_MODEL=mistral-small-latest
MISTRAL_MAX_TOKENS=200
MISTRAL_TEMPERATURE=0

# DeepSeek API (mantido)
DEEPSEEK_API_KEY=sk-401fbd42cf00493b8c28db07f3027460
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=200
DEEPSEEK_TEMPERATURE=0

# (Demais variáveis já devem estar configuradas)
```

Salve com `Ctrl+X`, depois `Y`, depois `Enter`.

```bash
# 7. Executar primeira atualização
bash scripts/update-server.sh
```

---

## 🔄 Uso Diário (Após Configuração)

Sempre que você fizer push para o GitHub, execute no servidor:

```bash
update-jarvis
```

**Pronto!** O script faz tudo automaticamente:
- Git pull
- npm install (se necessário)
- Build
- PM2 reload
- Verificação

---

## 📋 Comandos Úteis

```bash
# Ver logs em tempo real
pm2 logs jarvis-bridge

# Ver status do servidor
pm2 status

# Reiniciar (se necessário)
pm2 restart jarvis-bridge

# Parar servidor
pm2 stop jarvis-bridge

# Editar variáveis de ambiente
nano ~/serve_ponte_jarvis/.env
pm2 reload jarvis-bridge --update-env
```

---

## 🎯 Resumo

### Uma vez:
```bash
cd ~/serve_ponte_jarvis
git pull origin main
chmod +x scripts/*.sh
bash scripts/install-alias.sh
source ~/.bashrc
bash scripts/update-server.sh
```

### Sempre:
```bash
update-jarvis
```

**Simples assim!** 🚀
