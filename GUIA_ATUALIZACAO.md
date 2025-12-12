# 🔄 Guia de Atualização Automática do Servidor

## 📋 Visão Geral

O script `update-server.sh` automatiza **TODO** o processo de atualização do servidor quando você faz push para o GitHub.

## 🚀 Uso Rápido

### No servidor Ubuntu:

```bash
cd ~/serve_ponte_jarvis
bash scripts/update-server.sh
```

**Ou tornar executável e rodar diretamente:**

```bash
chmod +x scripts/update-server.sh
./scripts/update-server.sh
```

---

## 🔧 O Que o Script Faz Automaticamente

### 1. ✅ Git Pull
- Verifica se há atualizações no GitHub
- Faz `git pull` se houver mudanças
- Pula se já estiver atualizado

### 2. ✅ Instalação de Dependências
- Detecta se `package.json` foi modificado
- Executa `npm install` **apenas se necessário**
- Economiza tempo quando não há mudanças nas dependências

### 3. ✅ Atualização do .env
- Verifica se `.env` existe
- Detecta novas variáveis no `.env.example`
- Avisa se você precisa atualizar manualmente

### 4. ✅ Build do Projeto
- Compila TypeScript (`npm run build`)
- Gera arquivos em `dist/`
- Para em caso de erro de compilação

### 5. ✅ Gerenciamento de Logs
- Cria diretório `/var/log/jarvis-bridge`
- Configura permissões corretas
- Logs ficam acessíveis

### 6. ✅ PM2 - Processo
- **Se já existe**: Recarrega com `pm2 reload` (zero downtime)
- **Se não existe**: Inicia pela primeira vez
- Atualiza variáveis de ambiente automaticamente

### 7. ✅ Verificação de Saúde
- Aguarda servidor iniciar
- Testa se está respondendo
- Mostra status e logs

---

## 📝 Fluxo de Trabalho Completo

### No seu computador local:

```bash
# 1. Fazer alterações no código
# 2. Commitar e enviar para GitHub
git add .
git commit -m "Atualizações no servidor"
git push origin main
```

### No servidor Ubuntu:

```bash
# 3. Executar script de atualização
cd ~/serve_ponte_jarvis
bash scripts/update-server.sh
```

**Pronto! O servidor está atualizado e rodando** 🎉

---

## 🎯 Primeira Execução

### Passo 1: Tornar o script executável

```bash
cd ~/serve_ponte_jarvis
chmod +x scripts/update-server.sh
```

### Passo 2: Configurar .env (se ainda não fez)

```bash
cp .env.example .env
nano .env
```

Configure todas as variáveis necessárias:
- `AI_PROVIDER=mistral`
- `MISTRAL_API_KEY=...`
- Demais variáveis

### Passo 3: Executar pela primeira vez

```bash
./scripts/update-server.sh
```

### Passo 4: Configurar PM2 Startup (uma vez)

O script mostrará um comando como:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Execute esse comando** para o PM2 iniciar automaticamente no boot.

---

## 📊 Outputs do Script

### ✅ Sucesso:
```
==========================================
✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!
==========================================

Status do servidor:
┌─────┬────────────────┬─────────┬─────────┬─────────┐
│ id  │ name           │ mode    │ status  │ cpu     │
├─────┼────────────────┼─────────┼─────────┼─────────┤
│ 0   │ jarvis-bridge  │ fork    │ online  │ 0%      │
└─────┴────────────────┴─────────┴─────────┴─────────┘

Servidor está respondendo! ✅
🎉 Processo concluído!
```

### ⚠️ Avisos Comuns:

**Nenhuma atualização:**
```
[!] Nenhuma atualização disponível.
```

**Novas variáveis no .env:**
```
[!] Novas variáveis detectadas no .env.example:
  - MISTRAL_API_KEY
  - MISTRAL_BASE_URL
[!] Por favor, atualize seu .env manualmente!
```

---

## 🛠️ Comandos PM2 Úteis

Após a atualização, use estes comandos:

```bash
# Ver logs em tempo real
pm2 logs jarvis-bridge

# Apenas últimas 100 linhas
pm2 logs jarvis-bridge --lines 100

# Limpar logs
pm2 flush

# Status
pm2 status

# Monitor em tempo real (CPU/RAM)
pm2 monit

# Reiniciar manualmente (se necessário)
pm2 restart jarvis-bridge

# Parar
pm2 stop jarvis-bridge

# Deletar do PM2
pm2 delete jarvis-bridge
```

---

## 🔍 Troubleshooting

### Problema: "Git pull falhou"

**Solução:**
```bash
cd ~/serve_ponte_jarvis
git status
git stash  # Se houver mudanças locais
git pull origin main
```

### Problema: "Build falhou"

**Solução:**
```bash
# Ver erro completo
npm run build

# Verificar erros TypeScript
npm run typecheck
```

### Problema: "PM2 não está instalado"

**Solução:**
```bash
sudo npm install -g pm2
```

### Problema: "Servidor não responde"

**Solução:**
```bash
# Ver logs
pm2 logs jarvis-bridge

# Verificar se porta está em uso
sudo lsof -i :3000

# Testar manualmente
curl http://localhost:3000
```

### Problema: "Permissão negada ao executar script"

**Solução:**
```bash
chmod +x scripts/update-server.sh
```

---

## 🔐 Segurança

### ⚠️ Importante:

1. **Nunca commite o arquivo `.env`** - ele contém suas chaves secretas
2. O script **não** sobrescreve seu `.env` existente
3. Variáveis novas devem ser adicionadas **manualmente**

### Verificar segurança:

```bash
npm run verify-security
```

---

## ⚡ Dicas de Performance

### 1. Usar `pm2 reload` (Zero Downtime)

O script usa automaticamente `pm2 reload` que:
- Reinicia sem downtime
- Aplica novas variáveis de ambiente
- Mantém o servidor sempre disponível

### 2. Executar apenas quando necessário

O script é inteligente:
- Pula `npm install` se `package.json` não mudou
- Só faz pull se houver atualizações
- Economiza tempo e recursos

---

## 📅 Automatização com Cron (Opcional)

### Atualizar automaticamente a cada 5 minutos:

```bash
# Editar crontab
crontab -e

# Adicionar esta linha:
*/5 * * * * cd /home/ubuntu/serve_ponte_jarvis && bash scripts/update-server.sh >> /var/log/jarvis-bridge/update.log 2>&1
```

**⚠️ Cuidado:** Isso pode consumir recursos desnecessariamente. Use apenas se realmente necessário.

---

## 🎯 Resumo

### Uso diário:

```bash
# No seu PC: commitar e fazer push
git push origin main

# No servidor: executar script
cd ~/serve_ponte_jarvis && ./scripts/update-server.sh
```

**Simples assim!** 🚀

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `pm2 logs jarvis-bridge`
2. Execute: `npm run verify-security`
3. Consulte a documentação em `Instruções/`
