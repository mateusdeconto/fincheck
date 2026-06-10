import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { writeSession, readSession, removeSession } from '../lib/storage.js';
import { SECTOR_BENCHMARKS } from './Onboarding.jsx';

const DRAFT_KEY = 'folego_capital_questionnaire_draft';

// Cada pergunta tem: campo, tipo, narrativa de capítulo, título, helper.
// As "phases" agrupam perguntas em capítulos visíveis no painel lateral.
const QUESTIONS = [
  {
    field: 'revenue', type: 'single', allowZero: false, phase: 1,
    chapter: 'O que entra',
    title: 'Quanto entrou no caixa esse mês?',
    subtitle: 'Tudo que você recebeu — boletos pagos, dinheiro, cartão, Pix. Não o que ainda não foi pago.',
    example: 'Ex: R$ 30.000 em vendas',
    helper: 'Conta apenas o que efetivamente entrou. Pedido feito mas não pago vai mais tarde em "Contas a receber".',
    label: 'Receita',
  },
  {
    field: 'cogs', type: 'single', allowZero: false, phase: 2,
    chapter: 'O que custou pra entregar',
    title: 'Quanto custou pra entregar isso?',
    subtitle: 'Matéria-prima, mercadoria revendida, embalagens, comissões. Não inclua aluguel ou folha fixa.',
    example: 'Ex: ingredientes, mercadoria pra revender',
    helper: 'É o CMV (Custo da Mercadoria Vendida). Se vendeu 100 pizzas, é o custo da farinha + queijo + carne dessas 100.',
    label: 'CMV',
  },
  {
    field: 'fixedExpenses', type: 'itemized', allowZero: false, phase: 3,
    chapter: 'O que sai todo mês',
    title: 'Quais foram seus gastos fixos?',
    subtitle: 'Adicione cada gasto separadamente. Custos que existem mesmo se você não vender nada.',
    exampleItems: ['Aluguel', 'Salários + encargos', 'Energia', 'Contador', 'Internet'],
    helper: 'Despesas que vencem todo mês: aluguel, folha, contas. Adicione um por linha.',
    label: 'Gastos fixos',
  },
  {
    field: 'cashBalance', type: 'single', allowZero: true, allowNegative: true, phase: 4,
    chapter: 'Como tá o caixa',
    title: 'Quanto sobrou no caixa?',
    subtitle: 'Saldo atual da conta bancária do negócio. Pode ser negativo se estiver no vermelho.',
    example: 'Ex: saldo da conta corrente hoje',
    helper: 'Se está negativo (cheque especial), digite com sinal de menos. Ex: -1500',
    label: 'Caixa',
  },
  {
    field: 'debtPayment', type: 'itemized', allowZero: true, phase: 4,
    chapter: 'Como tá o caixa',
    title: 'Tem dívidas? Liste as parcelas.',
    subtitle: 'Adicione cada dívida separadamente. Sem dívidas? Pode pular.',
    exampleItems: ['Empréstimo banco', 'Financiamento equipamento', 'Cheque especial', 'Fornecedor parcelado'],
    helper: 'Apenas o valor da parcela do mês — não o total. Financia equipamento R$ 800/mês? Digite 800.',
    label: 'Dívidas',
  },
  {
    field: 'accountsReceivable', type: 'single', allowZero: true, phase: 4,
    chapter: 'Como tá o caixa',
    title: 'Tem clientes que ainda não pagaram?',
    subtitle: 'Total de vendas feitas mas não recebidas — boletos vencidos, parcelamentos em aberto.',
    example: 'Ex: cliente deve R$ 2.000, outro deve R$ 500',
    helper: 'Dinheiro que existe mas ainda não chegou. Inadimplência alta = sinal de risco.',
    label: 'A receber',
  },
  {
    field: 'mixedAccounts', type: 'choice', allowZero: true, phase: 5,
    chapter: 'Algumas perguntas finais',
    title: 'Usa a mesma conta pra você e pro negócio?',
    subtitle: 'Pessoal + PJ na mesma conta — entender isso ajuda no diagnóstico.',
    helper: 'Misturar PJ com PF é um dos erros mais comuns e perigosos em pequenas empresas brasileiras.',
    options: [
      { value: 'yes', label: 'Sim, é tudo junto', detail: 'Pessoal e empresa misturados' },
      { value: 'no',  label: 'Não, são separadas', detail: 'Cada um no seu lugar' },
    ],
    label: 'Contas PJ/PF',
  },
  {
    field: 'investments', type: 'single', allowZero: true, phase: 5,
    chapter: 'Algumas perguntas finais',
    title: 'Investiu de volta no negócio esse mês?',
    subtitle: 'Equipamentos, reformas, marketing, treinamentos, estoque extra — gastos pra crescer (não pra operar).',
    example: 'Ex: equipamento R$ 3.000 + marketing R$ 1.500',
    helper: 'É dinheiro que sai do caixa pra crescer. Não confunda com despesa operacional (aluguel/folha).',
    label: 'Investimentos',
  },
];

const TOTAL_PHASES = 5;

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } }),
};

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

function formatBRLCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)}k`;
  return formatBRL(n);
}

function HelperTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {open ? 'Ok, entendi' : 'O que conta aqui?'}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-gold-500/10 border border-gold-500/20 rounded-md text-xs text-white/70 leading-relaxed animate-fade-in">
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
        <div key={i} className="item-row animate-fade-in" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
          <input
            type="text"
            value={item.desc}
            onChange={e => handleDescChange(i, e.target.value)}
            placeholder={exampleItems?.[i] || `Item ${i + 1}`}
            className="item-desc-input text-white/80 placeholder:text-white/30"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs font-medium text-white/40 select-none">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={item.value}
              onChange={e => handleValueChange(i, e.target.value)}
              placeholder="0,00"
              className="item-value-input text-white placeholder:text-white/30"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-100 flex-shrink-0 text-lg leading-none"
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
        <div className="flex justify-between items-center px-1 pt-3 border-t border-white/10 mt-3">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold text-white font-mono">{formatBRL(total)}</span>
        </div>
      )}
    </div>
  );
}

function numToInput(value) {
  if (!value || value === 0) return '';
  return formatCurrencyInput(String(Math.round(Math.abs(value) * 100)));
}

// Retorna sugestão de valor baseada nos benchmarks do setor
function getSectorHint(field, values, segment) {
  const rev = parseFormattedValue(values.revenue);
  if (rev <= 0) return null;
  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS.outro;

  if (field === 'cogs' && bench.cmvPct) {
    const low  = Math.round(rev * bench.cmvPct[0] / 100);
    const high = Math.round(rev * bench.cmvPct[1] / 100);
    const mid  = Math.round((low + high) / 2);
    return {
      label: `Média do setor: ${formatBRL(low)} – ${formatBRL(high)}`,
      value: mid,
      formatted: numToInput(mid),
    };
  }

  if (field === 'fixedExpenses' && bench.laborPct && bench.rentPct) {
    const laborMid = Math.round(rev * (bench.laborPct[0] + bench.laborPct[1]) / 2 / 100);
    const rentMid  = Math.round(rev * (bench.rentPct[0]  + bench.rentPct[1])  / 2 / 100);
    return {
      items: [
        { desc: 'Salários + encargos', value: numToInput(laborMid) },
        { desc: 'Aluguel',             value: numToInput(rentMid)  },
      ],
    };
  }

  return null;
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

// Retorna aviso de plausibilidade para o campo atual
function getPlausibilityWarning(field, values, segment) {
  if (field !== 'cogs') return null;
  const rev = parseFormattedValue(values.revenue);
  const cogs = parseFormattedValue(values.cogs);
  if (rev <= 0 || cogs <= 0) return null;

  if (cogs >= rev) {
    return { type: 'loss', message: 'CMV maior ou igual à receita — o custo direto consumiu tudo que entrou. Confira se os valores estão certos.' };
  }

  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS.outro;
  if (!bench?.cmvPct) return null;

  const [low, high] = bench.cmvPct;
  const cogsPct = (cogs / rev) * 100;

  if (cogsPct < low * 0.35) {
    return { type: 'warn', message: `CMV de ${cogsPct.toFixed(1)}% parece muito baixo para este setor (média: ${low}–${high}%). Tem certeza que incluiu todos os custos diretos?` };
  }
  if (cogsPct > high * 1.8) {
    return { type: 'warn', message: `CMV de ${cogsPct.toFixed(1)}% está bem acima da média do setor (${low}–${high}%). Confira se os valores estão corretos.` };
  }

  return null;
}

// Calcula valor numérico atual do campo (lida com itemized)
function valueOf(values, field, isItemized) {
  if (isItemized) {
    return (values[field] || []).reduce((s, i) => s + parseFormattedValue(i.value), 0);
  }
  return parseFormattedValue(values[field]);
}

// Insight progressivo baseado no que já foi respondido
function getInsight(values, segment) {
  const rev = parseFormattedValue(values.revenue);
  const cogs = parseFormattedValue(values.cogs);
  const fixed = (values.fixedExpenses || []).reduce((s, i) => s + parseFormattedValue(i.value), 0);
  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS.outro;

  if (rev > 0 && cogs > 0) {
    const grossMargin = ((rev - cogs) / rev) * 100;
    const [low, high] = bench.grossMargin;

    if (grossMargin >= low && grossMargin <= high) {
      return {
        tone: 'money',
        title: `Margem bruta: ${grossMargin.toFixed(1)}%`,
        text: `Dentro da média do seu setor (${low}–${high}%). Bom sinal — você cobra um preço justo pelo que vende.`,
      };
    } else if (grossMargin > high) {
      return {
        tone: 'money',
        title: `Margem bruta: ${grossMargin.toFixed(1)}%`,
        text: `Acima da média (${low}–${high}% no seu setor). Você tem fôlego — pode ser oportunidade de crescer ou reinvestir.`,
      };
    } else if (grossMargin > 0) {
      return {
        tone: 'warn',
        title: `Margem bruta: ${grossMargin.toFixed(1)}%`,
        text: `Abaixo da média do setor (${low}–${high}%). Pode ser preço baixo ou custo alto. Vamos investigar no diagnóstico.`,
      };
    } else {
      return {
        tone: 'loss',
        title: 'Margem bruta negativa',
        text: 'Seus custos diretos passaram da receita. É urgente — vamos analisar isso no diagnóstico final.',
      };
    }
  }

  if (rev > 0 && fixed > 0) {
    const ratio = (fixed / rev) * 100;
    if (ratio > 50) {
      return {
        tone: 'warn',
        title: `Gastos fixos: ${ratio.toFixed(0)}% da receita`,
        text: 'É bastante. Mais da metade do que entra já vai pra contas que vencem todo mês — pouco espaço pra imprevisto.',
      };
    }
    return {
      tone: 'brand',
      title: 'Indo bem',
      text: 'Suas perguntas estão sendo registradas. O diagnóstico fica mais preciso a cada resposta.',
    };
  }

  return null;
}

// Painel lateral — DRE em construção
function LiveDRE({ values, businessData }) {
  const rev   = parseFormattedValue(values.revenue);
  const cogs  = parseFormattedValue(values.cogs);
  const fixed = (values.fixedExpenses || []).reduce((s, i) => s + parseFormattedValue(i.value), 0);
  const cash  = parseFormattedValue(values.cashBalance);
  const debt  = (values.debtPayment || []).reduce((s, i) => s + parseFormattedValue(i.value), 0);
  const ar    = parseFormattedValue(values.accountsReceivable);
  const inv   = parseFormattedValue(values.investments);

  const grossProfit = rev - cogs;
  const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
  const ebitda = grossProfit - fixed;
  const netProfit = ebitda - debt - inv;
  const netMargin = rev > 0 ? (netProfit / rev) * 100 : 0;

  const bench = SECTOR_BENCHMARKS[businessData.segment] || SECTOR_BENCHMARKS.outro;
  const grossMarginBelowBench = rev > 0 && cogs > 0 && grossMargin < bench.grossMargin[0];
  const insight = getInsight(values, businessData.segment);

  function Row({ label, value, filled, bold = false, sign = '', benchWarn = false }) {
    const colorClass = !filled
      ? 'text-white/20'
      : benchWarn
        ? 'text-amber-600'
        : value >= 0
          ? 'text-white/85'
          : 'text-loss-600';
    return (
      <div className="flex justify-between items-center py-1.5 text-xs">
        <span className={filled ? (benchWarn ? 'text-amber-600' : 'text-white/55') : 'text-white/20'}>{label}</span>
        <span className={`font-mono tabular-nums ${bold ? 'font-bold text-sm' : 'font-medium'} ${colorClass}`}>
          {filled ? `${sign}${formatBRLCompact(Math.abs(value))}` : '—'}
        </span>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-4 space-y-3">
      <div className="rounded-2xl p-5 border border-gold-500/40" style={{ background: '#1e3356' }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Sua DRE em construção</p>
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
        </div>
        <p className="text-sm font-bold text-white mb-4">{businessData.businessName}</p>

        <Row label="(+) Receita"        value={rev}         filled={rev > 0}       sign="" />
        <Row label="(−) CMV"            value={cogs}        filled={cogs > 0}      sign="−" />
        <div className="border-t border-white/10 my-1" />
        <Row label="= Lucro Bruto" value={grossProfit} filled={rev > 0 && cogs > 0} bold benchWarn={grossMarginBelowBench} />
        {rev > 0 && cogs > 0 && (
          <p className={`text-[10px] text-right font-mono mb-1 ${grossMarginBelowBench ? 'text-amber-500 font-semibold' : 'text-white/35'}`}>
            {grossMargin.toFixed(1)}% margem
            {grossMarginBelowBench && ` ⚠ abaixo do setor (${bench.grossMargin[0]}–${bench.grossMargin[1]}%)`}
          </p>
        )}

        <Row label="(−) Gastos fixos"   value={fixed}       filled={fixed > 0}     sign="−" />
        <div className="border-t border-white/10 my-1" />
        <Row label="= EBITDA"           value={ebitda}      filled={rev > 0 && cogs > 0 && fixed > 0} bold />

        <Row label="(−) Dívidas"        value={debt}        filled={debt > 0}      sign="−" />
        <Row label="(−) Investimentos"  value={inv}         filled={inv > 0}       sign="−" />
        <div className="border-t border-white/10 my-2" />
        <div className="flex justify-between items-center py-1.5">
          <span className="text-sm font-bold text-white">= Lucro Líquido</span>
          <span className={`font-mono font-bold text-base ${
            rev > 0 ? (netProfit >= 0 ? 'text-money-700' : 'text-loss-600') : 'text-white/20'
          }`}>
            {rev > 0 ? formatBRLCompact(netProfit) : '—'}
          </span>
        </div>
        {rev > 0 && (
          <p className="text-[10px] text-white/35 text-right font-mono">
            {netMargin.toFixed(1)}% margem líquida
          </p>
        )}

        {(cash !== 0 || ar > 0) && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Outros</p>
            <div className="flex justify-between text-xs">
              <span className="text-white/55">Caixa</span>
              <span className={`font-mono ${cash >= 0 ? 'text-white/85' : 'text-loss-600'}`}>{formatBRLCompact(cash)}</span>
            </div>
            {ar > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-white/55">A receber</span>
                <span className="font-mono text-white/85">{formatBRLCompact(ar)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insight progressivo */}
      {insight && (
        <div className={`rounded-2xl p-4 border border-white/10 border-l-4 animate-fade-in ${
          insight.tone === 'money' ? 'border-l-money-500'
          : insight.tone === 'warn' ? 'border-l-amber-400'
          : insight.tone === 'loss' ? 'border-l-loss-500'
          : 'border-l-brand-500'
        }`} style={{ background: '#253d63' }}>
          <div className="flex items-start gap-2.5">
            <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              insight.tone === 'money' ? 'text-money-600'
              : insight.tone === 'warn' ? 'text-amber-600'
              : insight.tone === 'loss' ? 'text-loss-600'
              : 'text-brand-600'
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white mb-0.5">{insight.title}</p>
              <p className="text-xs text-white/55 leading-relaxed">{insight.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Questionnaire({ onComplete, onBack, initialValues = null, businessData = {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState(() => {
    const draft = readSession(DRAFT_KEY, null);
    if (draft && !initialValues) return draft;
    return buildInitialValues(initialValues);
  });

  useEffect(() => { writeSession(DRAFT_KEY, values); }, [values]);

  const dirRef = useRef(1);

  const question = QUESTIONS[currentIndex];
  const currentValue = values[question.field];
  const isItemized = question.type === 'itemized';
  const isChoice   = question.type === 'choice';
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  // Detecta mudança de capítulo
  const prevQuestion = currentIndex > 0 ? QUESTIONS[currentIndex - 1] : null;
  const newChapter = !prevQuestion || prevQuestion.chapter !== question.chapter;

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
      dirRef.current = 1;
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
      dirRef.current = -1;
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
    <div className="grid lg:grid-cols-[1.1fr_400px] gap-6 max-w-5xl w-full mx-auto">

      {/* Coluna principal — pergunta */}
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={handleBack}
            className="text-white/60 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar
          </button>
          <span className="text-xs font-medium text-white/50">
            Capítulo {question.phase} de {TOTAL_PHASES}
          </span>
        </div>

        {/* Progress + chapter title */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              {question.chapter}
            </span>
            <span className="text-xs font-semibold text-white/60 font-mono">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold-500"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>
        </div>

        {/* Pergunta — wrapped with AnimatePresence for slide transition */}
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.div
            key={currentIndex}
            custom={dirRef.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="rounded-2xl p-6 sm:p-7 border border-white/10" style={{ background: '#253d63' }}>
              {newChapter && (
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2 animate-fade-in">
                  Pergunta {currentIndex + 1} de {QUESTIONS.length}
                </p>
              )}

              <h2 className="text-2xl sm:text-[1.6rem] font-bold text-white tracking-tighter mb-2 leading-tight">
                {question.title}
              </h2>

              <p className="text-white/70 text-[15px] leading-relaxed mb-3">
                {question.subtitle}
              </p>

              {question.helper && (
                <div className="mb-6">
                  <HelperTip text={question.helper} />
                </div>
              )}

              {/* Input */}
              {(() => {
                const singleHint = !isItemized && !isChoice && question.field !== 'cashBalance'
                  ? getSectorHint(question.field, values, businessData.segment)
                  : null;
                const fixedHint = isItemized && question.field === 'fixedExpenses'
                  ? getSectorHint('fixedExpenses', values, businessData.segment)
                  : null;
                return (singleHint || fixedHint) ? (
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    {singleHint && (
                      <button
                        type="button"
                        onClick={() => setValues(prev => ({ ...prev, [question.field]: singleHint.formatted }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold max-w-full
                          bg-gold-500/15 border border-gold-500/30 text-gold-300 hover:bg-gold-500/25
                          hover:border-gold-400/50 transition-all duration-150 active:scale-95"
                      >
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{singleHint.label} — usar média</span>
                      </button>
                    )}
                    {fixedHint && (Array.isArray(values.fixedExpenses) && values.fixedExpenses.length === 0) && (
                      <button
                        type="button"
                        onClick={() => setValues(prev => ({ ...prev, fixedExpenses: fixedHint.items }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold max-w-full
                          bg-gold-500/15 border border-gold-500/30 text-gold-300 hover:bg-gold-500/25
                          hover:border-gold-400/50 transition-all duration-150 active:scale-95"
                      >
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">Sugerir gastos típicos do setor</span>
                      </button>
                    )}
                  </div>
                ) : null;
              })()}
              {/* Aviso de plausibilidade — só aparece quando há valor digitado e fora do esperado */}
              {(() => {
                const warn = getPlausibilityWarning(question.field, values, businessData.segment);
                if (!warn) return null;
                const isLoss = warn.type === 'loss';
                return (
                  <div className={`mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs leading-relaxed animate-fade-in ${
                    isLoss
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {warn.message}
                  </div>
                );
              })()}

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
                            : 'border-white/15 hover:border-white/30'
                          }`}
                        style={!selected ? { background: 'rgba(255,255,255,0.06)' } : {}}
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
                              ${selected ? (isRisk ? 'text-loss-700' : 'text-money-700') : 'text-white/80'}`}>
                              {opt.label}
                            </p>
                            <p className={`text-xs mt-0.5 ${selected ? (isRisk ? 'text-loss-600' : 'text-money-600') : 'text-white/50'}`}>{opt.detail}</p>
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
                  <div
                    className="rounded-xl p-5 mb-3 border border-white/15 focus-within:border-gold-400 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-semibold text-white/40 font-mono">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentValue}
                        onChange={handleSingleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="0,00"
                        className="currency-input flex-1 min-w-0"
                        autoFocus
                      />
                    </div>
                    {question.allowZero && (
                      <p className="text-center text-xs text-white/40 mt-2">
                        Pode deixar em branco se não tiver
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-white/35 text-center mb-6">
                    {question.example}
                  </p>
                </>
              )}

              {/* Botões */}
              <div className={`space-y-2.5 ${isItemized ? 'mt-6' : ''}`}>
                <button onClick={handleNext} disabled={!canProceed} className="btn-gold w-full">
                  <span className="flex items-center justify-center gap-2">
                    {isLast ? 'Gerar diagnóstico' : 'Continuar'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </button>
                <button onClick={handleBack} className="w-full py-2.5 px-5 border border-white/30 text-white/70 font-medium rounded-xl text-sm bg-transparent hover:bg-white/10 hover:text-white hover:border-white/50 active:scale-[0.98] transition-all duration-150">
                  Voltar
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-white/35 mt-5">
          Suas respostas são salvas automaticamente
        </p>
      </div>

      {/* Painel lateral — DRE em construção (apenas em telas grandes) */}
      <div className="hidden lg:block">
        <LiveDRE values={values} businessData={businessData} />
      </div>
    </div>
  );
}
