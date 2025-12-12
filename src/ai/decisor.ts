// ===========================================================
// IA DECISORA - SUPORTA MISTRAL (PADRÃO) E DEEPSEEK
// ===========================================

import OpenAI from 'openai';
import axios from 'axios';
import { DecisaoIA, ContextoSistema, ResultadoExecucao } from '../types/index.js';
import { getSystemPrompt } from './prompts.js';
import { DecisaoSchema } from '../validators/schemas.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// Inicializar cliente Mistral (Padrão)
const mistralClient = new OpenAI({
    apiKey: config.mistral.apiKey,
    baseURL: config.mistral.baseUrl
});

// Inicializar cliente DeepSeek (Alternativa)
const deepseekClient = new OpenAI({
    apiKey: config.deepseek.apiKey,
    baseURL: config.deepseek.baseUrl
});

// Seletor dinâmico de cliente IA
const getAIClient = () => {
    if (config.aiProvider === 'deepseek') {
        logger.info('Usando DeepSeek como provedor de IA');
        return {
            client: deepseekClient,
            model: config.deepseek.model,
            maxTokens: config.deepseek.maxTokens,
            temperature: config.deepseek.temperature,
            provider: 'DeepSeek'
        };
    }

    // Padrão: Mistral
    logger.info('Usando Mistral AI como provedor de IA (padrão)');
    return {
        client: mistralClient,
        model: config.mistral.model,
        maxTokens: config.mistral.maxTokens,
        temperature: config.mistral.temperature,
        provider: 'Mistral'
    };
};

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

        // 1. Selecionar provedor de IA configurado
        const aiConfig = getAIClient();
        logger.info({ provider: aiConfig.provider }, 'Cliente IA selecionado');

        // 2. Processar comando com a IA selecionada
        const systemPrompt = getSystemPrompt(contexto);

        const response = await aiConfig.client.chat.completions.create({
            model: aiConfig.model,
            max_tokens: aiConfig.maxTokens,
            temperature: aiConfig.temperature,
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

        // 3. Envia para webhook N8N (Roteamento Inteligente)
        if (!config.webhook.enabled) {
            throw new Error('Webhooks estão desabilitados');
        }

        const ferramentaAlvo = decisao.ferramenta || 'default';

        // Mapa de roteamento
        const webhookMap: Record<string, string | undefined> = {
            spotify: config.webhook.spotify,
            whatsapp: config.webhook.whatsapp,
            contatos: config.webhook.whatsapp, // Compartilha webhook
            financeiro: config.webhook.financeiro,
            clima: config.webhook.clima,
            pesquisa: config.webhook.pesquisa,
            default: config.webhook.url
        };

        // Seleciona URL ou fallback para default
        let urlDestino = webhookMap[ferramentaAlvo] || config.webhook.url;

        logger.info({
            comando: decisao.comando_processado,
            ferramenta: ferramentaAlvo,
            url: urlDestino
        }, 'Enviando para webhook dedicado');

        const webhookResponse = await axios.post(
            urlDestino,
            { query: decisao.comando_processado },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: config.webhook.timeout
            }
        );

        const responseData = webhookResponse.data;

        // Validação específica para Spotify (anti-alucinação)
        if (ferramentaAlvo === 'spotify') {
            const outputTexto = (responseData.output || '').toLowerCase();
            const respostasGenericas = ['estou tocando', 'foi pausada', 'agente do spotify'];

            const ehGenerico = respostasGenericas.some(frase => outputTexto.includes(frase));

            // Se diz que tocou mas não mandou dados da música
            if (ehGenerico && !responseData.track && !responseData.artist && !responseData.data) {
                logger.warn('Possível alucinação do agente Spotify');
            }
        }

        const resultado: ResultadoExecucao = {
            sucesso: true, // Assume sucesso se N8N respondeu 200 OK
            dados: responseData,
            tempoExecucao: Date.now() - startTime
        };

        logger.info({
            ferramenta: ferramentaAlvo,
            tempo: resultado.tempoExecucao
        }, 'Execução concluída com sucesso');

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
