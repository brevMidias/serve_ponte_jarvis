// ===========================================
// ENTRADA PRINCIPAL - JARVIS BRIDGE
// ===========================================

import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { criarServidorHTTP } from './server/http.js';

async function main() {
    logger.info('🤖 Iniciando Jarvis Bridge...');

    try {
        // Valida configuração do webhook
        if (!config.webhook.enabled) {
            logger.warn('⚠️  Webhook N8N está desabilitado!');
        } else {
            logger.info({ webhookUrl: config.webhook.url }, '✅ Webhook N8N configurado');
        }

        // Inicia servidor HTTP
        const httpServer = await criarServidorHTTP();
        await httpServer.listen({
            port: config.port,
            host: config.host
        });

        logger.info({ port: config.port }, '✅ Servidor HTTP iniciado');

        // Log de configuração
        logger.info({
            ambiente: config.nodeEnv,
            http: `http://${config.host}:${config.port}`,
            ia: config.deepseek.model,
            webhook: config.webhook.url,
            rateLimit: `${config.security.rateLimitMax} req/${config.security.rateLimitWindow}ms`
        }, '🚀 Jarvis Bridge pronto!');

        logger.info('📡 Aguardando comandos do Gemini Live...');

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

process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Exceção não tratada');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Promise rejection não tratada');
    process.exit(1);
});

main();
