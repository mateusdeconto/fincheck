import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Client instanciado na primeira requisição — garante que dotenv já carregou
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Formata um número como moeda brasileira
 */
function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Monta o prompt enviado à Anthropic com os dados financeiros do usuário
 */
function buildDiagnosisPrompt({ businessName, segment, revenue, cogs, fixedExpenses, cashBalance, debtPayment, accountsReceivable }) {
  return `Você é um consultor financeiro especialista em pequenas e médias empresas brasileiras.
Analise os dados financeiros abaixo e gere um diagnóstico completo.

EMPRESA: ${businessName}
SEGMENTO: ${segment}

DADOS FINANCEIROS DO MÊS:
- Receita Bruta: ${formatBRL(revenue)}
- Custo do Produto/Serviço (CPV): ${formatBRL(cogs)}
- Despesas Fixas Operacionais: ${formatBRL(fixedExpenses)}
- Saldo de Caixa Atual: ${formatBRL(cashBalance)}
- Pagamento de Dívidas (mensal): ${formatBRL(debtPayment)}
- Contas a Receber / Inadimplência: ${formatBRL(accountsReceivable)}

CALCULE AUTOMATICAMENTE E USE NOS TEXTOS:
- Margem Bruta = (Receita - CPV) / Receita × 100
- Margem Líquida = (Receita - CPV - Despesas Fixas - Dívidas) / Receita × 100
- Ponto de Equilíbrio = Despesas Fixas / (Margem Bruta em decimal)
- Índice de Endividamento = Dívidas / Receita × 100

CLASSIFICAÇÃO DA SAÚDE FINANCEIRA (use apenas uma):
- 🔴 Crítica: Margem Líquida < 0% OU caixa negativo
- 🟡 Atenção: Margem Líquida entre 0-5% OU endividamento > 30%
- 🟢 Estável: Margem Líquida entre 5-10% E endividamento < 30%
- ✅ Saudável: Margem Líquida > 10% E endividamento < 20% E caixa positivo

GERE O DIAGNÓSTICO em português, em exatamente 4 seções com os títulos EXATOS abaixo:

## 🏢 Resumo Executivo
[3 parágrafos curtos. Explique como está o negócio em linguagem de dono, não de contador. Inclua a classificação de saúde financeira (ex: "Saúde Financeira: 🟡 Atenção") e os principais números calculados com explicação simples. Tom direto e humano.]

## ⚠️ Pontos de Atenção
[Até 3 alertas no formato:
• **Nome do problema**: o que está acontecendo e por que é preocupante — use os números reais do cliente.
Se não houver problemas graves, diga isso claramente e elogie.]

## ✅ O que está funcionando
[Até 2 pontos positivos no formato:
• **Ponto forte**: por que esse número é bom e o que ele significa na prática.
Se quase nada estiver bom, seja honesto mas encorajador — mencione o que pode ser alavancado.]

## 🎯 Recomendações para essa semana
[3 ações concretas no formato:
**1. Nome da ação**: como fazer na prática — resultado esperado em linguagem simples.
Priorize pelo impacto mais rápido no caixa.]

REGRAS ABSOLUTAS:
- NUNCA use jargão técnico sem explicar entre parênteses logo depois. Ex: "margem bruta (quanto sobra depois de pagar o que você vendeu)"
- Tom: direto, encorajador, humano — como um amigo que entende de finanças falando com o dono
- Use os números reais do cliente em reais nas explicações, não só percentuais
- Cada seção: máximo 200 palavras
- Não repita informações entre seções
- NÃO inclua cabeçalho antes das seções, comece direto com ## 🏢 Resumo Executivo`;
}

/**
 * POST /api/diagnose
 * Recebe os dados financeiros e retorna o diagnóstico em streaming (SSE)
 */
router.post('/', async (req, res) => {
  const { businessName, segment, revenue, cogs, fixedExpenses, cashBalance, debtPayment, accountsReceivable } = req.body;

  // Validação básica
  if (!businessName || !segment || revenue === undefined) {
    return res.status(400).json({ error: 'Dados insuficientes para gerar o diagnóstico.' });
  }

  // Configura SSE (Server-Sent Events) para streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders();

  try {
    const prompt = buildDiagnosisPrompt({ businessName, segment, revenue, cogs, fixedExpenses, cashBalance, debtPayment, accountsReceivable });

    // Cria o stream com a Anthropic API
    const stream = await getClient().messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Envia cada chunk de texto ao frontend via SSE
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        const text = chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Sinaliza o fim do stream
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Erro ao chamar Anthropic API:', error.status, error.message);
    const msg = error.status === 401 ? 'API key inválida.' : error.message || 'Erro ao gerar diagnóstico.';
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
