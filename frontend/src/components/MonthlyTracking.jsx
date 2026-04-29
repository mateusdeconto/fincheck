import { useEffect, useMemo, useState } from 'react';
import { readJSON, writeJSON, STORAGE_AVAILABLE } from '../lib/storage.js';
import { calcMetrics, formatBRL, formatBRLCompact } from '../lib/metrics.js';

const STORAGE_KEY = 'fincheck_history';
const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTH_NAMES_LONG = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                          'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getMonthShort(monthKey) {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]}/${year.slice(2)}`;
}
function getMonthLong(monthKey) {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES_LONG[parseInt(month, 10) - 1]} de ${year}`;
}

function loadHistory() { return readJSON(STORAGE_KEY, []); }

function saveEntry(businessData, financialData) {
  const history = loadHistory();
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const m = calcMetrics(financialData);
  const entry = {
    date:               today.toISOString().split('T')[0],
    month:              monthKey,
    businessName:       businessData.businessName,
    segment:            businessData.segment,
    revenue:            m.revenue,
    cogs:               m.cogs,
    fixedExpenses:      m.fixedExpenses,
    cashBalance:        m.cashBalance,
    debtPayment:        m.debtPayment,
    investments:        m.investments,
    accountsReceivable: m.accountsReceivable,
    netProfit:          m.netProfit,
    netMargin:          m.netMargin,
    grossMargin:        m.grossMargin,
  };

  const updated = [...history.filter(e => e.month !== monthKey), entry]
    .sort((a, b) => a.month.localeCompare(b.month));
  writeJSON(STORAGE_KEY, updated);

  return { entry, monthKey };
}

function deleteEntry(monthKey) {
  const history = loadHistory();
  writeJSON(STORAGE_KEY, history.filter(e => e.month !== monthKey));
}

// Sparkline minimalista
function Sparkline({ values, color = '#2c5deb', height = 48, formatTooltip = formatBRLCompact }) {
  if (!values || values.length < 2) return null;

  const w = 100;
  const h = height;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 12) - 6;
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const lastPoint = points[points.length - 1];
  const zeroY = h - ((0 - min) / range) * (h - 12) - 6;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {min < 0 && max > 0 && (
          <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="#dde0e6" strokeWidth="0.5" strokeDasharray="2,2" />
        )}
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} fillOpacity="0.06" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.5" fill={color} stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
        <span>{formatTooltip(values[0])}</span>
        <span className="font-semibold text-ink-700">{formatTooltip(values[values.length - 1])}</span>
      </div>
    </div>
  );
}

function TrendChip({ change, isPP }) {
  if (change === null || change === undefined || isNaN(change)) return null;
  const positive = change > 0.05;
  const negative = change < -0.05;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded
      ${positive ? 'bg-money-50 text-money-700'
      : negative ? 'bg-loss-50 text-loss-700'
      : 'bg-ink-100 text-ink-500'}`}>
      {positive && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>}
      {negative && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>}
      {!positive && !negative && '→'}
      {isPP
        ? `${change > 0 ? '+' : ''}${change.toFixed(1)} pp`
        : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
    </span>
  );
}

function CompareRow({ label, current, previous, format, isPP = false }) {
  let change = null;
  if (previous !== undefined && previous !== null) {
    change = isPP ? current - previous : previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null;
  }
  return (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="data-value">{format(current)}</span>
        <TrendChip change={change} isPP={isPP} />
      </div>
    </div>
  );
}

export default function MonthlyTracking({ businessData, financialData, onBack, onRefill }) {
  const [currentEntry, setCurrentEntry]   = useState(null);
  const [history, setHistory]             = useState([]);

  useEffect(() => {
    const { entry } = saveEntry(businessData, financialData);
    setCurrentEntry(entry);
    setHistory(loadHistory());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const previousEntry = useMemo(() => {
    if (!currentEntry) return null;
    return history
      .filter(e => e.month < currentEntry.month)
      .sort((a, b) => b.month.localeCompare(a.month))[0] || null;
  }, [history, currentEntry]);

  const last6 = useMemo(() => history.slice(-6), [history]);
  const revenueValues   = last6.map(e => e.revenue);
  const netProfitValues = last6.map(e => e.netProfit);
  const cashValues      = last6.map(e => e.cashBalance);

  function handleDelete(monthKey) {
    if (!confirm('Excluir esse registro? Não dá pra desfazer.')) return;
    deleteEntry(monthKey);
    setHistory(loadHistory());
  }

  const dateLabel = currentEntry
    ? new Date(currentEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="animate-slide-up space-y-4">

      {/* Header */}
      <div>
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">Acompanhamento</p>
        <h1 className="text-3xl font-bold text-ink-900 tracking-tighter">
          {businessData.businessName}
        </h1>
      </div>

      {/* Storage warning */}
      {!STORAGE_AVAILABLE && (
        <div className="card p-4 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700 leading-relaxed">
            Seu navegador está bloqueando o armazenamento temporário. Tente sair do modo anônimo.
          </p>
        </div>
      )}

      {/* Saved confirmation */}
      {currentEntry && (
        <div className="card p-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-money-50 border border-money-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-money-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-800">Diagnóstico salvo</p>
            <p className="text-xs text-ink-400">{getMonthLong(currentEntry.month)} · {dateLabel}</p>
          </div>
        </div>
      )}

      {/* Sparklines */}
      {last6.length >= 2 && (
        <div className="card p-5 space-y-5">
          <div>
            <p className="text-sm font-bold text-ink-800">Evolução nos últimos {last6.length} meses</p>
            <p className="text-xs text-ink-400 mt-0.5">Salvo no seu navegador</p>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-500 mb-2">Receita</p>
            <Sparkline values={revenueValues} color="#2c5deb" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500 mb-2">Lucro líquido</p>
            <Sparkline values={netProfitValues} color="#059669" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500 mb-2">Saldo em caixa</p>
            <Sparkline values={cashValues} color="#1f2433" />
          </div>
        </div>
      )}

      {/* Comparação */}
      {currentEntry && previousEntry && (
        <div className="card p-5">
          <div className="mb-3">
            <p className="text-sm font-bold text-ink-800">Comparado ao mês anterior</p>
            <p className="text-xs text-ink-400 mt-0.5">vs. {getMonthLong(previousEntry.month)}</p>
          </div>
          <CompareRow label="Receita"        current={currentEntry.revenue}     previous={previousEntry.revenue}     format={formatBRL} />
          <CompareRow label="Margem líquida" current={currentEntry.netMargin}   previous={previousEntry.netMargin}   format={v => `${v.toFixed(1)}%`} isPP />
          <CompareRow label="Saldo em caixa" current={currentEntry.cashBalance} previous={previousEntry.cashBalance} format={formatBRL} />
          <CompareRow label="Lucro líquido"  current={currentEntry.netProfit}   previous={previousEntry.netProfit}   format={formatBRL} />
        </div>
      )}

      {/* Primeiro registro */}
      {currentEntry && !previousEntry && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink-700 mb-1">Primeiro diagnóstico salvo</p>
          <p className="text-sm text-ink-500 leading-relaxed">
            Volte no próximo mês e a gente compara automaticamente — receita, margem, caixa.
          </p>
        </div>
      )}

      {/* Histórico */}
      {history.length > 1 && (
        <div className="card p-5">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-3">Histórico completo</p>
          <div className="divide-y divide-ink-100">
            {[...history].reverse().map((entry) => (
              <div key={entry.month} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink-700">{getMonthLong(entry.month)}</p>
                  <p className="text-xs text-ink-400 font-mono">
                    Lucro: {formatBRL(entry.netProfit)} · Margem {entry.netMargin.toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(entry.month)}
                  className="text-ink-300 hover:text-loss-500 hover:bg-loss-50 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                  aria-label="Excluir registro"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="space-y-2.5">
        <button onClick={() => onRefill(previousEntry)} className="btn-primary">
          Refazer diagnóstico do mês
        </button>
        <button onClick={onBack} className="btn-back">
          Voltar ao diagnóstico
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 pb-4">
        Dados salvos na sua conta · seguros na nuvem
      </p>
    </div>
  );
}
