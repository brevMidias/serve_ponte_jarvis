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

## 📚 Documentação Completa

- [**Configuração de APIs de IA**](./Instruções/CONFIGURACAO_API_IA.md) - Como alternar entre Mistral e DeepSeek
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