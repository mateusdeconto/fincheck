import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAnthropic, MODEL, isOverloadError } from '../lib/anthropic.js';
import { openSSE } from '../lib/sse.js';
import { calcMetrics } from '../lib/metrics.js';

const router = Router();

// 5 diagnósticos por IP a cada 10 minutos. Anthropic é caro — sem isso a conta sangra.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos diagnósticos em sequência. Aguarde alguns minutos.' },
});

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function buildItemsList(items) {
  if (!items || items.length === 0) return '  (sem detalhamento)';
  return items.map(i => `  • ${i.desc}: ${formatBRL(i.value)}`).join('\n');
}

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

function buildDiagnosisPrompt(input) {
  const m = calcMetrics(input);
  const { businessName, segment, fixedExpensesItems, debtPaymentItems, mixedAccounts } = input;

  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS.outro;
  const actualCmvPct = m.revenue > 0 ? ((m.cogs / m.revenue) * 100) : 0;

  const benchmarkBlock = `
BENCHMARK SETORIAL — ${bench.name} (fonte: SEBRAE / médias de PMEs brasileiras):
- Margem Bruta típica: ${bench.grossMargin[0]}%–${bench.grossMargin[1]}%  →  Empresa: ${m.grossMargin.toFixed(1)}% ${m.grossMargin >= bench.grossMargin[0] ? '✓ dentro da média' : '⚠ abaixo da média'}
- Margem Líquida típica: ${bench.netMargin[0]}%–${bench.netMargin[1]}%  →  Empresa: ${m.netMargin.toFixed(1)}% ${m.netMargin >= bench.netMargin[0] ? '✓ dentro da média' : '⚠ abaixo da média'}
- CMV/Receita típico: ${bench.cmvPct[0]}%–${bench.cmvPct[1]}%  →  Empresa: ${actualCmvPct.toFixed(1)}% ${actualCmvPct <= bench.cmvPct[1] ? '✓ dentro da média' : '⚠ acima da média'}
Use esses benchmarks no diagnóstico para contextualizar o desempenho da empresa vs. mercado.`;

  return `Você é um consultor financeiro especialista em pequenas e médias empresas brasileiras.
Analise os dados financeiros abaixo e gere um diagnóstico completo.

EMPRESA: ${businessName}
SEGMENTO: ${segment}

DADOS FINANCEIROS DO MÊS:
- Receita Bruta: ${formatBRL(m.revenue)}
- Custo das Vendas (CMV): ${formatBRL(m.cogs)}
- Lucro Bruto: ${formatBRL(m.grossProfit)} (Margem: ${m.grossMargin.toFixed(1)}%)

Despesas Fixas Operacionais: ${formatBRL(m.fixedExpenses)}
${buildItemsList(fixedExpensesItems)}

- EBITDA / Resultado Operacional: ${formatBRL(m.ebitda)}
- Saldo de Caixa: ${formatBRL(m.cashBalance)}

Dívidas / Parcelas Mensais: ${formatBRL(m.debtPayment)}
${buildItemsList(debtPaymentItems)}

- Investimentos na Empresa: ${formatBRL(m.investments)}
- Contas a Receber: ${formatBRL(m.accountsReceivable)}
- Mistura conta pessoal/PJ: ${mixedAccounts ? 'SIM — risco crítico de gestão' : 'Não (contas separadas)'}

${benchmarkBlock}

CÁLCULOS AUTOMATIZADOS (use esses valores nos textos):
- Lucro Líquido (o que vai pro bolso do dono): ${formatBRL(m.netProfit)}
- Margem Líquida: ${m.netMargin.toFixed(1)}%
- Índice de Endividamento: ${m.debtRatio.toFixed(1)}%
- Ponto de Equilíbrio: ${formatBRL(m.breakEven)} (precisa faturar ao menos isso para não ter prejuízo)

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

router.post('/', limiter, async (req, res) => {
  const { businessName, segment, revenue } = req.body || {};

  if (!businessName || !segment || revenue === undefined) {
    return res.status(400).json({ error: 'Dados insuficientes para gerar o diagnóstico.' });
  }

  const sse = openSSE(res);
  const prompt = buildDiagnosisPrompt(req.body);

  // Cancelamento: se cliente fecha aba, aborta o stream da Anthropic
  const ac = new AbortController();
  req.on('close', () => ac.abort());

  const MAX_RETRIES = 6;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const stream = await getAnthropic().messages.stream({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }, { signal: ac.signal });

      try {
        for await (const chunk of stream) {
          if (ac.signal.aborted) return;
          if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
            sse.sendText(chunk.delta.text);
          }
        }
      } catch (streamErr) {
        if (ac.signal.aborted) return;
        throw streamErr;
      }

      sse.end();
      return;
    } catch (error) {
      if (ac.signal.aborted) return;
      console.error(`[diagnose] tentativa ${attempt}/${MAX_RETRIES}:`, error.status, error.message);

      if (isOverloadError(error) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 4000 * attempt));
        continue;
      }

      let msg;
      if (error.status === 401)        msg = 'Chave de API inválida. Contate o suporte.';
      else if (isOverloadError(error)) msg = 'A IA está temporariamente sobrecarregada. Aguarde alguns segundos e tente novamente.';
      else                             msg = 'Erro ao gerar diagnóstico. Tente novamente em instantes.';

      sse.sendError(msg);
      sse.end();
      return;
    }
  }
});

export default router;
