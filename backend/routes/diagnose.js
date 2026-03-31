import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function buildItemsList(items) {
  if (!items || items.length === 0) return '  (sem detalhamento)';
  return items.map(i => `  • ${i.desc}: ${formatBRL(i.value)}`).join('\n');
}

// Fontes: SEBRAE (restaurante/CMV), dados públicos de empresas brasileiras (demais)
// Ajustados para PMEs, não grandes empresas de capital aberto
const SECTOR_BENCHMARKS = {
  restaurante: { grossMargin: [55, 70], netMargin: [3, 9],  cmvPct: [30, 40], name: 'Restaurante / Alimentação' },
  varejo:      { grossMargin: [25, 42], netMargin: [2, 8],  cmvPct: [55, 72], name: 'Varejo / Comércio' },
  servicos:    { grossMargin: [38, 55], netMargin: [8, 15], cmvPct: [28, 48], name: 'Serviços' },
  saude:       { grossMargin: [45, 60], netMargin: [6, 12], cmvPct: [25, 40], name: 'Saúde / Bem-estar' },
  beleza:      { grossMargin: [40, 58], netMargin: [7, 14], cmvPct: [18, 35], name: 'Beleza / Estética' },
  tecnologia:  { grossMargin: [50, 70], netMargin: [5, 15], cmvPct: [15, 35], name: 'Tecnologia / Digital' },
  construcao:  { grossMargin: [20, 32], netMargin: [5, 12], cmvPct: [62, 78], name: 'Construção / Reforma' },
  educacao:    { grossMargin: [45, 58], netMargin: [4, 10], cmvPct: [20, 38], name: 'Educação / Cursos' },
  industria:   { grossMargin: [25, 42], netMargin: [5, 10], cmvPct: [52, 70], name: 'Indústria / Fabricação' },
  outro:       { grossMargin: [30, 45], netMargin: [5, 10], cmvPct: [40, 62], name: 'Outro segmento' },
};

function buildDiagnosisPrompt({
  businessName, segment,
  revenue, cogs,
  fixedExpenses, fixedExpensesItems,
  cashBalance,
  debtPayment, debtPaymentItems,
  accountsReceivable,
  mixedAccounts,
  investments,
}) {
  const grossProfit = (revenue || 0) - (cogs || 0);
  const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
  const ebitda = grossProfit - (fixedExpenses || 0);
  const netProfit = ebitda - (debtPayment || 0) - (investments || 0);
  const netMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;
  const debtRatio = revenue > 0 ? (((debtPayment || 0) / revenue) * 100).toFixed(1) : 0;
  const breakEven = grossMargin > 0 ? ((fixedExpenses || 0) / (grossMargin / 100)) : 0;

  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS['outro'];
  const actualCmvPct = revenue > 0 ? ((cogs / revenue) * 100).toFixed(1) : 0;
  const benchmarkBlock = `
BENCHMARK SETORIAL — ${bench.name} (fonte: SEBRAE / médias de PMEs brasileiras):
- Margem Bruta típica: ${bench.grossMargin[0]}%–${bench.grossMargin[1]}%  →  Empresa: ${grossMargin}% ${parseFloat(grossMargin) >= bench.grossMargin[0] ? '✓ dentro da média' : '⚠ abaixo da média'}
- Margem Líquida típica: ${bench.netMargin[0]}%–${bench.netMargin[1]}%  →  Empresa: ${netMargin}% ${parseFloat(netMargin) >= bench.netMargin[0] ? '✓ dentro da média' : '⚠ abaixo da média'}
- CMV/Receita típico: ${bench.cmvPct[0]}%–${bench.cmvPct[1]}%  →  Empresa: ${actualCmvPct}% ${parseFloat(actualCmvPct) <= bench.cmvPct[1] ? '✓ dentro da média' : '⚠ acima da média'}
Use esses benchmarks no diagnóstico para contextualizar o desempenho da empresa vs. mercado.`;

  return `Você é um consultor financeiro especialista em pequenas e médias empresas brasileiras.
Analise os dados financeiros abaixo e gere um diagnóstico completo.

EMPRESA: ${businessName}
SEGMENTO: ${segment}

DADOS FINANCEIROS DO MÊS:
- Receita Bruta: ${formatBRL(revenue)}
- Custo das Vendas (CMV): ${formatBRL(cogs)}
- Lucro Bruto: ${formatBRL(grossProfit)} (Margem: ${grossMargin}%)

Despesas Fixas Operacionais: ${formatBRL(fixedExpenses)}
${buildItemsList(fixedExpensesItems)}

- EBITDA / Resultado Operacional: ${formatBRL(ebitda)}
- Saldo de Caixa: ${formatBRL(cashBalance)}

Dívidas / Parcelas Mensais: ${formatBRL(debtPayment)}
${buildItemsList(debtPaymentItems)}

- Investimentos na Empresa: ${formatBRL(investments)}
- Contas a Receber: ${formatBRL(accountsReceivable)}
- Mistura conta pessoal/PJ: ${mixedAccounts ? 'SIM — risco crítico de gestão' : 'Não (contas separadas)'}

${benchmarkBlock}

CÁLCULOS AUTOMATIZADOS (use esses valores nos textos):
- Lucro Líquido (o que vai pro bolso do dono): ${formatBRL(netProfit)}
- Margem Líquida: ${netMargin}%
- Índice de Endividamento: ${debtRatio}%
- Ponto de Equilíbrio: ${formatBRL(breakEven)} (precisa faturar ao menos isso para não ter prejuízo)

CLASSIFICAÇÃO DA SAÚDE FINANCEIRA (use apenas uma):
- 🔴 Crítica: Margem Líquida < 0% OU caixa negativo
- 🟡 Atenção: Margem Líquida entre 0-5% OU endividamento > 30%
- 🟢 Estável: Margem Líquida entre 5-10% E endividamento < 30%
- ✅ Saudável: Margem Líquida > 10% E endividamento < 20% E caixa positivo

GERE O DIAGNÓSTICO em português, em exatamente 4 seções com os títulos EXATOS abaixo:

## 🏢 Resumo Executivo
[3 parágrafos curtos. Explique como está o negócio em linguagem de dono. Mencione obrigatoriamente: classificação de saúde financeira (ex: "Saúde Financeira: 🟡 Atenção"), o lucro líquido real (o que vai pro bolso), o ponto de equilíbrio, e como a empresa se compara à média setorial em pelo menos uma métrica. Tom direto e humano.]

## ⚠️ Pontos de Atenção
[Até 3 alertas no formato:
• **Nome do problema**: o que está acontecendo e por que é preocupante — use os números reais.
Se não houver problemas graves, diga isso e elogie.]

## ✅ O que está funcionando
[Até 2 pontos positivos no formato:
• **Ponto forte**: por que esse número é bom e o que significa na prática.
Se quase nada estiver bom, seja honesto mas encorajador.]

## 🎯 Recomendações para essa semana
[3 ações concretas no formato:
**1. Nome da ação**: como fazer na prática — resultado esperado em linguagem simples.
Priorize pelo impacto mais rápido no caixa.]

REGRAS ABSOLUTAS:
- NUNCA use jargão técnico sem explicar entre parênteses. Ex: "margem bruta (quanto sobra depois de pagar o que você vendeu)"
- Tom: direto, encorajador, humano — como um amigo que entende de finanças
- Use os números reais em reais (R$) nas explicações, não só percentuais
- Cada seção: máximo 200 palavras
- Não repita informações entre seções
- Comece DIRETO com ## 🏢 Resumo Executivo, sem cabeçalho extra antes`;
}

router.post('/', async (req, res) => {
  const {
    businessName, segment,
    revenue, cogs,
    fixedExpenses, fixedExpensesItems,
    cashBalance,
    debtPayment, debtPaymentItems,
    accountsReceivable,
    mixedAccounts,
    investments,
  } = req.body;

  if (!businessName || !segment || revenue === undefined) {
    return res.status(400).json({ error: 'Dados insuficientes para gerar o diagnóstico.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders();

  try {
    const prompt = buildDiagnosisPrompt({
      businessName, segment,
      revenue, cogs,
      fixedExpenses, fixedExpensesItems,
      cashBalance,
      debtPayment, debtPaymentItems,
      accountsReceivable,
      mixedAccounts,
      investments,
    });

    const stream = await getClient().messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

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
