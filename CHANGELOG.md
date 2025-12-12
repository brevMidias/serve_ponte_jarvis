# 📝 Changelog - Suporte Multi-API

## [1.1.0] - 2025-12-12

### ✨ Novidades

#### 🤖 Suporte a Múltiplas APIs de IA

- **Mistral AI** agora é o provedor padrão
- **DeepSeek** mantido como alternativa
- Sistema de alternância simples via variável de ambiente `AI_PROVIDER`

### 🔧 Alterações Técnicas

#### Configuração (`.env`)
- ➕ Adicionado `AI_PROVIDER` - seletor de API ('mistral' ou 'deepseek')
- ➕ Adicionado `MISTRAL_API_KEY` - chave da API Mistral
- ➕ Adicionado `MISTRAL_BASE_URL` - URL base da API Mistral
- ➕ Adicionado `MISTRAL_MODEL` - modelo Mistral (mistral-small-latest)
- ➕ Adicionado `MISTRAL_MAX_TOKENS` - limite de tokens Mistral
- ➕ Adicionado `MISTRAL_TEMPERATURE` - temperatura Mistral
- ✅ Mantido todas as variáveis DeepSeek para compatibilidade

#### Código Fonte

**`src/config/index.ts`**
- ➕ Schema de validação para Mistral
- ➕ Campo `aiProvider` no schema de configuração
- ➕ Suporte a múltiplos provedores de IA

**`src/ai/decisor.ts`**
- ♻️ Refatorado de cliente único para multi-cliente
- ➕ Cliente Mistral inicializado
- ➕ Cliente DeepSeek mantido
- ➕ Função `getAIClient()` - seletor dinâmico de provedor
- ✅ Logs indicam qual provedor está sendo usado
- ♻️ Função `processarComando()` usa seletor dinâmico

### 🔐 Segurança

#### Novo Script de Verificação
- ➕ `scripts/verify-security.js` - verifica API keys expostas
- ➕ Comando `npm run verify-security` disponível
- ✅ Valida se `.env` está no `.gitignore`
- ✅ Detecta API keys hardcoded no código
- ✅ Verifica configuração de provedor

### 📚 Documentação

#### Novos Arquivos
- ➕ `Instruções/CONFIGURACAO_API_IA.md` - guia completo de APIs
- ♻️ `README.md` - atualizado com informações de multi-API

#### Conteúdo da Documentação
- ✅ Como alternar entre APIs
- ✅ Configuração de cada provedor
- ✅ Troubleshooting
- ✅ Melhores práticas de segurança
- ✅ Exemplos de uso

### 🔄 Compatibilidade

#### Retrocompatibilidade
- ✅ Projetos existentes continuam funcionando
- ✅ DeepSeek pode ser usado alterando `AI_PROVIDER=deepseek`
- ✅ Configurações antigas do DeepSeek mantidas

#### Migração
Para projetos existentes:

1. Copie as novas variáveis do `.env.example` para seu `.env`
2. Configure `AI_PROVIDER=mistral` (ou mantenha `deepseek`)
3. Adicione as credenciais da API escolhida
4. Reinicie o servidor

### 📦 Package.json

**Novos Scripts**
- `verify-security` - verificação de segurança

**Keywords Atualizadas**
- ➕ "mistral"
- ➕ "ai"

### 🎯 Benefícios

1. **Flexibilidade**: Troque de API sem mudar código
2. **Segurança**: Todas as chaves em variáveis de ambiente
3. **Failover**: Use outra API se uma estiver indisponível
4. **Custo**: Escolha a API mais econômica
5. **Performance**: Teste qual API responde mais rápido

### ⚠️ Breaking Changes

**Nenhum!** Totalmente retrocompatível.

### 📊 Comparação de APIs

| Aspecto | Mistral AI | DeepSeek |
|---------|-----------|----------|
| Status | Padrão ⭐ | Alternativa |
| Modelo | mistral-small-latest | deepseek-chat |
| Performance | Rápida | Muito rápida |
| Custo | Médio | Baixo |
| Qualidade | Alta | Alta |

### 🚀 Próximos Passos Sugeridos

1. [ ] Adicionar suporte a Claude (Anthropic)
2. [ ] Adicionar suporte a GPT-4 (OpenAI)
3. [ ] Implementar fallback automático entre APIs
4. [ ] Adicionar cache de respostas
5. [ ] Métricas de uso por provedor

### 🐛 Correções

- ✅ Script de verificação convertido para ES modules
- ✅ Todos os testes de segurança passando

### 📝 Notas

- Todas as API keys permanecem secretas no `.env`
- O `.env.example` contém exemplos seguros
- Documentação completa disponível em `Instruções/`

---

## Como Usar Esta Versão

```bash
# 1. Atualizar dependências (se necessário)
npm install

# 2. Atualizar .env com novas variáveis
cp .env.example .env.new
# Copie as variáveis do Mistral para seu .env

# 3. Verificar segurança
npm run verify-security

# 4. Testar
npm run dev
```

---

**Versão**: 1.1.0  
**Data**: 2025-12-12  
**Autor**: Atualização de API Multi-Provedor
