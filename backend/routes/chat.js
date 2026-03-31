import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Monta o system prompt para o chat, injetando o contexto financeiro do usuário
 */
function buildSystemPrompt({ businessName, segment, revenue, cogs, fixedExpenses, cashBalance, debtPayment, accountsReceivable, diagnosis }) {
  const grossMargin = revenue > 0 ? (((revenue - cogs) / revenue) * 100).toFixed(1) : 0;
  const netMargin = revenue > 0 ? (((revenue - cogs - fixedExpenses - debtPayment) / revenue) * 100).toFixed(1) : 0;
  const debtIndex = revenue > 0 ? ((debtPayment / revenue) * 100).toFixed(1) : 0;

  return `Você é o assistente financeiro do FinCheck, especialista em pequenas e médias empresas brasileiras.

CONTEXTO DO USUÁRIO:
- Empresa: ${businessName} (${segment})
- Receita Bruta: R$ ${Number(revenue).toLocaleString('pt-BR')}
- CPV (custo do produto/serviço): R$ ${Number(cogs).toLocaleString('pt-BR')}
- Despesas Fixas: R$ ${Number(fixedExpenses).toLocaleString('pt-BR')}
- Saldo de Caixa: R$ ${Number(cashBalance).toLocaleString('pt-BR')}
- Dívidas mensais: R$ ${Number(debtPayment).toLocaleString('pt-BR')}
- Contas a receber: R$ ${Number(accountsReceivable).toLocaleString('pt-BR')}

NÚMEROS CALCULADOS:
- Margem Bruta: ${grossMargin}%
- Margem Líquida: ${netMargin}%
- Índice de Endividamento: ${debtIndex}%

DIAGNÓSTICO GERADO:
${diagnosis || '(não disponível)'}

REGRAS DO CHAT:
- Responda SEMPRE referenciando os números reais do usuário acima
- Use linguagem simples, sem jargão contábil (se usar termo técnico, explique entre parênteses)
- Seja direto, encorajador e humano — como um consultor financeiro amigo
- Se não souber algo específico do negócio, diga isso honestamente
- Respostas curtas a médias (2-5 parágrafos no máximo)
- Foco em orientações práticas que o dono pode aplicar essa semana`;
}

/**
 * POST /api/chat
 * Recebe mensagem do usuário + histórico + contexto financeiro
 * Retorna resposta da IA em streaming (SSE)
 */
router.post('/', async (req, res) => {
  const { message, history, financialData, diagnosis } = req.body;

  if (!message || !financialData) {
    return res.status(400).json({ error: 'Mensagem e dados financeiros são obrigatórios.' });
  }

  // Configura SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders();

  try {
    // Constrói o histórico de mensagens no formato da API
    const messages = [
      // Mensagens anteriores do chat
      ...(history || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      // Nova mensagem do usuário
      { role: 'user', content: message },
    ];

    const stream = await getClient().messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: buildSystemPrompt({ ...financialData, diagnosis }),
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Erro no chat:', error.message);
    res.write(`data: ${JSON.stringify({ error: 'Erro ao processar sua pergunta.' })}\n\n`);
    res.end();
  }
});

export default router;
