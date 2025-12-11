# 📘 GUIA TÉCNICO: Integrar Gemini Live com Jarvis Bridge

---

## 🏗️ ARQUITETURA ATUAL

Temos dois sistemas rodando:

1.  **Front-End (Gemini Live):** App que Conversa em tempo real com o gemini live.
2.  **Back-End (Jarvis Bridge):** Servidor Node.js rodando no IP `52.67.190.48:3000` que executa as ações reais (Spotify, WhatsApp, etc).

**Missão:** Fazer o Front-End detectar intenções de comando e enviar para o Back-End executar.

---

## 🔧 INSTRUÇÕES PARA ALTERAÇÃO DE CÓDIGO (Copie e envie para a IA)

"Olá! Tenho um projeto Gemini Live rodando. Preciso integrar com meu servidor de execução (Jarvis Bridge). Siga estas instruções:"

### 1. Configuração da API
No arquivo de configuração ou constantes do front-end, adicione:

```typescript
// config.ts ou constants.ts
export const JARVIS_API_URL = "http://52.67.190.48:3000";
export const JARVIS_API_KEY = "AIzaSyDUifAQ1utyUhqcmoFiEJ689TqJo5m3E24"; // Em produção, usar .env
```

### 2. Definição das Ferramentas (Tools Declaration)
No local onde você configura a sessão do Gemini (`initialConfig` ou similar), adicione a definição de *Function Calling* genérica para capturar comandos.

**Estratégia:** Em vez de definir 50 ferramentas no front, vamos definir UMA ferramenta "Mestre" que captura tudo e delega para o servidor.

```typescript
// tools-declaration.ts
export const tools = [
  {
    googleSearch: {}, // Manter busca se já tiver
  },
  {
    functionDeclarations: [
      {
        name: "executar_acao_jarvis",
        description: "Use esta função SEMPRE que o usuário solicitar uma ação prática como: tocar música, enviar WhatsApp, anotar gasto financeiro, ver clima, ou gerenciar contatos. Envie o pedido completo em linguagem natural.",
        parameters: {
          type: "OBJECT",
          properties: {
            comando: {
              type: "STRING",
              description: "O comando completo do usuário em linguagem natural. Ex: 'Manda um zap pro João avisando que chego logo' ou 'Toca Rolling Stones'."
            }
          },
          required: ["comando"]
        }
      }
    ]
  }
];
```

### 3. Implementação da Chamada (Client-Side Action)
No componente ou hook que gerencia as `toolCalls` (geralmente onde tem o `onToolCall` ou listener de eventos):

```typescript
// App.tsx ou useGemini.ts

async function enviarParaJarvis(comando: string) {
  try {
    const response = await fetch(`${JARVIS_API_URL}/comando`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': JARVIS_API_KEY
      },
      body: JSON.stringify({ comando })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao chamar Jarvis Bridge:", error);
    return { sucesso: false, erro: "Falha de conexão com Jarvis" };
  }
}

// ... dentro do loop de toolCalls ...
if (toolCall.name === "executar_acao_jarvis") {
  const { comando } = toolCall.args;
  
  // Feedback visual (opcional)
  console.log(`📡 Enviando para Jarvis: ${comando}`);
  
  // Chama o servidor
  const resultado = await enviarParaJarvis(comando);
  
  // Retorna resposta para o Gemini falar
  const respostaParaGemini = resultado.sucesso 
    ? `Ação realizada: ${resultado.mensagem}` 
    : `Tive um problema: ${resultado.erro}`;
    
  return respostaParaGemini; 
}
```

---

## ⚙️ FEATURE EXTRA: PAINEL DE CONFIGURAÇÕES (COM SUPABASE)

Implemente um **Painel de Configurações** persistente usando **Supabase**.
**IMPORTANTE:** Use a ferramenta MCP (`mcp-supabase`) para criar as tabelas e configurar o banco automaticamente.

### 1. Estrutura do Banco de Dados (Via MCP)
Peça para o MCP Supabase executar o seguinte SQL para criar a tabela de configurações:

```sql
-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gemini_api_key TEXT,
  jarvis_url TEXT DEFAULT 'http://52.67.190.48:3000',
  jarvis_auth_key TEXT,
  system_instruction TEXT,
  custom_tools JSONB DEFAULT '[]'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS) - Exemplo simples (ajuste conforme auth do seu app)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write for demo" ON user_settings FOR ALL USING (true);
```

### 2. Integração no Front-End
Substitua o uso de `localStorage` pelo cliente Supabase.

```typescript
// services/settings.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single(); // Assume configuração única por enquanto
    
  if (!data) return defaultSettings;
  return data;
}

export async function saveSettings(settings) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ ...settings, updated_at: new Date() });
}
```

### 3. Uso do MCP Supabase
Ordene à IA:
*"Utilize o tool `mcp-supabase` para criar a tabela `user_settings` no projeto configurado. Verifique se a tabela existe e, se não, crie com as colunas: gemini_api_key (text), jarvis_url (text), etc."*

### 4. Campos do Painel
O painel deve ler/escrever nesta tabela:
*   **Conectividade:** `gemini_api_key`, `jarvis_url`, `jarvis_auth_key`
*   **IA:** `system_instruction` (Prompt do Gemini)
*   **Tools:** `custom_tools` (JSONB para function declarations extras)

___

## 📋 RESUMO DAS FERRAMENTAS DISPONÍVEIS (Back-End)

O Gemini não precisa saber "como" executar, apenas "o que" pedir. O servidor (Jarvis Bridge) já está configurado para entender estes domínios:

1.  **WhatsApp:** Envio de mensagens.
2.  **Spotify:** Controle de música (Toque, Pause, Volume).
3.  **Financeiro:** Registro e consulta.
4.  **Clima:** Consulta meteorológica.
5.  **Contatos:** Agenda.

**Basta o Front-End enviar o texto natural via função `executar_acao_jarvis`, e o Back-End cuidará do resto.**
