// ===========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ===========================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config/index.js';

/**
 * Verifica API Key no header
 */
export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    // Ignora health check
    if (request.url === '/health') {
        return;
    }

    const apiKey = request.headers['x-api-key'];

    if (apiKey !== config.security.apiKey) {
        reply.status(401).send({
            sucesso: false,
            erro: 'API Key inválida',
            requestId: request.id,
            timestamp: Date.now()
        });
    }
}
