import { useState } from 'react';

/**
 * As 6 perguntas do formulário financeiro
 * Cada uma tem: campo, título simples, subtítulo com exemplo prático, placeholder
 */
const QUESTIONS = [
  {
    field: 'revenue',
    title: 'Quanto você faturou esse mês?',
    subtitle: 'Some tudo que entrou no caixa com vendas — boletos pagos, dinheiro, cartão, Pix. Não inclua o que ainda não foi pago.',
    placeholder: '0,00',
    example: 'Ex: se vendeu R$ 30.000 em produtos e serviços',
    allowZero: false,
  },
  {
    field: 'cogs',
    title: 'Quanto gastou pra entregar seu produto ou serviço?',
    subtitle: 'Inclua: ingredientes, mercadoria revendida, embalagens, mão de obra direta (quem faz o produto). Não inclua aluguel ou salários fixos.',
    placeholder: '0,00',
    example: 'Ex: farinha, carne, mercadoria comprada pra revender',
    allowZero: false,
  },
  {
    field: 'fixedExpenses',
    title: 'Quais foram seus gastos fixos do mês?',
    subtitle: 'Inclua: aluguel, salários + encargos, energia, internet, contador, sistemas. São os gastos que existem mesmo que você não venda nada.',
    placeholder: '0,00',
    example: 'Ex: aluguel R$ 3.000 + 2 funcionários R$ 4.000 + contas R$ 500',
    allowZero: false,
  },
  {
    field: 'cashBalance',
    title: 'Quanto sobrou no caixa no fim do mês?',
    subtitle: 'Olhe o saldo atual da sua conta bancária do negócio. Pode ser negativo se estiver no vermelho.',
    placeholder: '0,00',
    example: 'Ex: saldo da conta corrente hoje',
    allowZero: true,
  },
  {
    field: 'debtPayment',
    title: 'Você tem dívidas? Quanto paga por mês?',
    subtitle: 'Some as parcelas mensais de: empréstimos bancários, financiamentos, cheque especial, dívidas com fornecedores. Se não tiver dívidas, pode deixar zero.',
    placeholder: '0,00',
    example: 'Ex: parcela do banco R$ 1.500 + fornecedor R$ 800',
    allowZero: true,
  },
  {
    field: 'accountsReceivable',
    title: 'Você tem clientes que ainda não pagaram?',
    subtitle: 'Valor total de vendas que você já fez mas ainda não recebeu. Inclui boletos vencidos, parcelamentos em aberto, cheques pré-datados. Se não tiver, deixe zero.',
    placeholder: '0,00',
    example: 'Ex: cliente deve R$ 2.000, outro deve R$ 500',
    allowZero: true,
  },
];

/**
 * Formata número como moeda brasileira durante a digitação.
 * Suporta sinal negativo no início.
 */
function formatCurrencyInput(raw) {
  const isNegative = raw.startsWith('-');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return isNegative ? '-' : '';
  const number = parseInt(digits, 10) / 100;
  const formatted = number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return isNegative ? '-' + formatted : formatted;
}

/**
 * Converte string formatada (ex: "-1.234,56") para número
 */
function parseFormattedValue(formatted) {
  if (!formatted || formatted === '-') return 0;
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

export default function Questionnaire({ onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState({
    revenue: '',
    cogs: '',
    fixedExpenses: '',
    cashBalance: '',
    debtPayment: '',
    accountsReceivable: '',
  });

  const question = QUESTIONS[currentIndex];
  const currentValue = values[question.field];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  // Permite avançar se: campo permite zero/negativo e está vazio, ou tem valor diferente de 0
  const parsedValue = parseFormattedValue(currentValue);
  const canProceed = question.allowZero
    ? currentValue !== '-' // pode avançar mesmo vazio, mas não com só "-"
    : parsedValue !== 0 && currentValue !== '-';

  function handleInput(e) {
    const raw = e.target.value;
    // Permite digitar "-" sozinho pra começar um número negativo
    if (raw === '-') {
      setValues((prev) => ({ ...prev, [question.field]: '-' }));
      return;
    }
    const formatted = formatCurrencyInput(raw);
    setValues((prev) => ({ ...prev, [question.field]: formatted }));
  }

  function handleNext() {
    if (!canProceed) return;

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Última pergunta — converte tudo para número e finaliza
      const numericData = {};
      QUESTIONS.forEach(({ field }) => {
        numericData[field] = parseFormattedValue(values[field]);
      });
      onComplete(numericData);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      onBack();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canProceed) handleNext();
  }

  const isLast = currentIndex === QUESTIONS.length - 1;

  return (
    <div className="animate-fade-in">
      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-navy-200 text-sm font-medium">
            Pergunta {currentIndex + 1} de {QUESTIONS.length}
          </span>
          <span className="text-navy-200 text-sm">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card da pergunta */}
      <div className="card p-6">
        {/* Número da pergunta */}
        <div className="inline-flex items-center justify-center w-8 h-8 bg-navy-100 rounded-full mb-4">
          <span className="text-navy-700 text-sm font-bold">{currentIndex + 1}</span>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
          {question.title}
        </h2>

        {/* Subtítulo / explicação */}
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {question.subtitle}
        </p>

        {/* Input monetário */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-slate-400">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={currentValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="0,00"
              className="currency-input w-40"
              autoFocus
            />
          </div>
          {question.allowZero && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Pode deixar em branco se não tiver (= R$ 0,00)
            </p>
          )}
        </div>

        {/* Exemplo prático */}
        <p className="text-xs text-slate-400 text-center mb-6">
          💡 {question.example}
        </p>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-primary"
          >
            {isLast ? 'Gerar diagnóstico →' : 'Próximo →'}
          </button>
          <button
            onClick={handleBack}
            className="btn-secondary"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <p className="text-center text-navy-300 text-xs mt-4">
        Sem jargão contábil, sem complicação
      </p>
    </div>
  );
}
