// ============================================
// TESTE ISOLADO - DEEPSEEK API
// ============================================

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
});

async function testarDeepSeek(comando: string) {
    console.log('\n🧪 TESTANDO DEEPSEEK API');
    console.log('==========================\n');
    console.log(`Comando de entrada: "${comando}"\n`);

    const systemPrompt = `Você é um processador de comandos.
Receba comandos em português e retorne JSON com:
- comando_processado: comando limpo
- confianca: 0-1
- raciocinio: explicação

Exemplo:
{"comando_processado": "toca música", "confianca": 0.95, "raciocinio": "Comando claro"}

Responda APENAS JSON, sem markdown.`;

    try {
        console.log('📤 Enviando para DeepSeek...\n');

        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            max_tokens: 200,
            temperature: 0,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Comando: "${comando}"` }
            ]
        });

        const content = response.choices[0]?.message?.content;

        console.log('✅ Resposta recebida!\n');
        console.log('📊 Uso de tokens:');
        console.log(`   - Prompt: ${response.usage?.prompt_tokens}`);
        console.log(`   - Completion: ${response.usage?.completion_tokens}`);
        console.log(`   - Total: ${response.usage?.total_tokens}\n`);

        console.log('📝 Conteúdo bruto:');
        console.log('---');
        console.log(content);
        console.log('---\n');

        // Parse JSON
        const jsonLimpo = content
            ?.replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim() || '';

        const decisao = JSON.parse(jsonLimpo);

        console.log('✨ JSON parseado com sucesso!\n');
        console.log('📦 Decisão da IA:');
        console.log(JSON.stringify(decisao, null, 2));
        console.log('\n');

        // Validações
        console.log('🔍 Validações:');
        console.log(`   ✅ comando_processado: ${decisao.comando_processado ? 'OK' : '❌ FALTA'}`);
        console.log(`   ✅ confianca: ${typeof decisao.confianca === 'number' ? decisao.confianca : '❌ INVÁLIDA'}`);
        console.log(`   ✅ raciocinio: ${decisao.raciocinio ? 'OK' : '⚠️ Opcional'}`);

        if (decisao.confianca >= 0.7) {
            console.log(`\n✅ ALTA CONFIANÇA (${decisao.confianca}) - Comando seria executado!`);
        } else {
            console.log(`\n⚠️ BAIXA CONFIANÇA (${decisao.confianca}) - Comando seria rejeitado!`);
        }

        return decisao;

    } catch (error) {
        console.error('\n❌ ERRO:', error);
        throw error;
    }
}

// Testes
const comandosTeste = process.argv[2] || 'toca uma música';

testarDeepSeek(comandosTeste)
    .then(() => {
        console.log('\n✅ Teste concluído com sucesso!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Teste falhou:', error.message);
        process.exit(1);
    });
