import { useEffect, useState } from 'react';
import { writeSession, readSession, removeSession } from '../lib/storage.js';

const DRAFT_KEY = 'fincheck_questionnaire_draft';

const QUESTIONS = [
  {
    field: 'revenue', type: 'single', allowZero: false,
    title: 'Quanto entrou no caixa esse mês?',
    subtitle: 'Soma tudo que você recebeu — boletos pagos, dinheiro, cartão, Pix. Não inclua o que ainda não foi pago.',
    example: 'Ex: R$ 30.000 em vendas',
    helper: 'Conta apenas o que efetivamente entrou. Pedido feito mas não pago vai mais tarde em "Contas a receber".',
  },
  {
    field: 'cogs', type: 'single', allowZero: false,
    title: 'Quanto custou pra entregar isso?',
    subtitle: 'Inclua: matéria-prima, mercadoria revendida, embalagens, comissões. Não inclua aluguel ou folha fixa.',
    example: 'Ex: ingredientes, mercadoria pra revender',
    helper: 'É o CMV (Custo da Mercadoria Vendida). Se vendeu 100 pizzas, é o custo da farinha + queijo + carne dessas 100 pizzas.',
  },
  {
    field: 'fixedExpenses', type: 'itemized', allowZero: false,
    title: 'Quais foram seus gastos fixos?',
    subtitle: 'Adicione cada gasto separadamente. Custos que existem mesmo se você não vender nada.',
    exampleItems: ['Aluguel', 'Salários + encargos', 'Energia', 'Contador', 'Internet'],
    helper: 'Despesas que vencem todo mês: aluguel, folha, contas. Adicione um por linha.',
  },
  {
    field: 'cashBalance', type: 'single', allowZero: true, allowNegative: true,
    title: 'Quanto sobrou no caixa?',
    subtitle: 'Saldo atual da conta bancária do negócio. Pode ser negativo se estiver no vermelho.',
    example: 'Ex: saldo da conta corrente hoje',
    helper: 'Se está negativo (cheque especial), digite com sinal de menos. Ex: -1500',
  },
  {
    field: 'debtPayment', type: 'itemized', allowZero: true,
    title: 'Tem dívidas? Liste as parcelas.',
    subtitle: 'Adicione cada dívida separadamente. Sem dívidas? Pode pular.',
    exampleItems: ['Empréstimo banco', 'Financiamento equipamento', 'Cheque especial', 'Fornecedor parcelado'],
    helper: 'Apenas o valor da parcela do mês — não o total. Financia equipamento R$ 800/mês? Digite 800.',
  },
  {
    field: 'accountsReceivable', type: 'single', allowZero: true,
    title: 'Tem clientes que ainda não pagaram?',
    subtitle: 'Total de vendas feitas mas não recebidas — boletos vencidos, parcelamentos em aberto.',
    example: 'Ex: cliente deve R$ 2.000, outro deve R$ 500',
    helper: 'Dinheiro que existe mas ainda não chegou. Inadimplência alta = sinal de risco.',
  },
  {
    field: 'mixedAccounts', type: 'choice', allowZero: true,
    title: 'Usa a mesma conta pra você e pro negócio?',
    subtitle: 'Pessoal + PJ na mesma conta — entender isso ajuda no diagnóstico.',
    helper: 'Misturar PJ com PF é um dos erros mais comuns e perigosos em pequenas empresas brasileiras.',
    options: [
      { value: 'yes', label: 'Sim, é tudo junto', detail: 'Pessoal e empresa misturados' },
      { value: 'no',  label: 'Não, são separadas', detail: 'Cada um no seu lugar' },
    ],
  },
  {
    field: 'investments', type: 'single', allowZero: true,
    title: 'Investiu de volta no negócio esse mês?',
    subtitle: 'Equipamentos, reformas, marketing, treinamentos, estoque extra — gastos pra crescer (não pra operar).',
    example: 'Ex: equipamento R$ 3.000 + marketing R$ 1.500',
    helper: 'É dinheiro que sai do caixa pra crescer. Não confunda com despesa operacional (aluguel/folha) — essas já foram nos gastos fixos.',
  },
];

function formatCurrencyInput(raw) {
  const isNegative = raw.startsWith('-');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return isNegative ? '-' : '';
  const number = parseInt(digits, 10) / 100;
  const formatted = number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return isNegative ? '-' + formatted : formatted;
}

function parseFormattedValue(formatted) {
  if (!formatted || formatted === '-') return 0;
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function HelperTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {open ? 'Ok, entendi' : 'O que conta aqui?'}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-brand-50 border border-brand-100 rounded-md text-xs text-ink-600 leading-relaxed animate-fade-in">
          {text}
        </div>
      )}
    </div>
  );
}

function ItemizedInput({ items, onChange, exampleItems }) {
  function handleDescChange(idx, val) {
    onChange(items.map((item, i) => i === idx ? { ...item, desc: val } : item));
  }
  function handleValueChange(idx, raw) {
    const formatted = raw === '-' ? '-' : formatCurrencyInput(raw);
    onChange(items.map((item, i) => i === idx ? { ...item, value: formatted } : item));
  }
  function addItem() { onChange([...items, { desc: '', value: '' }]); }
  function removeItem(idx) { onChange(items.filter((_, i) => i !== idx)); }

  const total = items.reduce((sum, item) => sum + parseFormattedValue(item.value), 0);
  const hasItems = items.length > 0;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="item-row animate-fade-in">
          <input
            type="text"
            value={item.desc}
            onChange={e => handleDescChange(i, e.target.value)}
            placeholder={exampleItems?.[i] || `Item ${i + 1}`}
            className="item-desc-input"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs font-medium text-ink-300 select-none">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={item.value}
              onChange={e => handleValueChange(i, e.target.value)}
              placeholder="0,00"
              className="item-value-input"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="w-7 h-7 flex items-center justify-center text-ink-300 hover:text-loss-500 hover:bg-loss-50 rounded-md transition-all duration-100 flex-shrink-0 text-lg leading-none"
            aria-label="Remover item"
          >
            ×
          </button>
        </div>
      ))}

      <button type="button" onClick={addItem} className="btn-add-item">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {hasItems ? 'Adicionar mais um' : 'Adicionar primeiro item'}
      </button>

      {total > 0 && (
        <div className="flex justify-between items-center px-1 pt-3 border-t border-ink-100 mt-3">
          <span className="text-xs font-medium text-ink-400 uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold text-ink-800 font-mono">{formatBRL(total)}</span>
        </div>
      )}
    </div>
  );
}

function numToInput(value) {
  if (!value || value === 0) return '';
  return formatCurrencyInput(String(Math.round(Math.abs(value) * 100)));
}

function emptyValues() {
  return {
    revenue: '', cogs: '',
    fixedExpenses: [],
    cashBalance: '',
    debtPayment: [],
    accountsReceivable: '',
    mixedAccounts: null,
    investments: '',
  };
}

function buildInitialValues(init) {
  if (!init) return emptyValues();
  return {
    revenue:           numToInput(init.revenue),
    cogs:              numToInput(init.cogs),
    fixedExpenses:     init.fixedExpenses > 0
                         ? [{ desc: 'Ref. mês anterior', value: numToInput(init.fixedExpenses) }]
                         : [],
    cashBalance:       init.cashBalance < 0
                         ? '-' + numToInput(init.cashBalance)
                         : numToInput(init.cashBalance),
    debtPayment:       init.debtPayment > 0
                         ? [{ desc: 'Ref. mês anterior', value: numToInput(init.debtPayment) }]
                         : [],
    accountsReceivable: numToInput(init.accountsReceivable),
    mixedAccounts:     null,
    investments:       numToInput(init.investments),
  };
}

export default function Questionnaire({ onComplete, onBack, initialValues = null }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState(() => {
    const draft = readSession(DRAFT_KEY, null);
    if (draft && !initialValues) return draft;
    return buildInitialValues(initialValues);
  });

  useEffect(() => { writeSession(DRAFT_KEY, values); }, [values]);

  const question = QUESTIONS[currentIndex];
  const currentValue = values[question.field];
  const isItemized = question.type === 'itemized';
  const isChoice   = question.type === 'choice';
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const canProceed = isChoice
    ? currentValue !== null
    : isItemized
      ? question.allowZero || (Array.isArray(currentValue) && currentValue.some(item => parseFormattedValue(item.value) > 0))
      : question.allowZero
        ? currentValue !== '-'
        : parseFormattedValue(currentValue) > 0 && currentValue !== '-';

  function handleSingleInput(e) {
    const raw = e.target.value;
    if (raw === '-' && question.allowNegative) {
      setValues(prev => ({ ...prev, [question.field]: '-' }));
      return;
    }
    setValues(prev => ({ ...prev, [question.field]: formatCurrencyInput(raw) }));
  }

  function handleNext() {
    if (!canProceed) return;
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const numericData = {};
      QUESTIONS.forEach(({ field, type }) => {
        const val = values[field];
        if (type === 'itemized') {
          const filledItems = (val || []).filter(i => i.desc || parseFormattedValue(i.value) > 0);
          numericData[field] = filledItems.reduce((sum, i) => sum + parseFormattedValue(i.value), 0);
          numericData[`${field}Items`] = filledItems.map(i => ({
            desc: i.desc || 'Item',
            value: parseFormattedValue(i.value),
          }));
        } else if (type === 'choice') {
          numericData[field] = val === 'yes';
        } else {
          numericData[field] = parseFormattedValue(val);
        }
      });
      removeSession(DRAFT_KEY);
      onComplete(numericData);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canProceed && !isItemized) handleNext();
  }

  const isLast = currentIndex === QUESTIONS.length - 1;

  return (
    <div className="animate-slide-up">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handleBack}
          className="text-ink-400 hover:text-ink-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium text-ink-400">2 / 2</span>
      </div>

      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink-500">
            Pergunta {currentIndex + 1} de {QUESTIONS.length}
          </span>
          <span className="text-xs font-semibold text-ink-700 font-mono">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1 bg-ink-100 rounded-full overflow-hidden">
          <div className="progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Pergunta */}
      <div>
        <h2 className="text-2xl sm:text-[1.6rem] font-bold text-ink-900 tracking-tighter mb-2 leading-tight">
          {question.title}
        </h2>

        <p className="text-ink-500 text-[15px] leading-relaxed mb-3">
          {question.subtitle}
        </p>

        {question.helper && (
          <div className="mb-6">
            <HelperTip text={question.helper} />
          </div>
        )}

        {/* Input */}
        {isChoice ? (
          <div className="space-y-2.5 mb-2">
            {question.options.map(opt => {
              const selected = currentValue === opt.value;
              const isRisk   = opt.value === 'yes';
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValues(prev => ({ ...prev, [question.field]: opt.value }))}
                  className={`w-full text-left rounded-lg border p-4 transition-all duration-100
                    ${selected
                      ? isRisk
                        ? 'border-loss-500 bg-loss-50'
                        : 'border-money-500 bg-money-50'
                      : 'border-ink-200 hover:border-ink-300 bg-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${selected
                        ? isRisk ? 'border-loss-500 bg-loss-500' : 'border-money-500 bg-money-500'
                        : 'border-ink-300'
                      }`}>
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-tight
                        ${selected ? (isRisk ? 'text-loss-700' : 'text-money-700') : 'text-ink-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">{opt.detail}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : isItemized ? (
          <ItemizedInput
            items={currentValue || []}
            onChange={newItems => setValues(prev => ({ ...prev, [question.field]: newItems }))}
            exampleItems={question.exampleItems}
          />
        ) : (
          <>
            <div className="bg-ink-50 rounded-lg p-5 mb-3 border border-ink-200
                            focus-within:border-brand-400 focus-within:bg-white transition-all">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-semibold text-ink-300 font-mono">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={currentValue}
                  onChange={handleSingleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="0,00"
                  className="currency-input w-44"
                  autoFocus
                />
              </div>
              {question.allowZero && (
                <p className="text-center text-xs text-ink-400 mt-2">
                  Pode deixar em branco se não tiver
                </p>
              )}
            </div>

            <p className="text-xs text-ink-400 text-center mb-6">
              {question.example}
            </p>
          </>
        )}

        {/* Botões */}
        <div className={`space-y-2.5 ${isItemized ? 'mt-6' : ''}`}>
          <button onClick={handleNext} disabled={!canProceed} className="btn-primary">
            <span className="flex items-center justify-center gap-2">
              {isLast ? 'Gerar diagnóstico' : 'Próximo'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
          <button onClick={handleBack} className="btn-back">
            Voltar
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-ink-400 mt-5">
        Suas respostas são salvas automaticamente
      </p>
    </div>
  );
}
