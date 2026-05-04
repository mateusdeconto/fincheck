import { useMemo, useState } from 'react';
import { calcMetrics, formatBRL } from '../lib/metrics.js';
import UpgradeModal from './UpgradeModal.jsx';

function getLabel(record) {
  const refMonth = record.financial_data?.referenceMonth;
  if (refMonth) {
    const [year, month] = refMonth.split('-');
    return new Date(Number(year), Number(month) - 1, 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
  return new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Retorna string sortável YYYY-MM para ordenar do mais recente ao mais antigo
function getSortKey(record) {
  const ref = record.financial_data?.referenceMonth;
  if (ref) return ref; // "2026-05"
  return record.created_at.slice(0, 7); // "2026-05"
}

function fmt(val, format) {
  if (format === 'brl') return formatBRL(val);
  return `${val.toFixed(1)}%`;
}

// Célula com valor + % de variação vs base
function DeltaCell({ rawVal, rawBase, display, invertColor = false, highlight = false }) {
  const delta    = rawVal - rawBase;
  const pct      = rawBase !== 0 ? (delta / Math.abs(rawBase)) * 100 : null;
  const positive = delta > 0;
  const good     = invertColor ? !positive : positive;
  const color    = delta === 0 ? 'text-ink-400' : good ? 'text-money-600' : 'text-loss-600';
  const arrow    = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const pctStr   = pct !== null
    ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
    : '—';

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`font-mono text-sm font-semibold ${highlight ? 'text-ink-900' : 'text-ink-600'}`}>
        {display}
      </span>
      <span className={`text-[10px] font-bold ${color}`}>
        {arrow} {pctStr}
      </span>
    </div>
  );
}

const ROW_DEFS = [
  { key: 'revenue',       label: 'Receita Bruta',       format: 'brl', invertColor: false, highlight: false },
  { key: 'cogs',          label: 'CMV',                 format: 'brl', invertColor: true,  highlight: false },
  { key: 'grossProfit',   label: 'Lucro Bruto',         format: 'brl', invertColor: false, highlight: true  },
  { key: 'grossMargin',   label: 'Margem Bruta',        format: 'pct', invertColor: false, highlight: false },
  { key: 'fixedExpenses', label: 'Despesas Fixas',      format: 'brl', invertColor: true,  highlight: false },
  { key: 'ebitda',        label: 'EBITDA',              format: 'brl', invertColor: false, highlight: false },
  { key: 'debtPayment',   label: 'Dívidas/Parcelas',    format: 'brl', invertColor: true,  highlight: false },
  { key: 'netProfit',     label: 'Lucro Líquido',       format: 'brl', invertColor: false, highlight: true  },
  { key: 'netMargin',     label: 'Margem Líquida',      format: 'pct', invertColor: false, highlight: true  },
  { key: 'cashBalance',   label: 'Saldo de Caixa',      format: 'brl', invertColor: false, highlight: false },
  { key: 'breakEven',     label: 'Ponto de Equilíbrio', format: 'brl', invertColor: true,  highlight: false },
];

export default function Comparison({ records = [], onBack, onOpenChat, plan = 'free' }) {
  const isPaid = plan === 'paid';
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Ordena do mais antigo (index 0 = base) ao mais recente
  const sorted = useMemo(
    () => [...records].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b))),
    [records],
  );

  const allMetrics = useMemo(() => sorted.map(r => calcMetrics(r.financial_data)), [sorted]);

  if (!sorted.length) return null;

  const base    = allMetrics[0];                          // mais antigo = referência
  const latest  = allMetrics[allMetrics.length - 1];     // mais recente
  const hasDiff = allMetrics.length > 1;

  const summaryCards = hasDiff ? [
    { label: 'Receita',        grew: latest.revenue   > base.revenue,   a: fmt(latest.revenue,   'brl'), b: fmt(base.revenue,   'brl') },
    { label: 'Lucro líquido',  grew: latest.netProfit > base.netProfit, a: fmt(latest.netProfit, 'brl'), b: fmt(base.netProfit, 'brl') },
    { label: 'Margem líquida', grew: latest.netMargin > base.netMargin, a: fmt(latest.netMargin, 'pct'), b: fmt(base.netMargin, 'pct') },
  ] : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Comparação</h1>
        <p className="text-sm text-ink-400 mt-0.5">
          {sorted[0].business_name} · {sorted.length} {sorted.length === 1 ? 'período' : 'períodos'}
        </p>
      </div>

      {/* Resumo (base vs imediatamente anterior) */}
      {summaryCards.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {summaryCards.map(card => (
            <div key={card.label} className={`rounded-xl border p-3 ${card.grew ? 'bg-money-50 border-money-200' : 'bg-loss-50 border-loss-200'}`}>
              <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-2">{card.label}</p>
              <p className={`text-base font-bold font-mono ${card.grew ? 'text-money-700' : 'text-loss-700'}`}>{card.a}</p>
              <p className="text-xs text-ink-400 mt-0.5">base: {card.b}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabela multi-período */}
      <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider sticky left-0 bg-ink-50 z-10 min-w-[140px]">
                  Indicador
                </th>
                {sorted.map((rec, i) => (
                  <th
                    key={rec.id}
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider whitespace-nowrap min-w-[150px]"
                    style={{ color: i === 0 ? '#111827' : '#6b7280' }}
                  >
                    {getLabel(rec)}
                    {i === 0 && (
                      <span className="ml-1.5 text-[9px] font-bold bg-ink-900 text-white px-1.5 py-0.5 rounded-full">base</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {ROW_DEFS.map(row => (
                <tr key={row.key} className={row.highlight ? 'bg-ink-50/50' : ''}>
                  <td
                    className={`px-4 py-3 text-sm sticky left-0 z-10 ${
                      row.highlight
                        ? 'font-bold text-ink-800 bg-ink-50'
                        : 'text-ink-600 bg-white'
                    }`}
                  >
                    {row.label}
                  </td>
                  {allMetrics.map((m, i) => {
                    const rawVal  = m[row.key];
                    const rawBase = allMetrics[0][row.key];
                    const display = fmt(rawVal, row.format);

                    return (
                      <td key={i} className="px-4 py-3 text-right">
                        {i === 0 ? (
                          <span className={`font-mono text-sm font-semibold ${row.highlight ? 'text-ink-900' : 'text-ink-800'}`}>
                            {display}
                          </span>
                        ) : (
                          <DeltaCell
                            rawVal={rawVal}
                            rawBase={rawBase}
                            display={display}
                            invertColor={row.invertColor}
                            highlight={row.highlight}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultor IA */}
      <button
        onClick={isPaid ? onOpenChat : () => setShowUpgrade(true)}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
          isPaid ? 'border-ink-200 text-ink-700 bg-white hover:bg-ink-50' : 'border-ink-200 text-ink-400 bg-white opacity-80'
        }`}
      >
        {!isPaid && (
          <svg className="w-3.5 h-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        Perguntar à IA sobre esta comparação
        {!isPaid && <span className="ml-auto text-[10px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">PRO</span>}
      </button>

      <button onClick={onBack} className="btn-back w-full">← Voltar ao histórico</button>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
