# 🌉 Jarvis Bridge - Servidor Ponte

Servidor Node.js/TypeScript que atua como ponte inteligente entre comandos de usuário e webhooks N8N, com processamento de IA.

## 🚀 Início Rápido

### 1. Configuração

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar configurações (IMPORTANTE!)
nano .env
```

### 2. Seleção de API de IA

O servidor suporta duas APIs de IA:

- **Mistral AI** (Padrão) ⭐
- **DeepSeek** (Alternativa)

**Configure no `.env`:**

```bash
# Para usar Mistral (padrão)
AI_PROVIDER=mistral

# OU para usar DeepSeek
AI_PROVIDER=deepseek
```

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔐 Segurança

⚠️ **NUNCA commite o arquivo `.env`** - todas as API keys devem permanecer secretas!

## 🔄 Atualização do Servidor (Ubuntu/VPS)

Após fazer push para o GitHub, atualize seu servidor automaticamente:

```bash
cd ~/serve_ponte_jarvis
bash scripts/update-server.sh
```

**O script faz automaticamente:**
- ✅ Git pull
- ✅ npm install (se necessário)
- ✅ npm run build
- ✅ PM2 reload (zero downtime)
- ✅ Verificação de saúde do servidor

**Primeira vez? Configure o atalho:**

```bash
chmod +x scripts/install-alias.sh
bash scripts/install-alias.sh
source ~/.bashrc
```

**Depois use apenas:**

```bash
update-jarvis
```

De qualquer diretório! 🚀

📖 **Guia completo**: [GUIA_ATUALIZACAO.md](./GUIA_ATUALIZACAO.md)

## 📚 Documentação Completa

- [**Configuração de APIs de IA**](./Instruções/CONFIGURACAO_API_IA.md) - Como alternar entre Mistral e DeepSeek
- [**Guia de Atualização**](./GUIA_ATUALIZACAO.md) - Como atualizar o servidor automaticamente
- [Guia de Integração Frontend](./Instruções/GUIA_INTEGRACAO_FRONTEND.md)
- [Prompt DeepSeek](./Instruções/PROMPT_DEEPSEEK_SERVIDOR_PONTE.md)
- [Deploy](./DEPLOY.md)

## 🛠️ Tecnologias

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **IA**: Mistral AI / DeepSeek (alternável)
- **Integração**: N8N Webhooks
- **Validação**: Zod

## 📞 Suporte

Para dúvidas sobre configuração, consulte a [documentação de APIs](./Instruções/CONFIGURACAO_API_IA.md).