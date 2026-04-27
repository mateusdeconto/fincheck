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
  return `${MONTH_NAMES_LONG[parseInt(month, 10) - 1]}/${year}`;
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

// ── Sparkline SVG ────────────────────────────────────────────────────────
function Sparkline({ values, color = '#d6612a', height = 56, formatTooltip = formatBRLCompact }) {
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
        {/* zero line */}
        {min < 0 && max > 0 && (
          <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="#e3ddd0" strokeWidth="0.5" strokeDasharray="2,2" />
        )}
        {/* área embaixo */}
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} fillOpacity="0.08" />
        {/* linha */}
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* pontos */}
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
        {/* highlight do último ponto */}
        <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.5" fill={color} stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
        <span>{formatTooltip(values[0])}</span>
        <span className="font-bold text-ink-700">{formatTooltip(values[values.length - 1])}</span>
      </div>
    </div>
  );
}

function TrendChip({ change, isPP }) {
  if (change === null || change === undefined || isNaN(change)) return null;
  const positive = change > 0.05;
  const negative = change < -0.05;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
      ${positive ? 'bg-emerald-50 text-emerald-700'
      : negative ? 'bg-red-50 text-red-700'
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
    <div className="flex items-center justify-between py-2.5 border-b border-ink-100 last:border-0">
      <span className="text-sm text-ink-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-ink-800 tabular-nums font-mono">{format(current)}</span>
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

  // Últimos 6 meses (incluindo o atual)
  const last6 = useMemo(() => history.slice(-6), [history]);
  const revenueValues   = last6.map(e => e.revenue);
  const netProfitValues = last6.map(e => e.netProfit);
  const cashValues      = last6.map(e => e.cashBalance);

  function handleDelete(monthKey) {
    if (!confirm('Excluir este registro? Não dá pra desfazer.')) return;
    deleteEntry(monthKey);
    setHistory(loadHistory());
  }

  const dateLabel = currentEntry
    ? new Date(currentEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="animate-slide-up space-y-4">

      {/* Header */}
      <div className="text-center">
        <p className="eyebrow mb-2">Acompanhamento mensal</p>
        <h1 className="font-display text-3xl font-semibold text-ink-800 tracking-tighter">
          {businessData.businessName}
        </h1>
      </div>

      {/* Storage warning */}
      {!STORAGE_AVAILABLE && (
        <div className="card p-4 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700 leading-relaxed">
            ⚠ Seu navegador está bloqueando o armazenamento local. O histórico não será salvo entre visitas.
            Tente sair do modo anônimo/privado.
          </p>
        </div>
      )}

      {/* Saved confirmation */}
      {currentEntry && (
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink-800">Diagnóstico salvo</p>
              <p className="text-xs text-ink-400">{getMonthLong(currentEntry.month)} · {dateLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sparklines (3+ meses) */}
      {last6.length >= 2 && (
        <div className="card p-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-800 leading-tight">Evolução {last6.length} meses</h3>
              <p className="text-xs text-ink-400">Dados salvos no seu navegador</p>
            </div>
          </div>

          <div>
            <p className="eyebrow-muted mb-2">Receita</p>
            <Sparkline values={revenueValues} color="#3a67a5" />
          </div>
          <div>
            <p className="eyebrow-muted mb-2">Lucro líquido</p>
            <Sparkline values={netProfitValues} color="#d6612a" />
          </div>
          <div>
            <p className="eyebrow-muted mb-2">Saldo em caixa</p>
            <Sparkline values={cashValues} color="#166534" />
          </div>
        </div>
      )}

      {/* Comparação com mês anterior */}
      {currentEntry && previousEntry && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink-800">Comparado ao mês anterior</p>
              <p className="text-xs text-ink-400">vs. {getMonthLong(previousEntry.month)}</p>
            </div>
          </div>
          <CompareRow label="Receita"        current={currentEntry.revenue}     previous={previousEntry.revenue}     format={formatBRL} />
          <CompareRow label="Margem Líquida" current={currentEntry.netMargin}   previous={previousEntry.netMargin}   format={v => `${v.toFixed(1)}%`} isPP />
          <CompareRow label="Saldo em Caixa" current={currentEntry.cashBalance} previous={previousEntry.cashBalance} format={formatBRL} />
          <CompareRow label="Lucro líquido"  current={currentEntry.netProfit}   previous={previousEntry.netProfit}   format={formatBRL} />
        </div>
      )}

      {/* Primeiro registro */}
      {currentEntry && !previousEntry && (
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-ink-700">Primeiro diagnóstico registrado</p>
              <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                Volte no próximo mês para ver receita, margem e caixa comparados automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico completo */}
      {history.length > 1 && (
        <div className="card p-5">
          <p className="eyebrow-muted mb-3">Histórico completo</p>
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
                  className="text-ink-300 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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

      {/* Motivacional */}
      <div className="card-quiet p-4 text-center">
        <p className="text-ink-600 text-sm leading-relaxed font-medium">
          📅 Volte todo mês para acompanhar a evolução do seu negócio.
        </p>
        <p className="text-ink-400 text-xs mt-1">
          Os dados ficam salvos no seu navegador.
        </p>
      </div>

      {/* Ações */}
      <div className="space-y-3">
        <button onClick={() => onRefill(previousEntry)} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refazer diagnóstico do mês
          </span>
        </button>
        <button onClick={onBack} className="btn-back">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar ao diagnóstico
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 pb-4">
        Dados salvos localmente · nenhum servidor envolvido
      </p>
    </div>
  );
}
