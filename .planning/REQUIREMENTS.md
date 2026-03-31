# FinCheck — Requirements

## Functional Requirements

### FR-01: Onboarding
- Campo de texto para nome do negócio (obrigatório)
- Dropdown para segmento: Restaurante, Varejo, Serviços, Indústria, Outro
- Validação: não avança sem preencher ambos

### FR-02: Questionário (6 perguntas)
| # | Campo | Título | Exemplo |
|---|-------|--------|---------|
| 1 | revenue | Quanto você faturou esse mês? | Soma de tudo que entrou no caixa com vendas |
| 2 | cogs | Quanto gastou pra entregar seu produto/serviço? | Ingredientes, mercadoria, mão de obra direta |
| 3 | fixedExpenses | Quais foram seus gastos fixos? | Aluguel, salários, contas de luz/internet |
| 4 | cashBalance | Quanto sobrou no caixa no fim do mês? | O saldo atual da sua conta bancária |
| 5 | debtPayment | Quanto paga de dívidas por mês? | Parcelas de empréstimo, financiamentos |
| 6 | accountsReceivable | Tem clientes que ainda não pagaram? | Vendas feitas mas ainda não recebidas |

- Cada pergunta: 1 por tela, input numérico formatado em R$
- Permite voltar à pergunta anterior
- Pergunta 5 e 6 podem ser 0 (negócio sem dívidas/inadimplência)

### FR-03: Diagnóstico via IA
- Enviado para Anthropic API após completar questionário
- Streaming progressivo (o texto aparece enquanto é gerado)
- 4 seções obrigatórias:
  1. Resumo Executivo (com saúde: Crítica / Atenção / Estável / Saudável)
  2. Pontos de Atenção (até 3 alertas)
  3. O que está funcionando (até 2 pontos positivos)
  4. Recomendações para essa semana (3 ações concretas)
- Linguagem: sem jargão, tom encorajador e direto

### FR-04: Chat Financeiro
- Aberto após o diagnóstico
- Histórico de mensagens visível
- IA responde com contexto dos dados fornecidos
- Sugestões de perguntas iniciais

## Non-Functional Requirements

### NFR-01: Performance
- Diagnóstico começa a aparecer em < 3s após envio
- Streaming suave, sem travamentos

### NFR-02: UX / Design
- Mobile-first (320px+)
- Responsivo até desktop
- Cores: azul escuro (#1e3a5f) + branco (#ffffff)
- Sem login, zero fricção

### NFR-03: Segurança
- ANTHROPIC_API_KEY apenas no backend (nunca exposta ao frontend)
- Nenhum dado do usuário é persistido
