# ⚡ SOLUÇÃO PARA O ERRO DO PM2

## 🔴 Problema Encontrado

Você tentou executar:
```bash
pm2 restart jarvis-bridge
```

E recebeu o erro:
```
[PM2][ERROR] Process or Namespace jarvis-bridge not found
```

## ✅ Solução

O processo ainda não foi iniciado. Execute estes comandos:

```bash
# 1. Ir para o diretório (você já está lá)
cd ~/serve_ponte_jarvis

# 2. Dar permissão aos scripts
chmod +x scripts/update-server.sh
chmod +x scripts/install-alias.sh

# 3. OPÇÃO A: Usar o script de atualização (RECOMENDADO)
bash scripts/update-server.sh
```

**OU**

```bash
# 3. OPÇÃO B: Iniciar manualmente com PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 🎯 Comandos Passo-a-Passo

### Para usar o script automático (recomendado):

```bash
# Estando em: /home/ubuntu/serve_ponte_jarvis

# 1. Tornar executável
chmod +x scripts/update-server.sh

# 2. Executar
bash scripts/update-server.sh

# 3. Configurar atalho (opcional mas muito útil)
chmod +x scripts/install-alias.sh
bash scripts/install-alias.sh
source ~/.bashrc

# 4. Da próxima vez, usar apenas:
update-jarvis
```

### Para iniciar manualmente:

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/jarvis-bridge
sudo chown -R ubuntu:ubuntu /var/log/jarvis-bridge

# Iniciar com PM2
pm2 start ecosystem.config.cjs

# Salvar configuração
pm2 save

# Configurar startup automático
pm2 startup
# Execute o comando que aparecer na tela

# Ver status
pm2 status
```

---

## 📋 O Que Fazer Agora

### Passo 1: Executar o script
```bash
bash scripts/update-server.sh
```

Este script vai:
- ✅ Criar diretórios de logs
- ✅ Verificar se build está pronto
- ✅ Iniciar o PM2 pela primeira vez
- ✅ Salvar configuração
- ✅ Verificar se servidor está respondendo

### Passo 2: Configurar o atalho (opcional)
```bash
bash scripts/install-alias.sh
source ~/.bashrc
```

Depois você só precisará executar:
```bash
update-jarvis
```

---

## 🔍 Verificação

Após executar, você deve ver:

```
========================================
✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!
========================================

Status do servidor:
┌─────┬────────────────┬─────────┬─────────┐
│ id  │ name           │ mode    │ status  │
├─────┼────────────────┼─────────┼─────────┤
│ 0   │ jarvis-bridge  │ fork    │ online  │
└─────┴────────────────┴─────────┴─────────┘

Servidor está respondendo! ✅
```

---

## 💡 Comandos Úteis Depois

```bash
# Ver logs
pm2 logs jarvis-bridge

# Ver status
pm2 status

# Reiniciar
pm2 restart jarvis-bridge

# Parar
pm2 stop jarvis-bridge
```

---

## 🎯 Resumo Super Rápido

```bash
cd ~/serve_ponte_jarvis
chmod +x scripts/update-server.sh
bash scripts/update-server.sh
```

**Pronto!** O servidor estará rodando! 🚀
