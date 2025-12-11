📋 PROMPT 1: Criação do Servidor Ponte

# INSTRUÇÃO: Criar Servidor Ponte Jarvis (jarvis-bridge)

## CONTEXTO DO PROJETO

Você deve criar um **servidor ponte** profissional que atua como intermediário inteligente entre o Gemini Live (via API) e um webhook N8N que gerencia todas as automações.

**ARQUITETURA ATUAL (Webhook Único):**
- **Webhook Principal:** `https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis`
- Todas as solicitações (Spotify, Clima, etc) vão para ESTE webhook
- O N8N (com agente AI) decide internamente qual MCP usar
- O Servidor Ponte apenas roteia e aguarda resposta

**ARQUITETURA FUTURA (Híbrida):**
- Ferramentas complexas → Webhook N8N (Spotify, Calendário, etc)
- Ferramentas simples → MCPs diretos via SSE (quando necessário)

O servidor ponte usa uma IA (DeepSeek) para:
1. Analisar comandos de voz transcritos pelo Gemini Live
2. Enviar comando para webhook N8N (atualmente)
3. Futuramente: Decidir entre webhook ou MCP direto
4. Retornar resposta para o Gemini Live

### Fluxo do Sistema:
```
Gemini Live (voz do usuário)
    ↓ (transcrição + HTTP POST)
Servidor Ponte Local
    ├─► IA DeepSeek (processa comando)
    └─► POST webhook/jarvis → N8N (Agente AI + MCPs)
            ├─► MCP Spotify
            ├─► MCP Clima
            └─► Outros MCPs
            ↓ (executa ação)
        Resposta → Gemini Live (áudio)
```

### Arquitetura de Conexão:
- **Webhook Principal:** `https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis`
- **Método:** POST
- **Payload:** `{ "comando": "comando em linguagem natural" }`
- **Latência Esperada:** < 500ms (webhook + agente N8N + MCP)

### Como Funciona a Integração com N8N:

1. **Startup do Servidor Ponte:**
   - Servidor inicia e carrega configuração do webhook
   - Testa conectividade com `https://aplicativos-n8n.../webhook/jarvis`
   - Inicializa cliente DeepSeek
   - Inicializa memória Zep (opcional)

2. **Quando Usuário Fala:**
   ```
   Usuário: "Jarvis, toca Zezé di Camargo"
        ↓
   Gemini Live transcreve e envia para Servidor Ponte
        ↓
   IA DeepSeek processa: "toca Zezé di Camargo"
        ↓
   Servidor Ponte → POST webhook/jarvis
   {
     "comando": "toca Zezé di Camargo"
   }
        ↓
   N8N Webhook → Agente N8N (decide usar MCP Spotify)
        ├─ Busca "Zezé di Camargo"
        ├─ Escolhe melhor playlist
        └─ Toca música
        ↓
   Resposta N8N: { "sucesso": true, "mensagem": "Tocando Zezé Top Hits" }
        ↓
   Servidor Ponte → Gemini Live
        ↓
   Gemini fala: "Tocando Zezé Top Hits"
   ```

3. **Vantagens dessa Arquitetura:**
   - ✅ **Simples**: Servidor Ponte só envia para webhook
   - ✅ **N8N decide tudo**: Qual MCP usar, como executar, sequência de ações
   - ✅ **Baixa latência**: ~500ms total (webhook + agente + MCP)
   - ✅ **Facilidade**: Adicionar nova tool = adicionar MCP no N8N
   - ✅ **Flexível**: Futuramente pode adicionar MCPs diretos (SSE) para casos específicos

---

## WEBHOOK N8N (Jarvis)

**URL do Webhook:** `https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis`

**Ferramentas Disponíveis no N8N:**
Baseado no agente N8N que recebe o webhook, as seguintes ferramentas estão disponíveis:

### **1. Spotify (MCP)**
- Tocar músicas, artistas, álbuns, playlists
- Pausar, pular, voltar faixa
- Buscar músicas/playlists
- Ajustar volume
- Obter informações da música atual
- Gerenciar playlists

**Exemplos de comandos:**
- "toca Zezé di Camargo"
- "pausa a música"
- "próxima música"
- "qual música está tocando?"
- "aumenta o volume"

### **2. Clima/Tempo (MCP)**
- Consultar temperatura atual
- Previsão do tempo
- Condições climáticas

**Exemplos de comandos:**
- "como está o tempo em Salvador?"
- "vai chover hoje em São Paulo?"
- "temperatura em Brasília"

### **Futuras Ferramentas:**
- Calendário/Agenda
- Email
- Luzes inteligentes
- Lembretes/Tarefas

**Como o Servidor Ponte usa o Webhook:**
```typescript
// Qualquer comando vai para o mesmo webhook
const response = await axios.post(
  'https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis',
  { comando: "toca Zezé di Camargo" }, // Ou qualquer outro comando
  { headers: { 'Content-Type': 'application/json' } }
);

// N8N decide internamente qual MCP usar
// Servidor Ponte apenas recebe e retorna resposta
```

---

## ESPECIFICAÇÕES DO SERVIDOR

### Ambiente:
- **Sistema Operacional:** Ubuntu 22.04 ou 20.04
- **RAM:** 24GB
- **CPUs:** 4
- **Storage:** 200GB

### Stack Tecnológica:
- **Runtime:** Node.js 20+ LTS
- **Linguagem:** TypeScript (strict mode)
- **Framework HTTP:** Fastify
- **WebSocket:** ws
- **MCP Client:** @modelcontextprotocol/sdk
- **MCP Transport:** SSE (Server-Sent Events) - conexão com MCPs remotos
- **API LLM:** DeepSeek (modelo: deepseek-chat)
- **Validação:** Zod
- **Gerenciador de Processos:** PM2
- **HTTP Client:** axios (para chamadas aos MCPs via SSE)

### Credenciais:
- **DEEPSEEK_API_KEY:** sk-401fbd42cf00493b8c28db07f3027460
- **DEEPSEEK_BASE_URL:** https://api.deepseek.com/v1

---

## ESTRUTURA DE PASTAS (OBRIGATÓRIA)
jarvis-bridge/
├── src/
│ ├── index.ts # Entrada principal - inicializa servidor
│ ├── config/
│ │ ├── index.ts # Configurações centralizadas
│ │ ├── tools.ts # Definição de todas as tools disponíveis
│ │ └── constants.ts # Constantes do sistema
│ ├── server/
│ │ ├── http.ts # Servidor Fastify (REST API)
│ │ └── websocket.ts # Servidor WebSocket (tempo real)
│ ├── ai/
│ │ ├── decisor.ts # IA DeepSeek que decide qual tool usar
│ │ ├── prompts.ts # System prompts otimizados
│ │ └── parser.ts # Parser de respostas da IA
│ ├── mcp/
│ │ ├── manager.ts # Gerenciador de conexões MCP
│ │ ├── client.ts # Cliente MCP genérico
│ │ └── tools/
│ │ ├── spotify.ts # Tool Spotify
│ │ ├── luzes.ts # Tool Philips Hue/Luzes
│ │ ├── email.ts # Tool Email
│ │ └── webhook.ts # Tool Webhook genérico
│ ├── executors/
│ │ ├── index.ts # Executor principal
│ │ ├── mcp-executor.ts # Executa comandos MCP
│ │ └── webhook-executor.ts # Executa webhooks HTTP
│ ├── validators/
│ │ ├── comandos.ts # Validação de comandos entrada
│ │ ├── decisao.ts # Validação de decisões da IA
│ │ └── schemas.ts # Schemas Zod centralizados
│ ├── middleware/
│ │ ├── auth.ts # Autenticação (API Key)
│ │ ├── rateLimit.ts # Rate limiting
│ │ └── errorHandler.ts # Tratamento global de erros
│ ├── utils/
│ │ ├── logger.ts # Sistema de logs (Pino)
│ │ ├── retry.ts # Retry com exponential backoff
│ │ └── helpers.ts # Funções auxiliares
│ └── types/
│ ├── index.ts # Tipos globais
│ ├── ai.types.ts # Tipos da IA
│ ├── mcp.types.ts # Tipos MCP
│ └── api.types.ts # Tipos da API
├── tests/
│ ├── unit/ # Testes unitários
│ └── integration/ # Testes de integração
├── scripts/
│ ├── setup.sh # Script de instalação
│ └── health-check.sh # Verificação de saúde
├── docker/
│ ├── Dockerfile # Container do servidor
│ └── docker-compose.yml # Orquestração
├── package.json
├── tsconfig.json
├── .env.example
├── .env # Variáveis de ambiente (não commitar)
├── .gitignore
├── ecosystem.config.js # Configuração PM2
└── README.md

---

## ARQUIVOS DETALHADOS

### 1. package.json

```json
{
  "name": "jarvis-bridge",
  "version": "1.0.0",
  "description": "Servidor Ponte Inteligente para Jarvis",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "pm2 start ecosystem.config.js",
    "test": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "fastify": "^4.26.0",
    "@fastify/cors": "^9.0.1",
    "@fastify/rate-limit": "^9.1.0",
    "@fastify/websocket": "^10.0.1",
    "ws": "^8.16.0",
    "openai": "^4.28.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.4",
    "pino": "^8.18.0",
    "pino-pretty": "^10.3.1",
    "dotenv": "^16.4.1",
    "axios": "^1.6.7",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/ws": "^8.5.10",
    "@types/uuid": "^9.0.8",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.2.2",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.20.0",
    "@typescript-eslint/parser": "^6.20.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
2. tsconfig.json
JSON

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
3. .env.example
env

# ===========================================
# SERVIDOR
# ===========================================
NODE_ENV=production
PORT=3000
WS_PORT=3001
HOST=0.0.0.0

# ===========================================
# DEEPSEEK API (IA Decisora)
# ===========================================
DEEPSEEK_API_KEY=sk-401fbd42cf00493b8c28db07f3027460
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=200
DEEPSEEK_TEMPERATURE=0

# ===========================================
# SEGURANÇA
# ===========================================
API_KEY=AIzaSyDUifAQ1utyUhqcmoFiEJ689TqJo5m3E24
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# ===========================================
# WEBHOOK N8N (Jarvis)
# ===========================================
# Webhook principal que recebe TODOS os comandos
JARVIS_WEBHOOK_URL=https://aplicativos-n8n.cegl3k.easypanel.host/webhook/jarvis
JARVIS_WEBHOOK_ENABLED=true
JARVIS_WEBHOOK_TIMEOUT=10000

# Autenticação com N8N (se necessário)
# N8N_API_KEY=sua-chave-aqui
# N8N_AUTH_HEADER=x-api-key

# ===========================================
# MCPs DIRETOS (FUTUROS - desabilitados)
# ===========================================
# Quando precisar de MCPs diretos via SSE, configure aqui
# MCP_BASE_URL=https://aplicativos-n8n.cegl3k.easypanel.host/mcp
# MCP_CLIMA_ENABLED=false
# MCP_CLIMA_PATH=/mcp_clima

# ===========================================
# MEMÓRIA (ZEP)
# ===========================================
# Cloud Zep
ZEP_API_KEY=sua-chave-zep-aqui
ZEP_CLOUD_ENABLED=true

# Ou Self-hosted Zep
# ZEP_BASE_URL=http://localhost:8000
# ZEP_CLOUD_ENABLED=false

# ===========================================
# LOGS
# ===========================================
LOG_LEVEL=info
LOG_FILE=/var/log/jarvis-bridge/app.log
4. src/types/index.ts
TypeScript

// ===========================================
// TIPOS GLOBAIS DO SISTEMA
// ===========================================

export interface ContextoSistema {
  musicaTocando: boolean;
  musicaAtual?: string;
  luzesAcesas: boolean;
  coresAtuais?: Record<string, string>;
  ultimoComando?: string;
  timestampUltimoComando?: number;
  sessaoId: string;
}

export interface ComandoEntrada {
  comando: string;
  contexto?: Partial<ContextoSistema>;
  sessionId?: string;
  timestamp?: number;
}

export interface DecisaoIA {
  categoria: 'spotify' | 'luzes' | 'email' | 'webhook' | 'sistema';
  acao: string;
  parametros: Record<string, unknown>;
  confianca: number;
  raciocinio?: string;
}

export interface ResultadoExecucao {
  sucesso: boolean;
  dados?: unknown;
  erro?: string;
  tempoExecucao: number;
}

export interface RespostaAPI {
  sucesso: boolean;
  mensagem: string;
  dados?: unknown;
  erro?: string;
  requestId: string;
  timestamp: number;
}

export interface ToolConfig {
  nome: string;
  categoria: string;
  url?: string; // URL do MCP remoto (via SSE)
  acoes: string[];
  parametrosObrigatorios?: string[];
  parametrosOpcionais?: string[];
  descricao: string;
  ativa: boolean;
}

export interface WebSocketMessage {
  tipo: 'comando' | 'resposta' | 'erro' | 'heartbeat';
  payload: unknown;
  requestId: string;
  timestamp: number;
}
5. src/config/tools.ts
TypeScript

// ===========================================
// CONFIGURAÇÃO DE TODAS AS TOOLS DISPONÍVEIS
// (MCPs REMOTOS via N8N)
// ===========================================

import { ToolConfig } from '../types/index.js';

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  spotify: {
    nome: 'Spotify',
    categoria: 'spotify',
    // URL do MCP Spotify rodando no N8N
    url: 'https://aplicativos-n8n.cegl3k.easypanel.host/mcp/mcp_spotify',
    acoes: [], // Será preenchido dinamicamente ao conectar no MCP
    parametrosObrigatorios: [],
    parametrosOpcionais: [],
    descricao: 'Controle de música via Spotify - pausa, toca, pula, busca músicas',
    ativa: true
  },
  
  // FUTUROS MCPs (desabilitados por enquanto)
  // 
  // clima: {
  //   nome: 'Clima/Tempo',
  //   categoria: 'clima',
  //   url: 'https://aplicativos-n8n.cegl3k.easypanel.host/mcp/mcp_clima',
  //   acoes: [],
  //   descricao: 'Consulta clima e previsão do tempo',
  //   ativa: false
  // },
  
  // luzes: {
  //   nome: 'Controle de Luzes',
  //   categoria: 'luzes',
  //   url: 'https://aplicativos-n8n.cegl3k.easypanel.host/mcp/mcp_luzes',
  //   acoes: [],
  //   descricao: 'Controle de iluminação inteligente',
  //   ativa: false
  // },
};

// Gera lista de tools para o prompt da IA
// IMPORTANTE: Chame `atualizarToolsDisponiveis()` antes de usar essa função
export function gerarDescricaoToolsParaPrompt(): string {
  const toolsAtivas = Object.values(TOOLS_CONFIG).filter(t => t.ativa);
  
  return toolsAtivas.map(tool => {
    const acoes = tool.acoes.length > 0 
      ? tool.acoes.join(', ')
      : 'carregando...';
    
    return `- ${tool.categoria}: ${acoes}`;
  }).join('\n');
}

// Valida se uma tool/ação existe
export function toolExiste(categoria: string, acao: string): boolean {
  const tool = TOOLS_CONFIG[categoria];
  if (!tool || !tool.ativa) return false;
  
  // Se ainda não carregou as ações, permite qualquer ação
  if (tool.acoes.length === 0) return true;
  
  return tool.acoes.includes(acao);
}

// Atualiza as ações disponíveis de uma tool
export function atualizarAcoesTool(categoria: string, acoes: string[]): void {
  const tool = TOOLS_CONFIG[categoria];
  if (tool) {
    tool.acoes = acoes;
  }
}
6. src/ai/prompts.ts
TypeScript

// ===========================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ===========================================

import { z } from 'zod';

// Schema da decisão da IA
export const DecisaoSchema = z.object({
  categoria: z.enum(['spotify', 'luzes', 'email', 'webhook', 'sistema']),
  acao: z.string().min(1).max(50),
  parametros: z.record(z.unknown()).default({}),
  confianca: z.number().min(0).max(1),
  raciocinio: z.string().optional()
});

// Schema do comando de entrada
export const ComandoEntradaSchema = z.object({
  comando: z.string().min(1).max(1000),
  contexto: z.object({
    musicaTocando: z.boolean().optional(),
    musicaAtual: z.string().optional(),
    luzesAcesas: z.boolean().optional(),
    ultimoComando: z.string().optional()
  }).optional(),
  sessionId: z.string().uuid().optional(),
  timestamp: z.number().optional()
});

// Schema da mensagem WebSocket
export const WebSocketMessageSchema = z.object({
  tipo: z.enum(['comando', 'resposta', 'erro', 'heartbeat']),
  payload: z.unknown(),
  requestId: z.string(),
  timestamp: z.number()
});

// Types inferidos dos schemas
export type DecisaoValidada = z.infer<typeof DecisaoSchema>;
export type ComandoValidado = z.infer<typeof ComandoEntradaSchema>;
export type WSMessageValidada = z.infer<typeof WebSocketMessageSchema>;
9. src/config/index.ts
TypeScript

// ===========================================
// CONFIGURAÇÕES CENTRALIZADAS
// ===========================================

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),
  wsPort: z.coerce.number().default(3001),
  host: z.string().default('0.0.0.0'),
  
  deepseek: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().default('https://api.deepseek.com/v1'),
    model: z.string().default('deepseek-chat'),
    maxTokens: z.coerce.number().default(200),
    temperature: z.coerce.number().default(0)
  }),
  
  security: z.object({
    apiKey: z.string().min(1),
    rateLimitMax: z.coerce.number().default(100),
    rateLimitWindow: z.coerce.number().default(60000)
  }),
  
  log: z.object({
    level: z.string().default('info'),
    file: z.string().optional()
  })
});

const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  wsPort: process.env.WS_PORT,
  host: process.env.HOST,
  
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL,
    model: process.env.DEEPSEEK_MODEL,
    maxTokens: process.env.DEEPSEEK_MAX_TOKENS,
    temperature: process.env.DEEPSEEK_TEMPERATURE
  },
  
  security: {
    apiKey: process.env.API_KEY,
    rateLimitMax: process.env.RATE_LIMIT_MAX,
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW
  },
  
  log: {
    level: process.env.LOG_LEVEL,
    file: process.env.LOG_FILE
  }
};

export const config = ConfigSchema.parse(rawConfig);
10. src/utils/logger.ts
TypeScript

// ===========================================
// SISTEMA DE LOGS PROFISSIONAL
// ===========================================

import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.log.level,
  transport: config.nodeEnv === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  base: {
    service: 'jarvis-bridge',
    version: '1.0.0'
  }
});
11. src/executors/index.ts
TypeScript

// ===========================================
// IA DECISORA - DEEPSEEK (WEBHOOK ÚNICO)
// ===========================================

import OpenAI from 'openai';
import axios from 'axios';
import { DecisaoIA, ContextoSistema, ResultadoExecucao } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { buscarContextoMemoria, adicionarMemoria } from '../memory/zep.js';

// DeepSeek usa API compatível com OpenAI
const deepseek = new OpenAI({
  apiKey: config.deepseek.apiKey,
  baseURL: config.deepseek.baseUrl
});

/**
 * System Prompt para DeepSeek
 * Simples: apenas processar comando e enviar para webhook
 */
function getSystemPrompt(contexto?: Partial<ContextoSistema>): string {
  return `# VOCÊ É UM ASSISTENTE PESSOAL INTELIGENTE

## SUA MISSÃO
Processar comandos de voz em PORTUGUÊS BR e enviá-los para execução via webhook.

## FERRAMENTAS DISPONÍVEIS (via Webhook N8N)

### **Spotify (Controle Musical)**
Use para QUALQUER coisa relacionada a música:
- Tocar músicas, artistas, álbuns, playlists
- Pausar, pular, voltar faixa
- Buscar músicas/artistas/playlists
- Ajustar volume
- Obter informações da música tocando
- Criar/gerenciar playlists

**Exemplos:**
- "toca Zezé di Camargo"
- "pausa a música"
- "próxima música"
- "qual música está tocando?"
- "aumenta o volume"
- "busca playlist de rock"

### **Clima/Tempo**
Use para consultas sobre clima e tempo:
- Temperatura atual
- Previsão do tempo
- Condições climáticas

**Exemplos:**
- "como está o tempo em Salvador?"
- "vai chover hoje em São Paulo?"
- "temperatura em Brasília"

### **Sistema** 
Comandos administrativos:
- "status" - estado do sistema
- "ajuda" - comandos disponíveis

## CONTEXTO ATUAL
${contexto?.musicaTocando !== undefined ? `- Música tocando: ${contexto.musicaTocando ? 'SIM' : 'NÃO'}` : ''}
${contexto?.musicaAtual ? `- Música atual: ${contexto.musicaAtual}` : ''}
${contexto?.luzesAcesas !== undefined ? `- Luzes acesas: ${contexto.luzesAcesas ? 'SIM' : 'NÃO'}` : ''}
${contexto?.ultimoComando ? `- Último comando: ${contexto.ultimoComando}` : ''}

## RESPOSTA
Responda SEMPRE em JSON com:
- "comando_processado": O comando limpo/processado
- "confianca": Nível de confiança (0-1)
- "raciocinio": Breve explicação da decisão

**Formato:**
\`\`\`json
{
  "comando_processado": "toca Zezé di Camargo",
  "confianca": 0.95,
  "raciocinio": "Comando claro para tocar música do artista"
}
\`\`\`

**IMPORTANTE:**
- Mantenha comandos em linguagem natural
- Use contexto para melhorar compreensão
- Se ambíguo (confiança < 0.7), peça clarificação`
}

/**
 * Processa comando e envia para webhook N8N
 */
export async function processarComando(
  comando: string,
  sessionId: string,
  contextoExtra?: Partial<ContextoSistema>
): Promise<ResultadoExecucao> {
  
  const startTime = Date.now();
  
  try {
    logger.info({ comando, sessionId }, 'Processando comando');
    
    // 1. Busca contexto da memória Zep
    const contextoMemoria = await buscarContextoMemoria(sessionId, comando);
    const contexto = { ...contextoMemoria, ...contextoExtra };
    
    // 2. DeepSeek processa o comando
    const systemPrompt = getSystemPrompt(contexto);
    
    const response = await deepseek.chat.completions.create({
      model: config.deepseek.model,
      max_tokens: config.deepseek.maxTokens,
      temperature: config.deepseek.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Comando: "${comando}"` }
      ]
    });
    
    const conteudo = response.choices[0]?.message?.content;
    
    if (!conteudo) {
      throw new Error('Resposta vazia da IA');
    }
    
    // Limpa e parse JSON
    const jsonLimpo = conteudo
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const decisao = JSON.parse(jsonLimpo);
    
    // 3. Valida confiança
    if (decisao.confianca < 0.7) {
      logger.warn({ decisao }, 'Confiança baixa no comando');
      
      return {
        sucesso: false,
        erro: 'Não entendi bem o comando. Pode repetir de outra forma?',
        dados: { decisao },
        tempoExecucao: Date.now() - startTime
      };
    }
    
    // 4. Envia para webhook N8N
    logger.info({ 
      comando_processado: decisao.comando_processado,
      webhook: config.webhook.url 
    }, 'Enviando para webhook N8N');
    
    const webhookResponse = await axios.post(
      config.webhook.url,
      { comando: decisao.comando_processado },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: config.webhook.timeout
      }
    );
    
    const resultado: ResultadoExecucao = {
      sucesso: webhookResponse.data.sucesso ?? true,
      dados: webhookResponse.data,
      tempoExecucao: Date.now() - startTime
    };
    
    // 5. Adiciona à memória Zep
    await adicionarMemoria(sessionId, comando, decisao, resultado);
    
    logger.info({ 
      resultado, 
      tempoExecucao: resultado.tempoExecucao 
    }, 'Comando executado com sucesso');
    
    return resultado;
    
  } catch (error) {
    const tempoExecucao = Date.now() - startTime;
    
    logger.error({ error, comando, sessionId, tempoExecucao }, 'Erro ao processar comando');
    
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      tempoExecucao
    };
  }
}

async function executarComandoSistema(
  decisao: DecisaoIA
): Promise<ResultadoExecucao> {
  
  switch (decisao.acao) {
    case 'status':
      return {
        sucesso: true,
        dados: { status: 'online', uptime: process.uptime() },
        tempoExecucao: 0
      };
      
    case 'ajuda':
      return {
        sucesso: true,
        dados: { 
          mensagem: 'Comandos disponíveis: música, luzes, email',
          comandos: ['pausar música', 'tocar música', 'acender luz', 'ler emails']
        },
        tempoExecucao: 0
      };
      
    case 'listar_comandos':
      return {
        sucesso: true,
        dados: { /* lista de comandos */ },
        tempoExecucao: 0
      };
      
    default:
      return {
        sucesso: false,
        erro: 'Comando de sistema não reconhecido',
        tempoExecucao: 0
      };
  }
}
12. src/executors/mcp-executor.ts
TypeScript

// ===========================================
// EXECUTOR MCP (CONEXÃO REMOTA VIA SSE)
// ===========================================

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { DecisaoIA, ResultadoExecucao } from '../types/index.js';
import { TOOLS_CONFIG, atualizarAcoesTool } from '../config/tools.js';
import { logger } from '../utils/logger.js';

// Cache de clientes MCP (reutiliza conexões)
const mcpClients: Map<string, Client> = new Map();
const mcpInitialized: Map<string, boolean> = new Map();

/**
 * Obtém ou cria cliente MCP para a categoria
 * Usa SSE transport para conectar em MCP remoto no N8N
 */
async function getMCPClient(categoria: string): Promise<Client> {
  // Se já existe conexão, reutiliza
  if (mcpClients.has(categoria) && mcpInitialized.get(categoria)) {
    return mcpClients.get(categoria)!;
  }
  
  // Busca configuração da tool
  const toolConfig = TOOLS_CONFIG[categoria];
  if (!toolConfig || !toolConfig.ativa) {
    throw new Error(`MCP não configurado ou inativo: ${categoria}`);
  }
  
  if (!toolConfig.url) {
    throw new Error(`URL do MCP não configurada para: ${categoria}`);
  }
  
  logger.info({ categoria, url: toolConfig.url }, 'Conectando ao MCP remoto...');
  
  try {
    // Cria transport SSE apontando para o N8N
    const transport = new SSEClientTransport(
      new URL(toolConfig.url)
    );
    
    // Cria cliente MCP
    const client = new Client({
      name: `jarvis-bridge-${categoria}`,
      version: '1.0.0'
    }, {
      capabilities: {}
    });
    
    // Conecta ao MCP remoto
    await client.connect(transport);
    
    // Lista tools disponíveis no MCP
    const { tools } = await client.listTools();
    const toolNames = tools.map(t => t.name);
    
    logger.info({ 
      categoria, 
      url: toolConfig.url,
      toolsDisponiveis: toolNames 
    }, 'MCP conectado com sucesso');
    
    // Atualiza configuração com tools reais
    atualizarAcoesTool(categoria, toolNames);
    
    // Armazena cliente e marca como inicializado
    mcpClients.set(categoria, client);
    mcpInitialized.set(categoria, true);
    
    return client;
    
  } catch (error) {
    logger.error({ 
      error, 
      categoria, 
      url: toolConfig.url 
    }, 'Erro ao conectar MCP remoto');
    
    throw new Error(`Falha ao conectar MCP ${categoria}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  }
}

/**
 * Executa uma decisão usando MCP remoto
 */
export async function executarMCP(
  decisao: DecisaoIA
): Promise<ResultadoExecucao> {
  
  const startTime = Date.now();
  
  try {
    // Obtém cliente MCP (cria conexão se necessário)
    const client = await getMCPClient(decisao.categoria);
    
    // Monta nome da tool
    // Tenta primeiro com o nome direto da ação
    let toolName = decisao.acao;
    
    logger.info({ 
      categoria: decisao.categoria,
      acao: decisao.acao,
      toolName,
      parametros: decisao.parametros 
    }, 'Executando MCP tool');
    
    // Executa a tool remota
    const resultado = await client.callTool({
      name: toolName,
      arguments: decisao.parametros
    });
    
    const tempoExecucao = Date.now() - startTime;
    
    logger.info({ 
      categoria: decisao.categoria,
      acao: decisao.acao,
      tempoExecucao,
      resultado 
    }, 'MCP tool executada com sucesso');
    
    return {
      sucesso: true,
      dados: resultado.content,
      tempoExecucao
    };
    
  } catch (error) {
    const tempoExecucao = Date.now() - startTime;
    
    logger.error({ 
      error, 
      decisao,
      tempoExecucao 
    }, 'Erro ao executar MCP');
    
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro ao executar MCP',
      tempoExecucao
    };
  }
}

/**
 * Inicializa todos os MCPs ativos no startup
 * Isso pré-carrega as tools disponíveis para a IA
 */
export async function inicializarMCPs(): Promise<void> {
  logger.info('Inicializando conexões MCP...');
  
  const toolsAtivas = Object.entries(TOOLS_CONFIG)
    .filter(([_, config]) => config.ativa);
  
  for (const [categoria, config] of toolsAtivas) {
    try {
      await getMCPClient(categoria);
      logger.info({ categoria }, `✅ MCP ${categoria} inicializado`);
    } catch (error) {
      logger.error({ 
        categoria, 
        error 
      }, `❌ Erro ao inicializar MCP ${categoria}`);
    }
  }
  
  logger.info('Inicialização de MCPs concluída');
}
13. src/executors/webhook-executor.ts
TypeScript

// ===========================================
// EXECUTOR WEBHOOK
// ===========================================

import axios from 'axios';
import { DecisaoIA, ResultadoExecucao } from '../types/index.js';
import { logger } from '../utils/logger.js';

export async function executarWebhook(
  decisao: DecisaoIA
): Promise<ResultadoExecucao> {
  
  const { url, body, headers, method } = decisao.parametros as {
    url?: string;
    body?: unknown;
    headers?: Record<string, string>;
    method?: string;
  };
  
  if (!url) {
    return {
      sucesso: false,
      erro: 'URL não fornecida para webhook',
      tempoExecucao: 0
    };
  }
  
  try {
    const httpMethod = (decisao.acao || method || 'POST').toUpperCase();
    
    const response = await axios({
      method: httpMethod,
      url,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    });
    
    return {
      sucesso: true,
      dados: {
        status: response.status,
        data: response.data
      },
      tempoExecucao: 0
    };
    
  } catch (error) {
    logger.error({ error, url }, 'Erro no webhook');
    
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro no webhook',
      tempoExecucao: 0
    };
  }
}
14. src/server/http.ts
TypeScript

// ===========================================
// SERVIDOR HTTP (FASTIFY)
// ===========================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { decidirAcao } from '../ai/decisor.js';
import { executarDecisao } from '../executors/index.js';
import { ComandoEntradaSchema } from '../validators/schemas.js';
import { RespostaAPI } from '../types/index.js';

export async function criarServidorHTTP() {
  
  const app = Fastify({
    logger: false, // Usamos nosso próprio logger
    requestIdHeader: 'x-request-id',
    genReqId: () => uuidv4()
  });
  
  // Plugins
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: config.security.rateLimitMax,
    timeWindow: config.security.rateLimitWindow
  });
  
  // Middleware de autenticação
  app.addHook('preHandler', async (request, reply) => {
    const apiKey = request.headers['x-api-key'];
    
    // Ignora health check
    if (request.url === '/health') return;
    
    if (apiKey !== config.security.apiKey) {
      return reply.status(401).send({
        sucesso: false,
        erro: 'API Key inválida',
        requestId: request.id,
        timestamp: Date.now()
      });
    }
  });
  
  // ===========================================
  // ROTAS
  // ===========================================
  
  // Health check
  app.get('/health', async () => ({
    status: 'online',
    timestamp: Date.now(),
    uptime: process.uptime()
  }));
  
  // Processar comando (rota principal)
  app.post<{ Body: unknown }>('/comando', async (request, reply) => {
    const requestId = request.id as string;
    const startTime = Date.now();
    
    try {
      // 1. Valida entrada
      const entrada = ComandoEntradaSchema.parse(request.body);
      
      logger.info({ requestId, comando: entrada.comando }, 'Comando recebido');
      
      // 2. IA decide ação
      const decisao = await decidirAcao(entrada.comando, entrada.contexto);
      
      // 3. Verifica confiança
      if (decisao.confianca < 0.7) {
        const resposta: RespostaAPI = {
          sucesso: false,
          mensagem: 'Não entendi o comando. Pode repetir de outra forma?',
          dados: { decisao },
          requestId,
          timestamp: Date.now()
        };
        return reply.status(200).send(resposta);
      }
      
      // 4. Executa
      const resultado = await executarDecisao(decisao);
      
      // 5. Resposta
      const resposta: RespostaAPI = {
        sucesso: resultado.sucesso,
        mensagem: resultado.sucesso 
          ? `Executado: ${decisao.categoria}.${decisao.acao}`
          : resultado.erro || 'Erro desconhecido',
        dados: {
          decisao,
          resultado: resultado.dados,
          tempoTotal: Date.now() - startTime
        },
        requestId,
        timestamp: Date.now()
      };
      
      logger.info({ requestId, resposta }, 'Comando processado');
      
      return resposta;
      
    } catch (error) {
      logger.error({ requestId, error }, 'Erro ao processar comando');
      
      const resposta: RespostaAPI = {
        sucesso: false,
        mensagem: 'Erro interno ao processar comando',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        requestId,
        timestamp: Date.now()
      };
      
      return reply.status(500).send(resposta);
    }
  });
  
  // Listar tools disponíveis
  app.get('/tools', async (request) => {
    const { TOOLS_CONFIG } = await import('../config/tools.js');
    
    return {
      sucesso: true,
      dados: TOOLS_CONFIG,
      requestId: request.id,
      timestamp: Date.now()
    };
  });
  
  return app;
}
15. src/server/websocket.ts
TypeScript

// ===========================================
// SERVIDOR WEBSOCKET (TEMPO REAL)
// ===========================================

import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { decidirAcao } from '../ai/decisor.js';
import { executarDecisao } from '../executors/index.js';
import { WebSocketMessageSchema } from '../validators/schemas.js';
import { WebSocketMessage, ContextoSistema } from '../types/index.js';

// Armazena contexto por sessão
const sessoes: Map<string, Partial<ContextoSistema>> = new Map();

export function criarServidorWebSocket() {
  
  const wss = new WebSocketServer({ 
    port: config.wsPort,
    path: '/ws'
  });
  
  logger.info({ port: config.wsPort }, 'WebSocket Server iniciado');
  
  wss.on('connection', (ws: WebSocket, request) => {
    const sessionId = uuidv4();
    sessoes.set(sessionId, { sessaoId: sessionId });
    
    logger.info({ sessionId }, 'Nova conexão WebSocket');
    
    // Envia confirmação de conexão
    enviarMensagem(ws, {
      tipo: 'resposta',
      payload: { status: 'conectado', sessionId },
      requestId: 'connect',
      timestamp: Date.now()
    });
    
    // Handler de mensagens
    ws.on('message', async (data: Buffer) => {
      try {
        const mensagem = JSON.parse(data.toString());
        const validada = WebSocketMessageSchema.parse(mensagem);
        
        await processarMensagemWS(ws, sessionId, validada);
        
      } catch (error) {
        logger.error({ error, sessionId }, 'Erro ao processar mensagem WS');
        
        enviarMensagem(ws, {
          tipo: 'erro',
          payload: { erro: 'Mensagem inválida' },
          requestId: 'error',
          timestamp: Date.now()
        });
      }
    });
    
    // Heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        enviarMensagem(ws, {
          tipo: 'heartbeat',
          payload: { timestamp: Date.now() },
          requestId: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, 30000);
    
    ws.on('close', () => {
      clearInterval(heartbeat);
      sessoes.delete(sessionId);
      logger.info({ sessionId }, 'Conexão WebSocket fechada');
    });
    
    ws.on('error', (error) => {
      logger.error({ error, sessionId }, 'Erro WebSocket');
    });
  });
  
  return wss;
}

async function processarMensagemWS(
  ws: WebSocket, 
  sessionId: string, 
  mensagem: WebSocketMessage
) {
  
  if (mensagem.tipo !== 'comando') {
    return;
  }
  
  const { comando, contexto } = mensagem.payload as { 
    comando: string; 
    contexto?: Partial<ContextoSistema> 
  };
  
  // Atualiza contexto da sessão
  if (contexto) {
    const sessaoAtual = sessoes.get(sessionId) || {};
    sessoes.set(sessionId, { ...sessaoAtual, ...contexto });
  }
  
  const contextoSessao = sessoes.get(sessionId);
  
  logger.info({ sessionId, comando }, 'Comando WS recebido');
  
  try {
    // 1. Decide
    const decisao = await decidirAcao(comando, contextoSessao);
    
    // 2. Valida confiança
    if (decisao.confianca < 0.7) {
      enviarMensagem(ws, {
        tipo: 'resposta',
        payload: {
          sucesso: false,
          mensagem: 'Não entendi. Pode repetir?',
          decisao,
          requerConfirmacao: true
        },
        requestId: mensagem.requestId,
        timestamp: Date.now()
      });
      return;
    }
    
    // 3. Executa
    const resultado = await executarDecisao(decisao);
    
    // 4. Atualiza contexto baseado na execução
    if (resultado.sucesso) {
      atualizarContextoPosExecucao(sessionId, decisao);
    }
    
    // 5. Responde
    enviarMensagem(ws, {
      tipo: 'resposta',
      payload: {
        sucesso: resultado.sucesso,
        mensagem: resultado.sucesso 
          ? gerarMensagemSucesso(decisao)
          : resultado.erro,
        decisao,
        dados: resultado.dados
      },
      requestId: mensagem.requestId,
      timestamp: Date.now()
    });
    
  } catch (error) {
    logger.error({ error, sessionId }, 'Erro ao processar comando WS');
    
    enviarMensagem(ws, {
      tipo: 'erro',
      payload: { erro: 'Erro ao processar comando' },
      requestId: mensagem.requestId,
      timestamp: Date.now()
    });
  }
}

function enviarMensagem(ws: WebSocket, mensagem: WebSocketMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(mensagem));
  }
}

function atualizarContextoPosExecucao(
  sessionId: string, 
  decisao: { categoria: string; acao: string }
) {
  const contexto = sessoes.get(sessionId) || {};
  
  if (decisao.categoria === 'spotify') {
    if (decisao.acao === 'play') {
      contexto.musicaTocando = true;
    } else if (decisao.acao === 'pause') {
      contexto.musicaTocando = false;
    }
  }
  
  if (decisao.categoria === 'luzes') {
    if (decisao.acao === 'ligar') {
      contexto.luzesAcesas = true;
    } else if (decisao.acao === 'desligar') {
      contexto.luzesAcesas = false;
    }
  }
  
  contexto.ultimoComando = `${decisao.categoria}.${decisao.acao}`;
  contexto.timestampUltimoComando = Date.now();
  
  sessoes.set(sessionId, contexto);
}

function gerarMensagemSucesso(decisao: { categoria: string; acao: string }): string {
  const mensagens: Record<string, Record<string, string>> = {
    spotify: {
      pause: 'Música pausada',
      play: 'Tocando música',
      next: 'Próxima música',
      previous: 'Música anterior',
      volume: 'Volume ajustado'
    },
    luzes: {
      ligar: 'Luzes acesas',
      desligar: 'Luzes apagadas',
      cor: 'Cor alterada',
      brilho: 'Brilho ajustado'
    },
    email: {
      ler: 'Lendo emails',
      enviar: 'Email enviado',
      listar: 'Listando emails'
    }
  };
  
  return mensagens[decisao.categoria]?.[decisao.acao] 
    || `Executado: ${decisao.categoria}.${decisao.acao}`;
}
16. src/index.ts (Entrada Principal)
TypeScript

// ===========================================
// ENTRADA PRINCIPAL - JARVIS BRIDGE
// ===========================================

import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { criarServidorHTTP } from './server/http.js';
import { criarServidorWebSocket } from './server/websocket.js';
import { inicializarMCPs } from './executors/mcp-executor.js';

async function main() {
  logger.info('🤖 Iniciando Jarvis Bridge...');
  
  try {
    // 1. Inicializa conexões MCP (pré-carrega tools disponíveis)
    await inicializarMCPs();
    logger.info('✅ MCPs remotos conectados');
    
    // 2. Inicia servidor HTTP
    const httpServer = await criarServidorHTTP();
    await httpServer.listen({ 
      port: config.port, 
      host: config.host 
    });
    logger.info({ port: config.port }, '✅ Servidor HTTP iniciado');
    
    // 3. Inicia servidor WebSocket
    criarServidorWebSocket();
    logger.info({ port: config.wsPort }, '✅ Servidor WebSocket iniciado');
    
    // 4. Log de configuração
    logger.info({
      ambiente: config.nodeEnv,
      http: `http://${config.host}:${config.port}`,
      ws: `ws://${config.host}:${config.wsPort}/ws`,
      ia: config.deepseek.model,
      mcpBase: process.env.MCP_BASE_URL
    }, '🚀 Jarvis Bridge pronto!');
    
  } catch (error) {
    logger.fatal({ error }, '❌ Falha ao iniciar Jarvis Bridge');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Encerrando Jarvis Bridge...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Encerrando Jarvis Bridge...');
  process.exit(0);
});

main();
17. ecosystem.config.js (PM2)
JavaScript

module.exports = {
  apps: [{
    name: 'jarvis-bridge',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/jarvis-bridge/error.log',
    out_file: '/var/log/jarvis-bridge/out.log',
    log_file: '/var/log/jarvis-bridge/combined.log',
    time: true
  }]
};
18. scripts/setup.sh
Bash

#!/bin/bash

# ===========================================
# SCRIPT DE INSTALAÇÃO - JARVIS BRIDGE
# ===========================================

set -e

echo "🤖 Instalando Jarvis Bridge..."

# 1. Atualiza sistema
sudo apt update && sudo apt upgrade -y

# 2. Instala Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Verifica versão
node --version
npm --version

# 4. Instala PM2 globalmente
sudo npm install -g pm2

# 5. Cria diretórios de log
sudo mkdir -p /var/log/jarvis-bridge
sudo chown $USER:$USER /var/log/jarvis-bridge

# 6. Instala dependências do projeto
npm install

# 7. Compila TypeScript
npm run build

# 8. Copia .env.example se .env não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Edite o arquivo .env com suas configurações"
fi

echo "✅ Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env"
echo "2. Execute: npm run start:prod"
19. Dockerfile
Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código compilado
COPY dist/ ./dist/

# Copia .env (em produção, use secrets)
COPY .env ./

# Expõe portas
EXPOSE 3000
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Inicia aplicação
CMD ["node", "dist/index.js"]
20. docker-compose.yml
YAML

version: '3.8'

services:
  jarvis-bridge:
    build: .
    container_name: jarvis-bridge
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/var/log/jarvis-bridge
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
INSTRUÇÕES DE INSTALAÇÃO
Bash

# 1. Clone/crie o projeto
mkdir jarvis-bridge && cd jarvis-bridge

# 2. Crie todos os arquivos conforme estrutura acima

# 3. Execute o setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Configure o .env
nano .env

# 5. Inicie em desenvolvimento
npm run dev

# 6. Ou em produção
npm run build
npm run start:prod
ENDPOINTS DISPONÍVEIS
HTTP (porta 3000):
GET /health - Health check
POST /comando - Processa comando de voz
GET /tools - Lista tools disponíveis
WebSocket (porta 3001):
ws://host:3001/ws - Conexão tempo real
EXEMPLO DE USO
HTTP:
Bash

curl -X POST http://localhost:3000/comando \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave-secreta" \
  -d '{"comando": "pausa a música"}'
WebSocket:
JavaScript

const ws = new WebSocket('ws://localhost:3001/ws');
ws.send(JSON.stringify({
  tipo: 'comando',
  payload: { comando: 'acende a luz' },
  requestId: 'abc123',
  timestamp: Date.now()
}));

---

## 🔧 TROUBLESHOOTING

### Erro: "Falha ao conectar MCP spotify"

**Causa:** URL do MCP incorreta ou N8N offline

**Solução:**
```bash
# 1. Teste a URL do MCP diretamente
curl https://aplicativos-n8n.cegl3k.easypanel.host/mcp/mcp_spotify

# 2. Verifique se N8N está rodando
# 3. Confirme que o workflow MCP Spotify está ativo no N8N
# 4. Verifique logs do servidor ponte
tail -f /var/log/jarvis-bridge/app.log
```

### Erro: "Tool 'pausarMusica' não encontrada"

**Causa:** Nome da tool no N8N diferente do esperado

**Solução:**
```bash
# Veja os logs de inicialização - mostra tools disponíveis
# Exemplo de log:
# { categoria: 'spotify', toolsDisponiveis: ['pausarMusica', 'tocarMusica', ...] }

# Ajuste o mapeamento da IA se necessário
```

### IA decide ação errada

**Causa:** Prompt da IA precisa ser ajustado

**Solução:**
- Edite `src/ai/prompts.ts`
- Adicione mais exemplos específicos para seus comandos
- Ajuste temperatura (atualmente 0, máxima precisão)

### Latência alta (> 500ms)

**Possíveis causas:**
1. **N8N sobrecarregado:** Verifique recursos do servidor N8N
2. **Rede lenta:** Teste ping para o N8N
3. **MCP pesado:** Otimize workflow no N8N
4. **DeepSeek lento:** Use modelo mais rápido ou aumente timeout

**Medição:**
```bash
# Endpoint de teste
curl -X POST http://localhost:3000/comando \
  -H "x-api-key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{"comando": "status"}' \
  --verbose
```

---

## 📝 NOTAS IMPORTANTES

### Segurança
1. **Nunca commite o `.env`** - contém chaves sensíveis
2. **Use HTTPS em produção** - nunca HTTP puro
3. **Rotacione API keys regularmente**
4. **Configure firewall** - libere apenas portas necessárias

### Performance
1. **Conexões SSE são persistentes** - não cria nova a cada request
2. **Cache de clientes MCP** - reutiliza conexões existentes
3. **PM2 em cluster mode** - para alta disponibilidade (se necessário)

### Monitoramento
```bash
# PM2 Dashboard
pm2 monit

# Logs em tempo real
pm2 logs jarvis-bridge

# Status
pm2 status
```

### Adicionar Novos MCPs

**Passo a passo:**

1. **Crie o MCP no N8N** e obtenha a URL

2. **Edite `src/config/tools.ts`:**
```typescript
clima: {
  nome: 'Clima/Tempo',
  categoria: 'clima',
  url: 'https://aplicativos-n8n.cegl3k.easypanel.host/mcp/mcp_clima',
  acoes: [],
  descricao: 'Consulta clima',
  ativa: true  // ← Mude para true
}
```

3. **Edite `.env`:**
```env
MCP_CLIMA_ENABLED=true  # ← Mude para true
```

4. **Atualize o prompt da IA** em `src/ai/prompts.ts` com exemplos do novo MCP

5. **Reinicie o servidor:**
```bash
pm2 restart jarvis-bridge
```

6. **Verifique logs** para confirmar que o MCP conectou:
```bash
pm2 logs jarvis-bridge | grep clima
# Deve mostrar: "✅ MCP clima inicializado"
```

---

## 🎯 CHECKLIST DE DEPLOY

- [ ] Node.js 20+ instalado
- [ ] PM2 instalado globalmente
- [ ] Arquivo `.env` configurado com todas as variáveis
- [ ] URL do MCP Spotify testada e funcionando
- [ ] DeepSeek API key válida
- [ ] Portas 3000 e 3001 liberadas no firewall
- [ ] Logs criados em `/var/log/jarvis-bridge/`
- [ ] Compilação TypeScript executada (`npm run build`)
- [ ] Teste de conexão MCP bem-sucedido
- [ ] Endpoint `/health` respondendo OK
- [ ] Teste de comando via HTTP funcionando

---

## 📚 REFERÊNCIAS

- **MCP SDK:** https://modelcontextprotocol.io/
- **DeepSeek API:** https://platform.deepseek.com/
- **Fastify Docs:** https://fastify.dev/
- **PM2 Docs:** https://pm2.keymetrics.io/
- **SSE Specification:** https://html.spec.whatwg.org/multipage/server-sent-events.html

---

**Versão do Documento:** 2.0 (Atualizado para MCPs Remotos via SSE)  
**Última Atualização:** 2025-12-11  
**Autor Original:** [Seu Nome]