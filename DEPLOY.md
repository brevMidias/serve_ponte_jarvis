# 🚀 Guia Rápido de Deploy - Jarvis Bridge

Guia passo a passo para subir o Jarvis Bridge em um VPS Ubuntu.

## 📋 Pré-requisitos

- VPS Ubuntu 20.04 ou 22.04
- Acesso SSH ao servidor
- Domínio (opcional, mas recomendado)
- Chaves de API:
  - DeepSeek API Key
  - URL do Webhook N8N

---

## 🎯 Deploy Rápido (5 minutos)

### 1️⃣ Conecte no servidor

```bash
ssh seu-usuario@seu-servidor.com
```

### 2️⃣ Clone o repositó

rio

```bash
git clone https://github.com/seu-usuario/jarvis-bridge.git
cd jarvis-bridge
```

### 3️⃣ Execute o script de setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

O script irá:
- ✅ Instalar Node.js 20
- ✅ Instalar PM2
- ✅ Criar diretórios de log
- ✅ Instalar dependências
- ✅ Compilar TypeScript
- ✅ Copiar .env.example para .env

### 4️⃣ Configure as variáveis de ambiente

```bash
nano .env
```

**Edite estas variáveis:**
```env
# DeepSeek
DEEPSEEK_API_KEY=sk-401fbd42cf00493b8c28db07f3027460

# Webhook N8N
JARVIS_WEBHOOK_URL=https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis

# Segurança
API_KEY=sua-chave-secreta-forte-aqui
```

Salve (`Ctrl+O`, `Enter`, `Ctrl+X`)

### 5️⃣ Inicie o servidor

```bash
npm run start:prod
```

### 6️⃣ Salve configuração PM2

```bash
pm2 save
```

### 7️⃣ Configure PM2 para iniciar no boot

```bash
pm2 startup
# Execute o comando sugerido pelo PM2
```

### 8️⃣ Teste o health check

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "online",
  "timestamp": ...,
  "uptime": 1.23
}
```

---

## ✅ Pronto!

Seu Jarvis Bridge está rodando!

### Próximos Passos:

1. **Configure Nginx** (se quiser HTTPS)
2. **Configure Firewall** (libere porta 3000)
3. **Monitore logs:** `pm2 logs jarvis-bridge`

---

## 🔄 Atualizar o Código

Quando fizer mudanças no código:

```bash
# No servidor
cd jarvis-bridge
git pull
npm install
npm run build
pm2 restart jarvis-bridge
```

---

## 🔍 Verificar Status

```bash
# Status do PM2
pm2 status

# Logs em tempo real
pm2 logs jarvis-bridge --lines 50

# Monitor
pm2 monit

# Health check
curl http://localhost:3000/health
```

---

## ⚙️ Configurar Nginx (HTTPS Opcional)

### 1. Instale Nginx

```bash
sudo apt install nginx
```

### 2. Crie configuração

```bash
sudo nano /etc/nginx/sites-available/jarvis-bridge
```

Cole:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Ative configuração

```bash
sudo ln -s /etc/nginx/sites-available/jarvis-bridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. (Opcional) Configure HTTPS com Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

Agora seu servidor estará acessível via HTTPS!

---

## 🔥 Firewall (UFW)

```bash
# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Permitir porta 3000 (se não usar Nginx)
# sudo ufw allow 3000

# Ativar firewall
sudo ufw enable

# Ver status
sudo ufw status
```

---

## 🐛 Troubleshooting

### PM2 não inicia automaticamente após reboot

```bash
# Execute novamente
pm2 startup
# Copie e execute o comando sugerido
pm2 save
```

### Porta 3000 já em uso

```bash
# Veja o que está usando
sudo lsof -i :3000

# Ou mude a porta no .env
PORT=3001
```

### Erro de permissão em /var/log

```bash
sudo mkdir -p /var/log/jarvis-bridge
sudo chown $USER:$USER /var/log/jarvis-bridge
```

---

## 📊 Monitoramento

### PM2 Plus (Opcional - Gratuito)

```bash
# Registre-se em https://app.pm2.io
pm2 link [secret-key] [public-key]
```

Terá dashboard web com:
- Métricas em tempo real
- Logs centralizados
- Alertas
- Deploy automático

---

**Pronto para produção!** 🎉

Qualquer dúvida, veja o README.md principal.
