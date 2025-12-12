// ===========================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ===========================================

import { z } from 'zod';

// Schema da decisão da IA
export const DecisaoSchema = z.object({
    comando_processado: z.string().min(1).max(1000),
    confianca: z.number().min(0).max(1),
    raciocinio: z.string().optional(),
    ferramenta: z.enum(['spotify', 'whatsapp', 'financeiro', 'clima', 'pesquisa', 'contatos', 'default']).default('default')
});

// Schema do comando de entrada
export const ComandoEntradaSchema = z.object({
    comando: z.string().min(1).max(1000),
    contexto: z.object({
        musicaTocando: z.boolean().optional(),
        musicaAtual: z.string().optional(),
        ultimoComando: z.string().optional()
    }).optional(),
    sessionId: z.string().uuid().optional(),
    timestamp: z.number().optional()
});

// Types inferidos dos schemas
export type DecisaoValidada = z.infer<typeof DecisaoSchema>;
export type ComandoValidado = z.infer<typeof ComandoEntradaSchema>;
