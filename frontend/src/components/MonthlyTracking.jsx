import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fincheck_history';
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]}/${year}`;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveEntry(businessData, financialData) {
  const history = loadHistory();
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const grossProfit = (financialData.revenue || 0) - (financialData.cogs || 0);
  const grossMargin = financialData.revenue > 0 ? (grossProfit / financialData.revenue) * 100 : 0;
  const ebitda     = grossProfit - (financialData.fixedExpenses || 0);
  const netProfit  = ebitda - (financialData.debtPayment || 0) - (financialData.investments || 0);
  const netMargin  = financialData.revenue > 0 ? (netProfit / financialData.revenue) * 100 : 0;

  const entry = {
    date:         today.toISOString().split('T')[0],
    month:        monthKey,
    businessName: businessData.businessName,
    segment:      businessData.segment,
    revenue:      financialData.revenue      || 0,
    cogs:         financialData.cogs         || 0,
    fixedExpenses:financialData.fixedExpenses|| 0,
    cashBalance:  financialData.cashBalance  || 0,
    debtPayment:  financialData.debtPayment  || 0,
    investments:  financialData.investments  || 0,
    accountsReceivable: financialData.accountsReceivable || 0,
    netProfit,
    netMargin,
    grossMargin,
  };

  // Replace any existing entry for this month
  const updated = [...history.filter(e => e.month !== monthKey), entry]
    .sort((a, b) => a.month.localeCompare(b.month));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return { entry, monthKey };
}

// ── Trend chip ──────────────────────────────────────────────────────────────
function TrendChip({ change, isPP }) {
  if (change === null || change === undefined || isNaN(change)) return null;
  const positive = change > 0.05;
  const negative = change < -0.05;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
      ${positive ? 'bg-emerald-50 text-emerald-600'
      : negative ? 'bg-red-50 text-red-600'
      : 'bg-slate-100 text-slate-500'}`}>
      {positive && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      )}
      {negative && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
        </svg>
      )}
      {!positive && !negative && '→'}
      {isPP
        ? `${change > 0 ? '+' : ''}${change.toFixed(1)} pp`
        : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      }
    </span>
  );
}

function CompareRow({ label, current, previous, format, isPP = false }) {
  let change = null;
  if (previous !== undefined && previous !== null) {
    change = isPP
      ? current - previous
      : previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null;
  }
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-800 tabular-nums">{format(current)}</span>
        <TrendChip change={change} isPP={isPP} />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MonthlyTracking({ businessData, financialData, onBack, onRefill }) {
  const [currentEntry, setCurrentEntry]   = useState(null);
  const [previousEntry, setPreviousEntry] = useState(null);

  useEffect(() => {
    const { entry, monthKey } = saveEntry(businessData, financialData);
    setCurrentEntry(entry);

    const history = loadHistory();
    const prev = history
      .filter(e => e.month < monthKey)
      .sort((a, b) => b.month.localeCompare(a.month))[0] || null;
    setPreviousEntry(prev);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dateLabel = currentEntry
    ? new Date(currentEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="animate-slide-up space-y-4">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
             style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H18v-.008zm0 2.25h.008v.008H18V15z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Acompanhamento Mensal</h1>
        <p className="text-white/50 text-sm mt-1">{businessData.businessName}</p>
      </div>

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
              <p className="text-sm font-bold text-slate-800">Diagnóstico salvo!</p>
              <p className="text-xs text-slate-400">{getMonthName(currentEntry.month)} · {dateLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      {currentEntry && (
        <div className="card p-5">
          {previousEntry ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Evolução do negócio</p>
                  <p className="text-xs text-slate-400">vs. {getMonthName(previousEntry.month)}</p>
                </div>
              </div>
              <CompareRow
                label="Receita"
                current={currentEntry.revenue}
                previous={previousEntry.revenue}
                format={formatBRL}
              />
              <CompareRow
                label="Margem Líquida"
                current={currentEntry.netMargin}
                previous={previousEntry.netMargin}
                format={v => `${v.toFixed(1)}%`}
                isPP
              />
              <CompareRow
                label="Saldo em Caixa"
                current={currentEntry.cashBalance}
                previous={previousEntry.cashBalance}
                format={formatBRL}
              />
            </>
          ) : (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-navy-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-slate-700">Primeiro diagnóstico registrado!</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Volte no próximo mês para ver a evolução — receita, margem e caixa comparados automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivational */}
      <div className="rounded-2xl p-4 text-center"
           style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="text-white/75 text-sm leading-relaxed font-medium">
          📅 Volte todo mês para acompanhar a evolução do seu negócio.
        </p>
        <p className="text-white/35 text-xs mt-1">
          Os dados ficam salvos automaticamente neste dispositivo.
        </p>
      </div>

      {/* Actions */}
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

      <p className="text-center text-white/25 text-xs pb-4">
        Dados salvos localmente · nenhum servidor envolvido
      </p>
    </div>
  );
}
