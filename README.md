# 🤖 Jarvis Bridge - Servidor Ponte Inteligente

Servidor intermediário entre Gemini Live e N8N para o sistema Jarvis.

## 📋 Sobre

O **Jarvis Bridge** é um servidor Node.js/TypeScript que:
- Recebe comandos do **Gemini Live** (voz via API)
- Processa com **DeepSeek AI** (decisor inteligente)
- Envia para **Webhook N8N** (execução via MCPs)
- Retorna resposta para o Gemini

### Arquitetura

```
Gemini Live (voz) 
    ↓
Jarvis Bridge (este servidor)
    ├─► DeepSeek (processa comando)
    └─► Webhook N8N (executa via MCPs)
        ↓
    Resposta → Gemini Live
```

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 20+ LTS
- **npm** ou **yarn**
- **Ubuntu** 20.04/22.04 (para produção)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/jarvis-bridge.git
cd jarvis-bridge
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

**Variáveis obrigatórias:**
```env
DEEPSEEK_API_KEY=sk-...        # Sua chave DeepSeek
JARVIS_WEBHOOK_URL=https://...  # URL do webhook N8N
API_KEY=sua-chave-segura        # Para auth do Gemini
```

### 3. Instale dependências

```bash
npm install
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

O servidor estará em: `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
jarvis-bridge/
├── src/
│   ├── index.ts           # Entrada principal
│   ├── config/
│   │   └── index.ts       # Configurações
│   ├── server/
│   │   └── http.ts        # Servidor Fastify
│   ├── ai/
│   │   ├── decisor.ts     # DeepSeek + Webhook
│   │   └── prompts.ts     # System prompts
│   ├── validators/
│   │   └── schemas.ts     # Schemas Zod
│   ├── middleware/
│   │   └── auth.ts        # Autenticação
│   ├── utils/
│   │   └── logger.ts      # Sistema de logs
│   └── types/
│       └── index.ts       # Tipos TypeScript
├── scripts/
│   └── setup.sh           # Script de instalação Ubuntu
├── dist/                  # Build (gerado)
├── package.json
├── tsconfig.json
├── ecosystem.config.cjs   # PM2 config
├── Dockerfile
└── docker-compose.yml
```

## 📡 API Endpoints

### `GET /health`
Health check do servidor

**Resposta:**
```json
{
  "status": "online",
  "timestamp": 1702480000,
  "uptime": 1234.56,
  "service": "jarvis-bridge",
  "version": "1.0.0"
}
```

### `POST /comando`
Processa comando de voz

**Headers:**
```
x-api-key: sua-chave-api
Content-Type: application/json
```

**Body:**
```json
{
  "comando": "toca Zezé di Camargo",
  "contexto": {
    "musicaTocando": false
  },
  "sessionId": "uuid-opcional"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Tocando Zezé Top Hits",
  "dados": {
    "resultado": { ... },
    "tempoTotal": 450
  },
  "requestId": "uuid",
  "timestamp": 1702480000
}
```

### `GET /status`
Status detalhado do sistema

## 🔧 Deploy em Produção (Ubuntu VPS)

### Método 1: PM2 (Recomendado)

```bash
# 1. Clone no servidor
git clone https://github.com/seu-usuario/jarvis-bridge.git
cd jarvis-bridge

# 2. Execute script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Configure .env
nano .env

# 4. Compile
npm run build

# 5. Inicie com PM2
npm run start:prod

# 6. Salve configuração PM2
pm2 save

# 7. Configure PM2 para iniciar no boot
pm2 startup
# Execute o comando sugerido

# 8. Verifique status
pm2 status
pm2 logs jarvis-bridge
```

### Método 2: Docker

```bash
# 1. Build
docker-compose build

# 2. Inicie
docker-compose up -d

# 3. Logs
docker-compose logs -f

# 4. Status
docker-compose ps
```

## 🔍 Monitoramento

### PM2

```bash
# Logs em tempo real
pm2 logs jarvis-bridge

# Monitor
pm2 monit

# Status
pm2 status

# Restart
pm2 restart jarvis-bridge

# Stop
pm2 stop jarvis-bridge
```

### Logs

Logs são salvos em:
- **Desenvolvimento:** Console (pino-pretty)
- **Produção:** `/var/log/jarvis-bridge/`
  - `error.log` - Erros
  - `out.log` - Output normal
  - `combined.log` - Tudo

## 🛠️ Desenvolvimento

### Scripts disponíveis

```bash
npm run dev          # Desenvolvimento com watch
npm run build        # Compila TypeScript
npm start            # Inicia build compilado
npm run start:prod   # Inicia com PM2
npm run typecheck    # Verifica tipos
npm run lint         # ESLint
```

### Testar localmente

```bash
# Health check
curl http://localhost:3000/health

# Comando (com auth)
curl -X POST http://localhost:3000/comando \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave" \
  -d '{"comando": "pausa a música"}'
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta HTTP | `3000` |
| `HOST` | Host | `0.0.0.0` |
| `DEEPSEEK_API_KEY` | API Key DeepSeek | - |
| `DEEPSEEK_MODEL` | Modelo DeepSeek | `deepseek-chat` |
| `JARVIS_WEBHOOK_URL` | URL webhook N8N | - |
| `API_KEY` | API Key para auth | - |
| `LOG_LEVEL` | Nível de log | `info` |

Ver `.env.example` para lista completa.

## 🔐 Segurança

- ✅ Autenticação via API Key (`x-api-key` header)
- ✅ Rate limiting (100 req/min por padrão)
- ❌ CORS aberto para desenvolvimento (configure em prod)
- ⚠️ **IMPORTANTE:** Use HTTPS em produção!

### Recomendações:

1. Use API Keys fortes (min 32 caracteres)
2. Configure firewall (libere apenas porta 3000)
3. Use HTTPS (Nginx reverse proxy + Let's Encrypt)
4. Rotacione keys regularmente
5. Monitor logs para atividades suspeitas

## 🐛 Troubleshooting

### Erro: "API Key inválida"
- Verifique header `x-api-key` no request
- Confirme `.env` tem `API_KEY` configurado

### Erro: "Webhook N8N está desabilitado"
- Configure `JARVIS_WEBHOOK_ENABLED=true` no `.env`
- Verifique `JARVIS_WEBHOOK_URL` está correto

### Servidor não inicia
```bash
# Veja logs
pm2 logs jarvis-bridge --lines 100

# Verifique porta
sudo lsof -i :3000

# Teste compilação
npm run build
```

### Alta latência
- Verifique conectividade com N8N
- Monitore logs do DeepSeek
- Aumente timeout do webhook se necessário

## 📚 Links Úteis

- **DeepSeek API:** https://platform.deepseek.com/
- **Fastify Docs:** https://fastify.dev/
- **PM2 Docs:** https://pm2.keymetrics.io/
- **N8N Docs:** https://docs.n8n.io/

## 📝 Licença

MIT

## 🤝 Contribuindo

Pull requests são bem-vindos!

## 📞 Suporte

Problemas ou dúvidas? Abra uma issue no GitHub.

---

**Versão:** 1.0.0  
**Última atualização:** 2025-12-11  
**Maintainer:** Seu Nome
