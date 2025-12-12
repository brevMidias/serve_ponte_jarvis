# 🤖 Configuração de API de IA - Servidor Ponte Jarvis

## 📋 Visão Geral

O Servidor Ponte Jarvis agora suporta **duas APIs de IA**:

1. **Mistral AI** (Padrão) ⭐
2. **DeepSeek** (Alternativa)

Você pode alternar entre elas facilmente através de uma variável de ambiente, sem precisar modificar código.

---

## 🔧 Configuração Inicial

### 1. Copiar o arquivo de exemplo

```bash
cp .env.example .env
```

### 2. Editar o arquivo `.env`

Abra o arquivo `.env` e configure as variáveis necessárias.

---

## 🎯 Variáveis de Ambiente

### Seletor de API

```bash
# Opções: 'mistral' ou 'deepseek'
AI_PROVIDER=mistral
```

### Mistral AI (Padrão)

```bash
MISTRAL_API_KEY=QPuCPLluM9zL5Rz95qXpzN3uxnqnXvUZ
MISTRAL_BASE_URL=https://api.mistral.ai/v1
MISTRAL_MODEL=mistral-small-latest
MISTRAL_MAX_TOKENS=200
MISTRAL_TEMPERATURE=0
```

### DeepSeek (Alternativa)

```bash
DEEPSEEK_API_KEY=sk-401fbd42cf00493b8c28db07f3027460
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=200
DEEPSEEK_TEMPERATURE=0
```

---

## 🔄 Como Alternar Entre APIs

### Usar Mistral (Padrão)

No arquivo `.env`, defina:

```bash
AI_PROVIDER=mistral
```

### Usar DeepSeek

No arquivo `.env`, defina:

```bash
AI_PROVIDER=deepseek
```

### Aplicar Mudanças

Após alterar a variável `AI_PROVIDER`, **reinicie o servidor**:

```bash
npm run dev
# ou em produção
pm2 restart jarvis-bridge
```

---

## ✅ Verificação

Quando o servidor iniciar, você verá nos logs qual API está sendo usada:

```
✅ Usando Mistral AI como provedor de IA (padrão)
```

ou

```
✅ Usando DeepSeek como provedor de IA
```

---

## 📊 Comparação das APIs

| Característica | Mistral AI | DeepSeek |
|----------------|------------|----------|
| **Status** | Padrão ⭐ | Alternativa |
| **Modelo** | mistral-small-latest | deepseek-chat |
| **Velocidade** | Rápida | Muito rápida |
| **Precisão** | Alta | Alta |
| **Custo** | Médio | Baixo |

---

## 🔐 Segurança

### ⚠️ IMPORTANTE

1. **NUNCA commite o arquivo `.env`** para o Git
2. O arquivo `.env` deve estar listado no `.gitignore`
3. Todas as API Keys devem permanecer secretas
4. Use o `.env.example` como referência, mas sem as chaves reais

### Verificar Segurança

```bash
# Verificar se .env está no gitignore
cat .gitignore | grep .env

# Verificar se .env não está trackeado
git status --ignored
```

---

## 🧪 Teste de Funcionamento

### 1. Testar API Mistral

```bash
# No .env
AI_PROVIDER=mistral

# Reiniciar servidor
npm run dev

# Fazer uma requisição de teste
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{"comando": "tocar música relaxante", "sessionId": "test-123"}'
```

### 2. Testar API DeepSeek

```bash
# No .env
AI_PROVIDER=deepseek

# Reiniciar servidor
npm run dev

# Fazer uma requisição de teste
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{"comando": "qual é a previsão do tempo", "sessionId": "test-123"}'
```

---

## 🛠️ Personalização

### Ajustar Parâmetros do Modelo

Você pode ajustar os parâmetros de cada modelo no arquivo `.env`:

#### Max Tokens
Controla o tamanho máximo da resposta

```bash
MISTRAL_MAX_TOKENS=200  # Padrão: 200
DEEPSEEK_MAX_TOKENS=200 # Padrão: 200
```

#### Temperature
Controla a criatividade (0 = determinístico, 1 = criativo)

```bash
MISTRAL_TEMPERATURE=0   # Padrão: 0 (mais preciso)
DEEPSEEK_TEMPERATURE=0  # Padrão: 0 (mais preciso)
```

---

## 📝 Logs e Monitoramento

O sistema registra automaticamente:

- Qual API está sendo usada
- Tempo de resposta
- Erros e avisos
- Confiança nas decisões

Consulte os logs em:

```bash
# Desenvolvimento
npm run dev

# Produção (PM2)
pm2 logs jarvis-bridge
```

---

## 🚨 Solução de Problemas

### Erro: "Cannot find API key"

**Solução:**
1. Verifique se o arquivo `.env` existe
2. Confirme que as variáveis estão definidas corretamente
3. Reinicie o servidor

### Erro: "Invalid API provider"

**Solução:**
1. Verifique se `AI_PROVIDER` é 'mistral' ou 'deepseek'
2. Corrija no arquivo `.env`
3. Reinicie o servidor

### API não responde

**Solução:**
1. Verifique sua conexão com a internet
2. Confirme que a API key está válida
3. Tente alternar para a outra API
4. Consulte os logs para mais detalhes

---

## 📚 Recursos Adicionais

### Documentação das APIs

- [Mistral AI Docs](https://docs.mistral.ai/)
- [DeepSeek Docs](https://api-docs.deepseek.com/)

### Suporte

Para problemas ou dúvidas:
1. Consulte os logs do servidor
2. Verifique a documentação das APIs
3. Revise este guia de configuração

---

## 🎯 Resumo Rápido

1. ✅ Copie `.env.example` para `.env`
2. ✅ Configure suas API keys
3. ✅ Escolha o provedor: `AI_PROVIDER=mistral` ou `AI_PROVIDER=deepseek`
4. ✅ Reinicie o servidor
5. ✅ Verifique os logs para confirmar

**Pronto! Seu servidor está usando a API selecionada** 🚀
