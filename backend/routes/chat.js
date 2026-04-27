import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAnthropic, MODEL, isOverloadError } from '../lib/anthropic.js';
import { openSSE } from '../lib/sse.js';
import { calcMetrics } from '../lib/metrics.js';

const router = Router();

// 30 mensagens por IP a cada 10 minutos. Chat é mais leve, mas ainda paga.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas mensagens em sequência. Aguarde alguns minutos.' },
});

function formatBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function buildSystemPrompt({ businessName, segment, financialData, diagnosis }) {
  const m = calcMetrics(financialData);

  return `Você é o assistente financeiro do FinCheck, especialista em pequenas e médias empresas brasileiras.

CONTEXTO DO USUÁRIO:
- Empresa: ${businessName} (${segment})
- Receita Bruta: ${formatBRL(m.revenue)}
- CMV (custo do produto/serviço): ${formatBRL(m.cogs)}
- Despesas Fixas: ${formatBRL(m.fixedExpenses)}
- Saldo de Caixa: ${formatBRL(m.cashBalance)}
- Dívidas mensais: ${formatBRL(m.debtPayment)}
- Investimentos no mês: ${formatBRL(m.investments)}
- Contas a receber: ${formatBRL(m.accountsReceivable)}

NÚMEROS CALCULADOS (use estes valores, não recalcule):
- Lucro Bruto: ${formatBRL(m.grossProfit)} (Margem ${m.grossMargin.toFixed(1)}%)
- EBITDA: ${formatBRL(m.ebitda)}
- Lucro Líquido (o que vai pro bolso): ${formatBRL(m.netProfit)} (Margem ${m.netMargin.toFixed(1)}%)
- Índice de Endividamento: ${m.debtRatio.toFixed(1)}%
- Ponto de Equilíbrio: ${formatBRL(m.breakEven)}

DIAGNÓSTICO GERADO:
${diagnosis || '(não disponível)'}

REGRAS DO CHAT:
- Responda SEMPRE referenciando os números reais do usuário acima
- Use linguagem simples, sem jargão contábil (se usar termo técnico, explique entre parênteses)
- Seja direto, encorajador e humano — como um consultor financeiro amigo
- Se não souber algo específico do negócio, diga isso honestamente
- Respostas curtas a médias (2-5 parágrafos no máximo)
- Foco em orientações práticas que o dono pode aplicar essa semana
- Lembre o usuário, quando relevante, que você é uma IA e ele deve confirmar decisões importantes com seu contador`;
}

router.post('/', limiter, async (req, res) => {
  const { message, history, businessData, financialData, diagnosis } = req.body || {};

  if (!message || !financialData) {
    return res.status(400).json({ error: 'Mensagem e dados financeiros são obrigatórios.' });
  }

  const sse = openSSE(res);
  const ac = new AbortController();
  req.on('close', () => ac.abort());

  try {
    const messages = [
      ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message },
    ];

    const stream = await getAnthropic().messages.stream({
      model: MODEL,
      max_tokens: 1000,
      system: buildSystemPrompt({
        businessName: businessData?.businessName || 'sua empresa',
        segment: businessData?.segment || 'outro',
        financialData,
        diagnosis,
      }),
      messages,
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
  } catch (error) {
    if (ac.signal.aborted) return;
    console.error('[chat]', error.status, error.message);
    const msg = isOverloadError(error)
      ? 'A IA está temporariamente sobrecarregada. Aguarde e tente novamente.'
      : 'Erro ao processar sua pergunta.';
    sse.sendError(msg);
    sse.end();
  }
});

export default router;
