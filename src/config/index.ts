// ===========================================
// CONFIGURAÇÕES CENTRALIZADAS
// ===========================================

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
    port: z.coerce.number().default(3000),
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

    webhook: z.object({
        url: z.string().url(),
        enabled: z.coerce.boolean().default(true),
        timeout: z.coerce.number().default(60000),
        spotify: z.string().trim().url().optional(),
        whatsapp: z.string().trim().url().optional(),
        financeiro: z.string().trim().url().optional(),
        clima: z.string().trim().url().optional(),
        pesquisa: z.string().trim().url().optional()
    }),

    log: z.object({
        level: z.string().default('info'),
        file: z.string().optional()
    })
});

const rawConfig = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
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

    webhook: {
        url: process.env.JARVIS_WEBHOOK_URL,
        enabled: process.env.JARVIS_WEBHOOK_ENABLED,
        timeout: process.env.JARVIS_WEBHOOK_TIMEOUT,
        spotify: process.env.WEBHOOK_SPOTIFY,
        whatsapp: process.env.WEBHOOK_WHATSAPP,
        financeiro: process.env.WEBHOOK_FINANCEIRO,
        clima: process.env.WEBHOOK_CLIMA,
        pesquisa: process.env.WEBHOOK_PESQUISA
    },

    log: {
        level: process.env.LOG_LEVEL,
        file: process.env.LOG_FILE
    }
};

export const config = ConfigSchema.parse(rawConfig);
