# ⚡ Comandos Rápidos - Servidor Ubuntu

## 🔄 Atualização Automática

### Método 1: Script Direto
```bash
cd ~/serve_ponte_jarvis
bash scripts/update-server.sh
```

### Método 2: Atalho Global (Recomendado)
```bash
# Configurar uma vez:
cd ~/serve_ponte_jarvis
chmod +x scripts/install-alias.sh
bash scripts/install-alias.sh
source ~/.bashrc

# Depois usar sempre:
update-jarvis
```

---

## 📊 Gerenciamento PM2

### Status e Monitoramento
```bash
pm2 status                    # Status de todos os processos
pm2 logs jarvis-bridge        # Logs em tempo real
pm2 logs jarvis-bridge --lines 100  # Últimas 100 linhas
pm2 monit                     # Monitor CPU/RAM em tempo real
pm2 show jarvis-bridge        # Detalhes completos
```

### Controle do Processo
```bash
pm2 restart jarvis-bridge     # Reiniciar
pm2 reload jarvis-bridge      # Reload sem downtime
pm2 stop jarvis-bridge        # Parar
pm2 start jarvis-bridge       # Iniciar
pm2 delete jarvis-bridge      # Remover do PM2
```

### Logs
```bash
pm2 flush                     # Limpar todos os logs
pm2 logs --err                # Apenas erros
pm2 logs --json               # Formato JSON
```

---

## 🔧 Configuração

### Editar Variáveis de Ambiente
```bash
cd ~/serve_ponte_jarvis
nano .env
# Após editar, reiniciar:
pm2 reload jarvis-bridge --update-env
```

### Alternar API de IA

**Para Mistral (padrão):**
```bash
nano .env
# Mudar para: AI_PROVIDER=mistral
pm2 reload jarvis-bridge --update-env
```

**Para DeepSeek:**
```bash
nano .env
# Mudar para: AI_PROVIDER=deepseek
pm2 reload jarvis-bridge --update-env
```

---

## 🛠️ Build e Desenvolvimento

### Build Manual
```bash
cd ~/serve_ponte_jarvis
npm run build
pm2 restart jarvis-bridge
```

### Testar Localmente (sem PM2)
```bash
cd ~/serve_ponte_jarvis
npm run dev
# Ctrl+C para parar
```

### Verificar TypeScript
```bash
npm run typecheck
```

### Verificar Segurança
```bash
npm run verify-security
```

---

## 🐛 Debug e Troubleshooting

### Ver Erros Recentes
```bash
pm2 logs jarvis-bridge --err --lines 50
```

### Verificar Se Servidor Está Respondendo
```bash
curl http://localhost:3000
```

### Ver Variáveis de Ambiente
```bash
pm2 env jarvis-bridge
```

### Reiniciar Completamente
```bash
pm2 delete jarvis-bridge
cd ~/serve_ponte_jarvis
pm2 start ecosystem.config.cjs
pm2 save
```

### Verificar Porta em Uso
```bash
sudo lsof -i :3000
```

### Verificar Processos Node
```bash
ps aux | grep node
```

---

## 📦 Git

### Atualizar do GitHub
```bash
cd ~/serve_ponte_jarvis
git pull origin main
npm run build
pm2 reload jarvis-bridge --update-env
```

### Verificar Status
```bash
git status
git log --oneline -5  # Últimos 5 commits
```

### Desfazer Mudanças Locais
```bash
git stash
git pull origin main
```

---

## 🗂️ Arquivos e Diretórios

### Logs do Sistema
```bash
# PM2 logs
tail -f /var/log/jarvis-bridge/out.log
tail -f /var/log/jarvis-bridge/error.log
tail -f /var/log/jarvis-bridge/combined.log

# Limpar logs antigos
sudo truncate -s 0 /var/log/jarvis-bridge/*.log
```

### Ver Espaço em Disco
```bash
df -h
du -sh ~/serve_ponte_jarvis
du -sh ~/serve_ponte_jarvis/node_modules
```

### Limpar Cache Node
```bash
cd ~/serve_ponte_jarvis
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 Segurança

### Verificar .env Está Protegido
```bash
cd ~/serve_ponte_jarvis
cat .gitignore | grep .env
git status --ignored | grep .env
```

### Permissões de Logs
```bash
sudo chown -R ubuntu:ubuntu /var/log/jarvis-bridge
sudo chmod 755 /var/log/jarvis-bridge
```

---

## 🚀 PM2 Startup

### Configurar Boot Automático
```bash
pm2 startup
# Executar o comando mostrado
pm2 save
```

### Remover Startup
```bash
pm2 unstartup
```

### Listar Apps Salvos
```bash
pm2 list
```

---

## 📈 Performance

### Ver Uso de Recursos
```bash
pm2 monit
```

### Informações do Sistema
```bash
free -h              # Memória
top                  # CPU/Processos
htop                 # top melhorado (se instalado)
```

### Reiniciar por Uso de Memória
```bash
# Ver memória do processo
pm2 show jarvis-bridge | grep memory

# PM2 já reinicia automaticamente se ultrapassar 512M
# (configurado no ecosystem.config.cjs)
```

---

## ⚡ Atalhos Úteis

Adicione ao seu `~/.bashrc` para facilitar:

```bash
# Atalhos Jarvis
alias jarvis-logs='pm2 logs jarvis-bridge'
alias jarvis-status='pm2 status jarvis-bridge'
alias jarvis-restart='pm2 restart jarvis-bridge'
alias jarvis-reload='pm2 reload jarvis-bridge --update-env'
alias jarvis-update='cd ~/serve_ponte_jarvis && bash scripts/update-server.sh'
alias jarvis-env='cd ~/serve_ponte_jarvis && nano .env'
```

Depois:
```bash
source ~/.bashrc
```

---

## 🎯 Fluxo de Trabalho Diário

### Atualização Normal
```bash
update-jarvis          # ou bash scripts/update-server.sh
```

### Mudança nas Variáveis de Ambiente
```bash
nano ~/serve_ponte_jarvis/.env
pm2 reload jarvis-bridge --update-env
```

### Ver o que está acontecendo
```bash
pm2 logs jarvis-bridge
```

---

## 📞 Comandos de Emergência

### Servidor Travou
```bash
pm2 restart jarvis-bridge --update-env
```

### Servidor Não Responde
```bash
pm2 delete jarvis-bridge
cd ~/serve_ponte_jarvis
pm2 start ecosystem.config.cjs
pm2 save
```

### Limpar Tudo e Recomeçar
```bash
cd ~/serve_ponte_jarvis
pm2 delete jarvis-bridge
rm -rf node_modules dist
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 💡 Dicas

1. **Use `reload` em vez de `restart`** quando possível (zero downtime)
2. **Sempre use `--update-env`** ao recarregar após mudar o .env
3. **Execute `pm2 save`** após mudanças importantes
4. **Monitore os logs** regularmente: `pm2 logs jarvis-bridge`
5. **Configure o atalho** `update-jarvis` para facilitar sua vida

---

**Salve este arquivo como referência rápida!** 📌
