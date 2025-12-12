// ===========================================
// TIPOS GLOBAIS DO SISTEMA
// ===========================================

export interface ContextoSistema {
    musicaTocando?: boolean;
    musicaAtual?: string;
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

export type Ferramenta = 'spotify' | 'whatsapp' | 'financeiro' | 'clima' | 'pesquisa' | 'contatos' | 'default';

export interface DecisaoIA {
    comando_processado: string;
    confianca: number;
    raciocinio?: string;
    ferramenta: Ferramenta;
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
