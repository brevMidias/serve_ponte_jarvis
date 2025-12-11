// ===========================================================
// IA DECISORA - DEEPSEEK (PROCESSA E ENVIA PARA WEBHOOK)
// ===========================================

import OpenAI from 'openai';
import axios from 'axios';
import { DecisaoIA, ContextoSistema, ResultadoExecucao } from '../types/index.js';
import { getSystemPrompt } from './prompts.js';
import { DecisaoSchema } from '../validators/schemas.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// DeepSeek usa API compatível com OpenAI
const deepseek = new OpenAI({
    apiKey: config.deepseek.apiKey,
    baseURL: config.deepseek.baseUrl
});

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

        const contexto = { sessaoId: sessionId, ...contextoExtra };

        // 1. DeepSeek processa o comando
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

        const decisaoRaw = JSON.parse(jsonLimpo);
        const decisao: DecisaoIA = DecisaoSchema.parse(decisaoRaw);

        logger.info({ decisao }, 'Decisão processada');

        // 2. Valida confiança
        if (decisao.confianca < 0.7) {
            logger.warn({ decisao }, 'Confiança baixa no comando');

            return {
                sucesso: false,
                erro: 'Não entendi bem o comando. Pode repetir de outra forma?',
                dados: { decisao },
                tempoExecucao: Date.now() - startTime
            };
        }

        // 3. Envia para webhook N8N
        if (!config.webhook.enabled) {
            throw new Error('Webhook N8N está desabilitado');
        }

        logger.info({
            comando_processado: decisao.comando_processado,
            webhook: config.webhook.url
        }, 'Enviando para webhook N8N');

        // IMPORTANTE: N8N espera "query" não "comando"
        const webhookResponse = await axios.post(
            config.webhook.url,
            { query: decisao.comando_processado },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: config.webhook.timeout
            }
        );

        // Valida se N8N realmente executou (não inventou resposta)
        const responseData = webhookResponse.data;

        // Detecta respostas genéricas/inventadas
        const respostasGenericas = [
            'estou tocando música',
            'música foi pausada',
            'música foi retomada',
            'agente do spotify',
            'está executando sua solicitação'
        ];

        const outputTexto = responseData.output?.toLowerCase() || '';
        const ehRespostaGenerica = respostasGenericas.some(frase =>
            outputTexto.includes(frase.toLowerCase())
        );

        // Se resposta é genérica E não tem dados reais do Spotify
        if (ehRespostaGenerica && !responseData.track && !responseData.artist) {
            logger.warn({ responseData }, 'N8N retornou resposta genérica - possível execução falha');

            return {
                sucesso: false,
                erro: 'N8N respondeu mas não executou ação no Spotify. Verifique configuração do MCP.',
                dados: {
                    respostaN8N: responseData,
                    aviso: 'Resposta parece genérica/inventada'
                },
                tempoExecucao: Date.now() - startTime
            };
        }

        const resultado: ResultadoExecucao = {
            sucesso: responseData.sucesso ?? true,
            dados: responseData,
            tempoExecucao: Date.now() - startTime
        };

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
