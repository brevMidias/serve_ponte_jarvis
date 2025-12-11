# 📋 RESUMO DOS 3 PROMPTS - SISTEMA JARVIS

## Arquitetura Geral

```
┌──────────────────────────────────────────────────────────┐
│ GEMINI LIVE (Conversação + Personality)                 │
│ - Fala com usuário                                       │
│ - Decide QUANDO executar ações                           │
│ - Function calling → Servidor Ponte                      │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ chamar_servidor_ponte({ comando: "..." })
                 ↓
┌──────────────────────────────────────────────────────────┐
│ SERVIDOR PONTE / DEEPSEEK (Processador)                 │
│ - Limpa e processa comando                               │
│ - Valida confiança                                       │
│ - Envia para webhook N8N                                 │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ POST /webhook/jarvis { comando: "..." }
                 ↓
┌──────────────────────────────────────────────────────────┐
│ N8N AGENTE (Executor + Memória)                         │
│ - Decide qual MCP usar                                   │
│ - Executa ferramentas (Spotify, Clima, etc)             │
│ - Memória Zep (histórico, preferências)                 │
│ - Retorna resultado                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 1️⃣ GEMINI LIVE (Personalidade JARVIS)

### **Responsabilidade:**
- Interface com usuário (voz)
- Conversação natural
- Decidir QUANDO chamar função

###  **Características:**
- ✅ Personalidade JARVIS (sofisticado, educado)
- ✅ Trata conversas casuais SEM chamar função
- ✅ Function calling para ações (Spotify, Clima, etc)
- ✅ Confirma ações executadas
- ❌ NÃO tem memória (stateless por sessão)
- ❌ NÃO decide COMO executar (só QUE executar)

### **Exemplos:**

| Usuário | Gemini | Chama Função? |
|---------|--------|---------------|
| "Oi Jarvis" | "Olá, senhor. Como posso ajudar?" | ❌ NÃO |
| "Toca uma música" | [chama função] → "Tocando música" | ✅ SIM |
| "Obrigado" | "Sempre às ordens" | ❌ NÃO |
| "Qual música tocando?" | [chama função] → "Bohemian Rhapsody do Queen" | ✅ SIM |

### **Arquivo:**
- `PROMPT_GEMINI_LIVE.md`

---

## 2️⃣ DEEPSEEK (Servidor Ponte - Processador)

### **Responsabilidade:**
- Receber comando do Gemini
- Processar/limpar comando
- Validar confiança
- Enviar para webhook N8N

### **Características:**
- ✅ Processa linguagem natural → comando limpo
- ✅ Usa contexto (música tocando, etc)
- ✅ Valida confiança (0-1)
- ✅ Simplifica comandos complexos
- ❌ NÃO executa nada
- ❌ NÃO tem memória persistente
- ❌ NÃO fala com usuário

### **Exemplos:**

| Input (Gemini) | Contexto | Output (para N8N) |
|----------------|----------|-------------------|
| "toca Zezé di Camargo" | - | "toca Zezé di Camargo" (0.98) |
| "pausa" | música tocando | "pausa a música" (0.88) |
| "próxima" | música tocando | "próxima música" (0.85) |
| "faz café" | - | "fazer café" (0.1 - baixa confiança) |

### **Arquivo:**
- `PROMPT_DEEPSEEK_SERVIDOR_PONTE.md`

---

## 3️⃣ AGENTE N8N (Executor + Cérebro)

### **Responsabilidade:**
- Receber comando processado
- Decidir qual MCP usar
- Executar ferramentas (possivelmente múltiplas)
- Gerenciar memória (Zep)
- Retornar resultado

### **Características:**
- ✅ Acessa MCPs (Spotify, Clima, etc)
- ✅ Busca antes de executar (ex: buscar artista → tocar)
- ✅ Executa múltiplas ações (ex: busca + toca)
- ✅ Memória Zep (histórico, preferências)
- ✅ Inteligente (escolhe melhor resultado)
- ❌ NÃO fala com usuário diretamente

### **Exemplos:**

| Input (Servidor Ponte) | Ações N8N | Output |
|------------------------|-----------|--------|
| "toca Zezé di Camargo" | 1. procurarArtista("Zezé")<br>2. tocarMusica(artist_id) | "Tocando Zezé Top Hits" |
| "pausa a música" | pausarMusica() | "Música pausada" |
| "qual música?" | tocandoAgora() | "Bohemian Rhapsody - Queen" |
| "toca aquela música de ontem" | 1. Zep: busca histórico<br>2. tocarMusica(last_track_id) | "Tocando [música] novamente" |

### **Arquivo:**
- `PROMPT_AGENTE_N8N.md`

---

## 📊 COMPARAÇÃO LADO A LADO

| Aspecto | **Gemini Live** | **DeepSeek (Ponte)** | **Agente N8N** |
|---------|-----------------|----------------------|----------------|
| **Interface** | Voz (usuário) | HTTP (Gemini) | Webhook (ponte) |
| **Personalidade** | ✅ JARVIS | ❌ Técnico | ❌ Funcional |
| **Memória** | ❌ Não | ❌ Não | ✅ Zep |
| **Executa Ações** | ❌ Não | ❌ Não | ✅ Sim (MCPs) |
| **Conversa** | ✅ Sim | ❌ Não | ❌ Não |
| **Contexto** | ❌ Sessão apenas | ✅ Recebe contexto | ✅ Zep + contexto |
| **Função Principal** | Interface usuário | Processador | Executor |
| **Custo** | Médio (Gemini) | Baixo (DeepSeek) | Variável (N8N) |
| **Latência** | ~200ms | ~100ms | ~300ms |

---

## 🔄 FLUXO COMPLETO - EXEMPLO REAL

### **Cenário:** Usuário quer ouvir Zezé di Camargo

```
┌─────────────────────────────────────────────────────┐
│ 1. USUÁRIO (voz)                                    │
│ "Jarvis, toca Zezé di Camargo"                      │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 2. GEMINI LIVE                                      │
│ - Ouve comando                                      │
│ - Identifica: ação (não é conversa casual)          │
│ - Chama função:                                     │
│   chamar_servidor_ponte({                           │
│     comando: "toca Zezé di Camargo"                 │
│   })                                                │
└────────────────┬────────────────────────────────────┘
                 │ HTTP POST
                 ↓
┌─────────────────────────────────────────────────────┐
│ 3. SERVIDOR PONTE / DEEPSEEK                        │
│ - Recebe: "toca Zezé di Camargo"                    │
│ - Processa: comando já está claro                   │
│ - Valida: confiança 0.98 (alta)                     │
│ - Retorna:                                          │
│   {                                                 │
│     "comando_processado": "toca Zezé di Camargo",   │
│     "confianca": 0.98                               │
│   }                                                 │
│ - Envia para webhook:                               │
│   POST /webhook/jarvis                              │
│   { "comando": "toca Zezé di Camargo" }             │
└────────────────┬────────────────────────────────────┘
                 │ HTTP POST
                 ↓
┌─────────────────────────────────────────────────────┐
│ 4. N8N AGENTE                                       │
│ - Recebe: "toca Zezé di Camargo"                    │
│ - Identifica: Spotify (artista específico)          │
│ - Executa:                                          │
│   1. procurarArtista({ query: "Zezé di Camargo" })  │
│      → Resultado: { id: "abc123", name: "Zezé..." } │
│   2. tocarMusica({ artist_id: "abc123" })           │
│      → Resultado: { sucesso: true }                 │
│ - Adiciona à memória Zep:                           │
│   "Usuário tocou Zezé di Camargo às 15:50"          │
│ - Retorna:                                          │
│   {                                                 │
│     "sucesso": true,                                │
│     "mensagem": "Tocando Zezé Top Hits"             │
│   }                                                 │
└────────────────┬────────────────────────────────────┘
                 │ HTTP Response
                 ↓
┌─────────────────────────────────────────────────────┐
│ 5. SERVIDOR PONTE                                   │
│ - Recebe resposta N8N                               │
│ - Retorna para Gemini                               │
└────────────────┬────────────────────────────────────┘
                 │ Function response
                 ↓
┌─────────────────────────────────────────────────────┐
│ 6. GEMINI LIVE                                      │
│ - Recebe: "Tocando Zezé Top Hits"                   │
│ - Fala (áudio):                                     │
│   "Tocando Zezé Top Hits, senhor."                  │
└─────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 7. USUÁRIO                                          │
│ Ouve confirmação e música começa a tocar            │
└─────────────────────────────────────────────────────┘
```

**Tempo total:** ~800ms (200 Gemini + 100 DeepSeek + 400 N8N + 100 overhead)

---

## 🎯 DECISÕES DE DESIGN

### **Por que 3 IAs?**

| IA | Por que existe? |
|----|-----------------|
| **Gemini** | Melhor para conversação natural + voz + personalidade |
| **DeepSeek** | Barato e rápido para processamento simples |
| **N8N Agent** | Já está no N8N, tem acesso direto aos MCPs, memória é natural lá |

### **Por que memória só no N8N?**

- ✅ N8N tem contexto completo de execuções
- ✅ Zep se integra nativamente com N8N
- ✅ Evita redundância (lembrar em 2 lugares)
- ✅ Servidor Ponte fica statle

ss e escalável

### **Por que não usar só 1 IA?**

**Poderia usar só Gemini Live:**
- ❌ Mais caro (Gemini processa TUDO)
- ❌ Mais lento (múltiplas chamadas Gemini)
- ❌ Menos flexível (tudo acoplado)

**Separação de responsabilidades:**
- ✅ Cada IA faz o que faz melhor
- ✅ Mais barato overall
- ✅ Mais escalável (swap components)

---

## 📁 ARQUIVOS CRIADOS

1. `PROMPT_GEMINI_LIVE.md` - System instruction completo Gemini
2. `PROMPT_DEEPSEEK_SERVIDOR_PONTE.md` - Prompt processador DeepSeek
3. `PROMPT_AGENTE_N8N.md` - Prompt executor N8N
4. `RESUMO_3_PROMPTS.md` - Este arquivo

---

**Criado em:** 2025-12-11  
**Sistema:** Jarvis Bridge  
**Arquitetura:** 3-tier AI (Gemini + DeepSeek + N8N)
