// ===========================================
// SERVIDOR HTTP (FASTIFY)
// ===========================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { processarComando } from '../ai/decisor.js';
import { ComandoEntradaSchema } from '../validators/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
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
    app.addHook('preHandler', authMiddleware);

    // ===========================================
    // ROTAS
    // ===========================================

    // Health check
    app.get('/health', async () => ({
        status: 'online',
        timestamp: Date.now(),
        uptime: process.uptime(),
        service: 'jarvis-bridge',
        version: '1.0.0'
    }));

    // Processar comando (rota principal)
    app.post<{ Body: unknown }>('/comando', async (request, reply) => {
        const requestId = request.id as string;
        const startTime = Date.now();

        try {
            // 1. Valida entrada
            const entrada = ComandoEntradaSchema.parse(request.body);

            logger.info({ requestId, comando: entrada.comando }, 'Comando recebido');

            // 2. Processa comando (DeepSeek + Webhook)
            const sessionId = entrada.sessionId || uuidv4();
            const resultado = await processarComando(
                entrada.comando,
                sessionId,
                entrada.contexto
            );

            // 3. Resposta
            const resposta: RespostaAPI = {
                sucesso: resultado.sucesso,
                mensagem: resultado.sucesso
                    ? (resultado.dados?.mensagem || 'Comando executado')
                    : resultado.erro || 'Erro desconhecido',
                dados: {
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

    // Status do sistema
    app.get('/status', async () => ({
        sucesso: true,
        dados: {
            uptime: process.uptime(),
            memoria: process.memoryUsage(),
            versao: '1.0.0',
            webhook: {
                url: config.webhook.url,
                enabled: config.webhook.enabled
            }
        },
        timestamp: Date.now()
    }));

    return app;
}
