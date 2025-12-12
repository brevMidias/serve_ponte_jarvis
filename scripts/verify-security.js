#!/usr/bin/env node

/**
 * 🔐 VERIFICADOR DE SEGURANÇA
 * 
 * Verifica se há API keys ou informações sensíveis expostas no código
 */

import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔐 Verificador de Segurança - API Keys\n');

const checks = {
    passed: [],
    warnings: [],
    errors: []
};

// 1. Verificar se .env existe
if (!fs.existsSync('.env')) {
    checks.errors.push('.env não encontrado! Copie o .env.example');
} else {
    checks.passed.push('.env encontrado');
}

// 2. Verificar .gitignore
if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (gitignore.includes('.env')) {
        checks.passed.push('.env está no .gitignore');
    } else {
        checks.errors.push('.env NÃO está no .gitignore!');
    }
} else {
    checks.errors.push('.gitignore não encontrado!');
}

// 3. Verificar se há API keys hardcoded nos arquivos fonte
const sourceFiles = [
    'src/config/index.ts',
    'src/ai/decisor.ts',
    'src/index.ts'
];

const apiKeyPatterns = [
    /sk-[a-zA-Z0-9]{30,}/g,  // DeepSeek pattern
    /[A-Za-z0-9]{32,}/g      // Generic API key pattern
];

for (const file of sourceFiles) {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');

        // Verificar se usa process.env
        if (content.includes('process.env')) {
            checks.passed.push(`${file}: Usa variáveis de ambiente`);
        }

        // Verificar se não há keys hardcoded
        let hasHardcodedKey = false;
        for (const pattern of apiKeyPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                // Filtrar falsos positivos (comentários, exemplos)
                const validMatches = matches.filter(match =>
                    !content.includes(`// ${match}`) &&
                    !content.includes(`example: ${match}`)
                );

                if (validMatches.length > 0) {
                    hasHardcodedKey = true;
                    checks.errors.push(`${file}: Possível API key hardcoded!`);
                }
            }
        }

        if (!hasHardcodedKey) {
            checks.passed.push(`${file}: Sem API keys hardcoded`);
        }
    }
}

// 4. Verificar se .env.example não tem keys reais
if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf-8');

    // Padrões de API keys reais (não exemplos)
    const realKeyPatterns = [
        /sk-[a-zA-Z0-9]{30,}/,  // DeepSeek real key
        /QPuCPLluM9zL5Rz95qXpzN3uxnqnXvUZ/, // Mistral key (example)
        /AIzaSy[a-zA-Z0-9_-]{33}/ // Google API key
    ];

    let hasRealKey = false;
    for (const pattern of realKeyPatterns) {
        if (pattern.test(envExample)) {
            // Verificar se está marcado como exemplo
            if (!envExample.includes('# EXEMPLO') && !envExample.includes('sua-chave-aqui')) {
                hasRealKey = true;
            }
        }
    }

    if (hasRealKey) {
        checks.warnings.push('.env.example pode conter API keys reais!');
    } else {
        checks.passed.push('.env.example está seguro');
    }
}

// 5. Verificar configuração de AI_PROVIDER no .env
if (fs.existsSync('.env')) {
    const env = fs.readFileSync('.env', 'utf-8');

    if (env.includes('AI_PROVIDER=')) {
        const match = env.match(/AI_PROVIDER=(\w+)/);
        if (match) {
            const provider = match[1];
            if (provider === 'mistral' || provider === 'deepseek') {
                checks.passed.push(`Provedor de IA configurado: ${provider}`);
            } else {
                checks.errors.push(`Provedor de IA inválido: ${provider}`);
            }
        }
    } else {
        checks.warnings.push('AI_PROVIDER não configurado (usará padrão: mistral)');
    }
}

// Exibir resultados
console.log(`${GREEN}✅ PASSOU (${checks.passed.length})${RESET}`);
checks.passed.forEach(msg => console.log(`  ✓ ${msg}`));

if (checks.warnings.length > 0) {
    console.log(`\n${YELLOW}⚠️  AVISOS (${checks.warnings.length})${RESET}`);
    checks.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
}

if (checks.errors.length > 0) {
    console.log(`\n${RED}❌ ERROS (${checks.errors.length})${RESET}`);
    checks.errors.forEach(msg => console.log(`  ✗ ${msg}`));
    console.log(`\n${RED}AÇÃO NECESSÁRIA: Corrija os erros acima!${RESET}\n`);
    process.exit(1);
} else {
    console.log(`\n${GREEN}🎉 Tudo certo! Nenhuma vulnerabilidade encontrada.${RESET}\n`);
    process.exit(0);
}
