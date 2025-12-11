# 🔧 TROUBLESHOOTING - N8N + MCP SPOTIFY

## ❌ PROBLEMA IDENTIFICADO

**Sintomas:**
1. Agente N8N responde com texto genérico
2. MCP Spotify NÃO é executado
3. Erro ao ver histórico: "Cannot read properties of null (reading 'data')"
4. Música não toca

**Causa:** Agente AI Node não está configurado para usar as Tools do MCP.

---

## ✅ SOLUÇÃO: Configurar AI Agent Corretamente

### 1. **Verificar Conexão do MCP Spotify**

No N8N, verifique se:
- [ ] MCP Spotify está conectado e ativo
- [ ] Credentials estão configuradas
- [ ] Você consegue ver as tools disponíveis

**Tools esperadas do MCP Spotify:**
- `pausarMusica`
- `tocarMusica`
- `pularMusica`
- `continuarMusica`
- `tocandoAgora`
- `procurarPlaylist`
- `procurarArtista`
- `procurarMusica`
- `ajustarVolume`

---

### 2. **Configurar AI Agent Node**

No Workflow N8N:

#### A) **Agent Configuration**

Certifique-se que o AI Agent tem:

1. **Tools/Sub-Agents:**
   - [ ] MCP Spotify está adicionado como Tool/Sub-Agent
   - [ ] Não está apenas "descrito" no prompt

2. **System Message (Prompt):**

Use este prompt **EXATO**:

```
Você é o agente executor do sistema Jarvis no N8N.

Você recebe comandos em linguagem natural e DEVE executar usando as tools disponíveis.

## TOOLS DISPONÍVEIS

Você tem acesso ao **mcp_spotify** que controla Spotify.

## IMPORTANTE - USE AS TOOLS!

Quando o usuário pedir algo relacionado a música:
1. **SEMPRE chame a tool correspondente**
2. **NÃO apenas responda com texto**
3. **Execute a ação de verdade**

## EXEMPLOS

Usuário: "toca música"
→ Você DEVE chamar: tocarMusica()
→ NÃO apenas diga "estou tocando"

Usuário: "pausa"
→ Você DEVE chamar: pausarMusica()
→ NÃO apenas diga "pausado"

Usuário: "toca Zezé di Camargo"
→ Você DEVE:
  1. Chamar procurarArtista("Zezé di Camargo")
  2. Chamar tocarMusica(artist_id)

## REGRA PRINCIPAL

**Use as tools! Não invente respostas!**
```

#### B) **Conectar MCP como Tool**

No AI Agent node:
1. Clique em **"Tools"** ou **"Sub-Agents"**
2. Adicione **"MCP Spotify"** (não é descrição no prompt, é conexão real!)
3. Salve

---

### 3. **Estrutura do Workflow N8N (Correta)**

```
┌─────────────────┐
│ Webhook Trigger │
│ /jarvis         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   AI Agent     │ ← IMPORTANTE! MCP deve estar aqui
│                 │
│ Tools:          │
│ - MCP Spotify   │ ← Conectado como tool
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Respond to      │
│ Webhook         │
└─────────────────┘
```

---

### 4. **Testar MCP Diretamente**

Antes de usar o agente, teste se MCP funciona:

1. No N8N, adicione um node **"Execute MCP Tool"**
2. Selecione MCP Spotify
3. Escolha tool: `tocarMusica`
4. Execute manualmente
5. Verifique se música toca

Se **NÃO tocar**:
- ❌ MCP Spotify não está configurado corretamente
- ❌ Credentials do Spotify inválidas
- ❌ MCP não está conectado ao Spotify API

---

### 5. **Verificar Credentials Spotify**

No N8N:
1. Vá em **Credentials**
2. Encontre **Spotify OAuth2**
3. Verifique:
   - [ ] Access Token válido
   - [ ] Refresh Token configurado
   - [ ] Scopes corretos:
     - `user-modify-playback-state`
     - `user-read-playback-state`
     - `user-read-currently-playing`

---

### 6. **Prompt Correto do AI Agent (Completo)**

```markdown
# AGENTE EXECUTOR JARVIS

Você recebe comandos processados e EXECUTA usando as tools MCP.

## TOOLS MCP DISPONÍVEIS

### mcp_spotify
Controla Spotify. Tools disponíveis:
- tocarMusica() - Inicia/resume reprodução
- pausarMusica() - Pausa
- pularMusica() - Próxima faixa
- continuarMusica() - Resume pausa
- tocandoAgora() - Info música atual
- procurarArtista(query) - Busca artista
- procurarMusica(query) - Busca música
- procurarPlaylist(query) - Busca playlist
- ajustarVolume(volume) - 0-100

## REGRAS

1. **SEMPRE use as tools** - não apenas responda com texto
2. **Para nomes específicos**: busque primeiro, depois execute
3. **Para comandos genéricos**: execute direto

## EXEMPLOS

**Input:** "toca música"
**Ação:** tocarMusica()
**Output:** "Tocando música"

**Input:** "toca Zezé di Camargo"
**Ações:**
1. procurarArtista("Zezé di Camargo")
2. tocarMusica(artist_id: resultado.id)
**Output:** "Tocando Zezé di Camargo"

**Input:** "pausa"
**Ação:** pausarMusica()
**Output:** "Música pausada"

**IMPORTANTE:** Execute as tools! Não invente!
```

---

## 🧪 TESTE APÓS CONFIGURAÇÃO

Depois de configurar:

1. **Salve o workflow**
2. **Ative o workflow**
3. **Teste pelo Jarvis Bridge:**

```powershell
$body = '{"comando": "toca uma música"}'
Invoke-WebRequest -Uri "http://localhost:3000/comando" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"; "x-api-key"="sua-key"} `
  -Body $body
```

4. **Verifique:**
   - [ ] Música REALMENTE toca no Spotify?
   - [ ] Histórico do N8N mostra execução da tool?
   - [ ] Sem erro "Cannot read properties of null"?

---

## 🔍 DEBUG NO N8N

Se ainda não funcionar:

1. **Veja execução no N8N:**
   - Abra workflow
   - Vá em "Executions" (histórico)
   - Clique na última execução
   - Veja se AI Agent chamou alguma tool

2. **Logs do AI Agent:**
   - Deve mostrar: "Calling tool: tocarMusica"
   - Se não mostrar, MCP não está conectado

3. **Output do MCP:**
   - Deve ter resposta do Spotify
   - Se vazio, credentials inválidas

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] MCP Spotify conectado no N8N
- [ ] Credentials Spotify válidas
- [ ] AI Agent tem MCP como Tool (não só no prompt!)
- [ ] Prompt do agente usa as tools
- [ ] Workflow tem Respond to Webhook
- [ ] Teste manual do MCP funciona

---

## 📞 SE AINDA NÃO FUNCIONAR

Me diga:
1. Ao executar manualmente tool "tocarMusica" no N8N, música toca?
2. No histórico do AI Agent, aparece "Calling tool: ..."?
3. Qual erro específico aparece no execution log?

---

**Próximo passo:** Configure o AI Agent para **usar as tools de verdade**, não apenas responder com texto!
