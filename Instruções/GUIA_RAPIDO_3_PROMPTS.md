# 🎯 GUIA RÁPIDO - SISTEMA JARVIS (3 IAs)

## 🏗️ ARQUITETURA VISUAL

```
          👤 USUÁRIO
            │
            │ "Jarvis, toca uma música"
            ↓
    ┌───────────────────┐
    │   GEMINI LIVE    │  🎭 Personalidade JARVIS
    │  (Conversação)   │  ✅ Conversa natural
    │                  │  ✅ Identifica intenções
    └────────┬──────────┘  ❌ Não executa
             │
             │ Function Call
             │ { comando: "toca uma música" }
             ↓
    ┌───────────────────┐
    │   DEEPSEEK       │  🧹 Processador
    │ (Servidor Ponte) │  ✅ Limpa comando
    │                  │  ✅ Valida confiança
    └────────┬──────────┘  ❌ Não decide qual MCP
             │
             │ POST /webhook/jarvis
             │ { comando: "toca uma música" }
             ↓
    ┌───────────────────┐
    │   AGENTE N8N     │  🤖 Executor
    │   (Webhook)      │  ✅ Decide MCP
    │                  │  ✅ Executa ações
    │   ┌───────────┐  │  ✅ Memória (Zep)
    │   │ MCP       │  │
    │   │ Spotify   │  │
    │   └───────────┘  │
    └────────┬──────────┘
             │
             │ { sucesso: true, mensagem: "..." }
             ↓
          🔊 Música toca!
```

---

## 🎯 RESPONSABILIDADES (Resumo de 1 linha)

| IA | 1 linha |
|----|---------|
| **Gemini** | "Conversa com usuário e identifica quando precisa executar algo" |
| **DeepSeek** | "Limpa e valida comandos antes de enviar pro N8N" |
| **N8N Agente** | "Executa usando MCPs e guarda na memória" |

---

## ✅ CHECKLIST DE USO

### **Use Gemini para:**
- [ ] Responder "oi", "obrigado", conversas casuais
- [ ] Identificar quando usuário quer AÇÃO
- [ ] Confirmar ações pro usuário ("Música pausada, senhor")
- [ ] Personalidade JARVIS

### **Use DeepSeek para:**
- [ ] Processar comandos do Gemini
- [ ] Simplificar ("Jarvis, por favor, toca..." → "toca música")
- [ ] Validar confidence
- [ ] Usar contexto (música tocando, etc)

### **Use N8N para:**
- [ ] Decidir qual MCP (Spotify? Clima?)
- [ ] Executar ferramentas
- [ ] Buscar antes de executar ("Zezé" → busca artista → toca)
- [ ] Guardar em memória Zep

---

## 📜 ONDE CADA PROMPT ESTÁ

| Prompt | Arquivo | Onde usar |
|--------|---------|-----------|
| Gemini Live | `PROMPT_GEMINI_LIVE.md` | System Instruction do Gemini 2.0 Flash |
| DeepSeek | `PROMPT_DEEPSEEK_SERVIDOR_PONTE.md` | `src/ai/decisor.ts` (variável systemPrompt) |
| N8N Agente | `PROMPT_AGENTE_N8N.md` | AI Agent node do N8N (system message) |

---

## 🚀 COMEÇAR RÁPIDO

### 1. **Configure Gemini Live**
```python
import google.generativeai as genai

# Leia PROMPT_GEMINI_LIVE.md
with open('PROMPT_GEMINI_LIVE.md') as f:
    system_instruction = f.read()

model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    system_instruction=system_instruction,
    tools=[chamar_servidor_ponte_tool]  # Function calling
)
```

### 2. **Configure Servidor Ponte (DeepSeek)**
```typescript
// src/ai/decisor.ts
import { PROMPT_DEEPSEEK } from './prompts';

const response = await deepseek.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: PROMPT_DEEPSEEK },
    { role: 'user', content: comando }
  ]
});
```

### 3. **Configure N8N**
- Crie workflow com Webhook trigger
- Adicione AI Agent node
- Cole `PROMPT_AGENTE_N8N.md` no System Message
- Conecte MCPs (Spotify, etc)
- (Opcional) Adicione Zep Memory node

---

## 🔍 TROUBLESHOOTING RÁPIDO

| Problema | Onde olhar | Solução |
|----------|------------|---------|
| Gemini não chama função | PROMPT_GEMINI_LIVE.md | Melhorar exemplos de "quando usar" |
| DeepSeek baixa confiança | PROMPT_DEEPSEEK...md | Adicionar mais exemplos de comandos |
| N8N não acha música | PROMPT_AGENTE_N8N.md | Revisar estratégia de busca |
| N8N não usa memória | Workflow N8N | Adicionar Zep node antes do agente |

---

**Arquivos:** 4 (3 prompts + 1 resumo + 1 guia)  
**Atualizado:** 2025-12-11
