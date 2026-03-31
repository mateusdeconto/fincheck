import { useState } from 'react';

const QUESTIONS = [
  {
    field: 'revenue',
    type: 'single',
    title: 'Quanto você faturou esse mês?',
    subtitle: 'Some tudo que entrou no caixa com vendas — boletos pagos, dinheiro, cartão, Pix. Não inclua o que ainda não foi pago.',
    example: 'Ex: vendeu R$ 30.000 em produtos e serviços',
    allowZero: false,
    icon: '💰',
  },
  {
    field: 'cogs',
    type: 'single',
    title: 'Quanto gastou pra entregar seu produto ou serviço?',
    subtitle: 'Inclua: ingredientes, mercadoria revendida, embalagens, mão de obra direta. Não inclua aluguel ou salários fixos.',
    example: 'Ex: farinha, carne, mercadoria comprada pra revender',
    allowZero: false,
    icon: '🏭',
  },
  {
    field: 'fixedExpenses',
    type: 'itemized',
    title: 'Quais foram seus gastos fixos do mês?',
    subtitle: 'Adicione cada gasto separadamente. São os custos que existem mesmo que você não venda nada.',
    exampleItems: ['Aluguel', 'Salários + encargos', 'Energia elétrica', 'Contador', 'Internet / sistemas'],
    allowZero: false,
    icon: '🏢',
  },
  {
    field: 'cashBalance',
    type: 'single',
    title: 'Quanto sobrou no caixa no fim do mês?',
    subtitle: 'Olhe o saldo atual da sua conta bancária do negócio. Pode ser negativo se estiver no vermelho.',
    example: 'Ex: saldo da conta corrente hoje',
    allowZero: true,
    icon: '🏦',
  },
  {
    field: 'debtPayment',
    type: 'itemized',
    title: 'Você tem dívidas? Liste as parcelas mensais.',
    subtitle: 'Adicione cada dívida separadamente. Se não tiver dívidas, clique em Próximo.',
    exampleItems: ['Empréstimo banco', 'Financiamento equipamento', 'Cheque especial', 'Dívida com fornecedor'],
    allowZero: true,
    icon: '📋',
  },
  {
    field: 'accountsReceivable',
    type: 'single',
    title: 'Você tem clientes que ainda não pagaram?',
    subtitle: 'Valor total de vendas já feitas mas não recebidas. Inclui boletos vencidos, parcelamentos em aberto. Se não tiver, deixe zero.',
    example: 'Ex: cliente deve R$ 2.000, outro deve R$ 500',
    allowZero: true,
    icon: '📥',
  },
  {
    field: 'investments',
    type: 'single',
    title: 'Quanto investiu de volta na empresa esse mês?',
    subtitle: 'Inclua: compra de equipamentos, reformas, marketing, treinamentos, estoque extra. São gastos para crescimento, não para operação.',
    example: 'Ex: novo equipamento R$ 3.000 + campanha marketing R$ 1.500',
    allowZero: true,
    icon: '📈',
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

/**
 * Componente para entrada de gastos itemizados (lista com + / ×)
 */
function ItemizedInput({ items, onChange, exampleItems, allowZero }) {
  function handleDescChange(idx, val) {
    onChange(items.map((item, i) => i === idx ? { ...item, desc: val } : item));
  }

  function handleValueChange(idx, raw) {
    let formatted;
    if (raw === '-') {
      formatted = '-';
    } else {
      formatted = formatCurrencyInput(raw);
    }
    onChange(items.map((item, i) => i === idx ? { ...item, value: formatted } : item));
  }

  function addItem() {
    onChange([...items, { desc: '', value: '' }]);
  }

  function removeItem(idx) {
    if (items.length <= 1) {
      onChange([{ desc: '', value: '' }]);
      return;
    }
    onChange(items.filter((_, i) => i !== idx));
  }

  const total = items.reduce((sum, item) => sum + parseFormattedValue(item.value), 0);
  const hasValues = items.some(item => parseFormattedValue(item.value) > 0);

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
            <span className="text-xs font-medium text-slate-400 select-none">R$</span>
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
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400
                       hover:bg-red-50 rounded-lg transition-all duration-150 flex-shrink-0 text-lg leading-none"
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
        Adicionar item
      </button>

      {hasValues && (
        <div className="flex justify-between items-center px-1 pt-2 border-t border-slate-100 mt-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</span>
          <span className="text-xl font-bold text-navy-700">{formatBRL(total)}</span>
        </div>
      )}

      {allowZero && (
        <p className="text-center text-xs text-slate-400 pt-1">
          Não tem? Clique em Próximo (total = R$ 0,00)
        </p>
      )}
    </div>
  );
}

export default function Questionnaire({ onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState({
    revenue: '',
    cogs: '',
    fixedExpenses: [{ desc: '', value: '' }],
    cashBalance: '',
    debtPayment: [{ desc: '', value: '' }],
    accountsReceivable: '',
    investments: '',
  });

  const question = QUESTIONS[currentIndex];
  const currentValue = values[question.field];
  const isItemized = question.type === 'itemized';
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const canProceed = isItemized
    ? question.allowZero || currentValue.some(item => parseFormattedValue(item.value) > 0)
    : question.allowZero
      ? currentValue !== '-'
      : parseFormattedValue(currentValue) > 0 && currentValue !== '-';

  function handleSingleInput(e) {
    const raw = e.target.value;
    if (raw === '-') {
      setValues(prev => ({ ...prev, [question.field]: '-' }));
      return;
    }
    setValues(prev => ({ ...prev, [question.field]: formatCurrencyInput(raw) }));
  }

  function handleNext() {
    if (!canProceed) return;
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      const numericData = {};
      QUESTIONS.forEach(({ field, type }) => {
        const val = values[field];
        if (type === 'itemized') {
          const filledItems = val.filter(i => i.desc || parseFormattedValue(i.value) > 0);
          numericData[field] = filledItems.reduce((sum, i) => sum + parseFormattedValue(i.value), 0);
          numericData[`${field}Items`] = filledItems.map(i => ({
            desc: i.desc || 'Item',
            value: parseFormattedValue(i.value),
          }));
        } else {
          numericData[field] = parseFormattedValue(val);
        }
      });
      onComplete(numericData);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
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
      {/* Barra de progresso */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium tracking-wide uppercase">
            Pergunta {currentIndex + 1} de {QUESTIONS.length}
          </span>
          <span className="text-white/80 text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card da pergunta */}
      <div className="card p-6">
        {/* Badge do número + ícone */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl text-lg
                          bg-gradient-to-br from-navy-100 to-navy-200">
            {question.icon}
          </div>
          <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">
            Pergunta {currentIndex + 1}
          </span>
        </div>

        {/* Título */}
        <h2 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
          {question.title}
        </h2>

        {/* Subtítulo */}
        <p className="text-slate-500 text-sm leading-relaxed mb-5">
          {question.subtitle}
        </p>

        {/* Input — single ou itemizado */}
        {isItemized ? (
          <ItemizedInput
            items={currentValue}
            onChange={newItems => setValues(prev => ({ ...prev, [question.field]: newItems }))}
            exampleItems={question.exampleItems}
            allowZero={question.allowZero}
          />
        ) : (
          <>
            <div className="bg-slate-50 rounded-2xl p-5 mb-2 border border-slate-100
                            focus-within:border-navy-300 focus-within:bg-navy-50/20 transition-all">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-slate-300">R$</span>
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
                <p className="text-center text-xs text-slate-400 mt-2">
                  Pode deixar em branco se não tiver
                </p>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center mb-5 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {question.example}
            </p>
          </>
        )}

        {/* Botões — com espaçamento adequado para itemized */}
        <div className={`space-y-3 ${isItemized ? 'mt-5' : ''}`}>
          <button onClick={handleNext} disabled={!canProceed} className="btn-primary">
            {isLast ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gerar diagnóstico
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Próximo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            )}
          </button>
          <button onClick={handleBack} className="btn-back">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Voltar
            </span>
          </button>
        </div>
      </div>

      <p className="text-center text-white/30 text-xs mt-4">
        Sem jargão contábil, sem complicação
      </p>
    </div>
  );
}
